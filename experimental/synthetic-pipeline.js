"use strict";
/**
 * NK-Pro 2.0 – Synthetic end-to-end integration runner, NOT production billing.
 * The only accepted input is an explicit in-memory synthetic fixture. No DOM,
 * network, persistence, PDF, legacy data import or archive mutation.
 * Failed, missing and unported checks NEVER become green due to other passes.
 */
const crypto = require("node:crypto");
const bridge = require("./legacy-fixture-bridge.js");
const quality = require("./quality-contract.js");
const water = require("./water-2025.js");
const external = require("./external-techem.js");
const letters = require("./letter-preflight.js");

const own = (o,k)=>o!=null && Object.prototype.hasOwnProperty.call(o,k);
const canonical = v => {
  if(Array.isArray(v))return v.map(canonical);
  if(v && typeof v==="object")return Object.fromEntries(Object.keys(v).sort().map(k=>[k,canonical(v[k])]));
  return v;
};
const hash = v => crypto.createHash("sha256").update(JSON.stringify(canonical(v))).digest("hex");
function run(input, options = {}) {
  if(!input || input.fixtureKind!=="synthetic" || !input.legacy || input.legacy.fixtureKind!=="synthetic")
    throw new TypeError("Synthetic-only orchestrator rejects untagged or actual billing data");
  if(options!=null && (typeof options!=="object" || Array.isArray(options)))
    throw new TypeError("Invalid synthetic runner options");

  const projected = bridge.project(input.legacy);
  const model = projected.normalized;
  const q = quality.evaluateEarly(model.qualityInput);
  const problems = [];
  const add = (code, severity, scope, reference = "", info = {}) => {
    problems.push({code,severity,scope,reference,...info});
  };
  for(const issue of projected.issues)
    add(issue.code,"critical","schema",issue.field||issue.entity);
  for(const row of q.rows){
    if(row.status!=="critical")continue;
    for(const finding of row.findings)
      add(finding.code,"critical","quality",row.ruleId,{ruleId:row.ruleId,
        sourceId:finding.id||finding.unitId||null});
  }

  // Fingerprint only explicitly projected domain fields, never arbitrary tokens or
  // personal data that may have been present in the original shaped object.
  const waterSignature=hash(model.waterData);
  const w=water.diagnostics(model.waterData);
  let externalResult=null,externalSignature=null;
  if(!model.providerInput){
    add("EXTERNAL_SOURCE_MISSING","critical","provider","umlageInputs");
  } else {
    externalSignature=hash(model.providerInput);
    try {
      externalResult=external.calculateExternal(model.providerInput);
    } catch(error) {
      add("EXTERNAL_CALCULATION_ERROR","critical","provider","umlageInputs",
        {details: "Synthetic external calculation rejected invalid input"});
    }
  }
  const decisions=own(options,"decisions")&&options.decisions&&typeof options.decisions==="object"
    ?options.decisions:{};
  let accepted=0;
  const decision=(code,scope,signature,reference="",extra={})=>{
    const d=decisions[code];
    const verified=!!d && typeof d==="object" &&
      d.signature===signature && typeof d.reason==="string" &&
      d.reason.trim().length>=10;
    if(verified)accepted++;
    add(code,verified?"accepted":"decision",scope,reference,{signature,...extra});
  };
  for(const issue of w.issues||[]){
    const code="WATER_"+issue.code+(issue.index??"");
    if(issue.code==="HOUSE_UNITS_DIFFERENCE")
      decision(code,"water",waterSignature,"waterMeters",{amount:issue.gap});
    else add(code,"critical","water","waterMeters",
      {index:issue.index??null});
  }
  if(externalResult)for(const issue of externalResult.issues){
    const code="EXTERNAL_"+issue.code+(issue.caseKey||"");
    if(issue.code==="UNCLASSIFIED_OWNER_BALANCE")
      decision(code,"provider",externalSignature,"umlageInputs",{amount:issue.amount});
    else add(code,"critical","provider",issue.caseKey||"umlageInputs");
  }

  // This is a data-only letter preflight. It deliberately never generates
  // documents, nor can it say the PDF/print output is ready.
  const expectedIds=model.tenants.map(t=>t.id);
  let letterReport=null;
  if(!input.letterBundle || input.letterBundle.fixtureKind!=="synthetic"){
    add("LETTERS_NOT_PROVIDED","critical","documents","letters");
  } else {
    const bundle={...input.letterBundle,expectedTenantIds:expectedIds};
    try {
      letterReport=letters.prepareAll(bundle);
      for(const tenantId of letterReport.missingRecipients)
        add("MISSING_RECIPIENT_LETTER","critical","documents","letters",
          {sourceId:tenantId});
      for(let i=0;i<letterReport.reports.length;i++){
        for(const err of letterReport.reports[i].errors)
          add(err.code,"critical","documents",err.field||"",{documentIndex:i});
      }
    } catch(error) {
      add("LETTER_PREFLIGHT_ERROR","critical","documents","letters",
        {details:"The synthetic document bundle is structurally invalid"});
    }
  }

  // The complete ORIGINAL 44-rule execution, real letters and archive are
  // not migrated. These gates must remain false even when the subset is clear.
  const critical=problems.filter(p=>p.severity==="critical").length;
  const openDecisions=problems.filter(p=>p.severity==="decision").length;
  const missing=["37 original quality rules not ported",
    "Original full-year settlement and owner reconciliation parity",
    "All-recipient letter rendering / A4 / PDF preflight",
    "Immutable archive and guarded original JSON migration",
    "Dedicated browser origin and security acceptance"];
  return {
    kind:"synthetic-integration-report",version:"1.0.0",
    sourceSchema:projected.sourceSchema,
    counts:{
      units:projected.counts.units,participants:projected.counts.tenants,
      costs:projected.counts.costs,waterMeters:projected.counts.readings,
      qualityRules:44,qualitySubsetExecuted:q.counts.experimental,
      qualityRulesNotRun:q.counts.notRun,
      critical,openDecisions,acceptedDecisions:accepted
    },
    sections:{
      schema:{issues:projected.issues.length},
      quality:{experimental:q.counts.experimental,notRun:q.counts.notRun,
        critical:q.counts.critical},
      water:{supported:!!w.supported,house:w.house??null,
        units:w.units??null,gap:w.gap??null},
      provider:externalResult?{
        ownerShare:externalResult.ownerShare,
        externalOwnerShare:externalResult.externalOwnerShare,
        vacancyShare:externalResult.vacancyShare,
        unclassifiedOwnerShare:externalResult.unclassifiedOwnerShare,
        errorCount:externalResult.issues.length
      }:{supported:false},
      documents:letterReport?{
        expected:expectedIds.length,produced:letterReport.produced,
        missingRecipients:letterReport.missingRecipients.length,
        dataReady:letterReport.dataReady,readyForPrint:false
      }:{expected:expectedIds.length,produced:0,dataReady:false,readyForPrint:false}
    },
    findings:problems,
    experimentalSubsetClear:critical===0 && openDecisions===0,
    // Intentionally independent of experimentalSubsetClear.
    readyForRealFinalization:false,
    missingGates:missing,
    fingerprint:{
      // Digests are used only to detect changes during synthetic tests.
      water:waterSignature,provider:externalSignature
    }
  };
}
module.exports=Object.freeze({run,version:"synthetic-pipeline-1"});
