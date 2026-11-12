import importlib.util
import json
import tempfile
import unittest
from pathlib import Path

MODULE = Path(__file__).resolve().parent.parent / 'scripts/check_catalog_integrity.py'
spec=importlib.util.spec_from_file_location('check_catalog_integrity', MODULE)
mod=importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)

class CatalogTests(unittest.TestCase):
    def test_rejects_too_small_catalog(self):
        with tempfile.TemporaryDirectory() as temp:
            folder=Path(temp)
            (folder/'data').mkdir()
            (folder/'data/games.json').write_text(json.dumps([{'id':1}]), encoding='utf-8')
            with self.assertRaises(ValueError):
                mod.check(folder)

if __name__=='__main__':
    unittest.main()
