/* GAME BANK monetization adapter — no dependencies, defaults disabled.
   Integrate only after the existing GAME BANK source has been recovered.
   HTML: <div data-gb-affiliate-list></div>
         <div data-gb-ad-slot="catalog"></div>
         <script src="/monetization/config.js"></script>
         <script defer src="/monetization/gamebank-monetize.js"></script> */
(function () {
  "use strict";
  const config = window.GAMEBANK_MONETIZATION || {};
  const aff = config.affiliate || {};
  const ads = config.adsense || {};
  const allowedHosts = new Set(["hb.afl.rakuten.co.jp", "px.a8.net"]);
  const approvedURL = (value) => {
    try {
      const u = new URL(value);
      return u.protocol === "https:" && allowedHosts.has(u.hostname) ? u.href : "";
    } catch (_) { return ""; }
  };
  function renderOffers() {
    document.querySelectorAll("[data-gb-affiliate-list]").forEach((host) => {
      host.textContent = "";
      const offers = aff.enabled && Array.isArray(aff.offers) ? aff.offers : [];
      const approved = offers.filter(x => x && approvedURL(x.url) && typeof x.title === "string");
      if (!approved.length) return;
      const section = document.createElement("section");
      section.className = "gb-commerce";
      const heading = document.createElement("h2");
      heading.textContent = "ゲームの世界を、リアルでも楽しもう";
      section.append(heading);
      const disclosure = document.createElement("p");
      disclosure.className = "gb-disclosure";
      disclosure.textContent = aff.disclosure || "このページには広告・アフィリエイトリンクが含まれます。";
      section.append(disclosure);
      const grid = document.createElement("div");
      grid.className = "gb-commerce-grid";
      approved.forEach((offer) => {
        const link = document.createElement("a");
        link.className = "gb-offer";
        link.href = approvedURL(offer.url);
        link.rel = "sponsored nofollow noopener noreferrer";
        link.target = "_blank";
        const title = document.createElement("strong");
        title.textContent = offer.title.slice(0, 100);
        const provider = document.createElement("small");
        provider.textContent = (offer.network === "A8" ? "A8" : "楽天") + "｜PR・商品を見る";
        link.append(title, provider);
        link.addEventListener("click", () => {
          window.dispatchEvent(new CustomEvent("gb:affiliate-click", {
            detail: { id: String(offer.id || "").slice(0, 100), network: String(offer.network || "") }
          }));
        });
        grid.append(link);
      });
      section.append(grid);
      host.append(section);
    });
  }
  function renderAds() {
    // AdSense requires a real publisher ID, site approval and valid ad unit IDs.
    // The host site must implement a compliant consent/CMP flow when required.
    if (!ads.enabled || !ads.approved || !/^ca-pub-\d{16}$/.test(ads.publisherId || "")) return;
    const slots = ads.slots || {};
    const nodes = [...document.querySelectorAll("[data-gb-ad-slot]")];
    const configured = nodes.filter(node => /^\d+$/.test(String(slots[node.dataset.gbAdSlot] || "")));
    if (!configured.length) return;
    const script = document.createElement("script");
    script.async = true;
    script.crossOrigin = "anonymous";
    script.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=" + encodeURIComponent(ads.publisherId);
    script.onload = () => configured.forEach((node) => {
      const label = document.createElement("small");
      label.className = "gb-ad-label";
      label.textContent = "広告";
      const unit = document.createElement("ins");
      unit.className = "adsbygoogle";
      unit.style.display = "block";
      unit.dataset.adClient = ads.publisherId;
      unit.dataset.adSlot = String(slots[node.dataset.gbAdSlot]);
      unit.dataset.adFormat = "auto";
      unit.dataset.fullWidthResponsive = "true";
      node.append(label, unit);
      try { (window.adsbygoogle = window.adsbygoogle || []).push({}); }
      catch (error) { console.warn("AdSense load deferred:", error); }
    });
    document.head.append(script);
  }
  function boot() { renderOffers(); renderAds(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();