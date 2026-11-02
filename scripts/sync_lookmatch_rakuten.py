#!/usr/bin/env python3
"""Sync only Rakuten's official returned affiliateUrl values."""
import datetime,json,os,time
from pathlib import Path
from urllib.parse import urlencode,urlparse
from urllib.request import Request,urlopen
API="https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20260401"
OUT=Path("public-mirror/games/look-match/rakuten-items.json")
KEYWORDS={"トレンチコート":"レディース トレンチコート","花柄ワンピース":"レディース 花柄ワンピース","ワイドパンツ":"レディース ワイドパンツ","デニムジャケット":"レディース デニムジャケット","カーディガン":"レディース カーディガン","ロングブーツ":"レディース ロングブーツ","スニーカー":"レディース スニーカー","プリーツスカート":"レディース プリーツスカート"}
def main():
 app=os.getenv("RAKUTEN_APP_ID","").strip()
 key=os.getenv("RAKUTEN_ACCESS_KEY","").strip()
 aff=os.getenv("RAKUTEN_AFFILIATE_ID","").strip()
 if not all((app,key,aff)):
  print("Credentials not configured; keeping product feed unchanged")
  return
 records={}
 for tag,kw in KEYWORDS.items():
  try:
   url=API+"?"+urlencode({"applicationId":app,"affiliateId":aff,"keyword":kw,"hits":8,"format":"json"})
   req=Request(url,headers={"accessKey":key,"User-Agent":"GAME-BANK-LOOK-MATCH/1.0","Accept":"application/json"})
   with urlopen(req,timeout=25) as res:data=json.load(res)
   for entry in data.get("Items",data.get("items",[])):
    x=entry.get("Item",entry)
    link=x.get("affiliateUrl","")
    if urlparse(link).hostname not in {"hb.afl.rakuten.co.jp","a.r10.to"}:continue
    code=str(x.get("itemCode",""))
    if code:records[code]={"itemCode":code,"itemName":x.get("itemName",""),"itemPrice":x.get("itemPrice"),"affiliateUrl":link,"itemUrl":x.get("itemUrl",""),"keyword":tag}
  except Exception as e:print("API error",tag,type(e).__name__)
  time.sleep(0.5)
 if not records:raise RuntimeError("No verified affiliate links; refusing to overwrite feed")
 OUT.parent.mkdir(parents=True,exist_ok=True)
 OUT.write_text(json.dumps({"source":"Rakuten Ichiba Item Search API 2026-04-01","status":"api_verified","lastSyncedAt":datetime.datetime.now(datetime.timezone.utc).isoformat(),"items":list(records.values())},ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
 print("Verified URLs synchronized:",len(records),"(publishing to Vercel requires a separate deploy)")
if __name__=="__main__":main()
