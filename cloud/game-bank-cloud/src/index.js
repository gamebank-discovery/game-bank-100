// GAME BANK CLOUD: isolated preview Worker; does not modify legacy production.
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api/health") {
      return Response.json({ ok: true, service: "game-bank-cloud-preview", version: 1 }, {
        headers: { "cache-control": "no-store", "x-content-type-options": "nosniff" }
      });
    }
    if (url.pathname.startsWith("/api/")) {
      return Response.json({ error: "not_found" }, { status: 404 });
    }
    return env.ASSETS.fetch(request);
  }
};
