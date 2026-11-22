"use strict";
const {test}=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
test("published version label and both synthetic and integrated asset versions",()=>{
 const html=fs.readFileSync(path.join(__dirname,"..","index.html"),"utf8");
 assert.match(html,/sidebar-version">NK-Pro 2\.0 · Synchronisierung 0\.16/);
 assert.doesNotMatch(html,/Fachtest 0\.7/);
 for(const asset of ["styles.css","demo-ledger.js","experimental/settlement-cost.js",
   "water-detail.js","synthetic-billing.js","synthetic-property.js","synthetic-case-billing.js","synthetic-workflow.js","synthetic-letters.js","legacy-letter-engine.js","letter-workspace-ui.js","legacy-landlord-documents.js","synthetic-review.js","synthetic-estate.js","synthetic-master-ui.js"]){
   assert.ok(html.includes('./'+asset+'?v=0.13'),asset+" not versioned");
 }
 for(const asset of ["app.js","integrated-data.js","integrated-app.js","integrated-ui.css",
  "private/private-model.js","private/vault-crypto.js","private/drive-adapter.js"])
   assert.ok(html.includes("./"+asset+"?v=0.16"),asset+" integration asset not versioned");
 assert.ok(html.includes('href="./nkpro2.webmanifest"'));
 assert.ok(html.indexOf("water-detail.js")<html.indexOf("synthetic-billing.js"));
 assert.ok(html.indexOf("synthetic-property.js")<html.indexOf("synthetic-case-billing.js"));
});