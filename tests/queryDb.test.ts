import assert from "node:assert/strict";
import { queryDb, notion } from "../lib/notion";

type QueryCall = Parameters<typeof notion.databases.query>[0];

async function testPaginatesAllResults() {
  const filter = { property: "Status", select: { equals: "Done" } };
  const sorts = [{ property: "Name", direction: "ascending" as const }];
  const pages = [
    { results: [{ id: "1" }, { id: "2" }], has_more: true, next_cursor: "cursor-1" },
    { results: [{ id: "3" }, { id: "4" }], has_more: true, next_cursor: "cursor-2" },
    { results: [{ id: "5" }], has_more: false, next_cursor: null },
  ];
  const calls: QueryCall[] = [];
  const notionClient = notion as any;
  const original = notionClient.databases.query;

  notionClient.databases.query = async (params: QueryCall) => {
    calls.push(params);
    const page = pages.shift();
    if (!page) throw new Error("No more pages");
    return page;
  };

  try {
    const results = await queryDb("db-123", { filter, sorts, page_size: 2 });

    assert.equal(results.length, 5, "should accumulate all results across pages");
    assert.deepEqual(results.map((r: any) => r.id), ["1", "2", "3", "4", "5"]);

    assert.equal(calls.length, 3, "should query until has_more is false");
    assert.deepEqual(calls[0], { database_id: "db-123", filter, sorts, page_size: 2 });
    assert(!("start_cursor" in calls[0]), "first call should not send start_cursor");
    assert.equal(calls[1]?.start_cursor, "cursor-1");
    assert.equal(calls[2]?.start_cursor, "cursor-2");
  } finally {
    notionClient.databases.query = original;
  }
}

async function testRespectsInitialCursor() {
  const filter = { property: "Status", select: { equals: "Pending" } };
  const pages = [
    { results: [{ id: "10" }], has_more: true, next_cursor: "cursor-20" },
    { results: [{ id: "20" }], has_more: false, next_cursor: null },
  ];
  const calls: QueryCall[] = [];
  const notionClient = notion as any;
  const original = notionClient.databases.query;

  notionClient.databases.query = async (params: QueryCall) => {
    calls.push(params);
    const page = pages.shift();
    if (!page) throw new Error("No more pages");
    return page;
  };

  try {
    const results = await queryDb("db-999", { filter, start_cursor: "initial-cursor" });

    assert.deepEqual(results.map((r: any) => r.id), ["10", "20"]);
    assert.equal(calls[0]?.start_cursor, "initial-cursor");
    assert.equal(calls[1]?.start_cursor, "cursor-20");
  } finally {
    notionClient.databases.query = original;
  }
}

(async function run() {
  await testPaginatesAllResults();
  await testRespectsInitialCursor();
  console.log("queryDb tests passed");
})();
