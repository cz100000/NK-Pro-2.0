"use strict";
/**
 * NK-Pro 2.0 experimental review kernel.
 * Full 44-rule REGISTRY metadata from pinned V99.4.86; seven early-data checks
 * are independently implemented for synthetic models only (NOT reference-parity approved).
 *
 * No browser DOM, storage, network, real data import, confirmation writes or finalization.
 * "not-run" is never equal to "passed" or "not-applicable".
 */
const catalog=require("../contracts/legacy-quality-registry.json");
const EARLY_RULES=Object.freeze([
  "NKP-FACH-001","NKP-FACH-002","NKP-FACH-003","NKP-FACH-004",
  "NKP-FACH-005","NKP-FACH-006","NKP-FACH-007"
]);
const allowed=new Set(EARLY_RULES);
const toText=value=>String(value??"").trim();
function date(value){
 const s=toText(value);
 if(!/^\d{4}-\d{2}-\d{2}$/.test(s))return null;
 const d=new Date(s+"T00:00:00Z");
 return Number.isFinite(d.getTime())&&d.toISOString().slice(0,10)===s?s:null;
}
function maxDate(...dates){return dates.filter(Boolean).sort().at(-1)||null;}
function minDate(...dates){return dates.filter(Boolean).sort()[0]||null;}
function overlap(a,b,start,end){
 const lo=maxDate(a,start),hi=minDate(b,end);
 return lo&&hi&&lo<=hi?{start:lo,end:hi}:null;
}
function evaluateEarly(model){
 if(!model||model.fixtureKind!=="synthetic")
   throw new TypeError("Synthetic-only contract: do not pass actual tenant data");
 const units=Array.isArray(model.units)?model.units:[],
       tenants=Array.isArray(model.tenants)?model.tenants:[],
       period=model.period||{},year=toText(period.year),
       start=date(period.start),end=date(period.end);
 const results=new Map();
 function add(id,findings,summary){
  const problems=Array.isArray(findings)?findings:[];
  results.set(id,{id,execution:"experimental-not-reference-verified",
    status:problems.length?"critical":"passed",findings:problems.map(x=>({...x})),
    summary:problems.length?problems.length+" Eingabemangel/-mängel":summary});
 }
 const badPeriod=[];
 if(!start)badPeriod.push({code:"INVALID_START",field:"period.start"});
 if(!end)badPeriod.push({code:"INVALID_END",field:"period.end"});
 if(start&&end&&start>end)badPeriod.push({code:"REVERSED_PERIOD"});
 if(end&&year!==end.slice(0,4))badPeriod.push({code:"YEAR_MISMATCH"});
 add("NKP-FACH-001",badPeriod,"Abrechnungszeitraum plausibel.");
 const active=units.filter(u=>u&&toText(u.id)&&toText(u.status).toLowerCase()!=="inaktiv");
 add("NKP-FACH-002",active.length?[]:[{code:"NO_ACTIVE_UNITS"}],
   active.length+" aktive Wohnung(en).");
 const present=tenants.filter(t=>t&&toText(t.id)&&toText(t.unitId)&&
   (start&&end?!!overlap(date(t.start)||start,date(t.end)||end,start,end):true));
 // The role/private-use annotation is NOT an exclusion criterion.
 add("NKP-FACH-003",present.length?[]:[{code:"NO_SETTLEMENT_PARTICIPANTS"}],
   present.length+" Abrechnungsteilnehmer (inklusive Privatanteil).");
 add("NKP-FACH-004",present.filter(t=>!toText(t.name)).map(t=>({
   code:"MISSING_NAME",id:toText(t.id),field:"tenants.name"
 })),"Alle Teilnehmer haben einen Namen.");
 const unitIds=new Set(units.filter(Boolean).map(u=>toText(u.id)));
 add("NKP-FACH-005",tenants.filter(t=>t&&(!toText(t.unitId)||!unitIds.has(toText(t.unitId))))
   .map(t=>({code:"UNIT_LINK_INVALID",id:toText(t.id),unitId:toText(t.unitId)})),
   "Alle Mietverhältnisse sind existierenden Wohnungen zugeordnet.");
 add("NKP-FACH-006",tenants.filter(t=>t&&(
   (t.start&&!date(t.start))||(t.end&&!date(t.end))||
   (date(t.start)&&date(t.end)&&t.start>t.end)))
   .map(t=>({code:"TENANCY_DATES_INVALID",id:toText(t.id)})),
   "Alle Mietzeiträume sind plausibel.");
 const crossings=[];
 if(start&&end)for(let i=0;i<present.length;i++)for(let j=i+1;j<present.length;j++){
   const a=present[i],b=present[j];
   if(toText(a.unitId)!==toText(b.unitId))continue;
   const aRange=overlap(date(a.start)||start,date(a.end)||end,start,end);
   const bRange=overlap(date(b.start)||start,date(b.end)||end,start,end);
   if(aRange&&bRange&&aRange.start<=bRange.end&&bRange.start<=aRange.end)
     crossings.push({code:"OVERLAPPING_TENANCIES",unitId:a.unitId,
       tenantA:toText(a.id),tenantB:toText(b.id)});
 }
 add("NKP-FACH-007",crossings,"Keine Mietzeitraumüberschneidungen.");
 const catalogRows=catalog.rules.map(r=>{
  const actual=results.get(r.id);
  return{
   ruleId:r.id,title:r.title,group:r.group,category:r.category,
   blocking:r.blocking,confirmAllowed:r.confirmAllowed,
   targetTab:r.targetTab,targetSelector:r.targetSelector,
   // For all remaining rules, an unevaluated state can never be mistaken for green.
   execution:actual?.execution||"not-ported",
   status:actual?.status||"not-run",
   findings:actual?.findings||[],
   summary:actual?.summary||"Originalregel noch nicht implementiert/geprüft."
  };
 });
 const critical=catalogRows.filter(x=>x.status==="critical");
 const notRun=catalogRows.filter(x=>x.status==="not-run");
 const executed=catalogRows.filter(x=>x.execution!=="not-ported");
 return{
  engineVersion:"experimental-quality-1",
  sourceRef:catalog.source.commit,
  scope:"synthetic-only",
  counts:{total:catalogRows.length,experimental:executed.length,
    passed:executed.filter(x=>x.status==="passed").length,
    critical:critical.length,notRun:notRun.length},
  rows:catalogRows,
  complete:false, // Cannot be changed by caller, even with zero critical findings.
  readyForRealFinalization:false,
  missingRequirements:["Originalverhalten aller 44 Regeln prüfen",
    "Reale Abrechnungsdaten nur auf isolierter Hosting-Origin",
    "Dokumentpreflight aller Briefe","Immutable Archival Snapshot"]
 };
}
function registry(){return catalog.rules.map(row=>({...row}));}
module.exports=Object.freeze({EARLY_RULES,evaluateEarly,registry,version:"experimental-quality-1"});
