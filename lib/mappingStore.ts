import { promises as fs } from "node:fs";
import path from "node:path";
import { notion } from "@/lib/notion";
import { DEFAULT_MAPPING, type UbMapping } from "@/lib/mapping";

const FILE_PATH = path.join(process.cwd(), ".ub_mapping.json");
const BLOCK_ID = process.env.UB_MAPPING_BLOCK_ID;
const PAGE_ID = process.env.UB_MAPPING_PAGE_ID;

const canUseNotion = Boolean(process.env.NOTION_TOKEN) && process.env.UB_OFFLINE !== "true";

type CodeBlock = {
  object: "block";
  id: string;
  type: "code";
  code: {
    language: string;
    rich_text: Array<{ plain_text: string }>;
  };
};

type Block = CodeBlock & Record<string, unknown>;

async function readFromFile(): Promise<UbMapping | null> {
  try {
    const raw = await fs.readFile(FILE_PATH, "utf-8");
    return JSON.parse(raw) as UbMapping;
  } catch {
    return null;
  }
}

async function writeToFile(mapping: UbMapping) {
  await fs.writeFile(FILE_PATH, JSON.stringify(mapping, null, 2), "utf-8");
}

async function extractJsonFromBlock(block: Block): Promise<UbMapping | null> {
  try {
    const text = block.code.rich_text.map((t) => t.plain_text).join("");
    if (!text.trim()) return null;
    return JSON.parse(text);
  } catch {
    return null;
  }
}

async function readFromBlock(blockId: string): Promise<UbMapping | null> {
  if (!canUseNotion) return null;
  try {
    const block = (await notion.blocks.retrieve({ block_id: blockId })) as Block;
    if (block.object !== "block" || block.type !== "code") return null;
    return await extractJsonFromBlock(block);
  } catch {
    return null;
  }
}

async function readFromPage(pageId: string): Promise<UbMapping | null> {
  if (!canUseNotion) return null;
  try {
    let cursor: string | undefined;
    do {
      const res = await notion.blocks.children.list({ block_id: pageId, start_cursor: cursor });
      for (const block of res.results as Block[]) {
        if (block.type === "code" && block.code.language === "json") {
          const parsed = await extractJsonFromBlock(block);
          if (parsed) return parsed;
        }
      }
      cursor = res.has_more ? res.next_cursor ?? undefined : undefined;
    } while (cursor);
    return null;
  } catch {
    return null;
  }
}

async function findJsonCodeBlock(pageId: string): Promise<Block | null> {
  if (!canUseNotion) return null;
  try {
    let cursor: string | undefined;
    do {
      const res = await notion.blocks.children.list({ block_id: pageId, start_cursor: cursor });
      for (const block of res.results as Block[]) {
        if (block.type === "code" && block.code.language === "json") {
          return block;
        }
      }
      cursor = res.has_more ? res.next_cursor ?? undefined : undefined;
    } while (cursor);
  } catch {
    return null;
  }
  return null;
}

async function upsertBlock(blockId: string, json: string) {
  await notion.blocks.update({
    block_id: blockId,
    code: {
      language: "json",
      rich_text: [
        {
          type: "text",
          text: { content: json },
        },
      ],
    },
  } as any);
}

async function appendBlock(pageId: string, json: string): Promise<string | null> {
  const res = await notion.blocks.children.append({
    block_id: pageId,
    children: [
      {
        object: "block",
        type: "code",
        code: {
          language: "json",
          rich_text: [
            {
              type: "text",
              text: { content: json },
            },
          ],
        },
      },
    ],
  });
  const block = res.results?.[0];
  return (block as any)?.id ?? null;
}

async function writeToNotion(mapping: UbMapping) {
  if (!canUseNotion) return;
  const json = JSON.stringify(mapping, null, 2);
  if (BLOCK_ID) {
    await upsertBlock(BLOCK_ID, json);
    return;
  }
  if (PAGE_ID) {
    const block = await findJsonCodeBlock(PAGE_ID);
    if (block) {
      await upsertBlock(block.id, json);
      return;
    }
    await appendBlock(PAGE_ID, json);
  }
}

export async function readMapping(): Promise<UbMapping> {
  const fromNotion = BLOCK_ID ? await readFromBlock(BLOCK_ID) : PAGE_ID ? await readFromPage(PAGE_ID) : null;
  if (fromNotion) return fromNotion;
  const fromFile = await readFromFile();
  return fromFile ?? DEFAULT_MAPPING;
}

export async function writeMapping(mapping: UbMapping) {
  await writeToNotion(mapping).catch(() => undefined);
  await writeToFile(mapping);
}
