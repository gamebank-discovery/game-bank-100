#!/usr/bin/env python3
"""Optional arcade layer for the 5-world PIG LOVE flight game.
Only modifies the restored, course-patched static assets at build time.
Existing memories, partner, evolution and save key remain unchanged.
"""
from pathlib import Path
import sys

FUN_MODULE = r"""
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
"""

def replace_one(text, old, new, label):
    count=text.count(old)
    if count!=1:
        raise RuntimeError(f"Arcade patch mismatch {label}: {count} matches")
    return text.replace(old,new,1)

def patch_fun(folder:Path)->None:
    path=Path(folder)/"pig.js"
    js=path.read_text(encoding="utf-8")
    if "__PIG_ARCADE_FUN_V1__" in js:return
    if "__PIG_COURSE_GOAL_V3__" not in js or "function memoryFlightCleared(distance)" not in js:
        raise RuntimeError("Expected tested course+love base. Stop before unsafe changes.")
    js=replace_one(js,"function begin(){",FUN_MODULE+"\nfunction begin(){","install fun module")
    js=replace_one(js,"courseBegin();}","courseBegin();funBegin();}","run init")
    js=replace_one(js,"function land(){const ch=","function land(){funLand();const ch=","record fun on land")
    js=replace_one(js,"el('modal').classList.remove('hidden');memoryFlightCleared(p.score);",
                       "el('modal').classList.remove('hidden');funResults();memoryFlightCleared(p.score);","results")
    js=replace_one(js,"courseTick(distance);if(distance>=COURSE_MAX)",
                       "courseTick(distance);funTick(distance,dt);if(distance>=COURSE_MAX)","event tick")
    js=replace_one(js,"if((p.y<=0&&p.z>155)||p.z>LIMIT){land();}",
                       "if((p.y<=0&&p.z>155)||p.z>LIMIT){if(!funRescue())land();}","graceful rescue")
    js=replace_one(js,"b.taken=true;const pts=", "b.taken=true;funCollect(b);const pts=","bonus combo")
    js=replace_one(js,"renderWorldEffects(now);drawLoveRoutes(now);",
                       "renderWorldEffects(now);funDraw(now);drawLoveRoutes(now);","animated portals")
    js=replace_one(js,"else if(p.phase==='air'&&!p.boosted){p.boosted=true;p.vy+=.33+saved.level*.013;p.speed+=.14;sfx('boost');toast('🐖 PIG BOOST! ✨');el('action').textContent='🐽 空を飛んでる！';}",
                       "else if(p.phase==='air'){funBoostTap();}","tap boost timing")
    js=replace_one(js,"el('play').textContent='🐖 もう一度、世界一周！';",
                       "el('play').textContent='🐖 もう一度、世界一周！';funFinale();","true ending")
    path.write_text(js,encoding="utf-8")
    print("Added arcade hazards, route choices, fever, timed boosts and revive.")

if __name__=="__main__":
    patch_fun(Path(sys.argv[1]))
