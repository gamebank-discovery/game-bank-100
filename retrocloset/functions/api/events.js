// Click logging only; never claims revenue, and never stores a user identifier.
export async function onRequestPost({request}){
 if(request.headers.get("content-length")&&Number(request.headers.get("content-length"))>512)return new Response(null,{status:413});
 const origin=request.headers.get("origin");
 if(origin&&origin!==new URL(request.url).origin)return new Response(null,{status:403});
 let v;try{v=await request.json();}catch{return new Response(null,{status:400});}
 if(v?.event!=="outbound_click"||!["rakuten","base"].includes(v.channel)||
   !Number.isInteger(v.look)||v.look<0||v.look>720)return new Response(null,{status:400});
 console.log("retrocloset_outbound_click",JSON.stringify({channel:v.channel,look:v.look,date:new Date().toISOString()}));
 return new Response(null,{status:204});
}
