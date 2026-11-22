"use strict";
const {test}=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
test("published version label matches the 0.4 water-and-cost UI assets",()=>{
 const html=fs.readFileSync(path.join(__dirname,"..","index.html"),"utf8");
 assert.match(html,/sidebar-version">Fachtest 0\.5 · 22\.11\.2026/);
 assert.doesNotMatch(html,/Fachtest 0\.4/);
 for(const asset of ["styles.css","demo-ledger.js","experimental/settlement-cost.js",
   "water-detail.js","synthetic-billing.js","app.js","synthetic-property.js","synthetic-case-billing.js"]){
   assert.ok(html.includes('./'+asset+'?v=0.5'),asset+" not versioned");
 }
 assert.ok(html.indexOf("water-detail.js")<html.indexOf("synthetic-billing.js"));
 assert.ok(html.indexOf("synthetic-property.js")<html.indexOf("synthetic-case-billing.js"));
});