import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import test from "node:test";
import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";

/**
 * Fixtures for the Coding Division instruction activation/rollback pair.
 *
 * These scripts mutate live agent configuration, so they are covered against a
 * mock control plane rather than a real instance. The mock implements only the
 * four endpoints the scripts actually call, and can be told to fail or to
 * half-apply a write so the recovery paths are exercised.
 *
 * Covered behaviour:
 *   - refuses to run against a pre-existing state directory
 *   - applies all four bundles byte-exactly and preserves the policy block
 *   - on HTTP 500, reconciles both surfaces, records "unknown", and stops
 *   - on a half-applied write (applied but no response), same recovery path
 *   - rollback refuses while any agent's latest state is unresolved
 *   - rollback restores the original bundles
 */

const pkgDir = new URL("../instruction-activation", import.meta.url).pathname;
const activateScript = path.join(pkgDir, "activate-instructions.sh");
const rollbackScript = path.join(pkgDir, "rollback-instructions.sh");

// Must match the AGENTS table in both scripts.
const AGENTS = {
  CodingLead: "6af847fd-f873-4978-a45d-040f7d8b7745",
  Coder1: "48472d3c-f44d-489b-bf50-de18b1205636",
  Coder2: "2c208dea-1705-4a4a-bf03-8d9010a55507",
  Reviewer: "5a0c3d40-7c8d-4c86-8e82-ddade5a6aef8",
};

const POLICY_MARKER = "MYMA_NETWORK_POLICY";
const cleanupDirs = [];
const cleanupPorts = [];

function makeWorkDir() {
  const dir = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "pc-activation-")));
  cleanupDirs.push(dir);
  for (const sub of ["store", "live", "cands", "orig"]) {
    fs.mkdirSync(path.join(dir, sub), { recursive: true });
  }
  return dir;
}

/** Policy block: everything from the marker to EOF, as the scripts compare it. */
function policyBlock(text) {
  const i = text.indexOf(POLICY_MARKER);
  return i < 0 ? null : text.slice(i);
}

/**
 * Build a fake instance: per-agent config store, on-disk bundle tree, and
 * copies of the package's candidate + original bundles.
 */
function seedWorkDir(dir) {
  const adapterConfig = {
    command: "/usr/bin/opencode",
    cwd: "/home/god",
    model: "x/y",
    instructionsBundleMode: "managed",
    instructionsEntryFile: "AGENTS.md",
    instructionsRootPath: "/x",
    instructionsFilePath: "/x/AGENTS.md",
  };

  const store = {};
  for (const [label, id] of Object.entries(AGENTS)) {
    store[id] = { adapterConfig: { ...adapterConfig } };
    const bundleDir = path.join(dir, "live", id, "instructions");
    fs.mkdirSync(bundleDir, { recursive: true });
    // The instance starts on the package's saved originals, not a placeholder,
    // so rollback has something realistic to restore.
    fs.copyFileSync(
      path.join(pkgDir, "original-live-bundles", `${label}.AGENTS.md`),
      path.join(bundleDir, "AGENTS.md"),
    );
    fs.copyFileSync(
      path.join(pkgDir, "original-live-bundles", `${label}.AGENTS.md`),
      path.join(dir, "orig", `${label}.AGENTS.md`),
    );
    fs.copyFileSync(
      path.join(pkgDir, "candidates", `${label}.AGENTS.md`),
      path.join(dir, "cands", `${label}.AGENTS.md`),
    );
  }
  fs.writeFileSync(path.join(dir, "store", "agents.json"), JSON.stringify(store, null, 2));
}

/** Read the mock's current view of an agent's bundle. */
function currentBundle(dir, id) {
  return fs.readFileSync(path.join(dir, "live", id, "instructions", "AGENTS.md"), "utf8");
}

/**
 * Minimal control plane: GET/PUT bundle file, GET/PATCH agent. `options.failId`
 * returns 500 on PUT; `options.loseId` applies the write then drops the
 * connection, which is the ambiguous case the scripts must detect.
 */
async function startMock(dir, options = {}) {
  const storePath = path.join(dir, "store", "agents.json");
  const readStore = () => JSON.parse(fs.readFileSync(storePath, "utf8"));
  const writeStore = (s) => fs.writeFileSync(storePath, JSON.stringify(s, null, 2));

  const server = http.createServer((req, res) => {
    const url = new URL(req.url, "http://127.0.0.1");
    const parts = url.pathname.replace(/^\/api\//, "").split("/").filter(Boolean);
    const send = (code, obj) => {
      const body = JSON.stringify(obj);
      res.writeHead(code, { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(body) });
      res.end(body);
    };

    const idOf = (candidate) => Object.entries(AGENTS).find(([, v]) => v === candidate)?.[0];

    if (parts[0] === "agents" && parts[2] === "instructions-bundle" && req.method === "GET") {
      const file = path.join(dir, "live", parts[1], "instructions", url.searchParams.get("path") || "");
      if (!fs.existsSync(file)) return send(404, { error: "not_found" });
      return send(200, { path: url.searchParams.get("path"), content: fs.readFileSync(file, "utf8") });
    }

    if (parts[0] === "agents" && parts[2] === "instructions-bundle" && req.method === "PUT") {
      let raw = "";
      req.on("data", (c) => (raw += c));
      return req.on("end", () => {
        const id = parts[1];
        if (id === options.failId) return send(500, { error: "simulated_failure" });
        const body = JSON.parse(raw || "{}");
        const file = path.join(dir, "live", id, "instructions", body.path);
        fs.mkdirSync(path.dirname(file), { recursive: true });
        fs.writeFileSync(file, body.content);
        if (id === options.loseId) return req.socket.destroy(); // applied, response lost
        return send(200, { ok: true });
      });
    }

    if (parts[0] === "agents" && parts.length === 2 && req.method === "GET") {
      return send(200, {
        id: parts[1],
        name: idOf(parts[1]) ?? parts[1],
        adapterType: "opencode_local",
        status: "idle",
        adapterConfig: readStore()[parts[1]]?.adapterConfig ?? {},
      });
    }

    if (parts[0] === "agents" && parts.length === 2 && req.method === "PATCH") {
      let raw = "";
      req.on("data", (c) => (raw += c));
      return req.on("end", () => {
        const store = readStore();
        store[parts[1]].adapterConfig = JSON.parse(raw || "{}").adapterConfig ?? {};
        writeStore(store);
        return send(200, { ok: true });
      });
    }

    return send(404, { error: "unmocked" });
  });

  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const port = server.address().port;
  cleanupPorts.push(server);

  return {
    api: `http://127.0.0.1:${port}/api`,
    close: () => new Promise((resolve) => server.close(resolve)),
  };
}

// The mock server runs in this same process, so the script under test must be
// awaited asynchronously — a synchronous spawn would block the event loop and
// the server could never answer, making every request hang until curl's timeout.
function runScript(script, workDir, api) {
  return new Promise((resolve) => {
    const child = spawn("bash", [script], {
      cwd: workDir,
      env: {
        ...process.env,
        PAPERCLIP_API: api,
        PKG_DIR: pkgDir,
        CAND_DIR: path.join(workDir, "cands"),
        ORIG_DIR: path.join(workDir, "orig"),
        STATE_DIR: path.join(workDir, "state"),
        LIVE_DIR: path.join(workDir, "live"),
      },
    });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (c) => (stdout += c));
    child.stderr.on("data", (c) => (stderr += c));
    child.on("close", (status) => resolve({ status, stdout, stderr }));
  });
}

const combined = (r) => `${r.stdout ?? ""}${r.stderr ?? ""}`;

/** Last recorded state per agent, from the append-only ledger. */
function latestStates(workDir) {
  const file = path.join(workDir, "state", "attempts.txt");
  if (!fs.existsSync(file)) return {};
  const latest = {};
  for (const line of fs.readFileSync(file, "utf8").trim().split("\n")) {
    if (!line) continue;
    const [label, id, state] = line.split("|");
    latest[label] = { id, state };
  }
  return latest;
}

test("activate applies all four bundles byte-exactly and preserves the policy block", async (t) => {
  const dir = makeWorkDir();
  seedWorkDir(dir);
  const mock = await startMock(dir);
  t.after(() => mock.close());

  const result = await runScript(activateScript, dir, mock.api);
  const output = combined(result);
  assert.equal(result.status, 0, `activation failed:\n${output}`);
  assert.match(output, /ACTIVATION COMPLETE/);

  for (const [label, id] of Object.entries(AGENTS)) {
    const candidate = fs.readFileSync(path.join(pkgDir, "candidates", `${label}.AGENTS.md`), "utf8");
    const original = fs.readFileSync(path.join(pkgDir, "original-live-bundles", `${label}.AGENTS.md`), "utf8");
    const live = currentBundle(dir, id);

    assert.equal(live, candidate, `${label}: bundle is not byte-exact`);
    // The network policy must survive activation untouched.
    assert.notEqual(policyBlock(live), null, `${label}: policy block missing after activation`);
    assert.equal(policyBlock(live), policyBlock(original), `${label}: policy block was altered`);
    assert.ok(live !== original, `${label}: activation was a no-op`);
  }

  const states = latestStates(dir);
  assert.deepEqual(
    Object.fromEntries(Object.entries(states).map(([k, v]) => [k, v.state])),
    { CodingLead: "updated", Coder1: "updated", Coder2: "updated", Reviewer: "updated" },
  );
});

test("activate refuses to reuse an existing state directory", async (t) => {
  const dir = makeWorkDir();
  seedWorkDir(dir);
  const mock = await startMock(dir);
  t.after(() => mock.close());

  assert.equal((await runScript(activateScript, dir, mock.api)).status, 0);
  const second = await runScript(activateScript, dir, mock.api);
  assert.notEqual(second.status, 0, "second activation should refuse");
  assert.match(combined(second), /already exists/);
});

test("activate reconciles and stops on HTTP 500 without touching later agents", async (t) => {
  const dir = makeWorkDir();
  seedWorkDir(dir);
  // Fail the second agent, so the first is applied and the rest are untouched.
  const failing = AGENTS.Coder1;
  const mock = await startMock(dir, { failId: failing });
  t.after(() => mock.close());

  const result = await runScript(activateScript, dir, mock.api);
  const output = combined(result);
  assert.notEqual(result.status, 0, "activation should fail loudly");
  assert.match(output, /RECONCILING/);
  assert.match(output, /state recorded: unknown/);

  const states = latestStates(dir);
  assert.equal(states.CodingLead?.state, "updated", "the completed agent should stay 'updated'");
  assert.equal(states.Coder1?.state, "unknown", "the ambiguous agent must be 'unknown'");
  assert.equal(states.Coder2, undefined, "must not proceed past the failure");
  assert.equal(states.Reviewer, undefined, "must not proceed past the failure");

  // Recovery evidence for the ambiguous agent must exist for a human to act on.
  assert.ok(fs.existsSync(path.join(dir, "state", "recon.Coder1.txt")), "missing recon record");
  const recon = fs.readFileSync(path.join(dir, "state", "recon.Coder1.txt"), "utf8");
  assert.match(recon, /reason=http_status_500/);
});

test("activate treats an applied-but-unacknowledged write as unknown", async (t) => {
  const dir = makeWorkDir();
  seedWorkDir(dir);
  // The write lands, but the response never arrives.
  const mock = await startMock(dir, { loseId: AGENTS.CodingLead });
  t.after(() => mock.close());

  const result = await runScript(activateScript, dir, mock.api);
  const output = combined(result);
  assert.notEqual(result.status, 0, "an unacknowledged write must not be treated as success");
  assert.match(output, /RECONCILING/);
  assert.equal(latestStates(dir).CodingLead?.state, "unknown");

  // The write really did land — which is exactly why this is ambiguous, and
  // why the ledger must not claim "updated".
  assert.equal(
    currentBundle(dir, AGENTS.CodingLead),
    fs.readFileSync(path.join(pkgDir, "candidates", "CodingLead.AGENTS.md"), "utf8"),
  );
});

test("activate refuses a candidate whose policy block was tampered with", async (t) => {
  const dir = makeWorkDir();
  seedWorkDir(dir);

  // Rewrite the network policy inside the candidate. The content check cannot
  // catch this on its own — the script writes exactly what it was given — so
  // the guard is the independent comparison against the saved original.
  const candidatePath = path.join(dir, "cands", "CodingLead.AGENTS.md");
  const original = fs.readFileSync(path.join(pkgDir, "original-live-bundles", "CodingLead.AGENTS.md"), "utf8");
  const candidate = fs.readFileSync(candidatePath, "utf8");
  fs.writeFileSync(
    candidatePath,
    `${candidate.slice(0, candidate.indexOf(POLICY_MARKER))}${POLICY_MARKER}\nALLOW_ALL_TRAFFIC=true\n`,
  );

  const mock = await startMock(dir);
  t.after(() => mock.close());

  const result = await runScript(activateScript, dir, mock.api);
  const output = combined(result);
  assert.notEqual(result.status, 0, "a tampered policy block must abort activation");
  assert.match(output, /POLICY BLOCK ALTERED/);
  assert.equal(latestStates(dir).CodingLead?.state, "unknown");
});

test("rollback refuses while an agent's latest state is unresolved", async (t) => {
  const dir = makeWorkDir();
  seedWorkDir(dir);
  const mock = await startMock(dir, { failId: AGENTS.Coder1 });
  t.after(() => mock.close());

  assert.notEqual((await runScript(activateScript, dir, mock.api)).status, 0);
  const result = await runScript(rollbackScript, dir, mock.api);
  const output = combined(result);
  assert.notEqual(result.status, 0, "rollback must refuse after a partial activation");
  assert.match(output, /unresolved latest state/);
});

test("rollback restores the original bundles", async (t) => {
  const dir = makeWorkDir();
  seedWorkDir(dir);
  const mock = await startMock(dir);
  t.after(() => mock.close());

  assert.equal((await runScript(activateScript, dir, mock.api)).status, 0);
  const result = await runScript(rollbackScript, dir, mock.api);
  const output = combined(result);
  assert.equal(result.status, 0, `rollback failed:\n${output}`);

  for (const [label, id] of Object.entries(AGENTS)) {
    const original = fs.readFileSync(path.join(pkgDir, "original-live-bundles", `${label}.AGENTS.md`), "utf8");
    assert.equal(currentBundle(dir, id), original, `${label}: bundle was not restored`);
  }

  const store = JSON.parse(fs.readFileSync(path.join(dir, "store", "agents.json"), "utf8"));
  for (const [label, id] of Object.entries(AGENTS)) {
    assert.equal(store[id].adapterConfig.instructionsBundleMode, "managed", `${label}: config not restored`);
    assert.equal(store[id].adapterConfig.model, "x/y", `${label}: config not restored`);
  }
});

test("rollback refuses when there is no ledger at all", async (t) => {
  const dir = makeWorkDir();
  seedWorkDir(dir);
  const mock = await startMock(dir);
  t.after(() => mock.close());

  const result = await runScript(rollbackScript, dir, mock.api);
  assert.notEqual(result.status, 0);
  assert.match(combined(result), /no activation ledger/);
});

test.after(() => {
  for (const server of cleanupPorts) server.close();
  for (const dir of cleanupDirs) fs.rmSync(dir, { recursive: true, force: true });
});
