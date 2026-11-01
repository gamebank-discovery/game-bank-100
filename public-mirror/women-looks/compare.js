(function(){
'use strict';
var panel=document.querySelector('#panel-saved'),grid=document.querySelector('#savedCards'),match=document.querySelector('#matchArea');if(!panel||!grid)return;
var selected=[];
var style=document.createElement('style');style.textContent='.compare-tools{margin:17px 0;padding:17px;background:#f7eee6;border:1px solid #dfcbbd;border-radius:11px}.compare-tools h3{font:normal 22px Georgia;margin:4px 0 9px}.compare-tools p{font-size:12px;color:#74685f;margin:7px 0}.compare-btn{border:1px solid #c4ada0;background:#fffaf6;color:#5b4439;border-radius:6px;padding:8px 10px;font-size:11px;margin:3px 0;cursor:pointer}.compare-btn.selected{background:#372923;color:#fff}.comparison{overflow-x:auto;margin-top:12px}.compare-table{width:100%;border-spacing:10px;border-collapse:separate;min-width:400px}.compare-table td{vertical-align:top;background:#fffdf9;border:1px solid #e6d9ce;border-radius:8px;padding:12px;min-width:150px}.compare-table img{width:100%;height:140px;object-fit:cover;border-radius:7px;background:#e9e0d8}.compare-table h4{font:normal 17px Georgia;margin:9px 0}.compare-table small{font-size:10px;color:#73655b}';document.head.appendChild(style);
var box=document.createElement('div');box.className='compare-tools';box.innerHTML='<h3>コーデを横並びで比較</h3><p>保存したコーデから2〜3件を選択して、色味・予算・雰囲気を比較しよう。</p><div class="comparison" id="compareResult">保存したカードの「比較に追加」を押してね。</div>';panel.insertBefore(box,grid);
function numberOf(card){var b=card.querySelector('[data-save]');return b?Number(b.dataset.save):0}
function savedCard(id){return Array.from(grid.querySelectorAll('.look')).find(function(el){return numberOf(el)===id})}
function refresh(){
selected=selected.filter(function(id){return !!savedCard(id)});
grid.querySelectorAll('.look').forEach(function(card){var id=numberOf(card);if(!id)return;var existing=card.querySelector('.compare-btn');if(!existing){existing=document.createElement('button');existing.className='compare-btn';existing.type='button';existing.dataset.compare=String(id);card.querySelector('.look-content').appendChild(existing)}existing.classList.toggle('selected',selected.includes(id));existing.textContent=selected.includes(id)?'✓ 比較対象':'＋ 比較に追加'});
var result=document.querySelector('#compareResult');if(selected.length<2){result.textContent=selected.length===1?'あと1つ選ぶと比較できます。':'保存したカードの「比較に追加」を2〜3件選んでね。';return}
var cols=selected.map(function(id){var card=savedCard(id);if(!card)return '';var photo=card.querySelector('.photo img'),title=card.querySelector('h3'),price=card.querySelector('.price'),tags=card.querySelector('.tags');return '<td><img alt="" src="'+(photo?photo.src:'')+'"><h4>'+(title?title.textContent:'')+'</h4><div>'+(tags?tags.innerHTML:'')+'</div><small>'+(price?price.textContent:'')+'</small></td>'}).join('');
result.innerHTML='<table class="compare-table"><tr>'+cols+'</tr></table><button class="compare-btn" id="clearCompare">比較をリセット</button>';
}
grid.addEventListener('click',function(e){var b=e.target.closest('[data-compare]');if(!b)return;var id=Number(b.dataset.compare);if(selected.includes(id)){selected=selected.filter(function(x){return x!==id})}else{if(selected.length>=3){alert('比較は最大3件までです。');return}selected.push(id)}refresh()});
box.addEventListener('click',function(e){if(e.target.id==='clearCompare'){selected=[];refresh()}});
new MutationObserver(function(){refresh()}).observe(grid,{childList:true});
var startX=0,startY=0;
match.addEventListener('touchstart',function(e){if(e.changedTouches.length!==1)return;startX=e.changedTouches[0].clientX;startY=e.changedTouches[0].clientY},{passive:true});
match.addEventListener('touchend',function(e){if(e.changedTouches.length!==1)return;var dx=e.changedTouches[0].clientX-startX,dy=e.changedTouches[0].clientY-startY;if(Math.abs(dx)>80&&Math.abs(dx)>Math.abs(dy)*1.3){var target=match.querySelector('[data-match="'+(dx>0?'yes':'no')+'"]');if(target)target.click()}},{passive:true});
refresh();
})();