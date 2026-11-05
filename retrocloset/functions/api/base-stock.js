// Cloudflare Pages Function: optional read-only BASE product catalog.
const json=(v,s=200)=>Response.json(v,{status:s,headers:{"cache-control":s===200?"public, max-age=0, s-maxage=180":"no-store","x-content-type-options":"nosniff"}});
const https=(x)=>{try{const u=new URL(String(x));return u.protocol==="https:"?u.href:null;}catch{return null;}};
export async function onRequestGet({env}){
 const token=env.BASE_API_TOKEN,shop=https(env.BASE_SHOP_URL);
 if(!token||!shop)return json({connected:false,items:[],setupRequired:true});
 try{
  const r=await fetch("https://apiv2.thebase.com/api/items?limit=40",{
    headers:{Authorization:"Bearer "+token,Accept:"application/json"},
    signal:AbortSignal.timeout(8000)});
  if(!r.ok)return json({connected:false,items:[],error:"base_unavailable"},502);
  const body=await r.json();
  const items=(Array.isArray(body.items)?body.items:[]).filter(x=>
    x.type==="normal"&&x.visible===true&&x.sales_status==="item_now_on_sale"&&
    Number(x.stock)>0&&Number(x.price)>0).map(x=>{
    const id=Number(x.id);if(!Number.isSafeInteger(id)||id<1)return null;
    return {id,title:String(x.name||"").slice(0,120),price:Number(x.price),
      stock:Number(x.stock),image:https(x.images?.[0]?.scaled_url||x.images?.[0]?.url),
      url:new URL("/items/"+id,shop).href};
  }).filter(Boolean).slice(0,24);
  return json({connected:true,items});
 }catch{return json({connected:false,items:[],error:"base_fetch_failed"},502);}
}
