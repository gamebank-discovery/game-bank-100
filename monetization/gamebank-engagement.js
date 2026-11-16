/* GAME BANK engagement module — no paid ads, tracking SDKs or external requests. */
(() => {
  'use strict';
  const picks = [
    { title: '終電、あと3秒。', description: '長押しして離すだけ。笑える終電チャレンジ', path: '/games/shuden-3sec/index.html', tag: '1分チャレンジ' },
    { title: 'にゃんこ大泥棒', description: '盗みすぎると出口を通れない!?', path: '/games/neko-big-heist/index.html', tag: '欲張り注意' },
    { title: 'PIG IMPOSSIBLE', description: '豚を飛ばして飛距離を競おう', path: '/games/pig-impossible/index.html', tag: '記録に挑戦' }
  ];
  const start = () => {
    if (document.getElementById('gb-discover')) return;
    const catalog = document.getElementById('catalog');
    if (!catalog) return; // Only enhance the catalog; never interrupt gameplay.
    const section = document.createElement('section');
    section.id = 'gb-discover';
    section.className = 'gb-discover';
    section.setAttribute('aria-labelledby', 'gb-discover-title');
    const eyebrow = document.createElement('p');
    eyebrow.className = 'gb-discover-eyebrow';
    eyebrow.textContent = 'START HERE · 迷ったらこの3本';
    const heading = document.createElement('h2');
    heading.id = 'gb-discover-title';
    heading.textContent = 'まずは、これで遊ぼう。';
    const intro = document.createElement('p');
    intro.textContent = '登録なし・無料。気に入ったら友達にも挑戦してもらおう。';
    const grid = document.createElement('div');
    grid.className = 'gb-discover-grid';
    const emit = (kind, path) => {
      // No personal data is sent. Analytics may subscribe to this event after consent/policy review.
      window.dispatchEvent(new CustomEvent('gb:engagement', { detail: { kind, game: path } }));
    };
    picks.forEach((game) => {
      const card = document.createElement('article');
      card.className = 'gb-discover-card';
      const tag = document.createElement('span');
      tag.className = 'gb-discover-tag';
      tag.textContent = game.tag;
      const h3 = document.createElement('h3');
      h3.textContent = game.title;
      const p = document.createElement('p');
      p.textContent = game.description;
      const actions = document.createElement('div');
      actions.className = 'gb-discover-actions';
      const play = document.createElement('a');
      play.className = 'gb-discover-play';
      play.href = game.path;
      play.textContent = '今すぐ遊ぶ';
      play.addEventListener('click', () => emit('featured-play', game.path));
      const share = document.createElement('button');
      share.type = 'button';
      share.className = 'gb-discover-share';
      share.textContent = '友達に送る';
      share.setAttribute('aria-label', game.title + 'を友達に共有');
      share.addEventListener('click', async () => {
        const url = new URL(game.path, location.origin).href;
        const message = game.title + '｜GAME BANKで遊んでみて！';
        try {
          if (navigator.share) await navigator.share({ title: game.title, text: message, url });
          else if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(url);
            share.textContent = 'URLをコピーしました';
            setTimeout(() => { share.textContent = '友達に送る'; }, 2400);
          } else {
            // Never report success when clipboard/share is unavailable.
            window.prompt('このURLをコピーして共有してください', url);
          }
          emit('featured-share', game.path);
        } catch (error) {
          if (error && error.name !== 'AbortError') window.prompt('このURLをコピーして共有してください', url);
        }
      });
      actions.append(play, share);
      card.append(tag, h3, p, actions);
      grid.append(card);
    });
    section.append(eyebrow, heading, intro, grid);
    catalog.parentNode.insertBefore(section, catalog);
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
