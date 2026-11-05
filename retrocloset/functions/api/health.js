// Public integration readiness, not account secrets.
export async function onRequestGet({env}){
 return Response.json({platform:"Cloudflare Pages",site:"RetroCloset",looks:720,
   rakutenConfigured:Boolean(env.RAKUTEN_APPLICATION_ID&&env.RAKUTEN_ACCESS_KEY),
   affiliateConfigured:Boolean(env.RAKUTEN_AFFILIATE_ID),
   baseConfigured:Boolean(env.BASE_API_TOKEN&&env.BASE_SHOP_URL)},
   {headers:{"cache-control":"no-store"}});
}
