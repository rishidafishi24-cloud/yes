#!/usr/bin/env bash
# Activation for the four Coding Division instruction bundles.
#
# Delivers corrected bundles via the supported bundle-file API, preserving
# MYMA_NETWORK_POLICY byte-for-byte.
#
# Recovery model
#   attempts.txt  : label|agentId|state   (append-only; LAST state per agent wins)
#   states        : attempted -> updated | unknown
#   post-adapterConfig.<label>.json : captured AFTER a verified update, so
#                   rollback compares against an INDEPENDENT snapshot rather
#                   than values manufactured from current state.
set -euo pipefail

SELF_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

API="${PAPERCLIP_API:-http://127.0.0.1:3100/api}"
COMPANY="${PAPERCLIP_COMPANY:-7888775d-334a-4892-9784-00c48f1b56cc}"
PKG="${PKG_DIR:-${SELF_DIR}}"
CAND="${CAND_DIR:-${PKG}/candidates}"
ORIG="${ORIG_DIR:-${PKG}/original-live-bundles}"
STATE="${STATE_DIR:-${PKG}/activation-state}"

# agentSlug is used to locate the on-disk bundle for reconciliation.
AGENTS=(
  "CodingLead|6af847fd-f873-4978-a45d-040f7d8b7745|coding-lead"
  "Coder1|48472d3c-f44d-489b-bf50-de18b1205636|coder-one"
  "Coder2|2c208dea-1705-4a4a-bf03-8d9010a55507|coder-two"
  "Reviewer|5a0c3d40-7c8d-4c86-8e82-ddade5a6aef8|reviewer"
)

# In tests LIVE_DIR is supplied; otherwise derive the instance path.
if [ -n "${LIVE_DIR:-}" ]; then
  live_root(){ printf '%s/%s' "$LIVE_DIR" "$1"; }
else
  live_root(){ printf '/home/god/.paperclip/instances/default/companies/%s/agents/%s' \
                "$COMPANY" "$1"; }
fi

step(){ printf '\n=== %s ===\n' "$1"; }
fail(){ printf 'FAILED: %s\n' "$1" >&2; exit 1; }
mark(){ printf '%s|%s|%s\n' "$1" "$2" "$3" >> "${STATE}/attempts.txt"; }

# ── 0. Preflight: refuse to reuse an existing state directory ──────────────────
step "0. Preflight"
if [ -e "$STATE" ]; then
  echo "REFUSING: ${STATE} already exists." >&2
  echo "It holds recovery backups, post-update snapshots, and the ledger." >&2
  echo "Inspect it, or move it aside deliberately, then re-run." >&2
  exit 1
fi
[ -d "$CAND" ] || fail "candidate dir missing: $CAND"
[ -d "$ORIG" ] || fail "original bundle dir missing: $ORIG"
for e in "${AGENTS[@]}"; do
  label="${e%%|*}"; rest="${e#*|}"; id="${rest%%|*}"
  [ -f "$CAND/${label}.AGENTS.md" ] || fail "candidate missing: ${label}.AGENTS.md"
  [ -f "$ORIG/${label}.AGENTS.md" ]  || fail "original missing:  ${label}.AGENTS.md"
  curl -sf --max-time 10 "${API}/agents/${id}" -o /dev/null || fail "agent unreachable: ${id}"
done
mkdir -p "$STATE"
: > "${STATE}/attempts.txt"
echo "preflight ok — fresh state dir created at ${STATE}"

# ── 1. Capture rollback state BEFORE any write ────────────────────────────────
step "1. Capture pre-activation state"
for e in "${AGENTS[@]}"; do
  label="${e%%|*}"; rest="${e#*|}"; id="${rest%%|*}"
  curl -sf --max-time 10 "${API}/agents/${id}" -o "${STATE}/pre-agent.${label}.json" \
    || fail "capture agent ${label}"
  # The heredoc is the check. `set -e` would abort on its non-zero exit before
  # any guard could run, so it is invoked as an `if` condition instead.
  if ! python3 - "$STATE/pre-agent.${label}.json" "$STATE/pre-adapterConfig.${label}.json" <<'PY'
import json,sys
ac=(json.load(open(sys.argv[1])).get("adapterConfig") or {})
bad=[k for k in ac if any(s in k.lower() for s in
     ("key","secret","token","cookie","auth","password"))]
if bad:
    print("REFUSING: sensitive adapterConfig keys: "+",".join(bad),file=sys.stderr); sys.exit(1)
json.dump({"adapterConfig":ac},open(sys.argv[2],"w"),indent=2)
PY
  then
    fail "sensitive keys in adapterConfig for ${label}"
  fi
  cp "${ORIG}/${label}.AGENTS.md" "${STATE}/pre-bundle.${label}.AGENTS.md"
  sha256sum "${STATE}/pre-bundle.${label}.AGENTS.md" | cut -d' ' -f1 \
    > "${STATE}/pre-bundle.${label}.sha256"
done
echo "captured pre-state for 4 agents"

# ── helpers ───────────────────────────────────────────────────────────────────
fetch_bundle(){ curl -sf --max-time 10 "${API}/agents/$1/instructions-bundle/file?path=AGENTS.md"; }
fetch_cfg(){     curl -sf --max-time 10 "${API}/agents/$1" \
                   | python3 -c "import json,sys;print(json.dumps(json.load(sys.stdin).get('adapterConfig') or {},sort_keys=True))"; }

# Reconcile BOTH surfaces after an ambiguous or failed update, record evidence,
# then stop. Never continue to another agent on a partial match.
reconcile_and_stop(){
  label="$1"; id="$2"; slug="$3"; why="$4"
  echo "    RECONCILING: ${why}"
  if fetch_bundle "$id" > "${STATE}/recon-bundle.${label}.json" 2>/dev/null; then
    python3 - "$CAND/${label}.AGENTS.md" "$STATE/recon-bundle.${label}.json" "$label" <<'PY'
import json,sys
cand=open(sys.argv[1],encoding="utf-8").read()
try:    body=json.load(open(sys.argv[2]))
except Exception: body={}
print("   bundle_api_content_matches_candidate="+str(body.get("content")==cand))
PY
  else
    echo "   bundle_api_unreadable=true"
  fi
  if fetch_cfg "$id" > "${STATE}/recon-adapterConfig.${label}.json" 2>/dev/null; then
    python3 - "$STATE/pre-adapterConfig.${label}.json" "$STATE/recon-adapterConfig.${label}.json" "$label" <<'PY'
import json,sys
pre=json.load(open(sys.argv[1])).get("adapterConfig") or {}
now=json.load(open(sys.argv[2]))
drift={k for k in set(pre)|set(now) if pre.get(k)!=now.get(k)}
print("   adapterConfig_changed_vs_pre="+str(sorted(drift)))
PY
  else
    echo "   adapterConfig_unreadable=true"
  fi
  { echo "reason=${why}"; date -u +%Y-%m-%dT%H:%M:%SZ; } > "${STATE}/recon.${label}.txt"
  mark "$label" "$id" "unknown"
  echo "    state recorded: unknown — activation STOPPED for manual reconciliation"
  echo "    ledger: ${STATE}/attempts.txt"
  fail "stopped after ambiguous/failed update on ${label}"
}

# ── 2. Activate ───────────────────────────────────────────────────────────────
step "2. Activate"
for e in "${AGENTS[@]}"; do
  label="${e%%|*}"; rest="${e#*|}"; id="${rest%%|*}"
  slug="$(live_root "$id")"
  echo "--> ${label} (${id})"

  python3 - "$CAND/${label}.AGENTS.md" > "${STATE}/payload.${label}.json" <<'PY'
import json,sys
json.dump({"path":"AGENTS.md",
           "content":open(sys.argv[1],encoding="utf-8").read(),
           "clearLegacyPromptTemplate":False},sys.stdout)
PY

  mark "$label" "$id" "attempted"      # recorded BEFORE the request

  set +e
  code=$(curl -s -o "${STATE}/resp.${label}.json" -w '%{http_code}' --max-time 30 \
    -X PUT -H 'Content-Type: application/json' \
    --data-binary "@${STATE}/payload.${label}.json" \
    "${API}/agents/${id}/instructions-bundle/file")
  rc=$?
  set -e

  if [ "$rc" -ne 0 ]; then
    reconcile_and_stop "$label" "$id" "$slug" "transport_failure_curl_rc_${rc}"
  fi
  case "$code" in
    200|201) : ;;
    *) reconcile_and_stop "$label" "$id" "$slug" "http_status_${code}" ;;
  esac

  # Verify content, then INDEPENDENTLY capture post-activation config.
  fetch_bundle "$id" > "${STATE}/post-bundle.${label}.json" \
    || reconcile_and_stop "$label" "$id" "$slug" "post_update_read_failed"
  # Verification is part of the reconcile decision, not a separate step: a
  # content or policy mismatch means the write landed but is not trustworthy, so
  # it must be reconciled and recorded as `unknown` like any other ambiguity.
  if ! python3 - "$CAND/${label}.AGENTS.md" "$STATE/post-bundle.${label}.json" \
           "$ORIG/${label}.AGENTS.md" "$label" <<'PY'
import hashlib,json,sys
def pol(t):
    i=t.find("MYMA_NETWORK_POLICY"); return t[i:] if i>=0 else None
cand=open(sys.argv[1],encoding="utf-8").read()
body=json.load(open(sys.argv[2])).get("content")
if body!=cand: sys.exit("content does not match candidate")
orig=open(sys.argv[3],encoding="utf-8").read()
a,b=pol(orig),pol(body)
if a is None or b is None: sys.exit("policy block missing")
if hashlib.sha256(a.encode()).hexdigest()!=hashlib.sha256(b.encode()).hexdigest():
    sys.exit("POLICY BLOCK ALTERED")
print("   content byte-exact + policy block byte-identical")
PY
  then
    reconcile_and_stop "$label" "$id" "$slug" "content_or_policy_verification_failed"
  fi

  fetch_cfg "$id" > "${STATE}/post-adapterConfig.${label}.json" \
    || reconcile_and_stop "$label" "$id" "$slug" "post_config_capture_failed"

  mark "$label" "$id" "updated"
  echo "    updated + post-activation snapshot saved"
done

step "ACTIVATION COMPLETE"
echo "ledger: ${STATE}/attempts.txt"; cat "${STATE}/attempts.txt"
