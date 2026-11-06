#!/usr/bin/env python3
"""Fail closed if a GAME BANK export silently drops playable games."""
from __future__ import annotations
import argparse
import html.parser
import json
from pathlib import Path
from urllib.parse import urlsplit, unquote

MUST_KEEP = (
    '/games/keiba-edge-pro/index.html',
    'https://color-beat-4.vercel.app/',
    '/games/gyoza-master-3d/index.html',
    '/games/gyoza-merge-3d/index.html',
    '/games/lost-quest/index.html',
)
WORKER_URL = 'https://game-bank-100next.daioku76.workers.dev/'


class Cards(html.parser.HTMLParser):
    def __init__(self):
        super().__init__()
        self.cards = []

    def handle_starttag(self, tag, attrs):
        if tag != 'a':
            return
        values = dict(attrs)
        if 'card' in values.get('class', '').split() and values.get('data-game-id'):
            self.cards.append(values)


def check(source: Path) -> dict:
    source = source.resolve()
    games = json.loads((source / 'data/games.json').read_text(encoding='utf-8'))
    if not isinstance(games, list) or len(games) < 166:
        raise ValueError('Catalog is incomplete (<166 entries)')
    ids = [str(game.get('id')) for game in games]
    if len(ids) != len(set(ids)):
        raise ValueError('Duplicated game IDs')
    by_url = {game.get('url'): game for game in games}
    for url in MUST_KEEP:
        game = by_url.get(url)
        if not game or not game.get('listed') or not game.get('playable') or game.get('hidden'):
            raise ValueError(f'Important game missing/hidden: {url}')
    parser = Cards()
    home = (source / 'index.html').read_text(encoding='utf-8')
    parser.feed(home)
    shown = [game for game in games if game.get('listed') and game.get('playable') and not game.get('hidden')]
    cards = parser.cards
    card_ids = [card['data-game-id'] for card in cards]
    visible_ids = [str(game['id']) for game in shown]
    if len(card_ids) != len(set(card_ids)) or set(card_ids) != set(visible_ids):
        missing = sorted(set(visible_ids) - set(card_ids))
        extra = sorted(set(card_ids) - set(visible_ids))
        raise ValueError(f'Home cards != visible catalog. Missing={missing}, extra={extra}')
    by_id = {str(game['id']): game for game in games}
    for card in cards:
        game = by_id[card['data-game-id']]
        if card.get('href') != game.get('url'):
            raise ValueError(f'Homepage link mismatch ID {game["id"]}')
    missing_pages, external = [], 0
    for game in shown:
        raw_url = game.get('url', '')
        url = urlsplit(raw_url)
        if url.scheme in ('http', 'https'):
            external += 1
            continue
        if url.scheme or url.netloc or not url.path.startswith('/'):
            raise ValueError(f'Unsafe game URL {raw_url}')
        path = unquote(url.path).lstrip('/')
        if path.endswith('/'):
            path += 'index.html'
        if '..' in Path(path).parts:
            raise ValueError(f'Path traversal in {raw_url}')
        if not (source / path).is_file():
            missing_pages.append(raw_url)
    if missing_pages:
        raise ValueError(f'Missing playable pages: {missing_pages[:20]}')
    if WORKER_URL not in home:
        raise ValueError('Live Cloudflare Workers GAME BANK NEXT is not linked')
    return {'catalog': len(games), 'visible_cards': len(cards),
            'local_playable_pages': len(shown) - external,
            'external_playable_links': external,
            'cloudflare_worker_preserved': True}


def main():
    p = argparse.ArgumentParser()
    p.add_argument('site', nargs='?', default='public-mirror')
    args = p.parse_args()
    print(json.dumps(check(Path(args.site)), ensure_ascii=False))


if __name__ == '__main__':
    main()
