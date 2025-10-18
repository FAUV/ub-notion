import { accessSync, constants as fsConstants, promises as fs } from "node:fs";
import path from "node:path";

const DEFAULT_FILE_NAME = ".ub_mapping.json";
const FALLBACK_FILE_PATH = "/tmp/ub_mapping.json";
const CUSTOM_PATH_ENV = "UB_MAPPING_PATH";

let resolvedPath: string | null = null;

function isWritable(directory: string): boolean {
  try {
    accessSync(directory, fsConstants.W_OK);
    return true;
  } catch {
    return false;
  }
}

function determineStoragePath(): string {
  if (resolvedPath) return resolvedPath;

  const custom = process.env[CUSTOM_PATH_ENV];
  if (custom && custom.trim()) {
    resolvedPath = path.resolve(custom);
    return resolvedPath;
  }

  const preferredPath = path.join(process.cwd(), DEFAULT_FILE_NAME);
  const preferredDir = path.dirname(preferredPath);

  if (!process.env.VERCEL && isWritable(preferredDir)) {
    resolvedPath = preferredPath;
  } else {
    resolvedPath = FALLBACK_FILE_PATH;
  }

  return resolvedPath;
}

async function ensureDirectoryExists(filePath: string) {
  const directory = path.dirname(filePath);
  await fs.mkdir(directory, { recursive: true });
}

export function getStoragePath(): string {
  return determineStoragePath();
}

export async function readFromFile<T>(): Promise<T | null> {
  const filePath = determineStoragePath();
  try {
    const data = await fs.readFile(filePath, "utf-8");
    return JSON.parse(data) as T;
  } catch (error: any) {
    if (error?.code === "ENOENT") return null;
    throw error;
  }
}

export async function writeToFile<T>(data: T): Promise<void> {
  const filePath = determineStoragePath();
  await ensureDirectoryExists(filePath);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
}

export function __resetStoragePathForTests() {
  resolvedPath = null;
}
