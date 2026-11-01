// Append or update KEIBA EDGE PRO in a built GAME BANK catalog without touching other entries.
import fs from 'node:fs';import path from 'node:path';
const root=path.resolve(process.argv[2]||'.');
const paths=['dist/data/games.json','public-mirror/data/games.json','data/games.json'].map(x=>path.join(root,x));
const target=paths.find(x=>fs.existsSync(x));if(!target)throw Error('GAME BANK catalog not found. Recover/build existing site before merging.');
const payload=JSON.parse(fs.readFileSync(target,'utf8'));const list=Array.isArray(payload)?payload:payload.games;
if(!Array.isArray(list)||list.length<100)throw Error('Refusing to replace an incomplete GAME BANK catalog');
const game={id:'keiba-edge-pro',title:'KEIBA EDGE PRO',description:'競馬新聞風予想・実レース検証・馬育成・レースゲーム（独自AI精度は未検証）',url:'/games/keiba-edge-pro/index.html',category:'スポーツ',tags:['競馬','予想','育成','レース'],hidden:false,listed:true,playable:true};
const i=list.findIndex(x=>x.id===game.id||x.url===game.url);if(i<0)list.push(game);else list[i]={...list[i],...game};
const destination=path.join(path.dirname(target),'..','games','keiba-edge-pro');
fs.mkdirSync(destination,{recursive:true});for(const filename of ['index.html','cover.svg']){const src=path.join(root,'public-mirror/games/keiba-edge-pro',filename);if(!fs.existsSync(src))throw Error('Missing '+src);fs.copyFileSync(src,path.join(destination,filename));}
fs.copyFileSync(target,target+'.before-keiba-edge-pro.bak');fs.writeFileSync(target,JSON.stringify(payload,null,2)+'\n');
console.log('KEIBA EDGE PRO registered',list.length,game.url);
