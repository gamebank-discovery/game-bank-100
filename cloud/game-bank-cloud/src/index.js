// GAME BANK CLOUD: isolated preview Worker; never changes the legacy production Worker.
// Health and diagnostics are intentionally public but disclose no secrets.
const JSON_HEADERS = {
  "cache-control": "no-store",
  "content-type": "application/json; charset=utf-8",
  "x-content-type-options": "nosniff"
};

function json(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // Only GET and HEAD are valid for read-only preview endpoints.
    if (path.startsWith("/api/") && request.method !== "GET" && request.method !== "HEAD") {
      return json({ error: "method_not_allowed" }, 405);
    }

    if (path === "/api/health") {
      return json({ ok: true, service: "game-bank-cloud-preview", version: 2 });
    }

    if (path === "/api/status") {
      return json({
        service: "game-bank-cloud-preview",
        environment: "preview",
        status: "ready",
        production_worker_unchanged: true
      });
    }

    if (path.startsWith("/api/")) {
      return json({ error: "not_found" }, 404);
    }

    // Static assets are served from the existing GAME BANK build output.
    // Do not redirect API 404s to the single-page application.
    return env.ASSETS.fetch(request);
  }
};
