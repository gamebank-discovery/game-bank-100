// Cloudflare Pages Function: official Rakuten Ichiba item search, secrets only on server.
const json=(v,s=200)=>Response.json(v,{status:s,headers:{"cache-control":s===200?"public, max-age=0, s-maxage=600":"no-store","x-content-type-options":"nosniff"}});
const safeUrl=(u)=>{try{const v=new URL(String(u));return v.protocol==="https:"?v.href:null;}catch{return null;}};
export async function onRequestGet({request,env}){
 const keyword=(new URL(request.url).searchParams.get("q")||"").normalize("NFKC").trim();
 if(keyword.length<2||keyword.length>90)return json({error:"invalid_keyword"},400);
 const app=env.RAKUTEN_APPLICATION_ID,accessKey=env.RAKUTEN_ACCESS_KEY,aid=env.RAKUTEN_AFFILIATE_ID;
 if(!app||!accessKey)return json({items:[],setupRequired:true},503);
 const u=new URL("https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20260701");
 for(const [k,v] of Object.entries({applicationId:app,keyword,format:"json",formatVersion:"2",hits:"5",availability:"1",imageFlag:"1"}))u.searchParams.set(k,v);
 if(aid)u.searchParams.set("affiliateId",aid);
 try{
  const r=await fetch(u,{headers:{accessKey,Accept:"application/json"},signal:AbortSignal.timeout(8000)});
  if(!r.ok)return json({error:"upstream_unavailable",code:r.status},502);
  const body=await r.json();
  const items=(Array.isArray(body.items)?body.items:[]).map(x=>x.item||x).map(x=>{
    const img=x.mediumImageUrls?.[0]||x.smallImageUrls?.[0],aff=Boolean(aid&&safeUrl(x.affiliateUrl));
    return {title:String(x.itemName||"").slice(0,140),price:Number(x.itemPrice)||0,
      image:safeUrl(typeof img==="string"?img:img?.imageUrl||img?.url),
      url:aff?safeUrl(x.affiliateUrl):safeUrl(x.itemUrl),affiliate:aff};
  }).filter(x=>x.title&&x.price>0&&x.url).slice(0,3);
  return json({items,affiliateEnabled:Boolean(aid)});
 }catch{return json({error:"upstream_fetch_failed"},502);}
}
