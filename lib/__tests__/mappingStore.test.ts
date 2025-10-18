import assert from "node:assert/strict";
import { afterEach, beforeEach, test } from "node:test";
import { promises as fs } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { __resetStoragePathForTests, getStoragePath, readFromFile, writeToFile } from "../mappingStore";

let tempDir: string | null = null;

beforeEach(async () => {
  __resetStoragePathForTests();
  delete process.env.UB_MAPPING_PATH;
  delete process.env.VERCEL;
  if (tempDir) {
    await fs.rm(tempDir, { recursive: true, force: true });
    tempDir = null;
  }
});

afterEach(async () => {
  __resetStoragePathForTests();
  delete process.env.UB_MAPPING_PATH;
  delete process.env.VERCEL;
  if (tempDir) {
    await fs.rm(tempDir, { recursive: true, force: true });
    tempDir = null;
  }
});

test("readFromFile returns null when the mapping file is missing", async () => {
  tempDir = await fs.mkdtemp(path.join(tmpdir(), "mapping-store-"));
  const customPath = path.join(tempDir, "mapping.json");
  process.env.UB_MAPPING_PATH = customPath;

  const result = await readFromFile<Record<string, unknown>>();
  assert.equal(result, null);
});

test("writeToFile persists JSON using the configured path", async () => {
  tempDir = await fs.mkdtemp(path.join(tmpdir(), "mapping-store-"));
  const customPath = path.join(tempDir, "mapping.json");
  process.env.UB_MAPPING_PATH = customPath;

  const payload = { foo: "bar", count: 2 };
  await writeToFile(payload);

  const stored = await fs.readFile(customPath, "utf-8");
  assert.deepEqual(JSON.parse(stored), payload);

  const roundTrip = await readFromFile<typeof payload>();
  assert.deepEqual(roundTrip, payload);
});

test("getStoragePath falls back to /tmp on read-only deployments", () => {
  process.env.VERCEL = "1";

  const storagePath = getStoragePath();
  assert.equal(storagePath, "/tmp/ub_mapping.json");
});
