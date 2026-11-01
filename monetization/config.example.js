/* Copy the approved values to monetization/config.js after review.
   NEVER add affiliate passwords, API tokens, or secrets here. */
window.GAMEBANK_MONETIZATION = {
  adsense: {
    enabled: false,
    approved: false,
    publisherId: "", // e.g. ca-pub-xxxxxxxxxxxxxxxx (real account only)
    slots: { catalog: "", gameover: "" }
  },
  affiliate: {
    enabled: false,
    disclosure: "このページには広告・アフィリエイトリンクが含まれます。",
    offers: [
      // { id:"outfit-001", title:"コーデの商品を見る", network:"Rakuten", url:"https://hb.afl.rakuten.co.jp/..." }
      // { id:"item-002", title:"おすすめの商品を見る", network:"A8", url:"https://px.a8.net/..." }
    ]
  }
};