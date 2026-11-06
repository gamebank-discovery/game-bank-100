"""Regression tests for the one-way staging merger."""
from __future__ import annotations

import importlib.util
import json
import tempfile
import unittest
from pathlib import Path

MODULE_PATH = Path(__file__).resolve().parent.parent / "scripts/merge_vercel_snapshot.py"
spec = importlib.util.spec_from_file_location("merge_vercel_snapshot", MODULE_PATH)
merge_module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(merge_module)


class MergerTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name)
        self.current = self.root / "current"
        self.vercel = self.root / "incoming"
        self.target = self.root / "preview"
        self.report = self.root / "reports/audit.json"
        for source in (self.current, self.vercel):
            (source / "data").mkdir(parents=True)
            (source / "games/horse").mkdir(parents=True)
        (self.current / "index.html").write_text("new Cloudflare homepage", encoding="utf-8")
        (self.vercel / "index.html").write_text("old Vercel homepage", encoding="utf-8")
        (self.current / "games/horse/index.html").write_text("v6 newest", encoding="utf-8")
        (self.vercel / "games/horse/index.html").write_text("v4 older", encoding="utf-8")
        (self.current / "data/games.json").write_text(json.dumps([{"id":167,"url":"/games/horse/index.html"}]), encoding="utf-8")
        (self.vercel / "data/games.json").write_text(json.dumps([{"id":163,"url":"/games/horse/index.html"}]), encoding="utf-8")
        (self.vercel / "games/horse/photo.svg").write_text("unique archive art", encoding="utf-8")

    def test_preserves_newer_assets_and_protected_catalog(self):
        report = merge_module.merge(self.current, self.vercel, self.target, self.report)
        self.assertEqual((self.target / "games/horse/index.html").read_text(), "v6 newest")
        self.assertEqual((self.target / "index.html").read_text(), "new Cloudflare homepage")
        self.assertEqual((self.target / "data/games.json").read_text(), (self.current / "data/games.json").read_text())
        self.assertEqual((self.target / "games/horse/photo.svg").read_text(), "unique archive art")
        self.assertEqual(report["files_added"], ["games/horse/photo.svg"])
        self.assertTrue(self.report.exists())
        self.assertEqual(len(report["conflicts_kept_existing"]), 3)

    def test_refuses_inplace_merge(self):
        with self.assertRaises(ValueError):
            merge_module.merge(self.current, self.vercel, self.current, self.report)

    def test_refuses_missing_input_homepage(self):
        (self.vercel / "index.html").unlink()
        with self.assertRaises(ValueError):
            merge_module.merge(self.current, self.vercel, self.target, self.report)

    def test_refuses_existing_output(self):
        self.target.mkdir()
        with self.assertRaises(ValueError):
            merge_module.merge(self.current, self.vercel, self.target, self.report)


if __name__ == "__main__":
    unittest.main()
