"use strict";
const {test}=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const p=path.join(__dirname,"..");
const app=fs.readFileSync(path.join(p,"app.js"),"utf8");
const index=fs.readFileSync(path.join(p,"index.html"),"utf8");
test("water editor includes KW and WW source readings, dates, meter number and note",()=>{
 for(const key of ["meterGroup('cold')","meterGroup('hot')","Number","StartDate","EndDate",
  "waterNote","houseMeterNumber","houseStart","houseEnd","invoiceNote"])
  assert.ok(app.includes(key),"Missing field: "+key);
});
test("water overview shows EUR/m3 price and both water reconciliation differences",()=>{
 for(const text of ["Preis je m³","delta.invoiceHouse","delta.houseUnits",
  "edit-water-price","cost-master-table","costPricePreview","invoiceConsumption","Notiz / Bemerkung","priceMode","unitPrice"])
  assert.ok(app.includes(text),"Missing UI: "+text);
});
test("domain modules load in order and original production browser data stays out of scope",()=>{
 assert.ok(index.indexOf("./water-detail.js")<index.indexOf("./synthetic-billing.js"));
 assert.ok(index.indexOf("./synthetic-billing.js")<index.indexOf("./app.js"));
 assert.ok(!/nkpro_browser_v85_qualitaets_cockpit_data|\/drive\/v3\/files/.test(app));
});
