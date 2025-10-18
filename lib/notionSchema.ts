import { notion } from "@/lib/notion";

type PropertyType = string;

const schemaCache = new Map<string, Record<string, PropertyType>>();

export async function getDatabasePropertyTypes(databaseId: string): Promise<Record<string, PropertyType>> {
  if (schemaCache.has(databaseId)) return schemaCache.get(databaseId)!;
  const db = await notion.databases.retrieve({ database_id: databaseId });
  const props: Record<string, PropertyType> = {};
  for (const [name, value] of Object.entries(db.properties)) {
    props[name] = (value as any)?.type ?? "unknown";
  }
  schemaCache.set(databaseId, props);
  return props;
}
