(() => {
'use strict';
const el=id=>document.getElementById(id);
const STAGES=[[1,"こぶた","🐷",[1,0.65,0.72],[1,0.77,0.78],"小さな冒険のはじまり"],[2,"いちごブタ","🍓",[1,0.44,0.53],[0.98,0.91,0.6],"背中にいちごの種"],[3,"しましまブタ","🦓",[0.93,0.75,0.7],[0.5,0.33,0.4],"元気なボーダー模様"],[4,"ミツバチブタ","🐝",[1,0.82,0.31],[0.24,0.22,0.26],"ハチの触角と羽"],[5,"忍者ブタ","🥷",[0.28,0.33,0.48],[0.96,0.3,0.43],"秘密の忍者ヘッドバンド"],[6,"パイロットブタ","🛩️",[0.78,0.55,0.38],[0.46,0.78,0.97],"空飛ぶゴーグル"],[7,"アイスブタ","❄️",[0.69,0.89,1],[0.97,0.99,1],"氷の結晶をまとう"],[8,"マシュマロブタ","☁️",[1,0.91,0.95],[1,0.73,0.88],"ふわふわの雲ボディ"],[9,"ロックブタ","🎸",[0.85,0.42,0.67],[0.18,0.17,0.21],"クールなサングラス"],[10,"ドラゴンブタ","🐉",[0.43,0.84,0.65],[1,0.68,0.27],"ドラゴンの角と背びれ"],[11,"サムライブタ","⚔️",[0.48,0.72,0.87],[1,0.75,0.25],"武将の兜を装備"],[12,"マリンブタ","⚓",[0.55,0.81,1],[0.96,0.97,1],"セーラー帽で大航海"],[13,"うさみみブタ","🐰",[1,0.8,0.89],[1,0.48,0.72],"ながーいうさ耳"],[14,"宇宙飛行士ブタ","🧑‍🚀",[0.85,0.88,0.98],[0.3,0.74,1],"スペースヘルメット"],[15,"ユニコーンブタ","🦄",[0.85,0.76,1],[1,0.82,0.37],"虹色の一本角"],[16,"海賊ブタ","🏴‍☠️",[0.55,0.47,0.43],[0.96,0.78,0.32],"海賊帽と眼帯"],[17,"魔法使いブタ","🪄",[0.61,0.46,0.94],[1,0.77,0.39],"魔法のとんがり帽子"],[18,"メカブタ","🤖",[0.63,0.75,0.82],[0.22,0.91,0.92],"機械の目とジェット"],[19,"アイドルブタ","🎀",[1,0.59,0.85],[1,0.88,0.94],"大きなリボンで変身"],[20,"キングブタ","👑",[0.97,0.76,0.31],[0.96,0.93,0.72],"きらめく王冠"],[21,"サーファーブタ","🏄",[0.38,0.85,0.84],[1,0.55,0.27],"南国サングラス"],[22,"フェニックスブタ","🔥",[1,0.43,0.25],[1,0.86,0.28],"火の鳥のような羽"],[23,"天使ブタ","😇",[1,0.93,0.87],[0.98,0.88,0.55],"天使の光輪"],[24,"デビルブタ","😈",[0.53,0.29,0.64],[0.98,0.38,0.48],"小悪魔のツノ"],[25,"クリスタルブタ","💎",[0.57,0.77,1],[0.9,0.97,1],"背中の宝石クリスタル"],[26,"サンダーブタ","⚡",[0.94,0.84,0.38],[0.28,0.64,0.98],"ビリビリ雷エフェクト"],[27,"ジェットブタ","🚀",[0.61,0.72,0.86],[1,0.5,0.27],"背中のツインエンジン"],[28,"ギャラクシーブタ","🪐",[0.43,0.38,0.83],[0.91,0.62,1],"星の軌道をまとって"],[29,"伝説のブタ","🌈",[1,0.73,0.86],[0.41,1,0.83],"虹のきらめきを解放"],[30,"神話のブタ","🌟",[1,0.87,0.55],[0.83,0.79,1],"世界でただ一匹の神話豚"]].map(([min,name,emoji,color,accent,tag])=>({min,name,emoji,color,accent,tag}));
const LIMIT=1200;
const stageFor=lv=>STAGES.reduce((acc,s)=>lv>=s.min?s:acc,STAGES[0]);
const nextStage=lv=>STAGES.find(s=>s.min>lv);
const clamp=(a,lo,hi)=>Math.max(lo,Math.min(hi,a));
let saved={best:0,carrots:0,level:1,runs:0,muted:false,volume:.72};
try{const x=JSON.parse(localStorage.getItem('pig-jump-evolution-v1'));if(x&&typeof x==='object'){saved={...saved,...x};saved.level=clamp(Math.floor(Number(saved.level)||1),1,30);saved.best=Number(saved.best)||0;saved.carrots=Math.max(0,Number(saved.carrots)||0);saved.volume=clamp(Number(saved.volume??.72),0,1)}}catch(e){}
function persist(){try{localStorage.setItem('pig-jump-evolution-v1',JSON.stringify(saved))}catch(e){}}
const p={phase:'menu',z:0,y:0,vy:0,speed:0,holding:false,boosted:false,carrots:0,combo:0,score:0,earned:0,last:0,toastTimer:0,items:[],spin:0};
function initItems(){p.bonuses=Array.from({length:29},(_,i)=>({z:156+i*36,y:15+Math.sin(i*.85)*9+Math.min(i*.24,6),kind:['ring','star','square','feather'][i%4],taken:false,missed:false,phase:i*.7}));p.items=Array.from({length:36},(_,i)=>({z:138+i*26,y:13+Math.sin(i*.9)*7+Math.min(20,i*.3),taken:false,missed:false,phase:i*.7}));
 p.events=['carrot','ring','star'].sort(()=>Math.random()-.5).map((type,i)=>({type,start:171+i*82,end:242+i*82}));
 for(const e of p.events){
  if(e.type==='carrot'){
   for(let i=0;i<11;i++)p.items.push({z:e.start+6+i*5.6,y:19+Math.sin(i*.74)*7,taken:false,missed:false,phase:10+i*.5,event:true});
  }else{
   for(let i=0;i<8;i++)p.bonuses.push({z:e.start+7+i*7.5,y:20+Math.sin(i*.61)*6,kind:e.type==='ring'?'ring':'star',taken:false,missed:false,phase:i*.55,event:true});
  }
 }
 p.eventActive=null;
}
initItems();
/* __PIG_SLOW_GROW_V1__ : More flights per evolution; leave existing saved data untouched */
function shopCost(){return Math.round(260+saved.level*47+6*Math.pow(saved.level,1.15));}
function upgradeWaitRuns(){
 const last=Number(saved.lastEvolutionRun);
 if(!Number.isFinite(last)||saved.lastEvolutionRun===undefined)return 0;
 return Math.max(0,3-Math.max(0,Math.floor(Number(saved.runs)||0)-Math.floor(last)));
}

function installExtras(){
 const footer=el('modalFoot');
 if(footer&&typeof footer.insertAdjacentHTML==='function'){
  footer.insertAdjacentHTML('beforebegin','<div class="pig-extra"><button id="evoGuide" type="button">🐖 進化図鑑 <b id="evoCounter">1 / 30</b> <span>⌄</span></button><div id="evoAlbum" class="pig-album" hidden></div><div class="pig-audio"><label for="volume">🎵 BGM・効果音　<strong id="volumeValue">72%</strong></label><input id="volume" type="range" min="0" max="100" step="5" value="72"><div id="audioNote">▶ スタートを押すと音が鳴ります</div></div></div>');
 }
 if(typeof document.createElement==='function'){
  const style=document.createElement('style');
  style.textContent='.pig-extra{margin:13px 0 15px;text-align:left}.pig-extra button{touch-action:manipulation}#evoGuide{width:100%;border:1px solid #ffd7dd7d;background:#ffffff16;color:white;padding:13px;border-radius:15px;display:flex;justify-content:space-between;font-size:14px;font-weight:900}#evoGuide b{color:#ffe1a9}#evoAlbum{margin:10px 0;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));max-height:260px;overflow:auto;gap:6px}.evo-cell{min-width:0;padding:8px 3px;background:#ffffff13;border:1px solid #ffffff25;border-radius:11px;text-align:center;font-size:10px;color:#fff;line-height:1.4}.evo-cell b{display:block;font-size:22px}.evo-cell.active{border-color:#ffd58d;background:#ffdb9740}.evo-cell.locked{opacity:.49}.evo-cell small{color:#ffdea8;font-size:10px}.pig-audio{margin-top:11px;background:#ffffff0d;border-radius:15px;padding:12px;border:1px solid #ffffff30}.pig-audio label{display:flex;align-items:center;justify-content:space-between;font-size:12px;font-weight:900}.pig-audio input{margin:10px 0 1px;width:100%;height:18px;accent-color:#ffadc6;cursor:pointer}.pig-audio #audioNote{color:#dbe1eb;font-size:10px;line-height:1.5}';
  (document.head||document.body).appendChild(style);
 }
 const vol=el('volume');
 if(vol){vol.value=String(Math.round((saved.volume??.72)*100));vol.addEventListener('input',()=>{
   saved.volume=clamp(Number(vol.value)/100,0,1);
   el('volumeValue').textContent=Math.round(saved.volume*100)+'%';
   PigAudio.setVolume(saved.volume);persist();
 });}
 const guide=el('evoGuide');
 if(guide)guide.addEventListener('click',()=>{const album=el('evoAlbum');if(album){album.hidden=!album.hidden;sfx('tap');}});
}
function paintAlbum(){
 const grid=el('evoAlbum');if(!grid||typeof grid.innerHTML==='undefined')return;
 grid.innerHTML=STAGES.map(s=>'<div class="evo-cell '+(saved.level===s.min?'active':saved.level<s.min?'locked':'')+'"><b>'+(saved.level>=s.min?s.emoji:'🔒')+'</b><small>LV.'+s.min+'</small><div>'+s.name+'</div></div>').join('');
 const counter=el('evoCounter');if(counter)counter.textContent=Math.min(30,saved.level)+' / 30';
}
installExtras();


function setupFlyingControls(){
 if(!document.body||!document.createElement)return;
 const style=document.createElement('style');
 style.textContent='#flightDeck{position:fixed;bottom:calc(env(safe-area-inset-bottom) + 80px);left:50%;transform:translateX(-50%);width:min(97vw,460px);display:none;z-index:16;gap:6px;pointer-events:auto}#flightDeck button{flex:1;min-height:56px;padding:6px 1px;background:linear-gradient(135deg,#fffef4,#ffcbe5);border:2px solid white;border-radius:16px;color:#553357;font:900 12px/1.3 system-ui;box-shadow:0 5px 15px #27142a77;touch-action:manipulation}#flightDeck button:active{transform:scale(.95)}#flightDeck button:disabled{opacity:.42}#flightPoints{position:fixed;top:calc(env(safe-area-inset-top) + 93px);right:15px;z-index:12;display:none;padding:8px 12px;border:1px solid #fff8;border-radius:15px;background:#152c4fe6;color:#fff;font:900 14px system-ui;pointer-events:none}#flightKey{position:fixed;bottom:calc(env(safe-area-inset-bottom) + 145px);left:50%;transform:translateX(-50%);z-index:12;display:none;background:#172947d9;border-radius:40px;padding:6px 11px;color:white;font:700 11px system-ui;white-space:nowrap;pointer-events:none}@media(max-height:610px){#flightDeck{bottom:54px}#flightKey{bottom:118px}#flightPoints{top:69px}}';
 (document.head||document.body).appendChild(style);
 const d=document.createElement('div');d.id='flightDeck';
 d.innerHTML='<button type="button" data-fly="flap">🪽<br>羽ばたき <span id="flapLeft">3</span></button><button type="button" data-fly="glide">☁️<br>滑空</button><button type="button" data-fly="spin">🌀<br>スピン</button><button type="button" data-fly="dive">⬇️<br>ダイブ</button>';
 const s=document.createElement('div');s.id='flightPoints';s.textContent='✨ 0 PTS';
 const g=document.createElement('div');g.id='flightKey';g.textContent='⭕ +120　⭐ +80　◻️ +55　🪶 +45';
 document.body.appendChild(d);document.body.appendChild(s);document.body.appendChild(g);
 d.addEventListener('pointerdown',e=>e.stopPropagation());
 d.addEventListener('click',e=>{
  const b=e.target.closest('button[data-fly]');if(!b||p.phase!=='air')return;
  e.preventDefault();e.stopPropagation();const a=b.dataset.fly;
  if(a==='flap'&&p.flaps>0&&p.actionCool<=0){p.vy+=.30+Math.min(saved.level,20)*.003;p.flaps--;p.actionCool=16;toast('🪽 羽ばたき！');sfx('boost');}
  else if(a==='glide'&&!p.glideUsed){p.glide=110;p.glideUsed=true;toast('☁️ 滑空！');sfx('tap');}
  else if(a==='spin'&&!p.spinUsed){p.spinAct=110;p.spinUsed=true;p.points+=20;toast('🌀 スピン +20');sfx('level');}
  else if(a==='dive'&&!p.diveUsed){p.vy-=.24;p.speed+=.19;p.diveUsed=true;p.points+=25;toast('⬇️ ダイブ +25');sfx('boost');}
  updateFlyUI();
 });
}
function flyMenu(v){
 for(const [id,on] of [['flightDeck','flex'],['flightPoints','block'],['flightKey','block']]){const e=el(id);if(e)e.style.display=v?on:'none';}
 if(v)updateFlyUI();
}
function updateFlyUI(){
 const e=el('flightPoints');if(e)e.textContent='✨ '+(p.points||0)+' PTS';
 const f=el('flapLeft');if(f)f.textContent=p.flaps??3;
 const d=el('flightDeck');if(!d||!d.querySelectorAll)return;
 for(const b of d.querySelectorAll('button')){
  const a=b.dataset.fly;b.disabled=a==='flap'?p.flaps<=0||p.actionCool>0:a==='glide'?!!p.glideUsed:a==='spin'?!!p.spinUsed:!!p.diveUsed;
 }
}
function collectBonuses(){
 for(const b of p.bonuses||[]){
  if(b.taken||b.missed||p.z<b.z)continue;
  if(Math.abs(p.y-b.y)>18){b.missed=true;continue;}
  b.taken=true;funCollect(b);const pts={ring:120,star:80,square:55,feather:45}[b.kind];
  const carrots={ring:2,star:2,square:1,feather:1}[b.kind];
  const m=(p.spinAct>0?2:1)*eventPointsMult(b.kind);p.points+=pts*m;p.carrots+=carrots;
  if(p.magnet>0)p.worldScore+=15;if(b.kind==='ring'){p.vy+=.085;chargeDuo(14);missionHit('rings');}
  if(b.kind==='feather')p.glide=Math.max(p.glide||0,24);
  sfx(b.kind==='star'?'level':'carrot');toast(({ring:'⭕',star:'⭐',square:'◻️',feather:'🪶'})[b.kind]+' +'+pts*m+' PTS!');
 }
 updateFlyUI();
}
function pigDeluxe(tr,lv,now,accent,skin){
 const ball=(x,y,z,rx,ry,rz,c)=>uvBall(x,y,z,rx,ry,rz,c,tr,5,9);
 for(const s of [-1,1]){
  ball(s*.56,1.69,1.73,.23,.14,.09,[Math.min(1,skin[0]*1.06),skin[1]*.84,skin[2]*.88]);
  ball(s*.37,1.99,1.88,.069,.083,.027,[.17,.14,.22]);
  ball(s*.34,2.055,1.91,.041,.043,.021,[1,.99,1]);
  ball(s*.36,2.28,1.52,.24,.05,.075,skin);
 }
 ball(0,1.29,1.91,.32,.07,.068,[.85,.42,.51]);
 // Animated multifeather wings, on all pigs, with larger wings after evolving.
 const beat=p.phase==='air'?Math.sin(now*.018)*.34:Math.sin(now*.003)*.075;
 const count=lv>=20?5:lv>=10?4:3;
 for(const s of [-1,1]){
  ball(s*1.12,1.91,-.43,.32,.26,.47,[.99,.95,.96]);
  for(let i=0;i<count;i++){
   const f=i/(count-1),c=i%2?[.93,.87,1]:lv>=20?[1,.86,.63]:[1,.97,1];
   ball(s*(1.33+i*.30),1.90+i*.11+beat*(.35+f*.75),-.49-i*.14,.36-f*.06,.15,.55+f*.13,c);
  }
 }
 for(let i=0;i<6;i++){const a=i*.82;ball(Math.cos(a)*.26,1.57+Math.sin(a)*.23,-1.83-i*.045,.085,.085,.09,skin);}
}
function flightBonusModel(b,now){
 const ball=(x,y,z,rx,ry,rz,c)=>uvBall(x,y,z,rx,ry,rz,c,(px,py,pz)=>[px,py,pz],5,8);
 const y=b.y+Math.sin(now*.002+b.phase)*.37,z=b.z;
 if(b.kind==='ring'){
  for(let k=0;k<12;k++){const t=k*Math.PI/6;ball(Math.cos(t)*2.7,y+Math.sin(t)*2.7,z,.31,.31,.25,k%2?[1,.78,.25]:[1,.96,.65]);}
 }else if(b.kind==='star'){
  ball(0,y,z,.64,.64,.30,[1,.78,.19]);
  for(let k=0;k<5;k++){const t=k*Math.PI*2/5;ball(Math.sin(t)*1.27,y+Math.cos(t)*1.27,z,.38,.38,.27,[1,.96,.36]);}
 }else if(b.kind==='square'){
  for(let i=-3;i<=3;i++){ball(i*.53,y+1.73,z,.28,.30,.19,[.43,.92,1]);ball(i*.53,y-1.73,z,.28,.30,.19,[.43,.92,1]);}
  for(let i=-2;i<=2;i++){ball(-1.7,y+i*.53,z,.28,.30,.19,[.40,.84,1]);ball(1.7,y+i*.53,z,.28,.30,.19,[.40,.84,1]);}
 }else{
  for(let i=0;i<8;i++){const f=i/7;ball((f-.5)*1.35,y+(f-.5)*1.95,z,.19+.24*Math.sin(f*Math.PI),.41,.15,i%2?[.76,.90,1]:[1,.99,1]);}
 }
}
setupFlyingControls();


function groundJump(){
 if(p.phase==='ready'){
   p.phase='run';p.holding=false;
   const v=el('phase');if(v)v.textContent='FULL SPEED!';
 }
 if(p.phase==='run'&&!(p.hopY>0)){
   p.hopY=.01;p.hopV=.43+Math.min(p.speed,2)*.035;
   p.holding=false;sfx('boost');toast('🐷 JUMP!');
   p.lastTapHandled=Date.now();return true;
 }
 if(p.phase==='air'&&p.flaps>0&&p.actionCool<=0){
   p.vy+=.30;p.flaps--;p.actionCool=14;sfx('boost');
   toast('🪽 羽ばたき！');updateFlyUI();p.lastTapHandled=Date.now();return true;
 }
 return false;
}
function createGroundJump(){
 if(!document.createElement||!document.body)return;
 const st=document.createElement('style');
 st.textContent='#groundJump{position:fixed;bottom:calc(env(safe-area-inset-bottom) + 100px);left:max(12px,env(safe-area-inset-left));z-index:22;display:none;min-width:122px;min-height:65px;padding:11px 15px;border-radius:22px;border:3px solid #fff;background:linear-gradient(145deg,#ffe7a0,#ff7fa3);box-shadow:0 5px 0 #a64365,0 12px 18px #1b284c99;color:#642944;font:900 16px/1.15 system-ui;pointer-events:auto;touch-action:none;-webkit-tap-highlight-color:transparent}#groundJump:active{transform:translateY(3px);box-shadow:0 2px 0 #a64365}#action{touch-action:none;pointer-events:auto;cursor:pointer}';
 (document.head||document.body).appendChild(st);
 const b=document.createElement('button');b.type='button';b.id='groundJump';b.textContent='🐷 JUMP!';b.setAttribute('aria-label','ジャンプ');document.body.appendChild(b);
 let lastPointer=0;
 b.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();lastPointer=Date.now();groundJump();});
 b.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();if(Date.now()-lastPointer>450)groundJump();});
}
createGroundJump();


/* __PIG_VNEXT_EVENTS_V1__ */
const pigEventThemes={
 carrot:{name:'にんじんフィーバー',icon:'🥕',info:'ニンジンが大量出現・獲得アップ',sky:'radial-gradient(circle at 48% 32%,rgba(255,179,83,.50),transparent 70%)'},
 ring:{name:'リングラッシュ',icon:'⭕',info:'輪っか連続出現・獲得得点2倍',sky:'radial-gradient(circle at 48% 32%,rgba(255,228,86,.43),transparent 70%)'},
 star:{name:'スターストーム',icon:'⭐',info:'星が大量出現・獲得得点2倍',sky:'radial-gradient(circle at 48% 32%,rgba(174,141,255,.45),transparent 70%)'}
};
function setupPigEvents(){
 if(!document.body)return;
 const st=document.createElement('style');
 st.textContent='#pigEventSky{position:fixed;inset:0;z-index:1;pointer-events:none;opacity:0;transition:opacity .4s}#pigEventBanner{position:fixed;top:calc(env(safe-area-inset-top) + 144px);left:50%;transform:translateX(-50%);z-index:19;width:min(88vw,354px);padding:11px 14px;display:none;border:2px solid #fffa;border-radius:19px;background:linear-gradient(145deg,#253758ee,#744466ed);box-shadow:0 7px 18px #102134a0;text-align:center;color:#fff;pointer-events:none;animation:pigEventPop .45s ease-out}#pigEventBanner strong{display:block;font:bold 17px system-ui;text-shadow:0 1px 5px #0009}#pigEventBanner small{display:block;font:bold 11px system-ui;margin-top:3px;color:#fff1dc}#pigEventProgress{height:5px;margin-top:7px;border-radius:20px;background:#ffffff55;overflow:hidden}#pigEventProgress i{display:block;height:100%;width:100%;background:linear-gradient(90deg,#fff4ab,#ffacd9);border-radius:20px}@keyframes pigEventPop{from{opacity:.1;transform:translate(-50%,-16px) scale(.94)}to{opacity:1;transform:translate(-50%,0) scale(1)}}@media(max-height:630px){#pigEventBanner{top:76px;padding:6px}#pigEventBanner strong{font-size:13px}#pigEventBanner small{font-size:10px}}';
 (document.head||document.body).appendChild(st);
 const sky=document.createElement('div');sky.id='pigEventSky';document.body.appendChild(sky);
 const panel=document.createElement('div');panel.id='pigEventBanner';panel.innerHTML='<strong id="pigEventTitle"></strong><small id="pigEventDesc"></small><div id="pigEventProgress"><i id="pigEventProgressFill"></i></div>';document.body.appendChild(panel);
}
function resetPigEvent(){
 const sky=el('pigEventSky'),banner=el('pigEventBanner');if(sky)sky.style.opacity='0';if(banner)banner.style.display='none';
}
function tickPigEvents(){
 if(!p.events)return;
 const event=p.events.find(e=>p.z>=e.start && p.z<e.end);
 const type=event?event.type:null;
 if(type!==p.eventActive){
  p.eventActive=type;
  if(!type)resetPigEvent();
  else{
   const theme=pigEventThemes[type];const sky=el('pigEventSky'),panel=el('pigEventBanner');
   if(sky){sky.style.background=theme.sky;sky.style.opacity='.64';}
   if(panel)panel.style.display='block';
   if(el('pigEventTitle'))el('pigEventTitle').textContent=theme.icon+' '+theme.name+'！';
   if(el('pigEventDesc'))el('pigEventDesc').textContent=theme.info;
   toast(theme.icon+' '+theme.name+'！');sfx('level');
  }
 }
 if(event&&el('pigEventProgressFill'))el('pigEventProgressFill').style.width=(100*(1-(p.z-event.start)/(event.end-event.start))).toFixed(1)+'%';
}
function eventPointsMult(kind){
 return (p.eventActive==='star'&&kind==='star')||(p.eventActive==='ring'&&kind==='ring')?2:1;
}
function cutePigDetail(tr,lv,now,skin){
 const ball=(x,y,z,rx,ry,rz,col)=>uvBall(x,y,z,rx,ry,rz,col,tr,5,8);
 for(const side of [-1,1]){
  ball(side*.39,2.01,1.93,.145,.159,.059,[.13,.12,.21]);
  ball(side*.35,2.08,1.992,.061,.063,.021,[1,.99,1]);
  ball(side*.44,1.96,1.98,.036,.035,.017,[.74,.93,1]);
  ball(side*.64,1.61,1.75,.22,.13,.09,[1,.49,.64]);
  ball(side*.64,1.65,1.85,.069,.037,.016,[1,.72,.81]);
  const w=Math.sin(now*.005+side)*.04;
  ball(side*(.90+w),2.83+w,1.16,.20,.26,.14,[Math.min(1,skin[0]*1.06),skin[1]*.74,skin[2]*.80]);
  ball(side*.58,.26,1.30,.17,.056,.11,[1,.96,.92]);
 }
 ball(0,1.37,2.10,.22,.087,.033,[1,.77,.86]);
 ball(0,1.16,1.929,.088,.03,.025,[.75,.32,.49]);
 if(lv>=7)ball(0,2.74,1.12,.13,.13,.14,[1,.97,.73]);
}
function pigSparkleVfx(now){
 if(p.phase!=='air'&&p.phase!=='run')return;
 const ball=(x,y,z,r,col)=>uvBall(x,y,z,r,r,r,(col),(a,b,c)=>[a,b,c],4,7);
 const active=p.eventActive;
 const colors=active==='star'?[[1,.96,.41],[.94,.77,1],[.84,.97,1]]:active==='ring'?[[1,.84,.32],[1,.94,.75],[1,.68,.85]]:[[1,.96,1],[1,.75,.85],[.87,.96,1]];
 const n=p.phase==='air'?(active?13:6):3;
 for(let i=0;i<n;i++){
  const a=now*.003+i*2.18,rad=.82+(i%5)*.28;
  ball(Math.cos(a)*rad,p.y+1.5+Math.sin(a*1.3)*(.65+i*.1),p.z-1.1-i*.38,.065+(i%3)*.028,colors[i%3]);
 }
}
setupPigEvents();


/* __PIG_WORLD_ALL15__ : 15 playable surprises, keep old physics & saved levels */
const FEATURES=[
 ['island','🏝️ 空飛ぶ島'],['ufo','🛸 UFO襲来'],['tornado','🌪️ 竜巻'],['target','🎯 的当て'],
 ['piglet','🐣 子豚救出'],['boss','🐉 ドラゴン'],['park','🎡 空の遊園地'],['magnet','🧲 マグネット'],
 ['weather','🌦️ 天候変化'],['crate','🎁 謎の箱'],['treasure','💎 宝島']
];
function worldItems(){
 const layout=[
 ['target',155,0,19],['piglet',184,-4,20],['magnet',205,4,23],['ufo',231,0,29],
 ['crate',263,-3.5,20],['tornado',290,3.5,26],['park',324,0,25],
 ['target',353,-4,19],['piglet',389,4,22],['boss',426,0,24],
 ['island',458,-2,18],['weather',500,2,27],['treasure',545,0,23],
 ['crate',593,4,20],['ufo',629,-3,29],['park',665,3,24],
 ['target',705,0,29],['piglet',748,-3,24],['tornado',782,0,28],
 ['boss',837,3,25],['island',896,0,28],['treasure',949,-4,27],
 ['weather',1006,1,32],['crate',1080,0,30]
 ];
 return layout.map(([kind,z,x,y],i)=>({kind,z,x,y,taken:false,missed:false,phase:i*.87}));
}
function worldInit(){
 p.x=0;p.vx=0;p.worldItems=worldItems();p.worldMessage='';p.worldScore=0;p.worldCollects=0;
 p.dodges=0;p.rescues=0;p.materials=0;p.magnet=0;p.fart=2;p.rareSpark=0;p.weather='calm';
 p.bossHits=0;p.tornadoHits=0;p.ufoHits=0;p.islandHits=0;p.trickChain=0;p.targetHits=0;
 p.runProfession=professionFor(saved.level);
 const weatherSky=el('worldWeatherSky');if(weatherSky){weatherSky.style.opacity='0';weatherSky.style.background='none';}
 worldDrawUi();
}
function professionFor(lv){
 const roster=[
 {name:'こぶた',gift:'標準フライト',boost:0},
 {name:'はねぶた',gift:'羽ばたき強化',boost:.12},
 {name:'忍者ぶた',gift:'スピン強化',boost:.04},
 {name:'冒険パイロット',gift:'速度強化',boost:.07},
 {name:'ドラゴンぶた',gift:'おならジェット強化',boost:.08},
 {name:'伝説ぶた',gift:'獲得スコア強化',boost:.15}
 ];
 return roster[Math.min(5,Math.floor((lv-1)/5))];
}
function initWorldControls(){
 if(!document.body)return;
 const style=document.createElement('style');
 style.textContent='#worldControls{position:fixed;z-index:25;bottom:calc(env(safe-area-inset-bottom) + 143px);left:50%;transform:translateX(-50%);width:min(98vw,460px);display:none;gap:6px;pointer-events:auto}#worldControls button{flex:1;min-width:0;min-height:52px;touch-action:manipulation;background:linear-gradient(135deg,#e8f9ff,#e6d8ff);border:2px solid white;border-radius:15px;box-shadow:0 5px 12px #14304d7d;color:#2d315b;font:bold 13px/1.2 system-ui;padding:4px}#worldControls button:disabled{opacity:.45}#worldHud{position:fixed;z-index:16;top:calc(env(safe-area-inset-top) + 117px);left:15px;display:none;padding:7px 10px;border-radius:11px;background:#1b3550db;color:white;font:800 11px/1.6 system-ui;max-width:190px;pointer-events:none}#worldMessage{position:fixed;z-index:25;top:calc(env(safe-area-inset-top) + 215px);left:50%;transform:translateX(-50%);font:900 15px system-ui;text-align:center;color:#fff;background:#3a2c6fdc;border:1px solid #ffffff9c;padding:9px 14px;border-radius:15px;display:none;pointer-events:none;max-width:86vw}#homePanel{margin:10px 0;padding:10px;background:#ffd6a917;border-radius:14px;border:1px solid #ffcfad55;color:#fff;font:700 12px system-ui}#homePanel strong{display:block;font-size:14px;margin-bottom:5px}#farmBuild{border:1px solid #fff9;background:#f8ddc3;color:#553b4b;border-radius:9px;padding:8px 12px;font-weight:900;margin-top:6px}#worldBadges{font-size:10px;margin-top:7px;color:#efdcff}#worldControls button:active{transform:translateY(2px)}@media(max-height:640px){#worldControls{bottom:calc(env(safe-area-inset-bottom) + 112px)}#worldHud{top:62px;left:8px;font-size:10px}#worldMessage{top:145px}#flightKey{display:none!important}}';
 (document.head||document.body).appendChild(style);
 const ctr=document.createElement('div');ctr.id='worldControls';
 ctr.innerHTML='<button id="steerLeft" type="button">⬅️ 左へ</button><button id="steerRight" type="button">右へ ➡️</button><button id="fartButton" type="button">💨 おなら<br>×2</button>';
 const overlay=document.createElement('div');overlay.id='worldWeatherSky';overlay.style.cssText='position:fixed;inset:0;pointer-events:none;z-index:1;opacity:0;transition:opacity .6s;';document.body.appendChild(overlay);
 const hud=document.createElement('div');hud.id='worldHud';
 const msg=document.createElement('div');msg.id='worldMessage';
 document.body.appendChild(ctr);document.body.appendChild(hud);document.body.appendChild(msg);
 function move(d){if(p.phase==='air'){p.x=clamp((p.x||0)+d*2.9,-7.2,7.2);p.vx=d*.13;missionHit('steer');worldDrawUi();sfx('tap');}}
 for(const [id,dir] of [['steerLeft',-1],['steerRight',1]]){
  const button=el(id);let last=0;
  button.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();last=Date.now();move(dir);});
  button.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();if(Date.now()-last>400)move(dir);});
 }
 const fart=el('fartButton');let lastFart=0;
 fart.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();lastFart=Date.now();fartJet();});
 fart.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();if(Date.now()-lastFart>400)fartJet();});
 const home=el('modalFoot');
 if(home){
  const panel=document.createElement('div');panel.id='homePanel';
  panel.innerHTML='<strong>🏡 PIGGY FARM｜豚の牧場</strong><span id="homeStatus">素材を集めてお家を育てよう</span><div><button id="farmBuild" type="button">🏠 牧場を建てる</button></div><div id="worldBadges">🏆 空の図鑑・レア豚</div>';
  home.parentNode.insertBefore(panel,home);
  el('farmBuild').addEventListener('click',()=>{const needed=3+Math.floor((saved.farmLevel||0)*1.5);if((saved.materials||0)<needed){toast('🪵 建築素材があと'+(needed-(saved.materials||0))+'個必要');return;}saved.materials-=needed;saved.farmLevel=Math.min(20,(saved.farmLevel||0)+1);persist();renderFarm();sfx('evolve');toast('🏠 牧場がレベルアップ！');});
 }
 renderFarm();
 window.addEventListener('keydown',e=>{if(p.phase!=='air')return;if(e.code==='ArrowLeft'||e.code==='KeyA'){e.preventDefault();move(-1)}if(e.code==='ArrowRight'||e.code==='KeyD'){e.preventDefault();move(1)}if(e.code==='KeyF'){e.preventDefault();fartJet()}});
}
function renderFarm(){
 if(el('homeStatus'))el('homeStatus').textContent='🏠 Lv.'+(saved.farmLevel||0)+' ｜ 木材・宝石 '+(saved.materials||0)+'個 ｜ 救出した子豚 '+(saved.rescued||0)+'匹';
 if(el('farmBuild')){const need=3+Math.floor((saved.farmLevel||0)*1.5);el('farmBuild').textContent='🏠 増築する（素材 '+need+'個）';el('farmBuild').disabled=(saved.materials||0)<need;}
 if(el('worldBadges'))el('worldBadges').textContent=(saved.rarePig?'🌟 伝説のレア豚が仲間に！':'🌟 子豚を5匹救うと伝説のレア豚を解放')+' ｜ 🐽 職業 '+professionFor(saved.level).name;
}
function showWorld(v){
 for(const id of ['worldControls','worldHud'])if(el(id))el(id).style.display=v?'flex':'none';
 if(!v&&el('worldMessage'))el('worldMessage').style.display='none';
 if(v)worldDrawUi();
}
function worldDrawUi(){
 if(el('worldHud'))el('worldHud').textContent='🧭 '+(p.runProfession?.name||'こぶた')+' ｜ 🌟 '+(p.worldScore||0)+'P ｜ 🐣 '+(p.rescues||0)+' ｜ 🪵 '+(p.materials||0)+' ｜ ↔ '+Math.round(p.x||0);
 if(el('fartButton')){el('fartButton').textContent='💨 ジェット ×'+(p.fart||0);el('fartButton').disabled=!p.fart;}
}
function worldNotice(message,frames=90){
 const e=el('worldMessage');if(e){e.textContent=message;e.style.display='block';}
 p.messageFrames=frames;toast(message);
}
function fartJet(){
 if(p.phase!=='air'||p.fart<=0)return;
 p.fart--;missionHit("fart");p.vy+=.36+(p.runProfession?.boost||0);p.speed+=.20;p.rareSpark=85;
 p.worldScore+=35;sfx('boost');worldNotice('💨 おならジェット！ +35P');worldDrawUi();
}
function worldReward(item){
 const d=Math.abs((p.x||0)-item.x),dy=Math.abs(p.y-item.y);
 if(item.kind==='weather'){
  item.taken=true;
  p.weather=['wind','snow','rainbow'][Math.floor(Math.random()*3)];
  worldNotice('🌦️ '+({wind:'強風！',snow:'雪が舞う！',rainbow:'虹の空！'}[p.weather]));
  const sky=el('worldWeatherSky');
  if(sky){sky.style.opacity='.55';sky.style.background={wind:'linear-gradient(125deg,transparent 30%,#8ae1ff88 55%,transparent 75%)',snow:'linear-gradient(155deg,#d6f7ff88,transparent 60%)',rainbow:'linear-gradient(135deg,#fdaaff6e,#fff49a65,#b7f8d766,#a2cfff79)'}[p.weather];}
  p.magnet=45;return;
 }
 if(d>4.5||dy>20){item.missed=true;if(item.kind==='boss'){p.bossHits++;if(!(p.duoActive>0))p.vy-=.09;worldNotice('🐉 ドラゴンが通過！避けた！');p.dodges++;p.worldScore+=40;}return;}
 item.taken=true;p.worldCollects++;
 switch(item.kind){
 case 'ufo':p.ufoHits++;p.vy+=.12;p.worldScore+=150;worldNotice('🛸 UFOから脱出！ +150P');break;
 case 'tornado':p.tornadoHits++;p.vy+=.22;p.x=clamp(p.x+((p.worldCollects%2)?-3:3),-7,7);p.worldScore+=100;worldNotice('🌪️ 竜巻で大ジャンプ！ +100P');break;
 case 'piglet':p.rescues++;chargeDuo(35);missionHit('rescues');p.worldScore+=170;worldNotice('🐣 子豚を救出！ +170P');break;
 case 'boss':p.bossHits++;p.worldScore+=260;p.rareSpark=90;worldNotice('🐉 ドラゴンをかわした！ +260P');break;
 case 'target':{const reward=d<1.7?250:90;p.targetHits++;p.worldScore+=reward;p.trickChain++;worldNotice('🎯 '+(d<1.7?'ど真ん中！ +250P':'ターゲット +90P'));break;}
 case 'park':p.vy+=.28;p.speed+=.07;p.worldScore+=90;worldNotice('🎡 空の大砲！ +90P');break;
 case 'magnet':p.magnet=160;p.worldScore+=75;worldNotice('🧲 アイテム吸引モード！ +75P');break;
 case 'island':p.islandHits++;p.materials+=2;p.worldScore+=80;worldNotice('🏝️ 空飛ぶ島に着陸！素材+2');break;
 case 'treasure':p.materials+=3;p.worldScore+=140;worldNotice('💎 宝島の宝箱！素材+3');break;
 case 'crate':{
  const opts=['booster','feathers','wood','points'];const x=opts[Math.floor(Math.random()*opts.length)];
  if(x==='booster'){p.vy+=.25;p.speed+=.09;}
  if(x==='feathers')p.flaps=Math.min(5,p.flaps+2);
  if(x==='wood')p.materials+=2;
  if(x==='points')p.worldScore+=170;
  worldNotice('🎁 サプライズ！ '+({booster:'ロケット加速',feathers:'羽ばたき+2',wood:'素材+2',points:'+170P'}[x]));break;
 }
 }
 if(item.kind==='ufo'||item.kind==='boss')sfx('boost');else sfx('level');
 worldDrawUi();
}
function tickWorld(dt){
 if(p.phase!=='air')return;
 if(p.weather==='wind')p.x=clamp(p.x+Math.sin(p.z*.046)*.05*dt,-7.2,7.2);
 if(p.weather==='snow')p.vy+=.0014*dt;
 if(p.weather==='rainbow'&&Math.floor(p.z)%60===0)p.worldScore+=.6;
 if(p.magnet>0){
  // Magnet pulls collectibles toward the pig instead of merely increasing score.
  for(const b of p.bonuses||[])if(!b.taken&&!b.missed&&b.z>p.z&&b.z-p.z<16&&Math.abs(p.y-b.y)<24)b.z=p.z+.5;
  for(const c of p.items||[])if(!c.taken&&!c.missed&&c.z>p.z&&c.z-p.z<15&&Math.abs(p.y-c.y)<20)c.z=p.z+.5;
 }
 if(p.magnet>0){p.magnet=Math.max(0,p.magnet-dt);}
 if(p.rareSpark>0)p.rareSpark=Math.max(0,p.rareSpark-dt);
 if(p.messageFrames>0){p.messageFrames-=dt;if(p.messageFrames<=0&&el('worldMessage'))el('worldMessage').style.display='none';}
 for(const item of p.worldItems||[]){if(!item.taken&&!item.missed&&p.z>=item.z)worldReward(item);}
 if(p.spinAct>0&&p.trickChain<3&&Math.floor(p.z)%39===0){p.trickChain++;p.worldScore+=35;}
 if(p.worldCollects%4===0&&p.worldCollects>0&&!p.trickRewarded){p.trickRewarded=true;p.worldScore+=90;worldNotice('🌀 トリックコンボ！ +90P');}
}
function worldSaveFlight(){
 saved.materials=(saved.materials||0)+p.materials;
 saved.rescued=(saved.rescued||0)+p.rescues;
 if(saved.rescued>=5&&!saved.rarePig){saved.rarePig=true;}
 saved.maxWorldScore=Math.max(saved.maxWorldScore||0,p.worldScore||0);
 persist();renderFarm();
}
function renderWorldItem(item,now){
 // lightweight 3D prop, stable xyz transform (fixes previous renderer crash)
 const tr=(x,y,z)=>[x,y,z],a=item.phase+now*.0015;
 const xyz=(dx,dy,dz,rx,ry,rz,col)=>uvBall(item.x+dx,item.y+dy+Math.sin(a)*.25,item.z+dz,rx,ry,rz,col,tr,5,8);
 const pink=[1,.56,.69],gold=[1,.79,.28],blue=[.58,.88,1],green=[.48,1,.76],white=[1,.96,1],purple=[.75,.56,1],red=[1,.44,.47];
 if(item.kind==='target'){
  for(let i=0;i<12;i++){const t=i*Math.PI/6;xyz(Math.cos(t)*1.9,Math.sin(t)*1.9,0,.32,.32,.28,i%2?red:white);}
  xyz(0,0,0,.58,.58,.29,gold);
 }else if(item.kind==='piglet'){
  xyz(0,0,0,.79,.70,.75,pink);xyz(0,.20,.66,.47,.44,.36,pink);xyz(0,-.02,1,.34,.22,.16,gold);
  for(const side of [-1,1])xyz(side*.23,.29,.95,.09,.11,.09,[.18,.14,.22]);
 }else if(item.kind==='ufo'){
  xyz(0,.32,0,2.4,.25,1.5,blue);xyz(0,.68,0,1.0,.70,.94,purple);xyz(0,-1,0,.38,1.6,.43,[.57,1,.83]);
 }else if(item.kind==='boss'){
  xyz(0,0,0,1.7,1.0,2.1,red);xyz(0,.55,1.35,1.0,.86,.94,gold);
  for(const side of [-1,1]){xyz(side*1.4,.55,-.45,1.25,.26,.85,purple);xyz(side*.5,1.55,1.4,.28,.66,.29,white);}
 }else if(item.kind==='tornado'){
  for(let i=0;i<9;i++){const t=i/8;xyz(Math.sin(a*2+i*.7)*(.4+t*1.1),-2+i*.55,0,.38+t*.30,.24,.38+t*.3,i%2?white:blue);}
 }else if(item.kind==='island'||item.kind==='treasure'){
  xyz(0,-1.3,0,3.0,.60,2.1,green);xyz(0,-2.3,0,1.7,1.1,1.3,[.47,.38,.36]);
  xyz(0,.18,0,.70,.75,.70,item.kind==='treasure'?gold:pink);
 }else if(item.kind==='park'){
  for(let i=0;i<9;i++){const t=i*Math.PI*2/9;xyz(Math.cos(t)*1.7,Math.sin(t)*1.7,0,.32,.32,.24,i%2?pink:blue);}
  xyz(0,0,0,.58,.58,.5,gold);
 }else if(item.kind==='weather'){
  for(let i=0;i<5;i++)xyz((i-2)*.55,Math.sin(i)*.22,0,.64,.35,.58,i%2?white:blue);
 }else if(item.kind==='crate'||item.kind==='magnet'){
  xyz(0,0,0,1.0,1.0,.9,item.kind==='magnet'?purple:gold);
  xyz(0,.07,.95,.38,.46,.10,white);
 }else{
  xyz(0,0,0,1,1,1,blue);
 }
}
/* __PIG_WORLD_POLISH__ */
function renderWorldEffects(now){
 if(p.phase!=='air')return;
 const tr=(x,y,z)=>[x,y,z];
 for(const o of p.worldItems||[]){
  if(o.taken||o.missed||o.z<p.z-14||o.z>p.z+145)continue;
  renderWorldItem(o,now);
 }
 if(saved.rarePig){
  // Visual reward for rescuing 5 piglets: permanent floating golden crown.
  for(let k=0;k<7;k++){const t=k*Math.PI*2/7;uvBall((p.x||0)+Math.cos(t)*.42,p.y+3.05+Math.sin(t)*.13,p.z+1.1,.16,.16,.18,[1,.81,.26],tr,5,7);}
  uvBall(p.x||0,p.y+3.13,p.z+1.1,.31,.13,.32,[1,.97,.54],tr,5,7);
 }
 if(p.rareSpark>0||saved.rarePig){
  const n=p.rareSpark>0?8:4;
  for(let i=0;i<n;i++){
   const a=now*.004+i*Math.PI*2/n;
   uvBall(p.x+Math.cos(a)*1.4,p.y+1.6+Math.sin(a)*.8,p.z-1-i*.3,.15,.15,.15,[1,.88,.32],tr,4,7);
  }
 }
}
initWorldControls();


/* __PIG_HUMAN_MEMORY_10__ : fictional story, reverse chronology, ten memories, two pigs */
const LOVE_CHAPTERS=[
 {name:'最後の約束',time:'未来の記憶',hint:'誰かが、自分の手を強く握っていた。ひづめではなく、指だった。',letter:'もしも姿が変わって、名前さえ忘れても。あなたを見つけたら、もう一度、同じ約束をするよ。',clue:'人間の指先',icon:'💍'},
 {name:'届かなかった手紙',time:'別れのあと',hint:'白い封筒と、書きかけの文字。たしかにペンを握っていた。',letter:'伝えたかった言葉がある。でも、あなたが笑っていてくれるなら、この一通は出さないままでいい。',clue:'手書きの文字',icon:'✉️'},
 {name:'ホームの灯り',time:'離れていた季節',hint:'駅のアナウンス。ふたりは違う方向の列車を見ていた。',letter:'遠くに行っても、同じ空は見えるかな。夜が来たら、いちばん明るい星を探そう。',clue:'遠い駅の風景',icon:'🚉'},
 {name:'雨の日の沈黙',time:'すれ違いの日々',hint:'冷たい雨。誰かの肩を抱く、自分の腕が見えた。',letter:'言い合いになった日のこと、ずっと覚えてる。正しい言葉より、そばにいる勇気がほしかった。',clue:'ふたりの腕',icon:'☔'},
 {name:'写真の裏側',time:'幸せだった頃',hint:'写真に写る二つの人影。あれは、まさか私たち？',letter:'笑いすぎて、ちゃんと写っていない写真。でも、たぶん一番好きな一枚。',clue:'人間の横顔',icon:'📷'},
 {name:'ふたりの夜空',time:'心が近づいた日',hint:'星の下で、人間の声が自分の名前を呼んでいた。',letter:'隣にいるだけで、世界が少し静かになる。そんな夜があるなんて知らなかった。',clue:'懐かしい声',icon:'🌙'},
 {name:'まだ友達だった頃',time:'遠い記憶',hint:'向かい合って座る二人。カップを持つ手が重なった。',letter:'くだらない話で、あんなに笑える人がいるんだね。また話せたら、きっと楽しい。',clue:'あたたかな手',icon:'☕'},
 {name:'初めての返事',time:'あの日の少し後',hint:'自分の筆跡が戻ってきた。文字を書く指の感触を思い出す。',letter:'お手紙ありがとう。こんなふうに、誰かの返事を待つのは初めてかもしれません。',clue:'自分の名前の一文字',icon:'🖋️'},
 {name:'名前を知る前',time:'出会う直前',hint:'振り返る人影。人間の瞳と笑顔が、少しずつはっきりしていく。',letter:'まだ名前も知らない人なのに。どうして、あの笑顔だけ忘れられなかったんだろう。',clue:'本当の顔',icon:'🌸'},
 {name:'はじめまして',time:'物語のいちばん最初',hint:'全部つながった。ふたりは最初から豚ではなかった。大切な約束を胸に、人間として出会ったふたりだった。',letter:'はじめまして。あなたの名前を聞いてもいいですか？　ここから、ふたりの物語が始まった。',clue:'人間だった本当の姿',icon:'💖'}
];
const LOVE_NAMES=['ふたりの約束','未送信の封筒','夜のホーム','雨の記憶','古い写真','夜空の声','カフェの笑い声','返事の便箋','名もない笑顔','出会いの日'];
function memoryUnlocked(){return Math.max(0,Math.min(10,Math.floor(Number(saved.memoryChapters)||0)));}
function memoryInit(){
 p.loveShards=[
  {z:153,x:0,y:17,taken:false},{z:242,x:1,y:23,taken:false},
  {z:341,x:-3,y:25,taken:false},{z:430,x:2,y:27,taken:false}
 ];
 p.memoryShards=0;p.loveHearts=0;
 memoryHudUpdate();
}
function memoryHudUpdate(){
 const e=el('loveMemoryHud');if(e)e.textContent='💌 記憶 '+memoryUnlocked()+'/10　♡ '+(p.loveHearts||0);
}
function memoryFlight(dt){
 if(p.phase!=='air')return;
 for(const shard of p.loveShards||[]){
  if(shard.taken||p.z<shard.z)continue;
  shard.taken=true;
  if(Math.abs((p.x||0)-shard.x)<5.7&&Math.abs(p.y-shard.y)<21){
   p.memoryShards++;p.loveHearts+=15;chargeDuo(25);missionHit("shards");p.worldScore=(p.worldScore||0)+60;
   toast('💌 記憶のかけら +60P');sfx('level');memoryHudUpdate();
  }
 }
}
function loveShardsDraw(now){
 if(p.phase!=='air')return;
 const trans=(x,y,z)=>[x,y,z];
 for(const q of p.loveShards||[]){
  if(q.taken||q.z<p.z-10||q.z>p.z+115)continue;
  const wave=Math.sin(now*.003+q.z)*.45;
  uvBall(q.x,q.y+wave,q.z,.78,.88,.27,[1,.83,.91],trans,6,10);
  uvBall(q.x,q.y+wave,q.z+.28,.41,.57,.18,[1,.98,.77],trans,5,8);
 }
}
function renderLoverPig(now){
 if(p.phase!=='air'&&p.phase!=='run')return;
 // light-weight companion model with separate pale-rose suit, scarf, blinking eyes and wings.
 const x=clamp((p.x||0)+2.8,-3.9,10),y=p.y+Math.sin(now*.007)*.25-.22,z=p.z+.38;
 const T=(xx,yy,zz)=>[x+xx*.76,y+yy*.76,z+zz*.76];
 const ball=(a,b,c,rx,ry,rz,col)=>uvBall(a,b,c,rx,ry,rz,col,T,6,10);
 ball(0,1.36,-.12,1.04,.90,1.34,[.91,.72,.87]);
 ball(0,1.79,1.03,.85,.74,.82,[1,.84,.93]);
 ball(0,1.47,1.80,.50,.32,.29,[1,.63,.79]);
 for(const side of [-1,1]){
  ball(side*.17,1.45,2.06,.078,.11,.06,[.40,.26,.36]);
  ball(side*.36,1.97,1.76,.13,.15,.071,[.16,.13,.23]);
  ball(side*.33,2.05,1.82,.045,.055,.029,[1,.99,1]);
  ball(side*.55,1.59,1.62,.20,.11,.081,[1,.58,.67]);
  ball(side*.74,.55,.82,.25,.38,.35,[.82,.64,.77]);
  ball(side*.74,.55,-.85,.25,.38,.35,[.82,.64,.77]);
  ball(side*.70,2.53,1.06,.25,.43,.15,[.98,.73,.89]);
  const w=Math.sin(now*.016+side)*.25;
  ball(side*1.22,1.89+w,-.64,.42,.20,.80,[.95,.97,1]);
  ball(side*1.64,1.96+w*1.3,-.91,.36,.16,.68,[.99,.94,1]);
 }
 // golden scarf, and a recollection crown that grows as chapters unlock.
 ball(0,1.39,1.09,.83,.10,.50,[.96,.82,.38]);
 if(memoryUnlocked()>=4){
  for(let j=0;j<5;j++){const a=j*1.25;ball(Math.cos(a)*.46,2.63,1.09+Math.sin(a)*.20,.17,.16,.15,[.72,.54,.35]);}
 }
 if(memoryUnlocked()>=8)ball(0,2.87,1.04,.55,.14,.29,[1,.85,.36]);
}
const humanCoupleArt='<div class="humanCouple"><div class="humanPerson man"><div class="humanHair"></div><div class="humanFace"><i></i><i></i><b></b></div><div class="humanOutfit"></div></div><div class="humanHeart">♥</div><div class="humanPerson woman"><div class="humanHair"></div><div class="humanFace"><i></i><i></i><b></b></div><div class="humanOutfit"></div></div></div>';
function memoryShow(index,newly){
 const n=memoryUnlocked(),chapter=index>0?LOVE_CHAPTERS[index-1]:null;
 const panel=el('loveMemoryPanel'),title=el('loveMemoryTitle'),copy=el('loveMemoryBody'),label=el('loveMemoryLabel'),portrait=el('loveMemoryPortrait');
 if(!panel||!chapter)return;
 if(label)label.textContent=(newly?'NEW MEMORY UNLOCKED · ':'記憶の手紙 · ')+String(index).padStart(2,'0')+' / 10';
 if(title)title.textContent=chapter.icon+' '+chapter.name;
 buildMemoryChoices(index);buildMemoryPuzzle(index);if(copy){copy.replaceChildren();for(const [tag,t] of [['h4',chapter.time],['p',chapter.hint],['blockquote',chapter.letter],['small','思い出したもの：'+chapter.clue]]){const c=document.createElement(tag);c.textContent=t;copy.appendChild(c);}}
 if(portrait){const blurred=index>=5 && index<10;if(index===10)portrait.innerHTML=humanCoupleArt;else if(blurred)portrait.innerHTML='<div style="width:100%;filter:blur('+(10-index)*1.85+'px);opacity:'+(.28+index*.067)+'">'+humanCoupleArt+'</div><div class="memorySilhouette">人間の顔が、少しずつ見えてきた…</div>';else portrait.innerHTML='<div class="loveMemoryGlyph">'+chapter.icon+'</div><div class="memorySilhouette">あの頃の記憶が、光の中から戻ってくる…</div>';}
 panel.style.display='flex';panel.setAttribute('aria-hidden','false');
 const close=el('loveClose');if(close)close.focus();
}
function memoryArchive(){
 const n=memoryUnlocked();
 const panel=el('loveArchiveList');if(!panel)return;
 panel.replaceChildren();
 if(n===0){const t=document.createElement('p');t.textContent='まだ記憶は眠ったまま。80m以上飛んで、ふたりの手紙を一通ずつ取り戻そう。';panel.appendChild(t);}
 for(let i=0;i<10;i++){
  const b=document.createElement('button');b.type='button';b.className='memoryChapter';const yes=i<n;
  b.textContent=yes?'✉ '+String(i+1).padStart(2,'0')+' '+LOVE_CHAPTERS[i].name:'🔒 '+String(i+1).padStart(2,'0')+' 未解放';
  b.disabled=!yes;
  if(yes)b.addEventListener('click',()=>memoryShow(i+1,false));
  panel.appendChild(b);
 }
 el('loveArchive').style.display='flex';
}
function memoryFlightCleared(distance){
 if(distance<80){memoryHudUpdate();return;}
 const n=memoryUnlocked();if(n>=10){memoryHudUpdate();return;}
 const newN=n+1;
 saved.memoryChapters=newN;
 saved.memoryLastRun=Math.floor(Number(saved.runs)||0);
 saved.lettersOpened=Number(saved.lettersOpened||0)+1;
 persist();
 memoryHudUpdate();renderMemoryMenu();
 setTimeout(()=>memoryShow(newN,true),680);
}
function renderMemoryMenu(){memoryArcadeMenu();
 const b=el('loveArchiveOpen');if(b)b.textContent='💌 記憶の書庫　'+memoryUnlocked()+'/10 通';
 const banner=el('loveMemoryProgress');
 if(banner)banner.textContent=memoryUnlocked()<10?'人間だった頃の記憶を、あと'+(10-memoryUnlocked())+'通。':'すべて思い出した。最後の「はじめまして」を読み返そう。';
}
function setupMemoryUi(){
 if(!document.body)return;
 const st=document.createElement('style');
 st.textContent='#loveMemoryHud{position:fixed;right:12px;top:calc(env(safe-area-inset-top) + 92px);z-index:17;display:none;max-width:160px;font:800 11px system-ui;color:#fff5e2;background:#623b5cca;border:1px solid #fff8;padding:7px 9px;border-radius:12px;pointer-events:none}#loveArchiveOpen{width:100%;padding:13px;background:linear-gradient(120deg,#d8ab6d,#fff1cb,#efc7d6);color:#5a3140;border:1px solid #fff9;border-radius:14px;font:900 14px system-ui;margin:9px 0 3px;box-shadow:0 5px 16px #0003}#loveMemoryProgress{font:700 11px system-ui;color:#fff0d8;padding:4px 0 9px}#loveArchive,#loveMemoryPanel{position:fixed;inset:0;background:#1b1421d9;z-index:90;display:none;align-items:center;justify-content:center;padding:calc(env(safe-area-inset-top) + 16px) 12px calc(env(safe-area-inset-bottom) + 14px);backdrop-filter:blur(13px);color:#412e3d}#loveMemoryPanel{z-index:92}#loveArchiveCard,#loveMemoryCard{position:relative;width:min(94vw,440px);max-height:85dvh;overflow:auto;border:2px solid #fff4d4;border-radius:24px;padding:25px 20px;background:radial-gradient(circle at 90% 0%,#fff0e0,#fff9ed 52%,#f5e0dc);box-shadow:0 20px 65px #060711a0;text-align:center}#loveArchiveCard h2,#loveMemoryCard h2{color:#6a394a;font:900 clamp(24px,7vw,32px)/1.25 Georgia,serif;margin:10px 0}#loveMemoryLabel{font:800 10px system-ui;letter-spacing:.22em;color:#aa835e}#loveMemoryBody h4{font:700 11px system-ui;letter-spacing:.22em;color:#9e6d69}#loveMemoryBody p{color:#75606a;font:600 13px/1.75 system-ui}#loveMemoryBody blockquote{margin:17px auto;padding:19px 13px;border-top:1px solid #eacaa2;border-bottom:1px solid #eacaa2;color:#604450;font:500 17px/1.95 Georgia,serif;white-space:pre-wrap}#loveMemoryBody small{display:block;color:#a17673;font:800 11px system-ui}#loveMemoryPortrait{min-height:120px;display:flex;flex-direction:column;justify-content:center;align-items:center}#loveMemoryPortrait .loveMemoryGlyph{font-size:64px;filter:drop-shadow(0 5px 8px #aa749499)}.memorySilhouette{font:700 11px system-ui;color:#a77d80;margin-top:2px}.loveMemoryClose{position:absolute;right:14px;top:12px;border:0;border-radius:100px;width:37px;height:37px;background:#e2c6b6;color:#693e50;font-size:21px;font-weight:800}#loveArchiveList{display:grid;gap:7px;text-align:left;max-height:51dvh;overflow:auto}#loveArchiveList .memoryChapter{border-radius:12px;text-align:left;border:1px solid #caa38a;background:#fff9f0;color:#604756;padding:12px;font:800 13px system-ui}#loveArchiveList .memoryChapter:disabled{opacity:.55;background:#e9ded6}.loveArchiveCopy{font:600 12px/1.8 system-ui;color:#836670;margin:0 0 10px}.humanCouple{height:215px;width:100%;position:relative;display:flex;align-items:flex-end;justify-content:center;gap:15px;background:radial-gradient(ellipse at 50% 60%,#f5dda3 10%,transparent 73%);overflow:hidden}.humanPerson{position:relative;width:108px;height:198px;filter:drop-shadow(0 8px 7px #4c34444a)}.humanHair{position:absolute;left:20px;top:6px;width:69px;height:100px;border-radius:43px 43px 16px 16px;background:linear-gradient(140deg,#2f2638,#65504e)}.woman .humanHair{left:11px;width:88px;height:171px;border-radius:44px 44px 19px 19px;background:linear-gradient(130deg,#412c39,#9a6263)}.humanFace{position:absolute;left:27px;top:30px;width:55px;height:77px;background:linear-gradient(115deg,#fff1d4,#e6ad96);border-radius:28px 28px 27px 27px;z-index:2}.woman .humanFace{background:linear-gradient(110deg,#ffe2ca,#eeb39f)}.humanFace i{position:absolute;top:36px;width:8px;height:5px;border-radius:50%;background:#533d43}.humanFace i:first-child{left:13px}.humanFace i:nth-child(2){right:13px}.humanFace b{position:absolute;top:56px;left:20px;width:17px;height:4px;border-radius:100%;background:#c17877}.humanOutfit{position:absolute;bottom:-20px;left:6px;width:96px;height:103px;border-radius:35px 35px 10px 10px;background:linear-gradient(125deg,#2d314d,#6c5372)}.man .humanOutfit:after{content:"";position:absolute;left:41px;top:0;width:16px;height:75px;clip-path:polygon(50% 0,100% 22%,50% 100%,0 22%);background:#eed9bb}.woman .humanOutfit{background:linear-gradient(100deg,#fff7ec,#f6d8c8,#fff);width:112px;left:-2px;border:2px solid #f8e8d2}.humanHeart{color:#d78a8d;align-self:center;font-size:29px;animation:loveBeat 2s infinite}@keyframes loveBeat{50%{transform:scale(1.3)}}@media(max-height:670px){#loveArchiveCard,#loveMemoryCard{max-height:92dvh;padding:15px}#loveMemoryPortrait{min-height:70px}.humanCouple{height:148px}.humanPerson{transform:scale(.71);transform-origin:bottom}.loveMemoryGlyph{font-size:44px!important}}';
 document.head.appendChild(st);
 const hud=document.createElement('div');hud.id='loveMemoryHud';document.body.appendChild(hud);
 const foot=el('modalFoot');
 if(foot&&foot.parentNode){
  const b=document.createElement('button');b.id='loveArchiveOpen';b.type='button';b.addEventListener('click',memoryArchive);foot.parentNode.insertBefore(b,foot);
  const progress=document.createElement('div');progress.id='loveMemoryProgress';foot.parentNode.insertBefore(progress,foot);
 }
 const archive=document.createElement('div');archive.id='loveArchive';archive.innerHTML='<div id="loveArchiveCard"><button class="loveMemoryClose" id="loveArchiveClose" type="button" aria-label="閉じる">×</button><div style="font:800 11px system-ui;letter-spacing:.2em;color:#b78b6c">THE LETTERS WE LOST</div><h2>記憶の書庫</h2><p class="loveArchiveCopy">旅の終わりから、最初の出会いへ。<br>飛ぶたびに、人間だった頃の物語がよみがえる。</p><div id="loveArchiveList"></div></div>';document.body.appendChild(archive);
 const modal=document.createElement('div');modal.id='loveMemoryPanel';modal.setAttribute('aria-hidden','true');modal.innerHTML='<div id="loveMemoryCard"><button class="loveMemoryClose" id="loveClose" type="button" aria-label="閉じる">×</button><div id="loveMemoryLabel">NEW MEMORY UNLOCKED</div><h2 id="loveMemoryTitle"></h2><div id="loveMemoryPortrait"></div><div id="loveMemoryBody"></div><p class="loveArchiveCopy">次の飛行で、もうひとつ前の記憶へ。</p></div>';document.body.appendChild(modal);
 el('loveArchiveClose').addEventListener('click',()=>archive.style.display='none');
 el('loveClose').addEventListener('click',()=>{modal.style.display='none';modal.setAttribute('aria-hidden','true');});
 for(const [layer,id] of [[archive,'loveArchiveCard'],[modal,'loveMemoryCard']])layer.addEventListener('click',e=>{if(e.target===layer){layer.style.display='none';}});
 window.addEventListener('keydown',e=>{if(e.key==='Escape'){archive.style.display='none';modal.style.display='none';}});
 renderMemoryMenu();
}
setupMemoryUi();


/* __PIG_LOVE_PLAY_V2__ — interactive memory choices, dual-flight skills and missions */
const LOVE_CHOICE_LINES=[
 ['その手を離さない','彼の言葉を信じる'],
 ['手紙を届けに行く','返事が来る日を待つ'],
 ['思い切って追いかける','遠くから無事を祈る'],
 ['勇気を出して謝る','まず相手の話を聞く'],
 ['ふたりの写真を撮る','小さな笑顔を大切にする'],
 ['素直な気持ちを伝える','そっと星を見上げる'],
 ['思い切って誘う','笑顔で話を聞く'],
 ['自分から手紙を書く','返事を大切に読む'],
 ['勇気を出して声をかける','目が合うまで微笑む'],
 ['「はじめまして」と伝える','「お名前は？」と微笑む']
];
function choiceStore(){
 if(!saved.loveDecisions||typeof saved.loveDecisions!=='object'||Array.isArray(saved.loveDecisions))saved.loveDecisions={};
 return saved.loveDecisions;
}
function memoryEnding(){
 const list=Object.values(choiceStore()),a=list.filter(x=>x==='courage').length,b=list.filter(x=>x==='trust').length;
 return a>b?'勇気の再会：今度は、僕からあなたを見つけにいく。':b>a?'やさしい再会：今度こそ、どんな言葉にも耳を傾ける。':'ふたりの約束：どんな未来でも、もう一度出会おう。';
}
function memoryDecision(index,selected){
 const store=choiceStore(),key=String(index);
 if(store[key]||!['courage','trust'].includes(selected))return;
 store[key]=selected;saved.loveBond=(Number(saved.loveBond)||0)+1;
 persist();renderMemoryMenu();buildMemoryChoices(index);sfx('level');
}
function buildMemoryChoices(index){
 const panel=el('loveDecisionPanel');if(!panel||index<1||index>10)return;
 panel.replaceChildren();
 const title=document.createElement('h4');title.textContent='もし、あの日に戻れたら？';title.className='choiceTitle';panel.appendChild(title);
 const savedChoice=choiceStore()[String(index)];
 if(savedChoice){
  const note=document.createElement('p');note.className='choiceNote';note.textContent='あなたの選択：'+LOVE_CHOICE_LINES[index-1][savedChoice==='courage'?0:1];panel.appendChild(note);
  if(index===10){const final=document.createElement('p');final.className='finaleLine';final.textContent=memoryEnding();panel.appendChild(final);}
 }else{
  for(let i=0;i<2;i++){
   const b=document.createElement('button');b.className='choiceOption';b.type='button';b.textContent=(i?'♡ ':'✦ ')+LOVE_CHOICE_LINES[index-1][i];
   b.addEventListener('click',()=>memoryDecision(index,i?'trust':'courage'));panel.appendChild(b);
  }
  const note=document.createElement('p');note.className='choiceNote';note.textContent='選択は保存され、最後の再会の言葉に影響する。';panel.appendChild(note);
 }
}
function initLoveExtraUi(){
 if(!document.body)return;
 const css=document.createElement('style');
 css.textContent='#duoActions{display:none;position:fixed;left:50%;transform:translateX(-50%);bottom:calc(env(safe-area-inset-bottom) + 207px);z-index:27;width:min(92vw,380px)}#duoPower{min-height:43px;width:100%;border:2px solid #fff1d0;border-radius:16px;background:linear-gradient(115deg,#6c3f60,#a26082,#b18a63);color:#fff7f0;font:900 13px system-ui;box-shadow:0 4px 14px #26304c99;touch-action:manipulation}#duoPower:disabled{opacity:.8}#loveQuestBox{display:none;position:fixed;right:12px;top:calc(env(safe-area-inset-top) + 288px);z-index:18;background:#352a50df;border:1px solid #fae6ba94;border-radius:12px;padding:7px 10px;max-width:175px;color:#fff7e8;font:800 11px/1.5 system-ui;pointer-events:none}#loveQuestBox strong{color:#ffe1a8}.choiceTitle{font:900 14px system-ui;color:#77465a;margin:16px 0 8px}.choiceOption{display:block;width:100%;margin:7px auto;padding:12px 8px;background:linear-gradient(110deg,#fff1d8,#f9d9e8);color:#694156;border:1px solid #ddb9a3;border-radius:12px;font:800 13px/1.3 system-ui;box-shadow:0 3px 0 #d6afb0}.choiceNote{font:700 11px/1.7 system-ui;color:#96747b;margin:10px 0}.finaleLine{padding:12px 9px;border-top:1px solid #ddb3a6;border-bottom:1px solid #ddb3a6;color:#94614f;font:800 14px/1.8 Georgia,serif}@media(max-height:700px){#duoActions{bottom:calc(env(safe-area-inset-bottom) + 184px)}#loveQuestBox{top:calc(env(safe-area-inset-top) + 228px)}}';
 document.head.appendChild(css);
 const duo=document.createElement('div');duo.id='duoActions';duo.innerHTML='<button id="duoPower" type="button">💕 ふたりの力 0/100</button>';document.body.appendChild(duo);
 const mission=document.createElement('div');mission.id='loveQuestBox';mission.innerHTML='<strong>✦ LOVE MISSION</strong><div id="loveQuestContent"></div>';document.body.appendChild(mission);
 const card=el('loveMemoryCard');if(card){const choice=document.createElement('div');choice.id='loveDecisionPanel';card.appendChild(choice);}
 let pointer=0;const b=el('duoPower');
 b.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();pointer=Date.now();activateDuo();});
 b.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();if(Date.now()-pointer>450)activateDuo();});
}
const LOVE_MISSIONS=[
 {key:'shards',label:'💌 記憶のかけらを2個',need:2},
 {key:'fart',label:'💨 ジェットを1回使う',need:1},
 {key:'rings',label:'⭕ リングを2個通る',need:2},
 {key:'rescues',label:'🐣 子豚を1匹助ける',need:1},
 {key:'steer',label:'⬅️➡️ 左右に3回操縦',need:3}
];
function resetLoveActions(){
 p.duoCharge=0;p.duoActive=0;p.duoUses=0;
 p.loveMission=LOVE_MISSIONS[(Math.floor(Number(saved.runs)||0)+Math.floor(Number(saved.memoryChapters)||0))%LOVE_MISSIONS.length];
 p.missionCount={shards:0,fart:0,rings:0,rescues:0,steer:0};p.missionDone=false;
 p.loveRoads=[{z:188,done:false},{z:323,done:false},{z:467,done:false}];
 updateLoveActions();
}
function chargeDuo(amount){p.duoCharge=Math.min(100,(p.duoCharge||0)+amount);updateLoveActions();}
function missionHit(which){
 if(!p.missionCount)return;
 p.missionCount[which]=(p.missionCount[which]||0)+1;
 if(!p.missionDone&&p.loveMission&&p.missionCount[p.loveMission.key]>=p.loveMission.need){
  p.missionDone=true;p.worldScore=(p.worldScore||0)+240;p.loveHearts=(p.loveHearts||0)+30;chargeDuo(30);
  worldNotice('🏆 ふたりのミッション達成！ +240P');sfx('level');
 }
 updateLoveActions();
}
function updateLoveActions(){
 const b=el('duoPower');
 if(b){b.disabled=p.phase!=='air'||(p.duoCharge||0)<100;b.textContent=(p.duoCharge||0)>=100?'💕 ふたりの奇跡！ 発動':'💕 ふたりの力 '+Math.floor(p.duoCharge||0)+'/100';}
 const q=el('loveQuestContent');
 if(q&&p.loveMission)q.textContent=(p.missionDone?'✓ 達成！ ':'')+p.loveMission.label+' '+Math.min(p.missionCount[p.loveMission.key]||0,p.loveMission.need)+'/'+p.loveMission.need;
}
function showLoveActions(show){
 if(el('duoActions'))el('duoActions').style.display=show?'block':'none';
 if(el('loveQuestBox'))el('loveQuestBox').style.display=show?'block':'none';
 updateLoveActions();
}
function activateDuo(){
 if(p.phase!=='air'||(p.duoCharge||0)<100)return;
 p.duoCharge=0;p.duoActive=190;p.duoUses++;
 p.magnet=Math.max(p.magnet||0,190);p.vy+=.24;p.speed+=.10;p.flaps=Math.min(5,(p.flaps||0)+1);
 p.worldScore=(p.worldScore||0)+170;
 worldNotice('💕 ふたりの奇跡！ 守護・磁力・羽ばたき +170P');sfx('boost');updateLoveActions();
}
function tickLoveActions(dt){
 if(p.phase!=='air')return;
 p.duoActive=Math.max(0,(p.duoActive||0)-dt);
 for(const r of p.loveRoads||[]){
  if(r.done||p.z<r.z)continue;r.done=true;
  if((p.x||0)<-1.75){chargeDuo(28);p.worldScore+=80;worldNotice('💙 勇気の空路！ +80P');}
  else if((p.x||0)>1.75){chargeDuo(28);p.worldScore+=80;worldNotice('💗 優しさの空路！ +80P');}
  else{chargeDuo(7);worldNotice('💞 ふたりで真ん中を飛ぶ');}
 }
}
function drawLoveRoutes(now){
 if(p.phase!=='air')return;
 const tr=(x,y,z)=>[x,y,z];
 for(const r of p.loveRoads||[]){
  if(r.done||r.z<p.z-10||r.z>p.z+125)continue;
  for(const [side,color] of [[-1,[.45,.87,1]],[1,[1,.56,.8]]]){
   for(let j=0;j<8;j++){const a=j*Math.PI/7;
    uvBall(side*4.4+Math.cos(a)*1.25,24+Math.sin(a)*2.1+Math.sin(now*.002)*.25,r.z,.19,.22,.22,color,tr,5,7);
   }
  }
 }
 if(p.duoActive>0){for(let i=0;i<12;i++){const t=i*Math.PI/6+now*.002;
  uvBall((p.x||0)+Math.cos(t)*3,p.y+1.3+Math.sin(t)*2,p.z+.5,.15,.15,.15,[1,.83,.91],tr,4,6);
 }}
}
initLoveExtraUi();


/* __PIG_MEMORY_ARCADE_V5__ -- one-time memory puzzles and in-flight heart-link rescues */
const MEMORY_LINK_Z=[110+247,110+447,110+647,110+847];
function memorySolvedMap(){
 if(!saved.memoryPuzzles||typeof saved.memoryPuzzles!=='object'||Array.isArray(saved.memoryPuzzles))saved.memoryPuzzles={};
 return saved.memoryPuzzles;
}
function memorySolvedCount(){return Object.values(memorySolvedMap()).filter(Boolean).length;}
function memoryPuzzleReward(index){
 if(index<1||index>memoryUnlocked()||memorySolvedMap()[String(index)])return false;
 memorySolvedMap()[String(index)]=true;
 saved.carrots=(Number(saved.carrots)||0)+20;
 saved.memoryStars=(Number(saved.memoryStars)||0)+1;
 if(memorySolvedCount()===10)saved.memoryMaster=true;
 persist();status();renderMemoryMenu();buildMemoryPuzzle(index);
 if(el('memoryPuzzleBanner'))el('memoryPuzzleBanner').textContent=
  saved.memoryMaster?'👑 全10通の記憶を復元！真実のエピローグ解放！':'✨ 記憶がつながった！ 🥕+20　星のかけら +1';
 sfx('level');
 return true;
}
function memoryPuzzleOptions(index){
 const want=LOVE_CHAPTERS[index-1].clue;
 const a=LOVE_CHAPTERS[(index+2)%10].clue;
 const b=LOVE_CHAPTERS[(index+5)%10].clue;
 const items=[want,a,b];
 const offset=index%3;
 return items.map((_,j)=>items[(j+offset)%3]);
}
function buildMemoryPuzzle(index){
 const box=el('memoryPuzzleBox');
 if(!box||index<1||index>memoryUnlocked())return;
 box.replaceChildren();
 const title=document.createElement('h3');title.textContent='🧩 記憶を復元しよう';title.className='memoryPuzzleTitle';box.appendChild(title);
 const question=document.createElement('div');question.className='memoryPuzzleQuestion';
 question.textContent='この手紙で思い出したものは何？';box.appendChild(question);
 if(memorySolvedMap()[String(index)]){
  const done=document.createElement('div');done.className='memoryPuzzleDone';
  done.textContent='✅ 復元成功：'+LOVE_CHAPTERS[index-1].clue+'　⭐';box.appendChild(done);
  if(saved.memoryMaster&&index===10){
   const ep=document.createElement('div');ep.className='memoryEpilogue';
   ep.textContent='💍 真実のエピローグ：忘れたくないのは、顔でも姿でもない。あなたに初めて「はじめまして」と言えた、あの日の胸の高鳴り。';
   box.appendChild(ep);
  }
  return;
 }
 const layout=document.createElement('div');layout.className='memoryPuzzleChoices';
 const feedback=document.createElement('div');feedback.className='memoryPuzzleFeedback';feedback.setAttribute('aria-live','polite');
 memoryPuzzleOptions(index).forEach((clue,j)=>{
  const b=document.createElement('button');b.type='button';b.className='memoryPuzzlePick';b.textContent='✦ '+clue;
  b.addEventListener('click',()=>{
   if(clue===LOVE_CHAPTERS[index-1].clue){
    if(memoryPuzzleReward(index))return;
   }else{
    feedback.textContent='違う記憶みたいや…。手紙の文章をもう一度読んでみよう。';
    b.disabled=true;b.classList.add('wrong');
   }
  });
  layout.appendChild(b);
 });
 box.appendChild(layout);box.appendChild(feedback);
 const note=document.createElement('p');note.className='memoryPuzzleNote';note.textContent='正解すると🥕20個と星のかけら。間違えても何度でも挑戦できるよ。';
 box.appendChild(note);
}
function initMemoryArcadeUi(){
 const css=document.createElement('style');
 css.textContent='#memoryPuzzleBox{margin:15px 0 9px;padding:14px 12px;background:linear-gradient(145deg,#fff9f1,#f3dce4);border:1px solid #d8b8a3;border-radius:16px}#memoryPuzzleBox .memoryPuzzleTitle{color:#72455e;font:900 17px system-ui;margin:0 0 5px}#memoryPuzzleBox .memoryPuzzleQuestion{font:800 12px system-ui;color:#92717a;margin-bottom:9px}#memoryPuzzleBox .memoryPuzzleChoices{display:grid;gap:6px}#memoryPuzzleBox .memoryPuzzlePick{border:1px solid #d8b2a0;border-radius:11px;background:#fffaf2;color:#604653;text-align:left;padding:11px 12px;font:800 12px system-ui;touch-action:manipulation}#memoryPuzzleBox .memoryPuzzlePick.wrong{opacity:.42}#memoryPuzzleBox .memoryPuzzleDone{font:800 13px/1.6 system-ui;color:#695057;padding:11px;background:#e8f6e4;border-radius:10px}#memoryPuzzleBox .memoryPuzzleFeedback{color:#ad6169;font:700 11px/1.5 system-ui;margin:5px 0}#memoryPuzzleBox .memoryPuzzleNote{font:700 10px/1.6 system-ui;color:#ab7777;margin:9px 0 0}.memoryEpilogue{font:600 13px/1.7 Georgia,serif;color:#71505f;border-top:1px solid #e0b2a1;padding-top:10px;margin-top:9px}#memoryPuzzleBanner{font:800 11px/1.6 system-ui;color:#fbe4b5;padding:4px 0}#heartLinkPanel{display:none;position:fixed;left:9px;top:calc(env(safe-area-inset-top) + 161px);z-index:29;width:min(44vw,180px);padding:8px 9px;background:#432854e8;border:1px solid #ffe6b6;border-radius:15px;box-shadow:0 7px 16px #231e3590;color:#fff8eb}#heartLinkPanel strong{display:block;font:900 11px system-ui;margin-bottom:4px}#heartLinkButton{width:100%;border:1px solid #fff1d3;border-radius:11px;background:linear-gradient(110deg,#ffb9d9,#ffe6ad);color:#683d58;padding:10px 4px;font:900 12px system-ui;touch-action:manipulation}#heartLinkMeter{height:4px;border-radius:10px;background:#ffffff45;overflow:hidden;margin-top:5px}#heartLinkMeterFill{width:100%;height:100%;background:#ffeaaa}#memoryArcadeStats{font:700 11px/1.65 system-ui;color:#ffe9c2;margin:4px 0 8px}@media(max-height:680px){#heartLinkPanel{top:calc(env(safe-area-inset-top) + 112px);width:43vw;padding:5px}#heartLinkButton{padding:7px 2px;font-size:11px}}';
 document.head.appendChild(css);
 const card=el('loveMemoryCard');if(card){
  const node=document.createElement('section');node.id='memoryPuzzleBox';
  const choices=el('loveDecisionPanel');
  if(choices)choices.insertAdjacentElement('beforebegin',node);else card.appendChild(node);
 }
 const bar=document.createElement('div');bar.id='heartLinkPanel';
 bar.innerHTML='<strong>💞 記憶の嵐！</strong><button type="button" id="heartLinkButton">💕 彼を助ける！</button><div id="heartLinkMeter"><div id="heartLinkMeterFill"></div></div>';
 document.body.appendChild(bar);
 el('heartLinkButton').addEventListener('click',e=>{e.stopPropagation();memoryLinkPress();});
 const n=document.createElement('div');n.id='memoryPuzzleBanner';const progress=el('loveMemoryProgress');
 if(progress)progress.insertAdjacentElement('afterend',n);
 const stats=document.createElement('p');stats.id='memoryArcadeStats';
 if(el('funMenu'))el('funMenu').appendChild(stats);
 memoryArcadeMenu();
}
function memoryArcadeMenu(){
 const n=memorySolvedCount(),a=el('memoryPuzzleBanner');
 if(a)a.textContent='🧩 記憶復元 '+n+'/10　⭐ '+(Number(saved.memoryStars)||0)+(saved.memoryMaster?'　👑 MEMORY MASTER':'');
 const stats=el('memoryArcadeStats');
 if(stats)stats.textContent='💞 ハートリンク成功 '+(Number(saved.memoryLinks)||0)+'回 ｜ 🧩 復元 '+n+'/10';
}
function memoryArcadeBegin(){
 p.heartLinks=MEMORY_LINK_Z.map(z=>({z,done:false}));
 p.heartLinkActive=null;p.heartLinkWon=0;p.heartLinkCommitted=false;
 const b=el('heartLinkPanel');if(b)b.style.display='none';
 memoryArcadeMenu();
}
function memoryLinkPress(){
 if(p.phase!=='air'||!p.heartLinkActive)return;
 const evt=p.heartLinkActive;
 if(evt.done||p.z>=evt.z+75)return;
 evt.done=true;p.heartLinkActive=null;p.heartLinkWon++;
 p.vy=Math.max(.30,p.vy+.27);p.glide=Math.max(p.glide||0,55);
 p.funEnergy=Math.min(100,(p.funEnergy||0)+25);
 p.points=(p.points||0)+180;p.worldScore=(p.worldScore||0)+130;
 chargeDuo(35);sfx('level');funNotice('💞 ハートリンク成功！ +310P・羽ばたき回復');
 if(el('heartLinkPanel'))el('heartLinkPanel').style.display='none';
}
function memoryArcadeTick(distance){
 if(p.phase!=='air')return;
 for(const evt of p.heartLinks||[]){
  if(evt.done||p.z<evt.z)continue;
  if(p.z>evt.z+75){evt.done=true;continue;}
  if(!p.heartLinkActive)p.heartLinkActive=evt;
 }
 const evt=p.heartLinkActive;
 if(evt&&(evt.done||p.z>=evt.z+75)){
  evt.done=true;p.heartLinkActive=null;
  toast('💭 記憶の嵐は過ぎ去った…');
 }
 const box=el('heartLinkPanel');
 if(box){
  box.style.display=p.heartLinkActive?'block':'none';
  if(p.heartLinkActive&&el('heartLinkMeterFill'))el('heartLinkMeterFill').style.width=
   Math.max(0,Math.min(100,(p.heartLinkActive.z+75-p.z)/75*100))+'%';
 }
}
function memoryArcadeLand(){
 if(el('heartLinkPanel'))el('heartLinkPanel').style.display='none';
 if(p.phase!=='air'||p.heartLinkCommitted)return;
 p.heartLinkCommitted=true;
 saved.memoryLinks=(Number(saved.memoryLinks)||0)+(p.heartLinkWon||0);
 persist();memoryArcadeMenu();
}
initMemoryArcadeUi();

function status(){
 const upd=(id,v)=>{const e=el(id);if(e)e.textContent=v;};
 upd('total',Math.floor(saved.carrots));upd('level',saved.level);upd('best',Math.floor(saved.best));
 upd('panelBest',Math.floor(saved.best)+'m');upd('panelCoins',Math.floor(saved.carrots));
 const s=stageFor(saved.level),nxt=nextStage(saved.level);
 upd('stage','Lv.'+saved.level+' '+s.name);upd('progressText',nxt?'次：'+nxt.emoji+' '+nxt.name+' ｜ 🥕あと'+Math.max(0,shopCost()-saved.carrots)+(upgradeWaitRuns()>0?' ｜ あと'+upgradeWaitRuns()+'回飛行':'')+' ｜ '+s.tag:'30段階コンプリート！ 伝説のブタ');
 const progress=el('stageProgress');if(progress)progress.style.width=(saved.level/30*100).toFixed(2)+'%';
 const b=el('upgrade');b.disabled=saved.carrots<shopCost()||saved.level>=30||upgradeWaitRuns()>0;
 b.textContent=saved.level>=30?'🏆 進化コンプリート':upgradeWaitRuns()>0?'🐖 あと'+upgradeWaitRuns()+'回飛ぶと進化できる':'🥕 '+shopCost()+'個で '+(nxt?nxt.name:'進化')+' に！';
 const vol=el('volumeValue');if(vol)vol.textContent=Math.round((saved.volume??.72)*100)+'%';
 if(el('audioNote'))el('audioNote').textContent=saved.muted?'🔇 音がOFFです。右上のボタンでON':'▶ スタートを押すとBGMが鳴ります';
 paintAlbum();
}
status();

const PigAudio=(()=>{
  let context=null,master=null,enabled=false,scene='menu',volume=clamp(Number(saved.volume??.72),0,1),timer=null,nextBeat=0,step=0,ready=false;
  const CTX=()=>window.AudioContext||window.webkitAudioContext;
  const note=n=>440*Math.pow(2,(n-69)/12);
  function ensure(){
    if(!CTX())return false;
    if(!context){
      context=new (CTX())();
      master=context.createGain();
      master.gain.value=volume*.34;
      master.connect(context.destination);
      nextBeat=0;
    }
    return true;
  }
  function playTone(freq,time,length,kind='triangle',gain=.10,slide=1){
    if(!context||!master||!enabled)return;
    const o=context.createOscillator(),g=context.createGain();
    o.type=kind;
    const t=Math.max(context.currentTime,time);
    o.frequency.setValueAtTime(Math.max(48,freq),t);
    if(slide!==1)o.frequency.exponentialRampToValueAtTime(Math.max(48,freq*slide),t+Math.max(.04,length*.85));
    g.gain.setValueAtTime(.0001,t);
    g.gain.exponentialRampToValueAtTime(Math.max(.001,gain),t+.014);
    g.gain.exponentialRampToValueAtTime(.0001,t+length);
    o.connect(g);g.connect(master);
    o.start(t);o.stop(t+length+.03);
  }
  const melody=[72,null,76,79,76,null,74,72,69,null,72,76,74,null,72,67,69,null,72,76,79,null,81,79,76,74,72,null,71,74,72,null];
  const roots=[48,45,41,43];
  function tick(){
    if(!context||!enabled||!ready||context.state==='suspended')return;
    const now=context.currentTime;
    if(!nextBeat||nextBeat<now-.20)nextBeat=now+.03;
    const beat=60/116/2;
    let iterations=0;
    while(nextBeat<now+.28&&iterations++<5){
      const i=step%32;
      const root=roots[Math.floor(i/8)%4];
      const lively=scene==='air',factor=scene==='menu'?.55:scene==='end'?.50:1;
      if(i%4===0)playTone(note(root-12),nextBeat,.42,'sine',.12*factor);
      if(lively&&i%2===0)playTone(note(root+12+((i/2)%3)*2),nextBeat,.15,'triangle',.042*factor);
      if(melody[i]!=null)playTone(note(melody[i]),nextBeat,lively?.17:.28,'triangle',.067*factor);
      step++;nextBeat+=beat;
    }
  }
  function unlock(){
    if(saved.muted)return false;
    try{
      if(!ensure())return false;
      enabled=true;ready=true;
      if(context.state==='suspended'){const r=context.resume();if(r&&r.catch)r.catch(()=>{});}
      master.gain.setTargetAtTime(volume*.34,context.currentTime,.025);
      if(!timer)timer=setInterval(tick,90);
      tick();
      return true;
    }catch(e){console.warn('Audio unavailable',e);return false;}
  }
  function setMuted(m){
    enabled=!m;
    if(!context)return;
    if(m){master.gain.setTargetAtTime(.0001,context.currentTime,.025);}
    else {unlock();master.gain.setTargetAtTime(volume*.34,context.currentTime,.025);}
  }
  function setVolume(v){
    volume=clamp(Number(v)||0,0,1);
    if(context&&master)master.gain.setTargetAtTime((enabled?volume*.34:.0001),context.currentTime,.02);
  }
  function setScene(v){scene=v;}
  function sfx(kind){
    if(saved.muted||!unlock())return;
    const t=context.currentTime+.008;
    if(kind==='oink'){playTone(205,t,.17,'sawtooth',.18,.56);playTone(185,t+.14,.16,'triangle',.16,.62);}
    else if(kind==='run'){playTone(170,t,.22,'triangle',.17,1.75);playTone(240,t+.10,.12,'triangle',.10,.7);}
    else if(kind==='launch'){playTone(220,t,.55,'sawtooth',.16,2.2);playTone(390,t+.10,.35,'triangle',.15,1.65);playTone(170,t+.34,.11,'sine',.18,.66);}
    else if(kind==='boost'){playTone(360,t,.31,'sawtooth',.15,2.6);playTone(620,t+.12,.22,'triangle',.17,1.6);}
    else if(kind==='carrot'){playTone(720,t,.085,'sine',.18,1.2);playTone(960,t+.065,.115,'sine',.15,1.28);}
    else if(kind==='evolve'){
      [60,64,67,72,76,79,84].forEach((n,i)=>playTone(note(n),t+i*.105,.32,'triangle',.17));
      playTone(note(48),t,.68,'sine',.16);
      playTone(250,t+.52,.15,'sawtooth',.10,.55);
    }
    else if(kind==='land'){playTone(185,t,.36,'triangle',.19,.52);playTone(120,t+.11,.38,'sine',.16,.76);}
    else if(kind==='tap'){playTone(570,t,.14,'sine',.13,1.1);}
    else if(kind==='level'){playTone(620,t,.16,'sine',.16,1.5);playTone(980,t+.12,.2,'triangle',.15);}
  }
  function stop(){if(!context)return;enabled=false;master.gain.setTargetAtTime(.0001,context.currentTime,.03);}
  return {unlock,setMuted,setVolume,setScene,sfx,stop};
})();
function unlockSound(){PigAudio.setVolume(saved.volume??.72);const ok=PigAudio.unlock();if(ok&&el('audioNote'))el('audioNote').textContent='♪ BGMと効果音を再生中';return ok;}
function beep(freq,duration,shape,volume){if(!saved.muted)PigAudio.sfx(freq>790?'carrot':freq>500?'tap':'oink');}
function sfx(name){PigAudio.sfx(name);}
function toast(s){el('toast').textContent=s;p.toastTimer=75;}

/* __PIG_COURSE_GOAL_V3__ */
const COURSE_MAX=1000;
const COURSE_ZONES=[
 ['🌸','花咲く丘','#ffb5d4'],
 ['🍬','スイーツ空','#ffb4e7'],
 ['🌊','大海原','#80d8ff'],
 ['🌋','マグマ谷','#ffad7b'],
 ['🪐','銀河宇宙','#c5a6ff']
];
function courseSkyTheme(){
 return [0,3,4,1,5][Math.min(4,Math.floor(Math.max(0,p.z-110)/200))];
}
function courseInstall(){
 if(el('courseHud'))return;
 const style=document.createElement('style');
 style.textContent='#courseHud{position:fixed;z-index:17;bottom:calc(env(safe-area-inset-bottom) + 215px);left:9px;width:min(53vw,200px);display:none;border:1px solid #ffb5d4;background:linear-gradient(130deg,#142f50ef,#433056ec);padding:9px 11px;border-radius:15px;box-shadow:0 6px 20px #071c3980;color:white;pointer-events:none;font:800 11px/1.5 system-ui}#courseHud strong{display:block;font-size:13px}#courseHudTrack{background:#ffffff38;border-radius:15px;height:8px;overflow:hidden;margin:6px 0}#courseHudFill{height:100%;width:0;background:linear-gradient(90deg,#ffa4d6,#ffe9ab)}#courseMap{margin:12px 0;padding:10px 7px;border:1px solid #ffffff60;background:#ffffff14;border-radius:14px;font:800 11px/1.5 system-ui}#courseMapRows{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:3px;margin-top:7px}#courseMapRows span{min-width:0;padding:6px 1px;background:#ffffff17;border-radius:8px;text-align:center;font-size:9px;opacity:.48}#courseMapRows .active,#courseMapRows .done{opacity:1;background:#ffe2a63b}#courseMapRows em{display:block;font:normal 19px system-ui}#courseConfetti{position:fixed;inset:0;z-index:48;display:none;pointer-events:none;background-image:radial-gradient(circle,#ffeda0 5px,transparent 7px),radial-gradient(circle,#ffc9df 5px,transparent 7px),radial-gradient(circle,#a6dcff 5px,transparent 7px);background-size:95px 117px,127px 101px,143px 135px;animation:courseRain 1.3s linear infinite}@keyframes courseRain{to{background-position:0 320px,0 350px,0 330px}}@media(max-height:640px){#courseHud{bottom:calc(env(safe-area-inset-bottom) + 163px);width:155px;padding:5px 8px}}';
 document.head.appendChild(style);
 const hud=document.createElement('div');hud.id='courseHud';
 hud.innerHTML='<strong id="courseHudTitle">🌸 WORLD 1/5</strong><div id="courseHudTrack"><div id="courseHudFill"></div></div><span id="courseHudSub">ゴールまで1000m</span>';
 document.body.appendChild(hud);
 const map=document.createElement('div');map.id='courseMap';
 map.innerHTML='<b id="courseMapTitle">🏆 5つの世界・1000mのゴールへ！</b><div id="courseMapRows"></div>';
 const d=el('description');if(d)d.insertAdjacentElement('afterend',map);
 const confetti=document.createElement('div');confetti.id='courseConfetti';document.body.appendChild(confetti);
 courseMapUpdate();
}
function courseMapUpdate(){
 const n=Math.max(0,Number(saved.coursesReached)||0);
 const box=el('courseMapRows');if(box)box.innerHTML=COURSE_ZONES.map((w,i)=>'<span class="'+(saved.courseChampion||i<n?'done':i===n?'active':'')+'"><em>'+(saved.courseChampion||i<=n?w[0]:'🔒')+'</em>'+(i+1)+'. '+w[1]+'</span>').join('');
 const t=el('courseMapTitle');if(t)t.textContent=saved.courseChampion?'🏆 1000m完全制覇！':'🏆 5つの世界・1000mのゴールへ！';
}
function courseBegin(){
 courseInstall();p.courseWorld=0;p.courseHudFrame=-100;
 el('courseHud').style.display='block';
 courseHudUpdate(0);courseMapUpdate();
}
function courseHudUpdate(distance){
 const i=Math.min(4,Math.floor(Math.max(0,distance)/200));
 const w=COURSE_ZONES[i],h=el('courseHud');
 if(h)h.style.borderColor=w[2];
 const t=el('courseHudTitle');if(t)t.textContent=w[0]+' WORLD '+(i+1)+'/5 '+w[1];
 const b=el('courseHudFill');if(b){b.style.width=Math.min(100,distance/COURSE_MAX*100)+'%';b.style.background='linear-gradient(90deg,'+w[2]+',#ffe4a7)';}
 const s=el('courseHudSub');if(s)s.textContent='🏁 残り'+Math.max(0,COURSE_MAX-distance)+'m / 次のゲート '+Math.max(0,Math.min(200,(i+1)*200-distance))+'m';
}
function courseTick(distance){
 const i=Math.min(4,Math.floor(Math.max(0,distance)/200));
 if(i>p.courseWorld){
  p.courseWorld=i;saved.coursesReached=Math.max(Number(saved.coursesReached)||0,i+1);persist();courseMapUpdate();
  p.vy+=.19;p.carrots+=3;
  sfx('level');toast('🚩 '+COURSE_ZONES[i][1]+' に突入！ 🥕+3');
 }
 if(distance-p.courseHudFrame>=3||distance>=COURSE_MAX){
  p.courseHudFrame=distance;courseHudUpdate(distance);
 }
}
function courseFinish(){
 p.z=110+COURSE_MAX;
 land(); // Keep existing LOVE STORY, memories, evolution and scoring.
 saved.courseChampion=true;saved.coursesReached=5;
 saved.courseChampionAt=saved.courseChampionAt||new Date().toISOString();
 saved.carrots+=100;persist();status();courseMapUpdate();
 el('headline').textContent='🏆 1000m 完全クリア！';
 el('description').innerHTML='🌸🍬🌊🌋🪐 5つの世界を制覇！<br>最終ゴールに到着！<br>🥕 優勝ボーナス100個ゲット！<br>✨ 合計 '+Math.round(p.points||0)+'ポイント';
 el('heroPig').textContent='👑🐷';
 el('play').textContent='🐖 もう一度、世界一周！';funFinale();
 const confetti=el('courseConfetti');if(confetti){confetti.style.display='block';setTimeout(()=>{confetti.style.display='none';},4500);}
 sfx('evolve');
}
courseInstall();


/* __PIG_ARCADE_FUN_V1__ : choice gates, hazards, fever, rhythm tap, revives */
const FUN_ICONS=['🌸','🍭','🐬','🔥','🌠'];
const FUN_DANGERS=['🐝','🍪','🦈','🌋','☄️'];
function funNotice(message){
 worldNotice(message,100);
}
function funInstall(){
 const hud=el('courseHud');
 if(!hud||el('funStats'))return;
 const style=document.createElement('style');
 style.textContent='#funStats{margin-top:7px;padding-top:6px;border-top:1px solid #ffffff52;line-height:1.45}#funStats strong{font-size:12px;color:#ffedbb}#funPulse{height:5px;border-radius:7px;background:#ffffff39;overflow:hidden;margin-top:4px}#funPulseFill{width:0;height:100%;background:linear-gradient(90deg,#ffc9df,#ffe48f)}#funMenu{margin:7px 0 12px;padding:10px;border:1px solid #ffdfa48c;border-radius:13px;background:#2d375f8e;color:#ffefdd;font:800 11px/1.65 system-ui}#funMenu b{color:#ffdf9c}#funRhythm{position:fixed;z-index:16;top:calc(env(safe-area-inset-top) + 173px);right:10px;display:none;padding:7px 10px;max-width:42vw;border-radius:12px;background:#18284bdc;color:#fff;border:1px solid #fff9;font:900 11px/1.35 system-ui;pointer-events:none}#funRhythm.on{background:#a23f73ed;border-color:#fff2ab;box-shadow:0 0 16px #ffd1ac80}#funBest{font:800 11px/1.5 system-ui;color:#ffedd5;margin-bottom:6px}@media(max-height:640px){#funRhythm{top:92px;right:5px;font-size:10px;padding:4px 6px}}';
 document.head.appendChild(style);
 const stats=document.createElement('div');stats.id='funStats';stats.innerHTML='<strong id="funScore">✨ FEVER 0/5</strong><div id="funGuide">🎯 左右で宝ゲートを狙え！</div><div id="funPulse"><div id="funPulseFill"></div></div>';
 hud.appendChild(stats);
 const a=document.createElement('div');a.id='funRhythm';a.textContent='🎵 空中タップでブースト';document.body.appendChild(a);
 const intro=document.createElement('div');intro.id='funMenu';
 intro.innerHTML='<b>🎮 NEW! 空飛ぶアーケード</b><br>💕 左右で「お宝ルート」を選ぶ → 障害物を避ける<br>🎵 空中タップでリズムブースト（PERFECTで高得点）<br>⚡ アイテム5個でFEVER！　🪽 救済ジャンプで再挑戦<br><span id="funBest">🏆 最高コンボ 0</span>';
 const map=el('courseMap');if(map)map.insertAdjacentElement('afterend',intro);
 funMenuUpdate();
}
function funMenuUpdate(){
 const t=el('funBest');if(t)t.textContent='🏆 歴代最高コンボ '+(saved.funBestCombo||0)+' ｜ 成功ゲート '+(saved.funGatesWon||0)+' ｜ 回避 '+(saved.funHazardsDodged||0);
}
function funBegin(){
 funInstall();
 p.funEnergy=45;p.funCombo=0;p.funBestCombo=0;p.funFever=0;p.funRevives=1;p.funReviveTimer=0;p.funTapCooldown=0;p.funGoodTaps=0;
 p.funHits=0;p.funDodges=0;p.funGatesWon=0;p.funPerfects=0;p.funLastZone=0;p.funHudAt=-100;
 p.funCommitted=false;p.funEvents=[];
 const seed=Math.floor(Number(saved.runs)||0);
 for(let i=0;i<5;i++){
  const side=(seed+i)%2===0?-1:1;
  p.funEvents.push({kind:'gate',zone:i,z:110+110+i*200,x:side*3.7,y:23,hit:false});
  p.funEvents.push({kind:'danger',zone:i,z:110+164+i*200,x:0,y:24,hit:false,phase:i*1.57+seed*.49});
 }
 const r=el('funRhythm');if(r)r.style.display='block';
 const guide=el('guide');if(guide)guide.textContent='← → 宝ルートを選ぼう！ 空中タップでリズムブースト 🎵';
 funHudUpdate(0);
}
function funBoostTap(){
 if(p.phase!=='air'||p.funTapCooldown>0)return;
 const distance=Math.max(0,Math.floor(p.z-110));
 const beat=distance%85;
 const perfect=beat<=11||beat>=74;
 const fresh=!p.boosted;
 const cost=fresh?0:20;
 if(p.funEnergy<cost){
  funNotice('💗 エナジー不足！ゲート・アイテムでチャージ');
  p.funTapCooldown=12;return;
 }
 p.funEnergy-=cost;p.boosted=true;
 p.vy+=perfect?.42:.21;p.speed+=perfect?.08:.025;
 p.funTapCooldown=perfect?19:26;p.funGoodTaps++;p.funReviveTimer=0;
 if(perfect){
  p.funPerfects++;p.funCombo++;p.funBestCombo=Math.max(p.funBestCombo,p.funCombo);
  p.points=(p.points||0)+100;p.worldScore=(p.worldScore||0)+50;chargeDuo(14);
  funNotice('🎵 PERFECT BOOST！ +150P ✨');sfx('level');
 }else{
  p.points=(p.points||0)+20;toast(fresh?'🐖 TAKE OFF BOOST！':'🎵 GOOD BOOST！ +20P');sfx('boost');
 }
 funHudUpdate(distance);
}
function funCollect(item){
 if(p.phase!=='air')return;
 p.funEnergy=Math.min(100,p.funEnergy+(item.kind==='ring'?20:12));
 p.funCombo++;p.funBestCombo=Math.max(p.funBestCombo,p.funCombo);
 if(p.funCombo%5===0){
  p.funFever=110;p.spinAct=Math.max(p.spinAct||0,110);
  p.funRevives=Math.min(2,p.funRevives+1);
  p.points=(p.points||0)+250;
  chargeDuo(20);
  funNotice('⚡ FEVER！ スコア2倍・復活チャンス+1');
  sfx('evolve');
 }
}
function funHit(event,distance){
 const isGate=event.kind==='gate';
 const inLane=Math.abs((p.x||0)-event.x);
 const inSky=Math.abs((p.y||0)-event.y);
 if(isGate){
  if(inLane<=2.7&&inSky<30){
   p.funGatesWon++;p.funCombo++;p.funBestCombo=Math.max(p.funBestCombo,p.funCombo);
   p.funEnergy=Math.min(100,p.funEnergy+35);
   p.funRevives=Math.min(2,p.funRevives+1);
   p.vy+=.29;p.carrots+=7;p.points=(p.points||0)+180;chargeDuo(18);
   funNotice(FUN_ICONS[event.zone]+' お宝ゲート大成功！ 🥕+7 ＋180P');
   sfx('level');
  }else{
   p.funEnergy=Math.min(100,p.funEnergy+8);
   toast('💫 宝ゲートは次のチャンスで！');
  }
 }else{
  const movingX=Math.sin(distance*.09+event.phase)*2.7;
  if(Math.abs((p.x||0)-movingX)<2.0&&inSky<27&&!(p.duoActive>0)){
   p.funHits++;p.funCombo=0;
   p.funEnergy=Math.min(100,p.funEnergy+5);
   p.vy-=.14;p.speed=Math.max(.55,p.speed-.08);
   p.points=Math.max(0,(p.points||0)-60);
   funNotice(FUN_DANGERS[event.zone]+' 障害物にヒット！ -60P');
   sfx('oink');
  }else{
   p.funDodges++;p.funEnergy=Math.min(100,p.funEnergy+12);
   p.points=(p.points||0)+90;chargeDuo(8);
   toast('🌀 ナイス回避！ +90P');
  }
 }
}
function funTick(distance,dt){
 if(p.phase!=='air')return;
 p.funTapCooldown=Math.max(0,p.funTapCooldown-dt);
 p.funFever=Math.max(0,p.funFever-dt);
 p.funReviveTimer=Math.max(0,p.funReviveTimer-dt);
 const zone=Math.min(4,Math.floor(Math.max(0,distance)/200));
 if(zone>p.funLastZone){
  p.funLastZone=zone;
  p.funRevives=Math.min(2,p.funRevives+1);
  p.funEnergy=Math.min(100,p.funEnergy+30);
  p.vy=Math.max(p.vy,.38);
  funNotice('🪽 CHECKPOINT！ 復活+1・エナジー回復');
 }
 for(const event of p.funEvents){
  if(event.hit||p.z<event.z)continue;
  event.hit=true;funHit(event,distance);
 }
 if(distance-p.funHudAt>=3||distance>=COURSE_MAX){p.funHudAt=distance;funHudUpdate(distance);}
}
function funHudUpdate(distance){
 const t=el('funScore');if(t)t.textContent=(p.funFever>0?'⚡ FEVER！':'✨ COMBO '+p.funCombo+' / 5')+'　💗'+Math.floor(p.funEnergy||0);
 const b=el('funPulseFill');if(b)b.style.width=Math.floor(p.funEnergy||0)+'%';
 const n=el('funGuide');
 if(n){const next=(p.funEvents||[]).find(e=>!e.hit);n.textContent=next?((next.kind==='gate'?'🎁 宝ルート':'⚠️ 障害物')+'まで '+Math.max(0,Math.floor(next.z-p.z))+'m'):'🏆 ゴールは目前！';}
 const r=el('funRhythm');if(r){
  const beat=distance%85,perfect=beat<=11||beat>=74;
  r.textContent=(perfect?'🎵 PERFECT NOW!':'🎵 タップでBOOST')+' 💗'+Math.floor(p.funEnergy||0)+' 🪽'+(p.funRevives||0);
  r.classList.toggle('on',perfect&&p.phase==='air'&&p.funTapCooldown<=0);
 }
}
function funRescue(){
 if(p.phase!=='air'||p.z>110+COURSE_MAX||p.y>0||p.funRevives<=0)return false;
 p.funRevives--;p.y=8;p.vy=.70;p.glide=Math.max(p.glide||0,58);p.speed=Math.max(p.speed,.82);
 p.funReviveTimer=45;
 funNotice('🪽 救済ジャンプ！ もう一度空へ！');
 sfx('boost');funHudUpdate(Math.floor(p.z-110));
 return true;
}
function funLand(){
 const a=el('funRhythm');if(a)a.style.display='none';
 if(p.phase!=='air'||p.funCommitted)return;
 p.funCommitted=true;
 saved.funBestCombo=Math.max(Number(saved.funBestCombo)||0,p.funBestCombo||0);
 saved.funGatesWon=(Number(saved.funGatesWon)||0)+(p.funGatesWon||0);
 saved.funHazardsDodged=(Number(saved.funHazardsDodged)||0)+(p.funDodges||0);
 saved.funPerfects=(Number(saved.funPerfects)||0)+(p.funPerfects||0);
 persist();funMenuUpdate();
}
function funResults(){
 const d=el('description');if(d&&p.funCommitted){
  d.innerHTML+='<br>🎵 PERFECT '+p.funPerfects+'回 ｜ 🎁 宝ゲート '+p.funGatesWon+'/5 ｜ 🌀 回避 '+p.funDodges+'回 ｜ 🔥 最大コンボ '+p.funBestCombo;
 }
}
function funFinale(){
 const trueEnd=(Number(saved.level)||1)>=30&&(Number(saved.memoryChapters)||0)>=10;
 if(trueEnd){saved.funTrueEnding=true;persist();}
 const d=el('description');if(d)d.innerHTML+=trueEnd
  ?'<br>💍 TRUE ENDING：記憶を取り戻したふたりは、人間へ戻り結婚式へ！'
  :'<br>💌 SECRET：進化Lv.30と記憶10通で「人間に戻る結婚式」が解放！';
}
function funDraw(now){
 if(p.phase!=='air')return;
 const tr=(x,y,z)=>[x,y,z];
 for(const event of p.funEvents||[]){
  if(event.hit||event.z<p.z-12||event.z>p.z+115)continue;
  const dy=Math.sin(now*.004+event.zone)*.45;
  if(event.kind==='gate'){
   const colors=[[1,.68,.85],[1,.84,.44],[.40,.91,1],[1,.52,.28],[.85,.71,1]],c=colors[event.zone];
   for(let j=0;j<12;j++){
    const a=j*Math.PI/6+now*.0007;
    uvBall(event.x+Math.cos(a)*2.5,event.y+Math.sin(a)*2.5+dy,event.z,.31,.31,.36,c,tr,4,6);
   }
   uvBall(event.x,event.y+dy,event.z,.8,.82,.38,[1.,.97,.72],tr,5,8);
  }else{
   const x=Math.sin(Math.max(0,p.z-110)*.09+event.phase)*2.7;
   for(let j=0;j<6;j++){
    const a=j*Math.PI/3+now*.002;
    uvBall(x+Math.cos(a)*1.55,event.y+dy+Math.sin(a)*1.55,event.z,.38,.39,.38,[1,.39,.28],tr,4,7);
   }
   uvBall(x,event.y+dy,event.z,1.1,1.1,1.1,[.32,.19,.36],tr,6,8);
   uvBall(x-.27,event.y+.26+dy,event.z+.97,.14,.14,.13,[1.,.88,.33],tr,4,6);
   uvBall(x+.27,event.y+.26+dy,event.z+.97,.14,.14,.13,[1.,.88,.33],tr,4,6);
  }
 }
}
funInstall();

function begin(){p.hopY=0;p.hopV=0;p.downAt=0;PigAudio.setScene('run');p.phase='ready';p.z=0;p.y=0;p.vy=0;p.speed=.57;p.holding=false;p.boosted=false;p.carrots=0;p.combo=0;p.score=0;p.earned=0;p.spin=0;p.points=0;p.flaps=3;p.glide=0;p.glideUsed=false;p.spinAct=0;p.spinUsed=false;p.diveUsed=false;p.actionCool=0;initItems();worldInit();memoryInit();resetLoveActions();showLoveActions(false);showWorld(false);if(el("loveMemoryHud"))el("loveMemoryHud").style.display="none";resetPigEvent();flyMenu(false);if(el('groundJump'))el('groundJump').style.display='block';el('modal').classList.add('hidden');el('phase').textContent='HOLD TO RUN';el('action').textContent='🐷 タップでジャンプ・長押しでダッシュ';el('guide').textContent='🐷 タップでジャンプ・長押しダッシュ → 空中でランダムイベント！';el('toast').textContent='';el('distance').innerHTML='0<small>METERS</small>';el('fill').style.width='0%';courseBegin();funBegin();memoryArcadeBegin();}
function upgrade(){
 const cost=shopCost();if(saved.level>=30||saved.carrots<cost||upgradeWaitRuns()>0)return;
 const was=stageFor(saved.level).name;
 saved.carrots-=cost;saved.level++;saved.lastEvolutionRun=Math.floor(Number(saved.runs)||0);persist();status();sfx('evolve');
 el('heroPig').textContent=stageFor(saved.level).emoji;
 el('headline').textContent='✨ 進化！ '+stageFor(saved.level).name;
 el('description').innerHTML='Lv.'+saved.level+' '+stageFor(saved.level).tag+'！<br>羽・色・飾りが変化してパワーアップ。<br>次はもっと遠くへ飛べるで！';
 if(was!==stageFor(saved.level).name&&el('stageCard'))el('stageCard').style.borderColor='#ffe4a8';
}
el('play').addEventListener('click',()=>{unlockSound();sfx('oink');begin()});el('upgrade').addEventListener('click',upgrade);
el('sound').addEventListener('click',()=>{saved.muted=!saved.muted;el('sound').textContent=saved.muted?'🔇':'🔊';el('sound').setAttribute?.('aria-label',saved.muted?'音をオンにする':'音をオフにする');persist();if(!saved.muted){unlockSound();sfx('oink')}else PigAudio.setMuted(true);status()});el('sound').textContent=saved.muted?'🔇':'🔊';
function interactDown(event){if(event)event.preventDefault();p.downAt=Date.now();unlockSound();if(p.phase==='ready'){p.phase='run';p.holding=true;sfx('run');el('phase').textContent='FULL SPEED!';}
else if(p.phase==='run'){p.holding=true;}
else if(p.phase==='air'){funBoostTap();}}
function interactUp(){const tap=Date.now()-(p.downAt||0)<260;p.holding=false;if(tap&&p.phase==='run')groundJump();}
for(const target of [canvas,el('action')]){
target.addEventListener('pointerdown',e=>{if(target===el('action')){try{target.setPointerCapture?.(e.pointerId)}catch(_){}}interactDown(e)});
target.addEventListener('pointerup',interactUp);
target.addEventListener('pointercancel',interactUp);
}
el('action').addEventListener('click',()=>{if(Date.now()-(p.lastTapHandled||0)>450&&(p.phase==='run'||p.phase==='ready'))groundJump()});
window.addEventListener('keydown',e=>{if(e.code==='Space'&&!e.repeat){e.preventDefault();interactDown(e)}});
window.addEventListener('keyup',e=>{if(e.code==='Space')interactUp()});
document.addEventListener('visibilitychange',()=>{if(document.hidden)p.holding=false});
function land(){memoryArcadeLand();funLand();const ch=el('courseHud');if(ch)ch.style.display='none';showLoveActions(false);if(p.missionDone){saved.loveMissionsWon=(saved.loveMissionsWon||0)+1;persist();}if(el("loveMemoryHud"))el("loveMemoryHud").style.display="none";showWorld(false);worldSaveFlight();resetPigEvent();if(el('groundJump'))el('groundJump').style.display='none';flyMenu(false);if(p.phase!=='air')return;p.phase='land';p.y=0;p.score=Math.max(0,Math.floor(p.z-110));const bonus=Math.floor(p.score/55)+Math.floor(p.combo/7)*2;p.earned=p.carrots+bonus;const record=p.score>saved.best;saved.best=Math.max(saved.best,p.score);saved.carrots+=p.earned;saved.runs++;persist();status();sfx('land');PigAudio.setScene('end');
el('heroPig').textContent='🐖';
el('headline').textContent=record?'🏆 NEW RECORD!':'ナイスジャンプ！';
el('description').innerHTML='飛距離 <strong>'+p.score+'m</strong>！<br>🥕 空中で '+p.carrots+'個 GET ＋ 距離・コンボボーナス '+bonus+'個。<br>育てて、30段階の進化を目指そう！';
p.points+=(p.worldScore||0);saved.bestPoints=Math.max(Number(saved.bestPoints)||0,p.points||0);persist();el('description').innerHTML+='<br/>✨ ボーナス '+(p.points||0)+' PTS （最高 '+saved.bestPoints+'）';el('play').textContent='🐖 もう1回飛ぶ！';
el('modal').classList.remove('hidden');funResults();memoryFlightCleared(p.score);
}
function update(dt){if(p.phase==='run'){const max=.98+Math.min(saved.level,20)*.055;p.speed=clamp(p.speed+(p.holding?.017:.003)*dt,.57,max);p.z+=p.speed*2.55*dt;p.y=roadY(Math.min(p.z,110));if(p.hopY>0){p.hopY+=p.hopV*dt;p.hopV-=.047*dt;if(p.hopY<=0){p.hopY=0;p.hopV=0;}p.y+=p.hopY;}p.spin+=dt*.2;el('fill').style.width=(p.speed/max*100).toFixed(1)+'%';if(p.z>=109.6){p.z=110;p.y=10.5;p.vy=.55+p.speed*.24+saved.level*.018;p.phase='air';p.vy+=(p.runProfession?.boost||0);p.hopY=0;p.hopV=0;p.holding=false;p.boosted=false;if(el('groundJump'))el('groundJump').style.display='none';el('phase').textContent='FLYING PIG!';el('action').textContent='✨ タップで空中ブースト！';el('guide').textContent='⬅️➡️で操縦！ 🛸・🌪️・🎡・🎯・🐣・💎を探そう';sfx('launch');PigAudio.setScene('air');toast('TAKE OFF! 🐷');flyMenu(true);showWorld(true);showLoveActions(true);if(el('loveMemoryHud'))el('loveMemoryHud').style.display='block';}}
else if(p.phase==='air'){p.z+=p.speed*2.8*dt;tickPigEvents();tickWorld(dt);memoryFlight(dt);tickLoveActions(dt);p.y+=p.vy*dt;p.vy-=(p.glide>0?.0048:.015)*dt;p.glide=Math.max(0,(p.glide||0)-dt);p.spinAct=Math.max(0,(p.spinAct||0)-dt);p.actionCool=Math.max(0,(p.actionCool||0)-dt);p.spin+=dt*.045;const distance=Math.max(0,Math.floor(p.z-110));p.score=distance;el('distance').innerHTML=distance+'<small>METERS</small>';courseTick(distance);funTick(distance,dt);memoryArcadeTick(distance);if(distance>=COURSE_MAX){courseFinish();return;}for(const item of p.items){if(!item.taken&&!item.missed&&p.z>=item.z){if(Math.abs(p.y-item.y)<15){item.taken=true;p.combo++;p.carrots+=1+Math.min(2,Math.floor(p.combo/6))+(p.eventActive==='carrot'?1:0);sfx('carrot');toast('🥕 '+p.carrots+'  + COMBO '+p.combo);}else{item.missed=true;p.combo=0;}}}collectBonuses();if((p.y<=0&&p.z>155)||p.z>LIMIT){if(!funRescue())land();}else{el('fill').style.width=(clamp(p.y/55*100,0,100)).toFixed(1)+'%';}}
if(p.toastTimer>0){p.toastTimer-=dt;if(p.toastTimer<=0)el('toast').textContent='';}}
let vw=0,vh=0,dpr=1;
function resize(){const rect=canvas.getBoundingClientRect();vw=Math.max(1,rect.width);vh=Math.max(1,rect.height);dpr=Math.min(window.devicePixelRatio||1,1.65);const nw=Math.round(vw*dpr),nh=Math.round(vh*dpr);if(canvas.width!==nw||canvas.height!==nh){canvas.width=nw;canvas.height=nh;gl.viewport(0,0,nw,nh)}}window.addEventListener('resize',resize);resize();
function uvBall(cx,cy,cz,rx,ry,rz,col,transform,rows=9,columns=15){
for(let j=0;j<rows;j++){const t0=-Math.PI/2+Math.PI*j/rows,t1=-Math.PI/2+Math.PI*(j+1)/rows;
for(let i=0;i<columns;i++){const f0=i*2*Math.PI/columns,f1=(i+1)*2*Math.PI/columns;
const pt=(t,f)=>transform(cx+rx*Math.cos(t)*Math.cos(f),cy+ry*Math.sin(t),cz+rz*Math.cos(t)*Math.sin(f));
const a=pt(t0,f0),b=pt(t1,f0),c=pt(t1,f1),d=pt(t0,f1);
tri(a,b,c,col);tri(a,c,d,col);
}}}

function pigAccessories(tr,lv,now,accent,skin){
 const ball=(x,y,z,rx,ry,rz,c=accent)=>uvBall(x,y,z,rx,ry,rz,c,tr,6,10);
 const horn=(x,y,z,r,h,c=accent)=>cone(...tr(x,y,z),r,h,c,8);
 const gold=[1,.82,.28],white=[1,.97,.92],dark=[.14,.18,.27],aqua=[.41,.91,.98];
 const sprinkle=(c,n=10)=>{for(let i=0;i<n;i++){const t=i*2.399,side=i%2?-1:1;ball(side*(.55+.46*Math.cos(t)),1.52+.63*Math.sin(t),-.4-i*.075,.09,.09,.12,c);}};
 const halo=(y,c)=>{for(let k=0;k<14;k++){const t=k*Math.PI/7;ball(Math.cos(t)*.59,y,1.03+Math.sin(t)*.28,.095,.06,.095,c);}};
 switch(lv){
 case 2: sprinkle([1,.97,.69],16);ball(0,2.45,1.07,.29,.13,.24,[.24,.72,.36]);break;
 case 3: for(let k=-2;k<=2;k++)ball(0,1.43,-1.12+k*.53,.96,.15,.11,accent);break;
 case 4: for(let s of [-1,1]){horn(s*.34,2.76,1.15,.09,.55,dark);ball(s*.34,3.10,1.15,.15,.15,.15,dark);}for(let k=0;k<3;k++)ball(0,1.44,-.98+k*.72,.95,.13,.13,dark);break;
 case 5: ball(0,2.36,1.49,.74,.18,.26,dark);for(let s of [-1,1])ball(s*.74,2.27,1.2,.19,.14,.14,[.91,.20,.35]);break;
 case 6: for(let s of [-1,1]){ball(s*.39,2.04,1.77,.25,.23,.13,[.28,.33,.39]);ball(s*.39,2.07,1.88,.18,.15,.05,aqua);}ball(0,2.1,1.7,.10,.09,.06,gold);break;
 case 7: sprinkle(white,12);for(let i=-2;i<=2;i++)horn(i*.29,2.47,1.04,.13,.23,white);break;
 case 8: for(let k=0;k<7;k++)ball(Math.sin(k*1.9)*.73,2.15+Math.cos(k*.9)*.22,-.95+k*.22,.29,.24,.29,white);break;
 case 9: for(let s of [-1,1])ball(s*.37,1.98,1.79,.31,.21,.12,dark);ball(0,2.02,1.80,.16,.05,.09,dark);break;
 case 10: for(let s of [-1,1])horn(s*.43,2.65,1.03,.20,.59,gold);for(let k=0;k<6;k++)horn(0,2.16,-1.32+k*.47,.21,.42,gold);break;
 case 11: ball(0,2.52,1.05,.67,.29,.54,dark);horn(0,2.90,1.10,.19,.74,gold);for(let s of [-1,1])ball(s*.66,2.54,1.0,.19,.35,.19,accent);break;
 case 12: ball(0,2.57,1.15,.68,.12,.48,white);ball(0,2.75,1.05,.46,.24,.33,white);ball(0,2.54,1.53,.38,.06,.13,[.22,.49,.81]);break;
 case 13: for(let s of [-1,1]){ball(s*.42,3.15,1.03,.23,.66,.19,skin);ball(s*.42,3.17,1.20,.12,.48,.06,[1,.50,.70]);}break;
 case 14: halo(2.28,aqua);ball(0,2.60,1.08,.76,.18,.64,white);for(let s of [-1,1])ball(s*.90,1.47,-.56,.25,.47,.38,[.37,.57,.85]);break;
 case 15: horn(0,2.88,1.47,.22,.95,gold);sprinkle([.99,.77,.97],10);break;
 case 16: ball(0,2.58,1.1,.76,.21,.47,dark);ball(0,2.77,.89,.49,.32,.25,dark);ball(-.37,1.97,1.83,.28,.25,.12,dark);break;
 case 17: horn(0,3.05,1.08,.65,1.17,[.32,.20,.67]);ball(0,2.57,1.08,.75,.15,.43,gold);sprinkle(gold,8);break;
 case 18: ball(-.37,2.0,1.78,.28,.24,.15,aqua);ball(.37,2.0,1.78,.28,.24,.15,dark);for(let s of [-1,1])ball(s*.85,1.67,-1.02,.31,.46,.37,[.36,.44,.54]);break;
 case 19: ball(-.30,2.63,1.03,.37,.23,.22,[1,.35,.68]);ball(.30,2.63,1.03,.37,.23,.22,[1,.35,.68]);ball(0,2.58,1.27,.17,.17,.18,gold);break;
 case 20: for(let k=-2;k<=2;k++)horn(k*.25,2.73,1.04,.17,.39+(k===0?.25:0),gold);ball(0,2.48,1.04,.64,.15,.43,gold);break;
 case 21: for(let s of [-1,1])ball(s*.37,1.98,1.79,.31,.21,.12,dark);ball(0,2.45,1.08,.34,.13,.26,[1,.47,.25]);sprinkle(white,8);break;
 case 22: for(let k=0;k<7;k++)horn(Math.sin(k*1.9)*.6,2.29,-1.37+k*.45,.20,.40+(k%3)*.24,[1,.45,.15]);break;
 case 23: halo(3.04,gold);for(let s of [-1,1])for(let k=0;k<3;k++)ball(s*(1.19+k*.19),1.67+k*.15,-.61,.30,.15,.40,white);break;
 case 24: for(let s of [-1,1])horn(s*.44,2.70,1.10,.19,.66,[.24,.12,.35]);ball(0,2.41,1.1,.32,.09,.20,dark);break;
 case 25: for(let k=-3;k<=3;k++)horn(Math.sin(k*1.5)*.46,2.39,-.86+k*.31,.19,.49+(k%3)*.17,aqua);sprinkle(white,7);break;
 case 26: for(let k=0;k<7;k++){const t=k*.91+now*.002;ball(Math.sin(t)*1.23,2.13+Math.cos(t)*.46,-.27,.13,.13,.13,k%2?gold:aqua);}break;
 case 27: for(let s of [-1,1]){ball(s*.86,1.40,-1.19,.28,.40,.46,[.25,.34,.45]);horn(s*.86,.93,-1.55,.18,.38,[1,.43,.12]);}break;
 case 28: for(let k=0;k<10;k++){const t=k*.63+now*.0005;ball(Math.cos(t)*1.40,1.94+Math.sin(t)*.43,-.31,.13,.13,.13,k%2?aqua:[1,.76,.99]);}break;
 case 29: sprinkle([.33,1,.86],18);halo(3.06,white);break;
 case 30: for(let k=-3;k<=3;k++)horn(k*.20,2.79,1.03,.16,.45+(k===0?.39:0),gold);halo(3.42,white);sprinkle(aqua,19);break;
 }
}

function pigModel(x,y,z,now){
 const stage=stageFor(saved.level),tier=Math.floor((saved.level-1)/5),lv=saved.level;
 const scale=clamp(.84+(lv-1)*.018,.84,1.36);
 const bounce=p.phase==='run'?Math.sin(p.spin*5)*.11:Math.sin(now*.003)*.035;
 const yaw=p.phase==='air'?.18+Math.sin(p.spin)*(p.spinAct>0?1.40:.35):.02;
 const cos=Math.cos(yaw),sin=Math.sin(yaw);
 const tr=(lx,ly,lz)=>[x+scale*(lx*cos+lz*sin),y+scale*(ly+bounce),z+scale*(lz*cos-lx*sin)];
 const skin=stage.color,accent=stage.accent;
 const light=skin.map(v=>Math.min(1,v+.085)),snout=[Math.min(1,skin[0]*1.07),skin[1]*.81,skin[2]*.94];
 const ear=[Math.min(1,skin[0]*.99),skin[1]*.69,skin[2]*.72];
 const shadow=[.62,.29,.42],hoof=tier>3?[.25,.33,.39]:[.35,.27,.36],eye=[.10,.12,.19],shine=[1,.98,1];
 const bodySize=1.08+Math.sin(lv*.83)*.045;
 uvBall(0,1.39,-.18,bodySize,.90,1.49,skin,tr,12,19);
 uvBall(0,1.78,1.15,.84,.76,.83,light,tr,10,17);
 uvBall(0,1.47,1.87,.49,.35,.22,snout,tr,9,17);
 for(const side of [-1,1]){
  uvBall(side*.18,1.47,2.05,.078,.115,.034,shadow,tr,5,9);
  uvBall(side*.37,1.96,1.8,.105,.14,.055,eye,tr,8,12);
  uvBall(side*.34,2.02,1.854,.035,.043,.018,shine,tr,5,8);
  uvBall(side*.58,1.57,1.70,.17,.115,.045,accent,tr,5,9);
  const footMove=p.phase==='run'?Math.sin(p.spin*8+side)*.20:.05;
  uvBall(side*.74,.52+footMove,-.97,.32,.51,.35,skin,tr,8,11);
  uvBall(side*.74,.47-footMove,.88,.32,.49,.36,skin,tr,8,11);
  uvBall(side*.74,.18+footMove,-.97,.33,.20,.39,hoof,tr,6,10);
  uvBall(side*.74,.16-footMove,.88,.33,.19,.40,hoof,tr,6,10);
  tri(tr(side*.39,2.24,1.06),tr(side*.92,2.93,1.11),tr(side*.77,2.20,1.48),skin);
  tri(tr(side*.51,2.32,1.115),tr(side*.86,2.74,1.17),tr(side*.72,2.29,1.42),ear);
 }
 for(let i=0;i<10;i++){const theta=i*.61;uvBall(Math.sin(theta)*.26,1.54+Math.cos(theta)*.28,-1.67-i*.025,.13,.13,.13,skin,tr,5,8);}
 // Every stage changes its palette, markings and decorative pig features.
 if([2,3,4,8,18,21,25,28].includes(lv)){for(let i=0;i<4+(lv%3);i++){
  const theta=.18+i*1.23+lv*.08;
  const xx=Math.cos(theta)*1.035,yy=1.43+Math.sin(theta)*.61;
  uvBall(xx,yy,-.12-i*.30,.18+(lv%4)*.018,.10,.19,accent,tr,5,8);
 }}
 if([5,6,9,11,12,16,19,24].includes(lv)){uvBall(0,2.48,1.22,.25,.12,.28,accent,tr,6,10);}
 if([4,10,13,17,22,23,24,27,29,30].includes(lv)){for(const side of [-1,1]){
  const wingColor=lv>=21?[1,.94,.78]:lv>=16?[.86,.91,1]:[.97,.88,1];
  for(let k=0;k<3+(lv>=23?1:0);k++)uvBall(side*(1.03+k*.27),1.54+k*.19,-.35,.33,.12,.50,wingColor,tr,6,10);
 }}
 if([7,14,15,17,20,25,30].includes(lv)){uvBall(0,2.65,1.22,.18,.29,.16,[1,.93,.82],tr,7,11);}
 if([10,11,15,20,24,30].includes(lv)){for(let i=-2;i<=2;i++)cone(...tr(i*.18,2.53,1.02),.13,.28+(i===0?.19:0),[1,.83,.36],7);}
 if([17,19,22,23,25,26,28,29,30].includes(lv)){for(let i=0;i<5;i++){
  const a=i*Math.PI*.4+now*.00018;
  uvBall(Math.cos(a)*1.24,2.1+Math.sin(a)*.22,-.28,.075,.075,.075,[1,.93,.65],tr,5,7);
 }}
 if([12,18,26,27,28,29,30].includes(lv)){for(let i=0;i<6;i++){
  uvBall(Math.sin(i*.7+p.spin)*.22,1.6+i*.095,-1.95-i*.24,.10,.10,.10,accent,tr,5,7);
 }}
 if([20,23,28,29,30].includes(lv)){for(let i=0;i<5;i++){
  const a=i*Math.PI*.4;
  uvBall(Math.cos(a)*.32,2.85+Math.sin(a)*.12,1.03,.10,.10,.10,[1,.94,.52],tr,5,9);
 }}
 pigDeluxe(tr,lv,now,accent,skin);cutePigDetail(tr,lv,now,skin);pigAccessories(tr,lv,now,accent,skin);
}
function carrotModel(item,now){const y=item.y+Math.sin(now*.002+item.phase)*.55;const x=Math.sin(item.phase)*1.3;
cone(x,y-.4,item.z,.46,1.13,[1,.45,.14],9);
cone(x,y+.29,item.z,.25,.52,[.22,.75,.37],7);
}
let cam=[-6,8,-17],look=[0,1,14];
function render(now){resize();gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);drawSky(now,courseSkyTheme());gl.useProgram(prog);
const target=[p.x||0,p.y+1.5,p.z+15], desired=[(p.x||0)-6.5,p.y+7.0,p.z-16];
const follow=p.phase==='air'?.08:.055;
for(let i=0;i<3;i++){cam[i]+=(desired[i]-cam[i])*follow;look[i]+=(target[i]-look[i])*follow;}
gl.uniformMatrix4fv(uVP,false,new Float32Array(camera(cam,look,canvas.width/canvas.height)));
gl.uniform3fv(uCamera,new Float32Array(cam));gl.uniform1f(uTime,now*.001);gl.uniform1f(uStudio,0);gl.uniform1f(uTheme,0);gl.uniform1f(uAlpha,1);
draw(staticBuffer,null,staticData.length/9);
verts=[];
for(const b of p.bonuses||[]){if(!b.taken&&!b.missed&&b.z>p.z-15&&b.z<p.z+185)flightBonusModel(b,now);}
for(const item of p.items){if(!item.taken&&!item.missed&&item.z>p.z-15&&item.z<p.z+110)carrotModel(item,now);}
renderWorldEffects(now);funDraw(now);drawLoveRoutes(now);loveShardsDraw(now);renderLoverPig(now);pigModel(p.x||0,p.y,p.z,now);pigSparkleVfx(now);
const mesh=new Float32Array(verts);draw(dynamicBuffer,mesh,mesh.length/9);
}
function loop(now){if(!p.last)p.last=now;let dt=clamp((now-p.last)/16.6667,.05,2.2);p.last=now;if(p.phase==='ready'||p.phase==='menu')p.spin+=dt*.035;if(p.phase==='run'||p.phase==='air')update(dt);render(now);requestAnimationFrame(loop)}
requestAnimationFrame(loop);
})();