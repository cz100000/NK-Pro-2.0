"use strict";
const {test}=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const crypto=require("node:crypto");
const cov=require("../contracts/legacy-coverage.json");
const dir=path.join(__dirname,"reference");
const sourceNav=fs.readFileSync(path.join(dir,"navigation-v99.4.86.js"),"utf8");
const sourceRules=fs.readFileSync(path.join(dir,"quality-rules-v99.4.86.js"),"utf8");
function sha(content){return crypto.createHash("sha1").update("blob "+Buffer.byteLength(content)+"\0").update(content).digest("hex")}
const actualTabs=[...sourceNav.matchAll(/"tab": "([^"]+)"/g)].map(x=>x[1]);
const actualRules=[...sourceRules.matchAll(/rule\("([A-Z0-9-]+)","([^"]+)",CATEGORY\.([A-Z]+),"([^"]+)"/g)].map(x=>x[1]);
const explicitInternal=["sicherung","export","objektuebersicht","verbraeuche"];
test("navigation and rules remain pinned to V99.4.86 exact file sources",()=>{
  assert.equal(sha(sourceNav),cov.source.codeBlobs["js/navigation.js"]);
  assert.equal(sha(sourceRules),cov.source.codeBlobs["js/quality-rules.js"]);
  assert.equal(cov.source.commit,"a089e1fe660dd5502799560efe2bc4b65a09f278");
});
test("all old navigation entries and internal views are mapped without loss",()=>{
  assert.equal(actualTabs.length,17);
  assert.equal(cov.pages.length,21);
  assert.deepEqual(new Set(cov.pages.map(x=>x.id)),new Set([...actualTabs,...explicitInternal]));
  assert.equal(new Set(cov.pages.map(x=>x.id)).size,cov.pages.length);
  for(const p of cov.pages){
    assert.ok(cov.targetAreas.includes(p.targetArea),p.id+" no domain");
    assert.ok(p.targetScreen && p.migration,p.id+" no target");
    assert.ok(cov.pageStatusEnum.includes(p.status),p.id+" invalid status");
  }
});
test("all existing quality rules have target and honest unported status",()=>{
  assert.equal(actualRules.length,44);
  assert.equal(cov.rules.length,44);
  assert.deepEqual(new Set(cov.rules.map(x=>x.id)),new Set(actualRules));
  assert.equal(new Set(cov.rules.map(x=>x.id)).size,44);
  for(const r of cov.rules){
    assert.ok(cov.targetAreas.includes(r.targetArea),r.id+" no domain");
    assert.ok(cov.ruleStatusEnum.includes(r.status),r.id+" invalid status");
  }
});
test("original cost is not falsely declared fully migrated",()=>{
  assert.ok(cov.pages.some(p=>p.status==="planned"));
  assert.ok(cov.rules.every(r=>r.status==="not-ported"));
});
