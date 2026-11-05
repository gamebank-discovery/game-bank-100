import assert from "node:assert/strict";
import test from "node:test";
import worker from "./index.js";

function call(path, method = "GET") {
  const request = new Request("https://preview.example" + path, { method });
  const env = {
    ASSETS: {
      fetch: async (req) => new Response("asset:" + new URL(req.url).pathname, { status: 200 })
    }
  };
  return worker.fetch(request, env);
}

test("health endpoint responds without caching", async () => {
  const response = await call("/api/health");
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  const body = await response.json();
  assert.equal(body.ok, true);
  assert.equal(body.service, "game-bank-cloud-preview");
});

test("status endpoint identifies preview", async () => {
  const response = await call("/api/status");
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.environment, "preview");
  assert.equal(body.production_worker_unchanged, true);
});

test("unknown API route returns JSON 404, not SPA", async () => {
  const response = await call("/api/missing");
  assert.equal(response.status, 404);
  assert.equal((await response.json()).error, "not_found");
});

test("API does not accept writes", async () => {
  const response = await call("/api/health", "POST");
  assert.equal(response.status, 405);
  assert.equal((await response.json()).error, "method_not_allowed");
});

test("game assets use existing ASSETS binding", async () => {
  const response = await call("/games/pig-jump-evolution/index.html");
  assert.equal(response.status, 200);
  assert.equal(await response.text(), "asset:/games/pig-jump-evolution/index.html");
});
