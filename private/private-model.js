/* NK-Pro 2.0 – independent private data schema and read-only V99.4.81 intake.
   Domain records only: no runtime import, eval, legacy renderer or source-side write. */
(function(root,factory){"use strict";const api=Object.freeze(factory());
 if(typeof module!=="undefined"&&module.exports)module.exports=api;
 else root.NKPRO2_PRIVATE_MODEL=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(){"use strict";
 const FORMAT="nkpro2-private-portfolio-v1",SOURCE="nkpro-drive-snapshot-v1";
 const copy=x=>JSON.parse(JSON.stringify(x));
 const arr=x=>Array.isArray(x)?x:[];
 const obj=x=>x&&typeof x==="object"&&!Array.isArray(x);
 const required=(condition,code)=>{if(!condition)throw new Error(code);};
 const cents=n=>{required(typeof n==="number"&&Number.isFinite(n)&&
  Math.abs(n*100-Math.round(n*100))<1e-6,"NON_CENT_AMOUNT");
  return Math.round(n*100);};
 function fnv(text){let h=0x811c9dc5;for(let i=0;i<text.length;i++){
   h^=text.charCodeAt(i);h=Math.imul(h,0x01000193);
  }return(h>>>0).toString(16).padStart(8,"0");}
 function integrity(state){
  const meta=state&&state.meta;
  if(!obj(meta)||meta.storageIntegrityAlgorithm!=="FNV1A32"||
     !/^[0-9a-f]{8}$/.test(String(meta.storageIntegrityChecksum||"")))return false;
  const bare=copy(state);for(const k of ["storageIntegrityChecksum","storageIntegrityProtectedAt",
     "storageIntegrityProtectedWithAppVersion","storageIntegrityAlgorithm"])delete bare.meta[k];
  return fnv(JSON.stringify(bare))===meta.storageIntegrityChecksum;
 }
 const id=x=>String(x||"");
 function unique(items,selector,code){let s=new Set();for(const item of items){
  const key=id(selector(item));required(key&&!s.has(key),code);s.add(key);}return s;}
 function validateSource(input){
  required(obj(input)&&input.format===SOURCE&&obj(input.data),"SOURCE_FORMAT");
  required(id(input.snapshotId).length>=12,"SOURCE_SNAPSHOT_ID");
  const d=input.data;
  required(d.meta?.dataSchemaVersion===5&&d.meta.abrechnungsjahr==="2025","SOURCE_SCHEMA_YEAR");
  required(integrity(d),"SOURCE_INTEGRITY_FAILED");
  required(obj(d.objektStandard)&&obj(d.zaehlerDaten)&&obj(d.stammdaten),"SOURCE_MASTER_MISSING");
  required(arr(d.objektStandard.einheiten).length>0&&arr(d.stammdaten.mieter).length>0,
   "SOURCE_EMPTY_MASTER");
  const ids=unique(d.objektStandard.einheiten,x=>x.id,"SOURCE_UNIT_IDS");
  for(const u of d.objektStandard.einheiten)
   required(Number.isFinite(u.wohnflaeche)&&u.wohnflaeche>0,"SOURCE_UNIT_AREA");
  unique(d.stammdaten.mieter,x=>x.id,"SOURCE_TENANT_IDS");
  for(const t of d.stammdaten.mieter)required(ids.has(t.wohnung),"SOURCE_TENANT_UNIT");
  unique(d.kostenarten,x=>x.id,"SOURCE_COST_IDS");
  unique(d.zaehlerDaten.zaehler,x=>x.zaehlerId||x.meterId,"SOURCE_METER_IDS");
  for(const r of arr(d.zaehlerDaten.messwerte))
   required(Number.isFinite(r.wert),"SOURCE_METER_READING");
  for(const a of arr(d.jahresArchiv))required(obj(a.data)&&a.immutable===true,
   "SOURCE_ARCHIVE_NOT_IMMUTABLE");
  const byId=new Map(d.kostenarten.map(x=>[x.id,x]));
  const expected=d.meta.confirmed2025Evidence;
  if(expected){
   for(const [key,costId] of [["water","K002"],["waste","K009"],["techem","K006"]]){
    const evidence=expected[key]?.invoiceTotal??expected[key]?.total;
    required(evidence!==undefined&&byId.has(costId)&&cents(evidence)===cents(byId.get(costId).gesamtbetrag),
     "SOURCE_CONFIRMED_TOTAL_CONFLICT_"+costId);
   }
  }
  const external=d.umlageInputs?.K006?.externalBilling;
  if(external){
   const entries=Object.values(d.umlageInputs.K006.caseValues||{})
     .filter(x=>String(x?.source||"").includes("Techem Gesamtabrechnung 2025"));
   const itemCents=entries.reduce((sum,x)=>sum+cents(x.amount),0);
   required(itemCents+cents(external.includedOwnerShare)===cents(external.totalCost),
    "SOURCE_TECHEM_RECONCILIATION");
  }
  const w=d.waterMeters?.settings;
  if(w&&Number.isFinite(w.houseMeterStart)&&Number.isFinite(w.houseMeterEnd))
    required(w.houseMeterEnd-w.houseMeterStart===w.houseWaterTotal,"SOURCE_WATER_HOUSE_BALANCE");
  return d;
 }
 function migrate(snapshot){
  const source=copy(snapshot),d=validateSource(source);
  const canonical=d.objektStandard,meters=d.zaehlerDaten;
  const unitIds=new Set(canonical.einheiten.map(x=>x.id));
  const normalization=[];
  const units=canonical.einheiten.map(u=>({
   id:u.id,buildingId:u.gebaeudeId||null,label:u.bezeichnung||u.id,
   position:u.lage||"",areaSqm:u.wohnflaeche,rooms:u.zimmer||null,
   status:u.status||"aktiv",distributionBases:copy(u.verteilungsgrundlagen||{})
  }));
  const tenancies=d.stammdaten.mieter.map(t=>{
   const corrected=t.id==="M000"&&t.einzug!=="2010-01-01";
   if(corrected)normalization.push({code:"M000_START_CORRECTED",id:"M000",
    field:"leaseStart",original:t.einzug,revised:"2010-01-01",
    reason:"Confirmed historical master-date correction; archived snapshots untouched."});
   return {id:t.id,unitId:t.wohnung,name:t.name,leaseStart:corrected?"2010-01-01":t.einzug,
    leaseEnd:t.auszug||null,persons:t.personen,status:t.status,role:t.abrechnungRolle,
    privateUse:t.id==="M000",billingParticipant:true,
    address:{street:t.strasse||"",postalCode:t.plz||"",city:t.ort||""},
    originalSourceId:t.id,sourceOriginalLeaseStart:t.einzug};
  });
  const costTypes=canonical.kostenarten.map(k=>({
   id:k.id,name:k.bezeichnung||k.kostenart,category:k.bereich||"",
   method:k.umlageschluessel||"",eligible:k.umlagefaehig??(k.inNK==="Ja")
  }));
  const expenseRows=d.kostenarten.map(k=>({
   id:k.id,name:k.kostenart,category:k.bereich,amountCents:
     typeof k.gesamtbetrag==="number"?cents(k.gesamtbetrag):null,
   active:k.inNK==="Ja",allocationMethod:k.umlageschluessel,
   calculationMode:k.berechnungsart,status:k.status,description:k.bemerkung||"",
   sourcePricePerUnit:k.preisProEinheit,sourceConsumption:k.gesamtverbrauch
  }));
  const readings=arr(meters.messwerte).map(r=>({
   id:r.messwertId||r.measurementId||r.id,meterId:r.zaehlerId||r.meterId,
   date:r.ablesedatum||r.messzeitpunkt,reading:r.wert,unit:r.einheit,
   provenance:r.herkunft||r.sourcePath||"",readingKind:r.ableseart||"",source:copy(r)
  }));
  const registry=arr(meters.zaehler).map(m=>({
   id:m.zaehlerId||m.meterId,unitId:unitIds.has(m.einheitId)?m.einheitId:null,
   type:m.zaehlerTyp||m.meterType,number:m.zaehlernummer||"",
   status:m.status||"",location:m.standortbeschreibung||"",source:copy(m)
  }));
  const normalizedArchives=arr(d.jahresArchiv).map((a,i)=>({
   id:a.snapshotId||("source-archive-"+i),year:String(a.year||a.period?.year||""),
   status:a.snapshotStatus||"legacy-partial",completeness:a.snapshotCompleteness||"unknown",
   immutable:true,sourceOrdinal:i,
   /* Immutable factual historic evidence; not rendered as newly calculated invoices. */
   sourceSnapshot:copy(a)
  }));
  unique(normalizedArchives,x=>x.id,"ARCHIVE_ID_CONFLICT");
  const settlement={
   year:"2025",period:{start:d.meta.abrechnungsbeginn,end:d.meta.abrechnungsende},
   status:d.meta.currentBillingFinalized===true?"finalized":"draft",
   unitSnapshots:copy(d.wohnungen),caseSnapshots:copy(d.mieter),
   expenses:expenseRows,prepaymentsByCost:copy(d.vorauszahlungen),
   allocationInputs:copy(d.umlageInputs),
   costCaseAllocations:copy(d.kostenartenMieterUmlage||{}),
   individualValues:copy(d.abrechnungsEinzelwerte||[]),
   costReconciliation:copy(d.kostenUmlagenAbgleich||{}),
   legacyWaterReadings:copy(d.waterMeters||{}),
   meterReadingsByCase:copy(d.meterReadings||{}),
   letterSettings:copy(d.briefSettings||{}),letterAddresses:copy(d.briefAddresses||{}),
   qualityDecisions:copy(d.abrechnungsPruefungen||{}),
   prepaymentAdjustments:copy(d.prepaymentAdjustmentSettings||{})
  };
  const portfolio={
   format:FORMAT,schemaVersion:1,containsRealPersonalData:true,
   source:{kind:source.format,version:source.appVersion,snapshotId:source.snapshotId,
    capturedAt:source.createdAt,storageIntegrityChecksum:d.meta.storageIntegrityChecksum},
   objects:[{
    id:canonical.objekt.id,code:null,name:canonical.objekt.bezeichnung,
    buildings:copy(canonical.gebaeude||[]),ownership:copy(canonical.eigentuemer||{}),
    partners:copy(canonical.partner||[]),contracts:copy(canonical.vertraege||[]),
    units,tenancies,costCatalog:costTypes,distributionKeys:copy(canonical.verteilerschluessel||[]),
    meters:registry,meterReadings:readings,meterPeriods:copy(meters.messperioden||[]),
    meterAssignments:copy(meters.zuordnungen||[]),meterReplacements:copy(meters.zaehlerwechsel||[]),
    consumptionPoints:copy(canonical.verbrauchsstellen||[]),
    waterHistory:copy(d.waterMeterHistory||{}),
    annual:{2025:settlement},archives:normalizedArchives,
    notes:{migrationReview:normalization}
   }],
   /* Preservation-only raw facts, including internal metadata as archival provenance.
      Neither executable nor used as live application state. */
   sourceEvidence:source,
   migration:{version:1,corrections:normalization,
    limitations:["Historical partial archives are evidence, not recalculated results.",
     "2025 settlement remains draft until independent billing parity and QA.",
     "Private-use role M000 never excludes billing allocations.",
     "Inherited source comments, calculation signatures and internal flags are not NK-Pro 2.0 engine settings."]}
  };
  validatePortfolio(portfolio);
  return portfolio;
 }
 function validatePortfolio(p){
  required(obj(p)&&p.format===FORMAT&&p.schemaVersion===1&&p.containsRealPersonalData===true,
   "PRIVATE_PORTFOLIO_FORMAT");
  required(arr(p.objects).length===1,"PRIVATE_OBJECT_COUNT");
  const o=p.objects[0];required(arr(o.units).length>0&&arr(o.tenancies).length>0,
   "PRIVATE_MASTER_EMPTY");
  const units=unique(o.units,x=>x.id,"PRIVATE_UNIT_DUPLICATE");
  unique(o.tenancies,x=>x.id,"PRIVATE_TENANCY_DUPLICATE");
  for(const t of o.tenancies)required(units.has(t.unitId),"PRIVATE_TENANCY_UNIT");
  const privateCase=o.tenancies.find(t=>t.id==="M000");
  if(privateCase)required(privateCase.leaseStart==="2010-01-01"&&privateCase.billingParticipant,
   "PRIVATE_PARTICIPANT_CONTRACT");
  unique(o.archives,x=>x.id,"PRIVATE_ARCHIVE_DUPLICATE");
  required(obj(o.annual[2025])&&o.annual[2025].status==="draft",
   "PRIVATE_SETTLEMENT_NOT_DRAFT");
  return true;
 }
 function summary(p){
  validatePortfolio(p);const o=p.objects[0],s=o.annual[2025];
  const cost=id=>s.expenses.find(x=>x.id===id)?.amountCents??null;
  return {schema:p.format,sourceVersion:p.source.version,sourceSnapshotId:p.source.snapshotId,
   unitCount:o.units.length,tenancyCount:o.tenancies.length,archiveCount:o.archives.length,
   archiveYears:o.archives.map(x=>x.year),meterCount:o.meters.length,
   meterReadingCount:o.meterReadings.length,meterPeriodCount:o.meterPeriods.length,
   areaSqm:o.units.reduce((sum,u)=>sum+u.areaSqm,0),
   costsCents:{K002:cost("K002"),K006:cost("K006"),K009:cost("K009")},
   corrections:p.migration.corrections.map(x=>x.code),billingStatus:s.status,
   productionReady:false};
 }
 return Object.freeze({FORMAT,SOURCE,migrate,validateSource,validatePortfolio,summary,integrity,fnv});
});