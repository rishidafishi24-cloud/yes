#!/usr/bin/env bash
# Rollback for the Coding Division instruction activation.
#
# Ordering guarantees
#   1. Resolve attempts.txt by LAST state per agent (append-only ledger).
#   2. Refuse to run if any agent's LATEST state is not 'updated'.
#   3. For every agent, compare the ENTIRE current adapterConfig against the
#      INDEPENDENT post-activation snapshot BEFORE any mutation. Values are
#      never manufactured from current state.
#   4. Confirm bundle content still matches the activated candidate before
#      restoring it.
#   5. Send only {"adapterConfig": ...}, matching updateAgentSchema.
#
# See activate-instructions.sh in this directory for the recovery model.
set -euo pipefail

SELF_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

API="${PAPERCLIP_API:-http://127.0.0.1:3100/api}"
PKG="${PKG_DIR:-${SELF_DIR}}"
ORIG="${ORIG_DIR:-${PKG}/original-live-bundles}"
STATE="${STATE_DIR:-${PKG}/activation-state}"
CAND_DIR="${CAND_DIR:-${PKG}/candidates}"

AGENTS=(
  "CodingLead|6af847fd-f873-4978-a45d-040f7d8b7745"
  "Coder1|48472d3c-f44d-489b-bf50-de18b1205636"
  "Coder2|2c208dea-1705-4a4a-bf03-8d9010a55507"
  "Reviewer|5a0c3d40-7c8d-4c86-8e82-ddade5a6aef8"
)

step(){ printf '\n=== %s ===\n' "$1"; }
fail(){ printf 'FAILED: %s\n' "$1" >&2; exit 1; }

fetch_bundle(){ curl -sf --max-time 10 "${API}/agents/$1/instructions-bundle/file?path=AGENTS.md"; }
fetch_cfg(){     curl -sf --max-time 10 "${API}/agents/$1" \
                   | python3 -c "import json,sys;print(json.dumps(json.load(sys.stdin).get('adapterConfig') or {},sort_keys=True))"; }

ATTEMPTS="${STATE}/attempts.txt"
[ -f "$ATTEMPTS" ] || fail "no activation ledger at ${ATTEMPTS} — nothing to roll back"

# ── 1. Resolve ledger by LAST state per agent ─────────────────────────────────
step "1. Resolve ledger (last state wins)"
LATEST="${STATE}/latest-states.txt"
awk -F'|' '!seen[$1]++ { }  { last[$1]=$3 }  END { for (a in last) print a"|"last[a] }' \
    "$ATTEMPTS" | sort > "$LATEST"
cat "$LATEST"

# ── 2. Block on any unresolved LATEST state ───────────────────────────────────
step "2. Check for unresolved agents"
BLOCK=0
while IFS='|' read -r label state; do
  case "$state" in
    updated) : ;;
    attempted|unknown)
      echo "  BLOCKED ${label}: latest state = ${state}" >&2
      BLOCK=1 ;;
    *) echo "  BLOCKED ${label}: unrecognised state '${state}'" >&2; BLOCK=1 ;;
  esac
done < "$LATEST"
[ "$BLOCK" -eq 0 ] || fail "one or more agents have an unresolved latest state; reconcile manually"

# ── 3. Pre-flight ALL agents: config snapshot + bundle content ────────────────
# Every check runs before ANY mutation, so a late failure leaves the system
# untouched.
step "3. Pre-flight checks (no mutations yet)"
for e in "${AGENTS[@]}"; do
  label="${e%%|*}"; id="${e##*|}"
  grep -q "^${label}|updated$" "$LATEST" || { echo "-- skip ${label} (never activated)"; continue; }

  SNAP="${STATE}/post-adapterConfig.${label}.json"
  [ -f "$SNAP" ] || fail "${label}: no independent post-activation snapshot — reconcile manually"

  fetch_cfg "$id" > "${STATE}/cur-adapterConfig.${label}.json" \
    || fail "${label}: cannot read current adapterConfig"
  # Guarded as an `if` condition: under `set -e` the heredoc's non-zero exit
  # would abort the script before the `|| fail` line could run, so the drift
  # would surface as a bare exit instead of the intended diagnostic.
  if ! python3 - "$SNAP" "$STATE/cur-adapterConfig.${label}.json" "$label" <<'PY'
import json,sys
exp=json.load(open(sys.argv[1])); cur=json.load(open(sys.argv[2]))
d={k:(exp.get(k),cur.get(k)) for k in set(exp)|set(cur) if exp.get(k)!=cur.get(k)}
if d:
    print(f"STOP: adapterConfig changed since activation for {sys.argv[3]}",file=sys.stderr)
    for k,(a,b) in sorted(d.items()): print(f"   {k}: snapshot={a!r} current={b!r}",file=sys.stderr)
    print("   Refusing to overwrite an independent change.",file=sys.stderr); sys.exit(1)
print(f"   OK  {sys.argv[3]}: adapterConfig matches post-activation snapshot")
PY
  then
    fail "${label}: adapterConfig drift — resolve manually"
  fi

  fetch_bundle "$id" > "${STATE}/cur-bundle.${label}.json" \
    || fail "${label}: cannot read current bundle"
  if ! python3 - "$CAND_DIR/${label}.AGENTS.md" "$STATE/cur-bundle.${label}.json" "$label" <<'PY'
import json,sys
cand=open(sys.argv[1],encoding="utf-8").read()
cur=json.load(open(sys.argv[2])).get("content")
if cur!=cand:
    print(f"STOP: bundle content changed since activation for {sys.argv[3]}",file=sys.stderr)
    print("   Refusing to overwrite; another writer may have changed it.",file=sys.stderr)
    sys.exit(1)
print(f"   OK  {sys.argv[3]}: bundle content still matches the activated candidate")
PY
  then
    fail "${label}: bundle content drift — resolve manually"
  fi
done

# NOTE ON ATOMICITY
# The checks above are read-before-write, NOT a lock. The bundle-file API
# exposes no compare-and-swap or ETag, so a concurrent writer between the check
# and the PUT would not be detected. Run this when no other writer is active.

# ── 4. Restore ───────────────────────────────────────────────────────────────
step "4. Restore"
for e in "${AGENTS[@]}"; do
  label="${e%%|*}"; id="${e##*|}"
  grep -q "^${label}|updated$" "$LATEST" || continue
  echo "--> ${label}"

  python3 - "$ORIG/${label}.AGENTS.md" > "${STATE}/rollback-payload.${label}.json" <<'PY'
import json,sys
json.dump({"path":"AGENTS.md",
           "content":open(sys.argv[1],encoding="utf-8").read(),
           "clearLegacyPromptTemplate":False},sys.stdout)
PY
  code=$(curl -s -o "${STATE}/rollback-resp.${label}.json" -w '%{http_code}' --max-time 30 \
    -X PUT -H 'Content-Type: application/json' \
    --data-binary "@${STATE}/rollback-payload.${label}.json" \
    "${API}/agents/${id}/instructions-bundle/file")
  case "$code" in 200|201) : ;; *) fail "bundle restore HTTP ${code} for ${label}" ;; esac

  # Restore captured PRE-activation adapterConfig (only field PATCH accepts).
  code=$(curl -s -o "${STATE}/rollback-cfg.${label}.json" -w '%{http_code}' --max-time 30 \
    -X PATCH -H 'Content-Type: application/json' \
    --data-binary "@${STATE}/pre-adapterConfig.${label}.json" \
    "${API}/agents/${id}")
  case "$code" in 200|201) : ;; *) fail "config restore HTTP ${code} for ${label}" ;; esac

  fetch_bundle "$id" > "${STATE}/post-rollback.${label}.json"
  diff -q "$ORIG/${label}.AGENTS.md" \
       <(python3 -c "import json,sys;sys.stdout.write(json.load(open(sys.argv[1]))['content'])" \
          "$STATE/post-rollback.${label}.json") >/dev/null \
    || fail "${label}: post-rollback content mismatch"
  echo "    restored + verified"
done

step "ROLLBACK COMPLETE"
