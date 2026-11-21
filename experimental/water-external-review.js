/* NK-Pro 2.0 – experimental combined water/external readiness.
   This can ONLY evaluate synthetic fixtures and is not connected to the live site.
   The production readiness gate is intentionally hard-closed until all V99.4.86 checks,
   documents and data migration have passed independent acceptance. */
(function(root,factory){
"use strict";
const mod=Object.freeze(factory(
  typeof module!=="undefined"&&module.exports?require("./water-2025.js"):root.NKPRO2_EXPERIMENTAL_WATER,
  typeof module!=="undefined"&&module.exports?require("./external-techem.js"):root.NKPRO2_EXPERIMENTAL_EXTERNAL
));
if(typeof module!=="undefined"&&module.exports)module.exports=mod;
else root.NKPRO2_EXPERIMENTAL_REVIEW=mod;
})(typeof globalThis!=="undefined"?globalThis:this,function(water,external){
"use strict";
if(!water||!external)throw new Error("Experimental domain adapters are required");
function canonical(value){
 if(Array.isArray(value))return value.map(canonical);
 if(value&&typeof value==="object")return Object.fromEntries(Object.keys(value).sort().map(key=>[key,canonical(value[key])]));
 return value;
}
function fingerprint(value){
 const s=JSON.stringify(canonical(value));let h=0x811c9dc5;
 for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,0x01000193);}
 return(h>>>0).toString(16).padStart(8,"0");
}
const waterSource=d=>({
 meta:d.meta,
 house:d.waterMeters&&d.waterMeters.settings&&d.waterMeters.settings.houseWaterTotal,
 readings:d.waterMeters&&d.waterMeters.readings
});
const providerSource=x=>({
 period:x.period,units:x.units,tenants:x.tenants,cost:x.cost,
 values:x.values,externalOwnerShare:x.externalOwnerShare
});
function audit({waterData,providerInput,decisions={}}={}){
 const w=water.diagnostics(waterData);
 const ex=external.calculateExternal(providerInput);
 const waterHash=fingerprint(waterSource(waterData)),externalHash=fingerprint(providerSource(providerInput));
 const checks=[];
 function add(id,severity,area,message,signature,action,extra={}){
  const saved=decisions&&decisions[id];
  const accepted=severity==="decision" && saved && saved.signature===signature
    && typeof saved.reason==="string"&&saved.reason.trim().length>=5;
  checks.push({id,severity,status:accepted?"accepted":"open",area,message,signature,action,...extra});
 }
 for(const issue of w.issues||[]){
  let severity="critical";
  if(issue.code==="HOUSE_UNITS_DIFFERENCE")severity="decision";
  add("WATER_"+issue.code+(issue.index??""),severity,"water",issue.code,waterHash,
    "inspect-meter",{amount:issue.gap??null,sourceIndex:issue.index??null});
 }
 for(const issue of ex.issues||[]){
  const severity=issue.code==="UNCLASSIFIED_OWNER_BALANCE"?"decision":"critical";
  add("EXTERNAL_"+issue.code+(issue.caseKey||""),severity,"provider",issue.code,externalHash,
    "inspect-provider",{amount:issue.amount??issue.difference??null,caseKey:issue.caseKey??null});
 }
 const openCritical=checks.filter(c=>c.severity==="critical");
 const openDecisions=checks.filter(c=>c.severity==="decision"&&c.status!=="accepted");
 const acceptedDecisions=checks.filter(c=>c.severity==="decision"&&c.status==="accepted");
 return{
  scope:"synthetic-experimental-subset",
  checks,water:{house:w.house,units:w.units,gap:w.gap,status:w.status},
  provider:{total:providerInput.cost.amount,ownerShare:ex.ownerShare,
    vacancyShare:ex.vacancyShare,externalOwnerShare:ex.externalOwnerShare,
    excludedOwnerShare:ex.excludedOwnerShare,documentedOwnerShare:ex.documentedOwnerShare,
    unclassifiedOwnerShare:ex.unclassifiedOwnerShare},
  counts:{critical:openCritical.length,decisions:openDecisions.length,accepted:acceptedDecisions.length},
  experimentalChecksClear:openCritical.length===0&&openDecisions.length===0,
  readyForRealFinalization:false, // NO override or decision can bypass this
  missingGates:["V99.4.86 full quality registry","full legacy billing parity",
    "private data migration","all recipient letters and print preflight","immutable archive"]
 };
}
return{audit,fingerprint,version:"synthetic-review-1"};
});
