/* NK-Pro 2.0: Master and pre-2025 archives only.
 * Genuine 2025 settlement values are NEVER migrated or inferred.
 * Old JavaScript, renderers and executable settings are never consumed. */
(function(root,factory){"use strict";const api=Object.freeze(factory());
 if(typeof module!=="undefined"&&module.exports)module.exports=api;
 else root.NKPRO2_INTEGRATED_DATA=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(){"use strict";
 const FORMAT="nkpro2-integrated-live-v1",copy=x=>JSON.parse(JSON.stringify(x));
 const invariant=(ok,code)=>{if(!ok)throw new Error(code);};
 const arr=x=>Array.isArray(x)?x:[];
 function normalizeName(name){
  const words=String(name||"").trim().split(/\s+/);
  return {firstName:words.length>1?words.slice(0,-1).join(" "):"",
   lastName:words.at(-1)||"",name:words.join(" ")};
 }
 const meterType={ "cold-water":"cold","hot-water":"hot",
  "house-water-control":"house-water" };
 function migrate(snapshot){
  const src=globalThis.NKPRO2_PRIVATE_MODEL;
  invariant(src&&typeof src.validateSource==="function","SCHEMA5_VALIDATOR_REQUIRED");
  const d=src.validateSource(snapshot);
  const canonical=d.objektStandard,buildings=arr(canonical.gebaeude);
  invariant(buildings.length===1,"ONE_BUILDING_EXPECTED");
  invariant(arr(canonical.einheiten).length===7,"EXPECTED_SEVEN_UNITS");
  const b=buildings[0];
  const units=canonical.einheiten.map(x=>({
   id:x.id,label:x.bezeichnung||x.id,position:x.lage||"",area:x.wohnflaeche,
   active:x.status==="aktiv",status:x.status,buildingId:x.gebaeudeId,
   note:x.bemerkung||"",roomCount:x.zimmer||null
  }));
  const unitIds=new Set(units.map(x=>x.id));
  const tenancies=arr(d.stammdaten.mieter).map(t=>{
   const parts=normalizeName(t.name);
   invariant(unitIds.has(t.wohnung),"TENANT_UNIT_UNRESOLVED");
   return {id:t.id,unitId:t.wohnung,...parts,role:t.id==="M000"?"Privatanteil":"Mieter",
    billingParticipant:true,privateUse:t.id==="M000",persons:t.personen||0,
    leaseStart:t.id==="M000"?"2010-01-01":t.einzug,
    leaseEnd:t.auszug||null,status:t.status,
    street:t.strasse||"",postalCode:t.plz||"",city:t.ort||"",
    email:t.email||"",phone:t.telefon||"",note:t.bemerkung||"",
    salutation:t.standardanrede||"",
    sourceLeaseStart:t.einzug};
  });
  const currentMeter=arr(d.zaehlerDaten.zaehler).map(m=>({
   id:m.zaehlerId||m.meterId||m.id,unitId:m.einheitId&&unitIds.has(m.einheitId)?
     m.einheitId:null,number:m.zaehlernummer||"",
   type:meterType[m.zaehlerTyp]||"unknown",legacyType:m.zaehlerTyp||"",
   status:m.status||"",room:m.standortbeschreibung||"",
   installedOn:m.einbaudatum||null,removedOn:m.ausbaudatum||null,
   buildingId:m.gebaeudeId||b.id,sourceId:m.zaehlerId||m.meterId||m.id
  }));
  const archiveIds=new Set();
  const archives=arr(d.jahresArchiv).map((a,ordinal)=>{
   invariant(a.immutable===true&&a.snapshotId&&!archiveIds.has(a.snapshotId),
    "ARCHIVE_ID_OR_IMMUTABILITY_INVALID");
   archiveIds.add(a.snapshotId);
   invariant(a.year!=="2025","NO_2025_SETTLEMENT_ARCHIVE_ALLOWED");
   return {id:a.snapshotId,ordinal,year:String(a.year),status:a.snapshotStatus,
    completeness:a.snapshotCompleteness,archivedAt:a.archivedAt||null,
    sourceType:a.snapshotFormat||"",immutable:true,
    /* Historical document evidence kept intact; may contain private tenant details,
     therefore it resides ONLY in encrypted local/cloud storage, never in source code. */
    snapshot:copy(a)};
  });
  const costCatalog=arr(canonical.kostenarten).map(k=>({
   id:k.id,name:k.bezeichnung||k.kostenart||k.id,
   category:k.bereich||"",allocationMethod:k.umlageschluessel||"",
   eligible:k.umlagefaehig??null,
   /* no 2025 amounts, quantities or evidence */}));
  const migrated={
   format:FORMAT,schemaVersion:1,productionReady:false,
   source:{format:snapshot.format,snapshotId:snapshot.snapshotId,
    appVersion:snapshot.appVersion,createdAt:snapshot.createdAt,
    integrityChecksum:d.meta.storageIntegrityChecksum},
   selectedObjectId:canonical.objekt.id,selectedYear:"2025",
   objects:[{id:canonical.objekt.id,code:"ARB5",name:canonical.objekt.bezeichnung,
    street:b.strasse,postalCode:b.plz,city:b.ort,buildingId:b.id,
    units,tenancies,meterRegistry:currentMeter,
    /* current master/reference metadata only, never 2025 billing amounts */
    costCatalog,buildings:buildings.map(x=>({id:x.id,name:x.bezeichnung||"",
     street:x.strasse,postalCode:x.plz,city:x.ort})),
    archives,
    annual:{"2025":{year:"2025",status:"not-started",
      source:"new-nkpro2-settlement",units:units.map(u=>({unitId:u.id,area:u.area})),
      costs:[],payments:{},allocationInputs:{},meterReadings:[],
      invoices:[],cases:[],letterSettings:{},qualityDecisions:[],
      importedFromLegacy:false,createdAt:null}},
    meterEvidence:{historyAvailability:"historical-archives-only",
      note:"New 2025 readings must be captured in NK-Pro 2.0, not copied from V99.4.81."}}],
   migration:{contractVersion:1,sourceArchivedCount:archives.length,
    migrationMode:"master-and-pre-2025-archives-only",year2025Excluded:true,
    masterFixes:tenancies.filter(t=>t.id==="M000"&&t.sourceLeaseStart!=="2010-01-01")
      .map(t=>({code:"M000_ENTRY_DATE_2010",oldDate:t.sourceLeaseStart,
        newDate:"2010-01-01"})),
    warnings:archives.filter(a=>a.completeness!=="complete")
      .map(a=>({archiveId:a.id,code:"HISTORICAL_ARCHIVE_PARTIAL"}))}};
  validate(migrated);
  return migrated;
 }
 function validate(p){
  invariant(p?.format===FORMAT&&p.schemaVersion===1&&p.productionReady===false,
   "INVALID_LIVE_FORMAT");
  invariant(arr(p.objects).length===1,"INVALID_OBJECT_COUNT");
  const o=p.objects[0];invariant(o.code==="ARB5"&&arr(o.units).length===7,
   "INVALID_ARB5_MASTER");
  const unitIds=new Set(o.units.map(x=>x.id));
  invariant(unitIds.size===7,"INVALID_UNIT_IDS");
  invariant(o.tenancies.every(x=>unitIds.has(x.unitId)&&x.billingParticipant===true),
   "INVALID_TENANCY_PARTICIPATION");
  const m=o.tenancies.find(t=>t.id==="M000");
  invariant(m?.leaseStart==="2010-01-01"&&m?.privateUse===true,
   "M000_MASTER_CONTRACT");
  invariant(arr(o.archives).length>=1&&o.archives.every(a=>
   a.immutable===true&&a.year!=="2025"&&a.snapshot?.snapshotId===a.id),
   "INVALID_ARCHIVE_IDENTITY");
  invariant(new Set(o.archives.map(a=>a.id)).size===o.archives.length,
   "ARCHIVE_DUPLICATE");
  const annual=o.annual?.["2025"];
  invariant(annual?.importedFromLegacy===false&&annual?.source==="new-nkpro2-settlement",
   "2025_MUST_BE_NEW");
  return p;
 }
 function summary(p){
  const v=validate(p),o=v.objects[0];
  return {objectCount:1,objectCode:o.code,year2025Migrated:false,
   apartments:o.units.length,tenancies:o.tenancies.length,
   archiveCount:o.archives.length,years:o.archives.map(a=>a.year),
   meters:o.meterRegistry.length,
   areaSqm:o.units.reduce((sum,u)=>sum+u.area,0),
   current2025CostCount:o.annual["2025"].costs.length,
   sourceSnapshotId:p.source.snapshotId};
 }
 return Object.freeze({FORMAT,migrate,validate,summary});
});