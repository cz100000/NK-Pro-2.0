"use strict";
/**
 * NK-Pro 2.0 experimental schema-5 legacy state projection (PREVIEW ONLY).
 * Only explicitly synthetic fixtures may be projected.
 * No writing, persistence, network, raw JSON import, archive edits or printing.
 * Unknown production fields and identity conflicts must be resolved before migration.
 */
const text=v=>String(v??"").trim();
const number=v=>v===null||v===undefined||v===""?null:
 Number.isFinite(Number(v))?Number(v):null;
const plain=v=>v!==null&&typeof v==="object"&&!Array.isArray(v);
function project(source){
 if(!source||source.fixtureKind!=="synthetic"||!plain(source.state))
   throw new TypeError("Only explicitly synthetic in-memory schema-5 test fixtures are accepted");
 const state=source.state,meta=plain(state.meta)?state.meta:{};
 const issues=[];
 const problem=(code,entity="",field="")=>issues.push({code,entity,field});
 const period={year:text(meta.abrechnungsjahr),start:text(meta.abrechnungsbeginn),end:text(meta.abrechnungsende)};
 if(!period.year||!period.start||!period.end)problem("INCOMPLETE_BILLING_PERIOD","","meta");
 const schema=number(meta.dataSchemaVersion);
 if(schema!==5)problem("UNSUPPORTED_SCHEMA_VERSION","","meta.dataSchemaVersion");
 if(!Array.isArray(state.wohnungen))problem("MISSING_UNITS");
 if(!Array.isArray(state.mieter))problem("MISSING_TENANTS");
 if(!Array.isArray(state.kostenarten))problem("MISSING_COSTS");
 const seenUnits=new Set(),seenTenants=new Set(),seenCosts=new Set();
 const units=(Array.isArray(state.wohnungen)?state.wohnungen:[]).map((u,i)=>{
   const id=text(u?.id),area=number(u?.wohnflaeche);
   if(!id||seenUnits.has(id))problem("INVALID_UNIT_ID",id,"wohnungen["+i+"].id");
   seenUnits.add(id);
   if(area===null||area<=0)problem("UNCONFIRMED_UNIT_AREA",id,"wohnungen["+i+"].wohnflaeche");
   return{id,label:text(u?.bezeichnung)||id,status:text(u?.status)||"unconfirmed",
     active:text(u?.status).toLowerCase()!=="inaktiv",area};
 });
 const tenants=(Array.isArray(state.mieter)?state.mieter:[]).map((t,i)=>{
   const id=text(t?.id),unitId=text(t?.wohnung);
   if(!id||seenTenants.has(id))problem("INVALID_TENANT_ID",id,"mieter["+i+"].id");
   seenTenants.add(id);
   if(!unitId||!seenUnits.has(unitId))problem("INVALID_UNIT_REFERENCE",id,"mieter["+i+"].wohnung");
   const label=text(t?.abrechnungRolle||t?.nutzungsart);
   const privateUse=/privat|eigen/i.test(label);
   return{id,unitId,name:text(t?.name),start:text(t?.einzug),end:text(t?.auszug),
     private:privateUse,role:label,originalIndex:i};
 });
 const costs=(Array.isArray(state.kostenarten)?state.kostenarten:[]).map((c,i)=>{
   const id=text(c?.id),amount=number(c?.gesamtbetrag),enabled:text(c?.inNK)==="Ja";
   if(!id||seenCosts.has(id))problem("INVALID_COST_ID",id,"kostenarten["+i+"].id");
   seenCosts.add(id);
   if(enabled&&(amount===null||amount<0))problem("INVALID_COST_TOTAL",id,"kostenarten["+i+"].gesamtbetrag");
   const basis=text(c?.umlageschluessel),mode=text(c?.berechnungsart);
   if(enabled&&!basis)problem("MISSING_COST_BASIS",id,"kostenarten["+i+"].umlageschluessel");
   return{id,name:text(c?.kostenart),amount,enabled,basis,mode,
     source:{id,amountField:"gesamtbetrag",activeField:"inNK"}};
 });
 // Never assume one apartment meter = one tenant or that index is a reliable ID.
 const readings=Array.isArray(state.waterMeters?.readings)?state.waterMeters.readings:[];
 const meterIds=new Set();
 const waterReadings=readings.map((r,i)=>{
   const meterId=text(r?.meterId);
   if(!meterId||meterIds.has(meterId))problem("METER_IDENTITY_UNVERIFIED",meterId,"waterMeters.readings["+i+"].meterId");
   meterIds.add(meterId);
   const record={meterId};
   for(const key of ["kwStart","kwEnd","wwStart","wwEnd"]){
     const raw=r?.[key],value=number(raw);
     if(value===null)problem("MISSING_METER_VALUE",meterId,key);
     record[key]=value;
   }
   return record;
 });
 const hasCanonicalMeters=plain(state.zaehlerDaten)&&
   (Array.isArray(state.zaehlerDaten.zaehler)||Array.isArray(state.zaehlerDaten.messperioden));
 if(hasCanonicalMeters)problem("CANONICAL_METER_PERIODS_NOT_YET_MAPPED","","zaehlerDaten");
 if(!readings.length)problem("NO_LEGACY_METER_READINGS","","waterMeters.readings");
 const house=number(state.waterMeters?.settings?.houseWaterTotal);
 if(house===null)problem("UNCONFIRMED_HOUSE_WATER","","waterMeters.settings.houseWaterTotal");
 const waterData={
   meta:{abrechnungsjahr:period.year,
     ...(plain(meta.confirmed2025Evidence)?{confirmed2025Evidence:JSON.parse(JSON.stringify(meta.confirmed2025Evidence))}:{})},
   waterMeters:{settings:{houseWaterTotal:house},readings:waterReadings}
 };
 let providerInput=null;
 if(text(source.providerCostId)){
   const id=text(source.providerCostId),cost=costs.find(c=>c.id===id);
   const input=plain(state.umlageInputs)&&plain(state.umlageInputs[id])?state.umlageInputs[id]:null;
   if(!cost||!cost.enabled||!input)problem("PROVIDER_SOURCE_INCOMPLETE",id,"umlageInputs");
   else{
     const mode=text(input.mode||input.art);
     if(mode!=="Externe Einzelabrechnung")problem("PROVIDER_MODE_NOT_CONFIRMED",id,"umlageInputs.mode");
     const raw=plain(input.caseValues)?input.caseValues:{};
     const values={};
     for(const [caseKey,record] of Object.entries(raw)){
       const rawAmount=plain(record)?(record.amount??record.value):record;
       const amount=number(rawAmount);
       if(amount===null)problem("PROVIDER_CASE_AMOUNT_INVALID",id,caseKey);
       else values[caseKey]=amount;
     }
     const owner=number(input.externalBilling?.includedOwnerShare);
     if(owner===null)problem("OWNER_SHARE_NOT_CONFIRMED",id,"umlageInputs.externalBilling.includedOwnerShare");
     providerInput={period:{start:period.start,end:period.end},
       units:units.map(u=>({id:u.id})),
       tenants:tenants.map(t=>({id:t.id,unitId:t.unitId,start:t.start||period.start,
         end:t.end||period.end,private:t.private})),
       cost:{id,amount:cost.amount,method:"Externe Einzelabrechnung"},
       values,externalOwnerShare:owner};
   }
 }
 const qualityInput={
   fixtureKind:"synthetic",period,units:units.map(x=>({id:x.id,status:x.status})),
   tenants:tenants.map(x=>({id:x.id,name:x.name,unitId:x.unitId,start:x.start,end:x.end,private:x.private}))
 };
 return {
   mode:"read-only-preview",sourceSchema:schema,sourceFingerprint:null,
   normalized:{period,units,tenants,costs,waterData,providerInput,qualityInput},
   counts:{units:units.length,tenants:tenants.length,costs:costs.length,readings:waterReadings.length},
   issues,reviewRequired:issues.length>0,
   migrationPermitted:false,readyForRealFinalization:false
 };
}
module.exports=Object.freeze({project,version:"schema5-preview-1"});
