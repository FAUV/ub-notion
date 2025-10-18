import { Client } from "@notionhq/client";

export const notion = new Client({ auth: process.env.NOTION_TOKEN });
export const CL_TZ = process.env.NOTION_TIMEZONE || "America/Santiago";

export type NotionProp = any;

export class MappingValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MappingValidationError";
  }
}

export function getTitle(p: NotionProp): string { return p?.title?.[0]?.plain_text ?? ""; }
export function getSelect(p: NotionProp): string | null { return p?.select?.name ?? null; }
export function getMulti(p: NotionProp): string[] { return (p?.multi_select ?? []).map((o: any) => o.name); }
export function getDateISO(p: NotionProp): string | null { return p?.date?.start ?? null; }
export function getNumber(p: NotionProp): number | null { return p?.number ?? null; }
export function getRich(p: NotionProp): string { return p?.rich_text?.[0]?.plain_text ?? ""; }
export function getUrl(p: NotionProp): string | null { return p?.url ?? null; }
export function getRelationIds(p: NotionProp): string[] { return (p?.relation ?? []).map((r: any) => r.id); }

export async function queryDb(database_id: string, body: any = {}) {
  const { start_cursor: initialCursor, ...rest } = body ?? {};
  const results: any[] = [];
  let cursor: string | undefined = initialCursor;

  while (true) {
    const response = await notion.databases.query({
      database_id,
      ...rest,
      ...(cursor ? { start_cursor: cursor } : {}),
    });

    results.push(...((response.results as any[]) ?? []));

    if (!response.has_more || !response.next_cursor) break;

    cursor = response.next_cursor ?? undefined;
  }

  return results;
}
export async function retrievePage(pageId: string) { return await notion.pages.retrieve({ page_id: pageId }); }
export function findTitleProperty(properties: Record<string, any>): string | null {
  for (const [k, v] of Object.entries(properties || {})) if ((v as any)?.type === "title") return k; return null;
}
export function toCL(iso?: string | null): string | null { if (!iso) return null; return new Date(iso).toLocaleString("es-CL", { timeZone: CL_TZ }); }

const titleCache = new Map<string, string>();
export async function resolveRelationTitles(ids: string[]): Promise<Record<string, string>> {
  const uniq = Array.from(new Set(ids.filter(Boolean)));
  const out: Record<string, string> = {}; const missing: string[] = [];
  for (const id of uniq) { if (titleCache.has(id)) out[id] = titleCache.get(id)!; else missing.push(id); }
  const chunks: string[][] = []; while (missing.length) chunks.push(missing.splice(0, 10));
  for (const group of chunks) {
    const res = await Promise.allSettled(group.map((id) => retrievePage(id)));
    res.forEach((r, idx) => {
      const id = group[idx];
      if (r.status === "fulfilled") {
        const props: any = (r.value as any)?.properties || {};
        const titleKey = findTitleProperty(props);
        const title = titleKey ? getTitle(props[titleKey]) : "";
        titleCache.set(id, title); out[id] = title;
      } else { out[id] = ""; }
    });
  }
  return out;
}

type DatabaseSchema = Record<string, { type: string } & Record<string, any>>;
const schemaCache = new Map<string, DatabaseSchema>();

async function getDatabaseSchema(databaseId: string): Promise<DatabaseSchema> {
  if (schemaCache.has(databaseId)) return schemaCache.get(databaseId)!;
  const db = await notion.databases.retrieve({ database_id: databaseId });
  const props = (db as any)?.properties ?? {};
  schemaCache.set(databaseId, props);
  return props;
}

function ensurePropertyName(alias: string, mapping: Record<string, string | undefined>): string {
  const notionProp = mapping[alias];
  if (!notionProp) throw new MappingValidationError(`Propiedad desconocida para el alias "${alias}"`);
  return notionProp;
}

function toTextRich(value: string | undefined | null) {
  const text = value ?? "";
  if (!text) return [];
  return [{ type: "text", text: { content: text } }];
}

function mapValueToProperty(value: any, property: any, alias: string) {
  const type = property?.type;
  switch (type) {
    case "title": {
      if (typeof value !== "string") throw new MappingValidationError(`"${alias}" requiere texto`);
      return { title: toTextRich(value) };
    }
    case "rich_text": {
      if (typeof value !== "string") throw new MappingValidationError(`"${alias}" requiere texto enriquecido`);
      return { rich_text: toTextRich(value) };
    }
    case "select": {
      if (value === null || value === undefined || value === "") return { select: null };
      if (typeof value !== "string") throw new MappingValidationError(`"${alias}" requiere una opción (texto)`);
      return { select: { name: value } };
    }
    case "status": {
      if (value === null || value === undefined || value === "") return { status: null };
      if (typeof value !== "string") throw new MappingValidationError(`"${alias}" requiere un estado válido`);
      return { status: { name: value } };
    }
    case "multi_select": {
      if (!Array.isArray(value)) throw new MappingValidationError(`"${alias}" requiere una lista`);
      return { multi_select: value.filter((name: string) => Boolean(name)).map((name: string) => ({ name: String(name) })) };
    }
    case "relation": {
      if (!Array.isArray(value)) throw new MappingValidationError(`"${alias}" requiere IDs de relación (lista)`);
      return { relation: value.filter((id: string) => Boolean(id)).map((id: string) => ({ id: String(id) })) };
    }
    case "people": {
      if (!Array.isArray(value)) throw new MappingValidationError(`"${alias}" requiere IDs de personas (lista)`);
      return { people: value.filter((id: string) => Boolean(id)).map((id: string) => ({ id: String(id) })) };
    }
    case "number": {
      if (value === null || value === undefined || value === "") return { number: null };
      if (typeof value !== "number" || Number.isNaN(value)) throw new MappingValidationError(`"${alias}" requiere número válido`);
      return { number: value };
    }
    case "checkbox": {
      if (typeof value !== "boolean") throw new MappingValidationError(`"${alias}" requiere booleano`);
      return { checkbox: value };
    }
    case "date": {
      if (!value) return { date: null };
      if (typeof value === "string") return { date: { start: value } };
      if (typeof value === "object" && (value.start || value.end)) {
        return { date: { start: value.start ?? null, end: value.end ?? null } };
      }
      throw new MappingValidationError(`"${alias}" requiere fecha ISO (YYYY-MM-DD)`);
    }
    case "url": {
      if (value === null || value === undefined || value === "") return { url: null };
      if (typeof value !== "string") throw new MappingValidationError(`"${alias}" requiere URL`);
      return { url: value };
    }
    case "email": {
      if (value === null || value === undefined || value === "") return { email: null };
      if (typeof value !== "string") throw new MappingValidationError(`"${alias}" requiere email`);
      return { email: value };
    }
    case "phone_number": {
      if (value === null || value === undefined || value === "") return { phone_number: null };
      if (typeof value !== "string") throw new MappingValidationError(`"${alias}" requiere teléfono`);
      return { phone_number: value };
    }
    default:
      throw new MappingValidationError(`Propiedad Notion no soportada: ${String(type ?? "desconocida")}`);
  }
}

interface BuildOptions { allowEmpty?: boolean; }

async function buildPropertiesFromMapping(
  databaseId: string,
  mapping: Record<string, string>,
  data: Record<string, any>,
  options: BuildOptions = {}
) {
  const schema = await getDatabaseSchema(databaseId);
  const entries = Object.entries(data ?? {}).filter(([, value]) => value !== undefined);
  const properties: Record<string, any> = {};

  for (const [alias, rawValue] of entries) {
    const notionProp = ensurePropertyName(alias, mapping);
    const property = schema[notionProp];
    if (!property) throw new MappingValidationError(`La propiedad "${notionProp}" no existe en la base de datos`);
    const value = mapValueToProperty(rawValue, property, alias);
    properties[notionProp] = value;
  }

  if (!options.allowEmpty && Object.keys(properties).length === 0) {
    throw new MappingValidationError("No se proporcionaron campos válidos para sincronizar");
  }

  return properties;
}

export async function createPageFromMapping(
  databaseId: string,
  mapping: Record<string, string>,
  data: Record<string, any>
) {
  const properties = await buildPropertiesFromMapping(databaseId, mapping, data, { allowEmpty: false });
  return notion.pages.create({ parent: { database_id: databaseId }, properties });
}

export async function updatePageFromMapping(
  pageId: string,
  databaseId: string,
  mapping: Record<string, string>,
  data: Record<string, any>
) {
  const properties = await buildPropertiesFromMapping(databaseId, mapping, data, { allowEmpty: false });
  return notion.pages.update({ page_id: pageId, properties });
}

export async function deletePage(pageId: string) {
  return notion.pages.update({ page_id: pageId, archived: true });
}
