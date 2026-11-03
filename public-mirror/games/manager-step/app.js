/* DISCOVERY | 昇進試験ラボ v2.0 — 係長・課長で完全に異なる問題バンク */
(function () {
  "use strict";
  var ROLES = {
    leader: { name: "係長", subtitle: "現場を動かし、チームを育てる", pass: 70, mock: 24, minutes: 30, tone: "blue" },
    manager: { name: "課長", subtitle: "組織と利益に責任を持つ", pass: 75, mock: 30, minutes: 45, tone: "teal" }
  };
  var POOLS = {
    leader: Array.isArray(window.LEADER_QUESTIONS) ? window.LEADER_QUESTIONS : [],
    manager: Array.isArray(window.MANAGER_QUESTIONS) ? window.MANAGER_QUESTIONS : []
  };
  var KEY = "discovery_promotion_exam_v2";
  var app = document.getElementById("app");
  var nav = document.getElementById("nav");
  var toast = document.getElementById("toast");
  var params = new URLSearchParams(location.search);
  var role = params.get("role") === "leader" ? "leader" : "manager";
  var page = "home", session = null, timerId = null;
  var stored = loadStored();
  if (!app) return;

  function loadStored() {
    try {
      var v = JSON.parse(localStorage.getItem(KEY) || "{}");
      return v && typeof v === "object" ? v : {};
    } catch (e) { return {}; }
  }
  function saveStored() {
    try { localStorage.setItem(KEY, JSON.stringify(stored)); } catch (e) { showToast("端末に学習履歴を保存できません"); }
  }
  function data() {
    if (!stored[role] || !Array.isArray(stored[role].history)) stored[role] = { history: [], exams: [] };
    if (!Array.isArray(stored[role].exams)) stored[role].exams = [];
    return stored[role];
  }
  function escapeHTML(v) {
    return String(v == null ? "" : v).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function shuffle(items, random) {
    var a = items.slice(), rnd = random || Math.random;
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(rnd() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  function seeded(seed) {
    var h = 2166136261;
    for (var i = 0; i < seed.length; i++) {
      h ^= seed.charCodeAt(i); h = Math.imul(h, 16777619);
    }
    return function () {
      h += 0x6d2b79f5;
      var t = h; t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function showToast(s) {
    if (!toast) return;
    toast.textContent = s;
    toast.classList.add("show");
    clearTimeout(showToast.timeout);
    showToast.timeout = setTimeout(function(){ toast.classList.remove("show"); }, 2300);
  }
  function stopTimer() { if (timerId !== null) { clearInterval(timerId); timerId = null; } }
  function todayKey() {
    var d = new Date(), y = d.getFullYear(), m = String(d.getMonth()+1).padStart(2,"0"), day = String(d.getDate()).padStart(2,"0");
    return y + "-" + m + "-" + day;
  }
  function prettyDate(iso) {
    try { return new Date(iso).toLocaleDateString("ja-JP", {year:"numeric",month:"short",day:"numeric"}); }
    catch(e) { return ""; }
  }
  function cats() {
    return Array.from(new Set(POOLS[role].map(function(q){ return q.category; })));
  }
  function counts() {
    var h = data().history;
    return { total: h.length, right: h.filter(function(x){return x.correct;}).length, exams: data().exams.length };
  }
  function head(title, sub) {
    return '<div class="section-header"><div class="eyebrow">DISCOVERY PROMOTION LAB · ' +
      escapeHTML(ROLES[role].name) + '</div><h1>' + escapeHTML(title) + '</h1>' +
      '<p>' + escapeHTML(sub || "") + '</p></div>';
  }
  function roleTabs() {
    return '<div class="role-tabs" aria-label="受験コース">' +
      '<button type="button" data-role="leader" class="' + (role === "leader" ? "active" : "") + '"><span>TEAM LEADER</span><b>係長昇進試験</b></button>' +
      '<button type="button" data-role="manager" class="' + (role === "manager" ? "active" : "") + '"><span>MANAGER</span><b>課長昇進試験</b></button>' +
      '</div>';
  }
  function commonHeader() {
    var r = ROLES[role];
    return '<div class="topline"><span class="logo-dot"></span> DISCOVERY CAREER ACADEMY <span class="edition">2026 ADVANCED</span></div>' +
      roleTabs() +
      '<div class="identity"><span class="identity-kicker">' + escapeHTML(r.name) + '昇進 / 専用カリキュラム</span><strong>' + escapeHTML(r.subtitle) + '</strong>' +
      '<span>' + POOLS[role].length + '問を収録 · 全問4択・根拠と誤答の落とし穴を解説</span></div>';
  }
  function switchRole(next) {
    if (!ROLES[next] || next === role) return;
    if (session && !session.finished && !confirm("受験中の問題を終了し、コースを切り替えますか？")) return;
    stopTimer(); session = null; role = next; page = "home";
    try { history.replaceState(null, "", location.pathname + "?role=" + role); } catch(e) {}
    render();
  }
  function checkBank() {
    var a = POOLS[role], seen = {};
    if (!a.length) return "問題データが読み込めませんでした。再読み込みしてください。";
    for (var i = 0; i < a.length; i++) {
      var q = a[i];
      if (!q.id || !q.question || !Array.isArray(q.choices) || q.choices.length !== 4 || q.choices.indexOf(q.answer) < 0 || seen[q.id])
        return "問題データの整合性エラー: " + (q.id || i);
      seen[q.id] = true;
    }
    return "";
  }
  function go(next) {
    if (session && !session.finished) {
      if (!confirm("受験中です。終了すると今回の未採点回答は保存されません。移動しますか？")) return;
      stopTimer(); session = null;
    }
    page = next;
    render();
  }
  function home() {
    var r = ROLES[role], c = counts(), pct = c.total ? Math.round(c.right / c.total * 100) : 0;
    return head(r.name + "昇進試験", "暗記だけでは通用しない。状況判断・数値・人材育成の実践問題に挑戦。") +
      '<div class="hero"><div class="hero-copy"><span class="hero-brow">LEARN · ANALYZE · LEAD</span><h2>その判断に、<em>根拠</em>はあるか。</h2><p>現場の実行力を問う係長試験と、経営・組織の意思決定を問う課長試験。問題は役職別に完全分離しています。</p>' +
      '<button data-action="daily" class="btn primary">今日の10問をはじめる <span>↗</span></button></div>' +
      '<div class="hero-metrics"><div><b>' + POOLS[role].length + '</b><small>専用問題</small></div><div><b>' + r.minutes + '<small>分</small></b><small>模擬試験</small></div><div><b>' + r.pass + '%</b><small>練習用目標</small></div></div></div>' +
      '<div class="stats-strip"><div><b>' + c.total + '</b><span>累計回答</span></div><div><b>' + (c.total ? pct + '%' : '—') + '</b><span>累計正答率</span></div><div><b>' + c.exams + '</b><span>完了セッション</span></div></div>' +
      '<div class="grid two"><article class="feature"><span class="feature-number">01 / PRACTICE</span><h3>苦手をなくす</h3><p>毎日の10問、分野別演習、間違い問題の再挑戦。誤答の理由まで理解する。</p><div class="actions"><button data-action="daily" class="btn">今日の10問</button><button data-action="hard" class="btn quiet">難問特訓</button></div></article>' +
      '<article class="feature highlight"><span class="feature-number">02 / EXAM SIMULATION</span><h3>本番形式で試す</h3><p>' + r.mock + '問・' + r.minutes + '分の模擬試験。試験中は正解を非表示。終了後に分野別分析。</p><button data-action="mock" class="btn primary">模擬試験に挑戦 →</button></article></div>' +
      '<section class="panel"><div class="panel-heading"><div><span class="eyebrow">SUBJECTS</span><h3>分野別トレーニング</h3></div><span class="small-note">各分野10問をランダム出題</span></div><div class="subject-grid">' +
      cats().map(function(ca, i) {return '<button class="subject" data-subject="' + escapeHTML(ca) + '"><span>0' + (i+1) + '</span><b>' + escapeHTML(ca) + '</b><small>' + POOLS[role].filter(function(q){return q.category === ca;}).length + '問収録 ↗</small></button>';}).join('') +
      '</div></section>' +
      '<p class="disclaimer">※ 企業ごとの正式な昇進試験・合格基準とは異なる一般対策教材です。難易度と目標正答率は教材独自の設定です。</p>';
  }
  function subjects() {
    return head("分野別演習", "係長・課長それぞれの役割に適した専門分野だけを収録。") +
      '<div class="subject-grid roomy">' + cats().map(function(ca, i) {
        var len = POOLS[role].filter(function(q){return q.category === ca;}).length;
        return '<button data-subject="' + escapeHTML(ca) + '" class="subject"><span>SECTION ' + String(i+1).padStart(2,"0") + '</span><b>' + escapeHTML(ca) + '</b><small>' + len + '問収録 · 10問演習 →</small></button>';
      }).join('') + '</div>';
  }
  function missedIds() {
    var h = data().history, newest = {};
    for (var i = 0; i < h.length; i++) newest[h[i].id] = h[i];
    return Object.keys(newest).filter(function(k){return !newest[k].correct;});
  }
  function review() {
    var ids = missedIds();
    return head("間違い復習", "最後に間違えた問題をもう一度。正解すると復習対象から外れます。") +
      '<div class="panel"><h3>復習対象：' + ids.length + '問</h3><p class="muted">各コースの履歴は別々に管理されます。解き直し結果で更新されます。</p>' +
      (ids.length ? '<button data-action="review-start" class="btn primary">間違いから最大10問を解く →</button>' : '<div class="empty">現在、復習対象はありません。まず演習を始めよう。</div>') +
      '</div><div class="actions"><button data-action="daily" class="btn">今日の10問へ</button></div>';
  }
  function stats() {
    var h = data().history, c = counts(), pct = c.total ? Math.round(c.right/c.total*100) : 0;
    var list = cats().map(function(ca){
      var rows=h.filter(function(x){return x.category===ca;});
      var correct=rows.filter(function(x){return x.correct;}).length;
      return {name:ca,total:rows.length,pct:rows.length?Math.round(correct/rows.length*100):0};
    }).sort(function(a,b){return (a.total? a.pct:101)-(b.total?b.pct:101);});
    var last = data().exams.slice(-6).reverse();
    return head("学習記録", "どこが強みで、どこが課題なのか。回答履歴から可視化。") +
      '<div class="stats-strip large"><div><b>' + c.total + '</b><span>回答総数</span></div><div><b>' + (c.total ? pct + '%' : '—') + '</b><span>正答率</span></div><div><b>' + missedIds().length + '</b><span>復習対象</span></div></div>' +
      '<section class="panel"><div class="panel-heading"><h3>分野別正答率</h3><span class="small-note">回答済み問題の実績</span></div>' +
      list.map(function(x){return '<div class="bar-row"><div class="bar-label"><b>' + escapeHTML(x.name) + '</b><span>' + (x.total ? x.pct + '% / '+x.total+'回答' : '未回答') + '</span></div><div class="bar-bg"><span style="width:' + x.pct + '%"></span></div></div>';}).join('') + '</section>' +
      '<section class="panel"><div class="panel-heading"><h3>最近のセッション</h3></div>' +
      (last.length ? last.map(function(x){return '<div class="history-row"><span>' + escapeHTML(prettyDate(x.date)) + ' · ' + escapeHTML(x.label) + '</span><b>' + x.score + '%</b></div>';}).join('') : '<div class="empty">まだ受験履歴がありません。</div>') + '</section>' +
      '<div class="actions"><button data-action="export" class="btn">このコースの記録をJSON保存</button><button data-action="reset" class="btn danger">このコースの記録を初期化</button></div>';
  }
  function pick(mode, subject) {
    var all = POOLS[role].slice(), pool = all;
    if (mode === "subject") pool = all.filter(function(q){return q.category===subject;});
    if (mode === "hard") pool = all.filter(function(q){return q.difficulty>=5;});
    if (mode === "review") {
      var ids = missedIds();
      pool = all.filter(function(q){return ids.indexOf(q.id)>=0;});
    }
    var limit = mode === "mock" ? ROLES[role].mock : 10;
    if (mode === "daily") {
      // Stable daily selection in each role, with an equal chance for each authored question.
      return shuffle(pool,seeded(todayKey()+role+"daily")).slice(0,limit);
    }
    if (mode === "mock") {
      // Across-domain blueprint: round-robin questions from each subject before repeating.
      var sections = cats().map(function(ca){return shuffle(all.filter(function(q){return q.category===ca;}));});
      var selected = [];
      while (selected.length < limit && sections.some(function(g){return g.length>0;})) {
        sections.forEach(function(g){if(g.length && selected.length<limit)selected.push(g.pop());});
      }
      return shuffle(selected);
    }
    return shuffle(pool).slice(0,limit);
  }
  function begin(mode, subject) {
    var error = checkBank();
    if (error) { showToast(error); return; }
    var picked=pick(mode,subject);
    if (!picked.length) { showToast("この条件の問題はありません"); return; }
    var label = mode==="mock"?"模擬試験":mode==="daily"?"今日の10問":mode==="hard"?"難問特訓":mode==="review"?"間違い復習":subject;
    var duration=mode==="mock"?ROLES[role].minutes:null;
    stopTimer();
    session={ mode:mode, label:label, questions:picked.map(function(q){
      return {ref:q, options:shuffle(q.choices)};
    }), answers:{}, index:0, duration:duration, deadline:duration?Date.now()+duration*60000:null, finished:false };
    page="exam";
    render();
    if(duration) timerId=setInterval(tick,1000);
  }
  function tick() {
    if(!session || !session.deadline){stopTimer();return;}
    var sec=Math.max(0,Math.ceil((session.deadline-Date.now())/1000));
    var label=document.getElementById("countdown");
    if(label) label.textContent=String(Math.floor(sec/60)).padStart(2,"0")+":"+String(sec%60).padStart(2,"0");
    if(sec<=0) finish(true);
  }
  function exam() {
    if (!session) return home();
    var s=session, i=s.index, pair=s.questions[i], q=pair.ref;
    var chosen=s.answers[q.id], locked=!!chosen, mock=s.mode==="mock";
    var remaining=s.deadline?Math.max(0,Math.ceil((s.deadline-Date.now())/1000)):0;
    var label=s.deadline?'<div class="timer">残り <b id="countdown">'+String(Math.floor(remaining/60)).padStart(2,"0")+":"+String(remaining%60).padStart(2,"0")+'</b></div>':'<div class="timer">解説付き演習</div>';
    return '<div class="exam-header"><button data-action="quit" class="back-button">← 終了</button><div>' +
      '<span class="eyebrow">'+escapeHTML(ROLES[role].name+' / '+s.label)+'</span></div>'+label+'</div>' +
      '<div class="progress"><span style="width:'+Math.round((i+1)/s.questions.length*100)+'%"></span></div>' +
      '<div class="question-meta"><span>QUESTION '+(i+1)+' / '+s.questions.length+'</span><span>'+escapeHTML(q.category)+' · 難度 '+q.difficulty+'/5</span></div>' +
      '<article class="question-card"><h2>'+escapeHTML(q.question)+'</h2><p class="choose-note">'+(mock?'最も適切な選択肢を1つ選びます。解説は試験終了後に表示。':'最も適切な選択肢を1つ選び、理由まで確認します。')+'</p>' +
      '<div class="option-list">'+pair.options.map(function(text,j){
        var result=(!mock&&locked)?(text===q.answer?'good':chosen.choice===text?'bad':''):"";
        return '<button type="button" class="option '+(locked&&chosen.choice===text?'selected ':'')+result+'" data-answer="'+j+'" '+(locked?'disabled':'')+'><span class="option-letter">'+String.fromCharCode(65+j)+'</span><span>'+escapeHTML(text)+'</span>'+(locked&&chosen.choice===text?'<b>✓</b>':'')+'</button>';
      }).join('')+'</div>' +
      (locked&&!mock?'<div class="feedback '+(chosen.correct?'correct':'incorrect')+'"><strong>'+(chosen.correct?'正解！':'惜しい。正解を確認しよう。')+'</strong><p>'+escapeHTML(q.explanation)+'</p><div class="pitfall">考え方のポイント：'+escapeHTML(q.pitfall)+'</div></div>':'') +
      '<div class="exam-footer"><button data-action="next" class="btn primary">'+(locked?(i===s.questions.length-1?'結果を見る →':'次の問題 →'):(mock?'この問題をスキップ →':'解答を選択してください'))+'</button></div></article>';
  }
  function answer(index) {
    if (!session) return;
    var s=session, pair=s.questions[s.index], q=pair.ref;
    if (s.answers[q.id] || index<0 || index>=4) return;
    var choice=pair.options[index];
    s.answers[q.id]={id:q.id,category:q.category,choice:choice,correct:choice===q.answer,at:new Date().toISOString()};
    render();
  }
  function next() {
    if (!session) return;
    var s=session, q=s.questions[s.index].ref;
    if (!s.answers[q.id]) {
      if (s.mode!=="mock") {showToast("まず選択肢を選んでください");return;}
      s.answers[q.id]={id:q.id,category:q.category,choice:null,correct:false,at:new Date().toISOString()};
    }
    if(s.index>=s.questions.length-1){finish(false);return;}
    s.index++;
    render();
  }
  function finish(expired) {
    if(!session || session.finished) return;
    stopTimer();
    var s=session;
    s.finished=true;
    var history=data().history, correct=0;
    s.questions.forEach(function(pair){
      var q=pair.ref, a=s.answers[q.id] || {id:q.id,category:q.category,choice:null,correct:false,at:new Date().toISOString()};
      if(a.correct) correct++;
      history.push(a);
    });
    if(history.length>3000)history.splice(0,history.length-3000);
    var score=Math.round(correct/s.questions.length*100);
    data().exams.push({date:new Date().toISOString(),mode:s.mode,label:s.label,score:score,correct:correct,count:s.questions.length,expired:!!expired});
    if(data().exams.length>200)data().exams.splice(0,data().exams.length-200);
    saveStored();
    page="result"; render();
  }
  function result() {
    if(!session) return home();
    var s=session, answers=s.answers, correct=s.questions.filter(function(x){return answers[x.ref.id] && answers[x.ref.id].correct;}).length;
    var score=Math.round(correct/s.questions.length*100), goal=ROLES[role].pass;
    var bad=s.questions.filter(function(x){return !answers[x.ref.id]||!answers[x.ref.id].correct;});
    var distributions=cats().map(function(ca){
      var qs=s.questions.filter(function(x){return x.ref.category===ca;});
      if(!qs.length)return null;
      var hit=qs.filter(function(x){return answers[x.ref.id]&&answers[x.ref.id].correct;}).length;
      return {name:ca,hit:hit,count:qs.length};
    }).filter(Boolean);
    return head("採点結果", s.label+" · "+escapeHTML(ROLES[role].name)+"専用の学習レポート") +
      '<div class="result-hero"><div><span class="eyebrow">YOUR RESULT</span><strong class="result-score">'+score+'<small>%</small></strong><p>'+correct+' / '+s.questions.length+'問正解</p></div><div class="result-comment"><h2>'+(score>=goal?'目標達成！':'伸びしろが見えた。')+'</h2><p>練習用目標：'+goal+'％。'+(s.mode==="mock"?'模擬試験の採点結果です。':'理解できなかった点を復習しましょう。')+'</p><p>※ 公式試験の合否を予測・保証するものではありません。</p></div></div>' +
      '<section class="panel"><h3>分野別の正答状況</h3>'+distributions.map(function(x){
        var p=Math.round(x.hit/x.count*100);return '<div class="bar-row"><div class="bar-label"><b>'+escapeHTML(x.name)+'</b><span>'+x.hit+'/'+x.count+'問</span></div><div class="bar-bg"><span style="width:'+p+'%"></span></div></div>';
      }).join('')+'</section>' +
      '<section class="panel"><h3>間違えた問題・解説（'+bad.length+'件）</h3>'+
      (bad.length?bad.map(function(pair,i){
        var q=pair.ref, a=answers[q.id];
        return '<details class="review-detail" '+(i===0?'open':'')+'><summary>'+escapeHTML(q.category)+' / '+escapeHTML(q.question)+'</summary><div class="detail-body"><p><b>あなたの回答：</b>'+escapeHTML(a&&a.choice?a.choice:"未回答")+'</p><p><b>正解：</b>'+escapeHTML(q.answer)+'</p><p>'+escapeHTML(q.explanation)+'</p><p class="pitfall">'+escapeHTML(q.pitfall)+'</p></div></details>';
      }).join(''):'<div class="empty">全問正解！次は別の問題で実力を確認しよう。</div>')+'</section>' +
      '<div class="actions"><button data-action="review-page" class="btn">間違いを復習</button><button data-action="daily" class="btn primary">次の演習へ →</button><button data-action="home" class="btn quiet">ホーム</button></div>';
  }
  function resources() {
    return '<div class="resources"><b>参考資料・学習上の注意</b><p>労務分野の一般原則は厚生労働省の資料と照合しています。業種の特例、改正法、就業規則、社内試験の基準は別途確認してください。</p>' +
      '<a href="https://hatarakikatakaikaku.mhlw.go.jp/overtime.html" target="_blank" rel="noopener noreferrer">時間外労働の上限規制 ↗</a>' +
      '<a href="https://hatarakikatakaikaku.mhlw.go.jp/salaried.html" target="_blank" rel="noopener noreferrer">年次有給休暇の時季指定 ↗</a></div>';
  }
  function render() {
    var error=checkBank();
    app.innerHTML=commonHeader() + (error?'<div class="error">'+escapeHTML(error)+'</div>':
      page==="home"?home():page==="subjects"?subjects():page==="review"?review():
      page==="stats"?stats():page==="exam"?exam():page==="result"?result():home())+
      (page==="home"||page==="stats"?resources():'');
    if (nav) {
      nav.querySelectorAll("[data-page]").forEach(function(b){
        b.classList.toggle("active",b.getAttribute("data-page")===page);
        b.setAttribute("aria-current",b.getAttribute("data-page")===page?"page":"false");
      });
    }
    document.title=ROLES[role].name+"昇進試験｜DISCOVERY PROMOTION LAB";
    tickLabelOnly();
  }
  function tickLabelOnly() {
    if(session&&session.deadline) {
      var elem=document.getElementById("countdown");
      if(elem){var n=Math.max(0,Math.ceil((session.deadline-Date.now())/1000));elem.textContent=String(Math.floor(n/60)).padStart(2,"0")+":"+String(n%60).padStart(2,"0");}
    }
  }
  function exportData() {
    var json=JSON.stringify({role:role,exported:new Date().toISOString(),data:data()},null,2);
    try {
      var blob=new Blob([json],{type:"application/json"});
      var url=URL.createObjectURL(blob),a=document.createElement("a");
      a.href=url;a.download="promotion-"+role+"-"+todayKey()+".json";a.click();
      setTimeout(function(){URL.revokeObjectURL(url);},1000);
    }catch(e){showToast("書き出せませんでした");}
  }
  app.addEventListener("click",function(e){
    var b=e.target.closest("button");
    if(!b)return;
    if(b.hasAttribute("data-role")){switchRole(b.getAttribute("data-role"));return;}
    if(b.hasAttribute("data-subject")){begin("subject",b.getAttribute("data-subject"));return;}
    if(b.hasAttribute("data-answer")){answer(Number(b.getAttribute("data-answer")));return;}
    var action=b.getAttribute("data-action");
    if(action==="daily"||action==="mock"||action==="hard")begin(action);
    else if(action==="review-start")begin("review");
    else if(action==="next")next();
    else if(action==="quit")go("home");
    else if(action==="home"||action==="review-page")go(action==="home"?"home":"review");
    else if(action==="export")exportData();
    else if(action==="reset"){
      if(confirm(ROLES[role].name+"コースの学習履歴だけを削除しますか？")){stored[role]={history:[],exams:[]};saveStored();render();}
    }
  });
  if(nav)nav.addEventListener("click",function(e){
    var b=e.target.closest("[data-page]");if(b)go(b.getAttribute("data-page"));
  });
  var brand=document.querySelector(".brand");
  if(brand)brand.addEventListener("click",function(e){e.preventDefault();go("home");});
  render();
})();
