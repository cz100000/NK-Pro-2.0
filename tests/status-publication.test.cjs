"use strict";
const {test}=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const build=require("../scripts/build-status.cjs");
const tap=(count=100)=>"TAP version 13\n# tests "+count+"\n# pass "+count+"\n# fail 0\n";
test("public status generated from actual CI test counts",()=>{
 const r=build.manifest(tap(117),"a".repeat(40));
 assert.equal(r.tests.passed,117);
 assert.equal(r.inventory.qualityRules,44);
 assert.equal(r.inventory.notPortedRules,37);
 assert.equal(r.gates.realBilling,false);
 assert.equal(r.gates.realDataImport,false);
});
test("failed or truncated test summaries cannot generate a green publication status",()=>{
 assert.throws(()=>build.manifest("# tests 10\n# pass 9\n# fail 1\n"),/not all passing/);
 assert.throws(()=>build.manifest("# tests 10\n# pass 10\n"),/Missing TAP counter/);
});
test("untrusted revision text and unrelated source logs cannot leak",()=>{
 const marker="CONFIDENTIAL-SYNTHETIC-TOKEN";
 const r=build.manifest(tap()+"# comment "+marker+"\n",marker);
 assert.equal(r.revision,"unknown");
 assert.ok(!JSON.stringify(r).includes(marker));
});
test("public progress page uses no browser data storage or production data API",()=>{
 const root=path.join(__dirname,"..");
 const page=fs.readFileSync(path.join(root,"status.html"),"utf8");
 const js=fs.readFileSync(path.join(root,"status.js"),"utf8");
 assert.ok(page.includes("./status.js"));
 assert.ok(js.includes("./status.json"));
 assert.ok(!/localStorage|sessionStorage|indexedDB|oauthToken|drive\/v3/.test(page+js));
});
