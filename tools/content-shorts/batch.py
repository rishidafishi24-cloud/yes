#!/usr/bin/env python3
"""Batch runner: make a baseline plus one-change variants of a short, check each, and write records.

  batch.py batch.json

batch.json:
{
  "batch_id": "b001",
  "input": "footage.mp4",
  "out_dir": "out/b001",
  "license": "license.json",
  "baseline": {"mode": "blur", "preset": "clean", "text": "", "captions": false,
               "music": null, "start": 0, "duration": 30},
  "vary": {"param": "preset", "values": ["warm", "punchy", "dreamy"]}
}

Exactly one parameter varies, so a pick can be tied to a cause. v0 is the baseline.
Writes vN.mp4, vN.json (the variant record), index.json, and pick_template.md.
"""
import json
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).parent
PARAMS = {"mode", "preset", "text", "captions", "music", "start", "duration"}


def sh(*cmd):
    res = subprocess.run([str(c) for c in cmd], capture_output=True, text=True)
    if res.returncode != 0:
        sys.exit(f"failed: {' '.join(str(c) for c in cmd[:4])}...\n{res.stdout[-800:]}{res.stderr[-800:]}")
    return res.stdout


def tool_versions():
    ff = subprocess.run(["ffmpeg", "-version"], capture_output=True, text=True).stdout.splitlines()[0]
    return {"ffmpeg": ff.split(" Copyright")[0]}


def build(cfg, settings, out_mp4, work):
    src = cfg["input"]
    vert = work / "vert.mp4"
    args = ["python3", HERE / "shorts.py", "reframe", src, vert, "--mode", settings["mode"]]
    if settings.get("start"):
        args += ["--start", settings["start"]]
    if settings.get("duration"):
        args += ["--duration", settings["duration"]]
    sh(*args)
    styled = work / "styled.mp4"
    cmd = ["python3", HERE / "shorts.py", "style", vert, styled, "--preset", settings["preset"]]
    if settings.get("text"):
        cmd += ["--text", settings["text"]]
    sh(*cmd)
    cur = styled
    if settings.get("captions"):
        capped = work / "captioned.mp4"
        sh("python3", HERE / "captions.py", "auto", cur, capped)
        cur = capped
    if settings.get("music"):
        mixed = work / "mixed.mp4"
        sh("python3", HERE / "mix_music.py", cur, settings["music"], mixed)
        cur = mixed
    sh("python3", HERE / "shorts.py", "loudness", cur, out_mp4)


def run_check(mp4, license_path):
    res = subprocess.run(["python3", HERE / "shorts.py", "check", mp4, "--license", license_path],
                         capture_output=True, text=True)
    checks = {}
    for line in res.stdout.splitlines():
        if line.startswith(("PASS", "FAIL")) and ":" in line:
            status, rest = line.split(None, 1)
            name, val = rest.split(":", 1)
            checks[name.strip()] = {"result": status, "detail": val.strip()}
    return checks, res.returncode == 0


def main():
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    cfg = json.load(open(sys.argv[1]))
    vary = cfg.get("vary") or {}
    param, values = vary.get("param"), vary.get("values") or []
    if not param or param not in PARAMS:
        sys.exit(f"vary.param must be one of {sorted(PARAMS)}")
    if not values:
        sys.exit("vary.values is empty")
    base = {"mode": "blur", "preset": "clean", "text": "", "captions": False, "music": None,
            "start": 0, "duration": 30}
    base.update(cfg.get("baseline", {}))
    out = Path(cfg["out_dir"])
    out.mkdir(parents=True, exist_ok=True)
    work = out / "_work"
    work.mkdir(exist_ok=True)
    versions = tool_versions()

    plan = [("v0", None, base)]
    for val in values:
        if val == base.get(param):
            print(f"skip: {param}={val!r} equals the baseline")
            continue
        s = dict(base)
        s[param] = val
        plan.append((f"v{len(plan)}", {param: val}, s))

    index = []
    for vid, changed, settings in plan:
        mp4 = out / f"{vid}.mp4"
        print(f"== {vid}: {changed or 'baseline'}")
        build(cfg, settings, mp4, work)
        checks, ok = run_check(mp4, cfg["license"])
        record = {
            "batch_id": cfg["batch_id"], "variant_id": vid, "baseline_id": "v0",
            "changed": changed or {}, "format": "shorts", "tools": versions,
            "settings": settings, "license_file": cfg["license"], "checks": checks,
            "all_checks_passed": ok, "file": mp4.name,
        }
        json.dump(record, open(out / f"{vid}.json", "w"), indent=2)
        index.append({"variant_id": vid, "changed": changed or {}, "passed": ok, "file": mp4.name})
        print(f"   checks: {'PASS' if ok else 'FAIL'}")
    json.dump({"batch_id": cfg["batch_id"], "variants": index}, open(out / "index.json", "w"), indent=2)

    lines = [f"# Batch {cfg['batch_id']}: pick your favorites", "",
             f"Varied: `{param}`. v0 is the baseline.", "",
             "| Variant | Changed | Checks | Pick (yes/no) | Why |", "|---|---|---|---|---|"]
    for e in index:
        ch = ", ".join(f"{k}={v}" for k, v in e["changed"].items()) or "baseline"
        lines.append(f"| {e['variant_id']} | {ch} | {'pass' if e['passed'] else 'FAIL'} | | |")
    open(out / "pick_template.md", "w").write("\n".join(lines) + "\n")
    bad = [e["variant_id"] for e in index if not e["passed"]]
    print(f"done: {len(index)} variants in {out}" + (f"; FAILED checks: {', '.join(bad)}" if bad else ""))
    sys.exit(1 if bad else 0)


if __name__ == "__main__":
    main()
