#!/usr/bin/env python3
"""Add replayable memory puzzle + reactive partner rescue to PIG LOVE.
Applies after restore_pig_love, patch_course and patch_fun. No secret or network.
"""
from pathlib import Path
import sys

MODULE=r'''
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
'''

def replace_once(s,a,b,label):
    n=s.count(a)
    if n!=1:raise RuntimeError(f'Arcade v5 incompatible {label}, found {n}')
    return s.replace(a,b,1)

def patch_memory_arcade(folder:Path)->None:
    file=Path(folder)/'pig.js'
    s=file.read_text(encoding='utf8')
    if '__PIG_MEMORY_ARCADE_V5__' in s:return
    if '__PIG_ARCADE_FUN_V1__' not in s or '__PIG_COURSE_GOAL_V3__' not in s:
        raise RuntimeError('Missing required arcade+course layers')
    s=replace_once(s,'function status(){',MODULE+'\nfunction status(){','insert memory arcade module')
    s=replace_once(s,'buildMemoryChoices(index);if(copy){','buildMemoryChoices(index);buildMemoryPuzzle(index);if(copy){','puzzle at letter reveal')
    s=replace_once(s,'function renderMemoryMenu(){','function renderMemoryMenu(){memoryArcadeMenu();','puzzle menu update')
    s=replace_once(s,'courseBegin();funBegin();}','courseBegin();funBegin();memoryArcadeBegin();}','flight init')
    s=replace_once(s,'function land(){funLand();','function land(){memoryArcadeLand();funLand();','save heart-links')
    s=replace_once(s,'funTick(distance,dt);if(distance>=COURSE_MAX)','funTick(distance,dt);memoryArcadeTick(distance);if(distance>=COURSE_MAX)','heart-link game loop')
    file.write_text(s,encoding='utf8')
    print('Applied PIG memory puzzle + real-time heart-link mechanics')

if __name__=='__main__':
    patch_memory_arcade(Path(sys.argv[1]))

