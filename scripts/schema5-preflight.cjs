#!/usr/bin/env node
"use strict";
/*
 * Local/offline preflight only: node scripts/schema5-preflight.cjs /private/path/export.json
 * Never prints names, addresses, raw JSON or invoice amounts; does not save data.
 * Do not execute with real data inside a publicly accessible CI or server.
 */
const fs = require("node:fs");
const {preflight} = require("../migration/schema5-preflight.cjs");
function run() {
  if (process.argv.length !== 3) {
    process.stderr.write("Usage: node scripts/schema5-preflight.cjs <private-local-backup.json>\n");
    process.exitCode = 64;
    return;
  }
  let source;
  try {
    source = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
  } catch {
    process.stderr.write("Could not read a valid local JSON source; no data was imported.\n");
    process.exitCode = 65;
    return;
  }
  const report = preflight(source);
  process.stdout.write(JSON.stringify(report, null, 2) + "\n");
  // Preflight cannot authorize import; nonzero status means unresolved blocking issues.
  if (report.blockers) process.exitCode = 2;
}
run();
