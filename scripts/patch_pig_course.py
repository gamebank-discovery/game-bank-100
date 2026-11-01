#!/usr/bin/env python3
"""Add five themed flight worlds and a 1000 m finish to the restored PIG LOVE game.
Runs on local source at Cloudflare build time; no network, credentials or dependencies.
"""
from pathlib import Path
import sys

MODULE = r"""
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
 el('play').textContent='🐖 もう一度、世界一周！';
 const confetti=el('courseConfetti');if(confetti){confetti.style.display='block';setTimeout(()=>{confetti.style.display='none';},4500);}
 sfx('evolve');
}
courseInstall();
"""
GATES = r"""
/* __PIG_COURSE_SCENE_V3__ */
for(let k=1;k<=5;k++){
 const z=110+k*200,colors=[[.97,.72,.81],[.96,.63,.86],[.36,.87,1.],[1.,.44,.24],[1.,.83,.33]],c=colors[k-1];
 for(const side of [-1,1])box(side*7.6,22,z,.5,44,.65,c);
 box(0,44,z,8,.75,.65,c);
 if(k===5){box(0,48,z,9,1,.7,[1.,.79,.2]);for(let j=0;j<7;j++)cone((j-3)*1.4,49,z,.5,1.6,[1.,.95,.52],6);}
}
for(let k=0;k<5;k++)for(let j=0;j<12;j++){
 const z=156+k*200+j*15,x=(j%2?1:-1)*(19+(j%3)*4),y=terrainH(x,z);
 if(k===0)cone(x,y,z,2.6,5,[1.,.63,.78],9);
 if(k===1){box(x,y+2,z,.65,4,.65,[1.,.85,.97]);cone(x,y+4,z,2.1,2.5,[1.,.58,.89],9);}
 if(k===2){cone(x,y,z,3,4,[.25,.80,.70],9);box(x,y+.8,z,.25,1.6,.25,[.64,.44,.26]);}
 if(k===3){cone(x,y,z,3.2,6,[.43,.24,.30],9);cone(x,y+5,z,1.4,2,[1.,.45,.17],8);}
 if(k===4)cone(x,y,z,2.2,5,[.62,.64,1.],7);
}
"""

def rep(s,a,b,desc):
    if s.count(a)!=1:
        raise RuntimeError(f"Cannot apply {desc}: match count {s.count(a)}")
    return s.replace(a,b,1)

def patch_course(folder: Path) -> None:
    folder=Path(folder)
    pig=folder/"pig.js"
    engine=folder/"engine.js"
    s=pig.read_text(encoding="utf-8")
    e=engine.read_text(encoding="utf-8")
    if "__PIG_COURSE_GOAL_V3__" in s and "__PIG_COURSE_SCENE_V3__" in e:
        return
    if "__PIG_WORLD_ALL15__" not in s or "function memoryFlightCleared(distance)" not in s:
        raise RuntimeError("PIG LOVE source markers missing: refusing incompatible patch")
    s=rep(s,"function begin(){",MODULE+"\nfunction begin(){","course module")
    s=rep(s,"el('fill').style.width='0%';}","el('fill').style.width='0%';courseBegin();}","begin")
    s=rep(s,"function land(){","function land(){const ch=el('courseHud');if(ch)ch.style.display='none';","land")
    s=rep(s,"p.score=distance;el('distance').innerHTML=distance+'<small>METERS</small>';","p.score=distance;el('distance').innerHTML=distance+'<small>METERS</small>';courseTick(distance);if(distance>=COURSE_MAX){courseFinish();return;}","finish")
    s=rep(s,"drawSky(now,0);","drawSky(now,courseSkyTheme());","sky")
    e=rep(e,"const c0=[.43,.67,.46],c1=[.53,.61,.65];",
      "const zone=Math.min(4,Math.max(0,Math.floor((z-110)/200)));const palette=[[[.43,.67,.46],[.53,.61,.65]],[[.91,.59,.74],[.74,.59,.82]],[[.38,.78,.82],[.46,.70,.91]],[[.59,.30,.26],[.72,.44,.23]],[[.35,.39,.72],[.29,.25,.52]]][zone];const c0=palette[0],c1=palette[1];","landscape")
    e=rep(e,"if(skyTheme>1.5)c=mix(vec3(.84,.91,.95),vec3(.36,.57,.76),uv.y);",
      "if(skyTheme>1.5&&skyTheme<2.5)c=mix(vec3(.84,.91,.95),vec3(.36,.57,.76),uv.y);if(skyTheme>2.5&&skyTheme<3.5)c=mix(vec3(1.,.82,.91),vec3(.68,.48,.87),uv.y);if(skyTheme>3.5&&skyTheme<4.5)c=mix(vec3(.66,1.,.96),vec3(.20,.47,.83),uv.y);if(skyTheme>4.5)c=mix(vec3(.25,.18,.48),vec3(.04,.06,.23),uv.y);","sky palettes")
    e=rep(e,"const staticData=new Float32Array(verts)",GATES+"\nconst staticData=new Float32Array(verts)","world gates")
    pig.write_text(s,encoding="utf-8")
    engine.write_text(e,encoding="utf-8")
    print("Applied PIG 5 worlds + 1000m goal to",folder)

if __name__=="__main__":
    patch_course(Path(sys.argv[1]))
