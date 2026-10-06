#!/usr/bin/env python3
"""Find and fetch footage from sources with usable licenses, and record the license as you go.

  sources.py search PROVIDER "query" [--limit 5]
  sources.py get PROVIDER "query" --index 0 --out clip.mp4 --license license.json
  sources.py add license.json --name N --source S --license L --url U [--file F] [--author A]

PROVIDER is one of: pexels, pixabay, nasa, archive.
  pexels   needs the PEXELS_API_KEY environment variable (free key)
  pixabay  needs the PIXABAY_API_KEY environment variable (free key)
  nasa     no key. NASA media is generally not copyrighted, but individual items can carry
           third-party rights; the license note says to verify per item.
  archive  no key. Only items that declare a public domain, CC0, or CC BY license are returned.
           CC BY requires credit to the author; the record keeps the license URL.

Licenses and terms change. This tool records what the source reported at fetch time; it does not
replace reading the source's current terms.
"""
import argparse
import datetime
import json
import os
import re
import sys
import urllib.parse
import urllib.request

UA = {"User-Agent": "shorts-toolkit/0.1"}


def http_json(url, headers=None):
    req = urllib.request.Request(url, headers={**UA, **(headers or {})})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.load(r)


# --- parsers: each turns an API response into [{title, page_url, license, author, download_url}] ---

def parse_pexels(data):
    out = []
    for v in data.get("videos", []):
        files = [f for f in v.get("video_files", []) if f.get("file_type") == "video/mp4"]
        files.sort(key=lambda f: f.get("height") or 0, reverse=True)
        if not files:
            continue
        out.append({"title": f"Pexels video {v['id']}", "page_url": v.get("url"),
                    "license": "Pexels License", "author": (v.get("user") or {}).get("name"),
                    "download_url": files[0]["link"]})
    return out


def parse_pixabay(data):
    out = []
    for h in data.get("hits", []):
        vids = h.get("videos") or {}
        pick = next((vids[k] for k in ("large", "medium", "small") if vids.get(k, {}).get("url")), None)
        if not pick:
            continue
        out.append({"title": f"Pixabay video {h['id']}", "page_url": h.get("pageURL"),
                    "license": "Pixabay Content License", "author": h.get("user"),
                    "download_url": pick["url"]})
    return out


def parse_nasa(data):
    out = []
    for it in (data.get("collection") or {}).get("items", []):
        d = (it.get("data") or [{}])[0]
        out.append({"title": d.get("title", d.get("nasa_id", "NASA item")),
                    "page_url": f"https://images.nasa.gov/details/{d.get('nasa_id', '')}",
                    "license": "NASA media (generally not copyrighted; verify per item)",
                    "author": d.get("center") or d.get("secondary_creator") or "NASA",
                    "asset_manifest": it.get("href")})
    return out


def nasa_pick_asset(urls):
    mp4 = [u for u in urls if u.lower().endswith(".mp4")]
    for tag in ("~orig", "~large", "~medium", "~mobile", "~small"):
        for u in mp4:
            if tag in u:
                return u
    return mp4[0] if mp4 else None


OK_LICENSE = re.compile(r"publicdomain|/zero/|/by/|/by-sa/", re.I)


def parse_archive(data):
    out = []
    for d in (data.get("response") or {}).get("docs", []):
        lic = d.get("licenseurl") or ""
        if isinstance(lic, list):
            lic = lic[0] if lic else ""
        if not OK_LICENSE.search(lic):
            continue  # skip items without a clearly usable declared license
        ident = d["identifier"]
        out.append({"title": d.get("title", ident), "page_url": f"https://archive.org/details/{ident}",
                    "license": lic, "author": d.get("creator") or "unknown", "identifier": ident})
    return out


def archive_pick_file(meta):
    files = [f["name"] for f in meta.get("files", []) if f.get("name", "").lower().endswith(".mp4")]
    return files[0] if files else None


# --- live search / resolve (need network) ---

def search(provider, query, limit):
    q = urllib.parse.quote(query)
    if provider == "pexels":
        key = os.environ.get("PEXELS_API_KEY") or sys.exit("set PEXELS_API_KEY")
        return parse_pexels(http_json(f"https://api.pexels.com/videos/search?query={q}&per_page={limit}",
                                      {"Authorization": key}))
    if provider == "pixabay":
        key = os.environ.get("PIXABAY_API_KEY") or sys.exit("set PIXABAY_API_KEY")
        return parse_pixabay(http_json(f"https://pixabay.com/api/videos/?key={key}&q={q}&per_page={max(limit, 3)}"))[:limit]
    if provider == "nasa":
        return parse_nasa(http_json(f"https://images-api.nasa.gov/search?q={q}&media_type=video&page_size={limit}"))
    if provider == "archive":
        fl = "&fl[]=identifier&fl[]=title&fl[]=licenseurl&fl[]=creator"
        return parse_archive(http_json(
            f"https://archive.org/advancedsearch.php?q={q}+AND+mediatype%3Amovies&rows={limit * 4}&output=json{fl}"))[:limit]
    sys.exit(f"unknown provider {provider}")


def resolve_download(provider, item):
    if provider == "nasa":
        return nasa_pick_asset(http_json(item["asset_manifest"]))
    if provider == "archive":
        name = archive_pick_file(http_json(f"https://archive.org/metadata/{item['identifier']}"))
        return f"https://archive.org/download/{item['identifier']}/{urllib.parse.quote(name)}" if name else None
    return item.get("download_url")


# --- license recording ---

def add_license(path, entry):
    try:
        data = json.load(open(path))
    except (OSError, ValueError):
        data = {"items": []}
    entry.setdefault("retrieved", datetime.date.today().isoformat())
    data.setdefault("items", []).append(entry)
    json.dump(data, open(path, "w"), indent=2)
    print(f"recorded {entry['name']} in {path}")


def cmd_search(a):
    for i, r in enumerate(search(a.provider, a.query, a.limit)):
        print(f"[{i}] {r['title']} | {r['license']} | {r.get('author')} | {r['page_url']}")


def cmd_get(a):
    results = search(a.provider, a.query, a.index + 1)
    if len(results) <= a.index:
        sys.exit("no result at that index")
    item = results[a.index]
    url = resolve_download(a.provider, item)
    if not url:
        sys.exit("no downloadable mp4 found for that item")
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=120) as r, open(a.out, "wb") as f:
        while chunk := r.read(1 << 20):
            f.write(chunk)
    add_license(a.license, {"name": item["title"], "source": a.provider, "license": item["license"],
                            "url": item["page_url"], "file": a.out, "author": item.get("author")})


def cmd_add(a):
    entry = {"name": a.name, "source": a.source, "license": a.license_name, "url": a.url}
    if a.file:
        entry["file"] = a.file
    if a.author:
        entry["author"] = a.author
    add_license(a.license_file, entry)


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = p.add_subparsers(dest="cmd", required=True)
    s = sub.add_parser("search"); s.add_argument("provider"); s.add_argument("query")
    s.add_argument("--limit", type=int, default=5); s.set_defaults(fn=cmd_search)
    g = sub.add_parser("get"); g.add_argument("provider"); g.add_argument("query")
    g.add_argument("--index", type=int, default=0); g.add_argument("--out", required=True)
    g.add_argument("--license", required=True); g.set_defaults(fn=cmd_get)
    d = sub.add_parser("add"); d.add_argument("license_file")
    d.add_argument("--name", required=True); d.add_argument("--source", required=True)
    d.add_argument("--license", dest="license_name", required=True); d.add_argument("--url", required=True)
    d.add_argument("--file"); d.add_argument("--author"); d.set_defaults(fn=cmd_add)
    a = p.parse_args()
    a.fn(a)


if __name__ == "__main__":
    main()
