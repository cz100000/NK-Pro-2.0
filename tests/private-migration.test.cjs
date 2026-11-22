"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const model=require("../private/private-model.js");
const clone=x=>JSON.parse(JSON.stringify(x));
function fixture(){
 const units=[{id:"W000.UG",wohnflaeche:65,bezeichnung:"UG",lage:"UG",gebaeudeId:"GEB-001"},
   {id:"W001.EG-L",wohnflaeche:62.5,bezeichnung:"EG links",lage:"EG-L",gebaeudeId:"GEB-001"}];
 const tenants=[{id:"M000",wohnung:"W000.UG",name:"Private Example",einzug:"2024-01-01",
    status:"Aktiv",abrechnungRolle:"Eigentümer/Privat",personen:1},
   {id:"M001",wohnung:"W001.EG-L",name:"Example Tenant",einzug:"2022-01-01",
    status:"Aktiv",abrechnungRolle:"Mieter",personen:1}];
 const costs=[{id:"K002",kostenart:"Wasserversorgung",gesamtbetrag:1234.56,inNK:"Ja"},
   {id:"K006",kostenart:"Heiz- und Warmwasserkosten",gesamtbetrag:7890.12,inNK:"Ja"},
   {id:"K009",kostenart:"Müllbeseitigung",gesamtbetrag:1111,inNK:"Ja"}];
 const caseValues={
  "tenant:M001:W001.EG-L:2025-01-01:2025-12-31":{amount:6000,source:"Techem Gesamtabrechnung 2025"},
  "private:M000:W000.UG:2025-01-01:2025-12-31":{amount:1886.24,source:"Techem Gesamtabrechnung 2025"}
 };
 const archives=[
  {year:"2023",snapshotId:"old-2023",immutable:true,snapshotStatus:"legacy-partial",data:{year:2023,water:123}},
  {year:"2023",snapshotId:"new-2023",immutable:true,snapshotStatus:"complete",data:{year:2023,water:130}},
  {year:"2024",snapshotId:"2024",immutable:true,snapshotStatus:"legacy-partial",data:{year:2024}}
 ];
 const d={meta:{dataSchemaVersion:5,abrechnungsjahr:"2025",
    abrechnungsbeginn:"2025-01-01",abrechnungsende:"2025-12-31",
    currentBillingFinalized:false,storageIntegrityAlgorithm:"FNV1A32",
    confirmed2025Evidence:{water:{invoiceTotal:1234.56},
     waste:{invoiceTotal:1111},techem:{total:7890.12}}},
   wohnungen:units,mieter:tenants,kostenarten:costs,
   stammdaten:{wohnungen:units,mieter:tenants},
   objektStandard:{objekt:{id:"OBJ-001",bezeichnung:"Synthetic 1"},
    gebaeude:[{id:"GEB-001",strasse:"Example Street"}],einheiten:units,partner:[],
    vertraege:[],kostenarten:costs,verteilerschluessel:[]},
   zaehlerDaten:{zaehler:[{zaehlerId:"MTR-1",einheitId:"W000.UG",zaehlerTyp:"KW"}],
    messwerte:[{messwertId:"R-1",zaehlerId:"MTR-1",wert:10.3}],
    messperioden:[{messperiodeId:"MP-1",zaehlerId:"MTR-1"}],zuordnungen:[],zaehlerwechsel:[]},
   jahresArchiv:archives,vorauszahlungen:[{kostenId:"K002",werte:[240,240]}],
   umlageInputs:{K006:{caseValues,externalBilling:{includedOwnerShare:3.88,totalCost:7890.12}}},
   waterMeters:{settings:{houseMeterStart:100,houseMeterEnd:150,houseWaterTotal:50}}};
 d.meta.storageIntegrityChecksum=model.fnv(JSON.stringify((()=>{const x=clone(d);
  delete x.meta.storageIntegrityAlgorithm;return x;})()));
 return {format:"nkpro-drive-snapshot-v1",snapshotId:"fake-uuid-12345678",
  appVersion:"V99.4.81",createdAt:"2026-11-21T19:34:02Z",data:d};
}
test("V99.4.81 signed snapshot converts to isolated full private domain model",()=>{
 const source=fixture(),before=JSON.stringify(source),p=model.migrate(source),s=model.summary(p);
 assert.equal(s.unitCount,2);assert.equal(s.tenancyCount,2);
 assert.equal(s.areaSqm,127.5);assert.equal(s.archiveCount,3);
 assert.deepEqual(s.archiveYears,["2023","2023","2024"]);
 assert.equal(s.meterReadingCount,1);assert.equal(s.billingStatus,"draft");
 assert.deepEqual(s.costsCents,{K002:123456,K006:789012,K009:111100});
 assert.equal(p.objects[0].tenancies.find(t=>t.id==="M000").leaseStart,"2010-01-01");
 assert.equal(p.objects[0].tenancies.find(t=>t.id==="M000").billingParticipant,true);
 assert.equal(p.objects[0].tenancies.find(t=>t.id==="M000").privateUse,true);
 assert.equal(p.sourceEvidence.data.stammdaten.mieter[0].einzug,"2024-01-01");
 assert.equal(p.objects[0].archives[0].sourceSnapshot.data.water,123);
 assert.equal(p.objects[0].archives[1].sourceSnapshot.data.water,130);
 assert.equal(before,JSON.stringify(source),"migration never modifies original data");
});
test("Tampered source or wrong invoice evidence rejects migration",()=>{
 let x=fixture();x.data.kostenarten[0].gesamtbetrag=1234.57;
 assert.throws(()=>model.migrate(x),/SOURCE_INTEGRITY_FAILED/);
 x=fixture();x.data.kostenarten[0].gesamtbetrag=1234.57;
 delete x.data.meta.storageIntegrityChecksum;assert.equal(model.integrity(x.data),false);
});
test("Techem allocated cases and owner-only 3.88 must reconcile exactly",()=>{
 const x=fixture(),row=x.data.umlageInputs.K006.caseValues[Object.keys(x.data.umlageInputs.K006.caseValues)[0]];
 row.amount=5999.99;delete x.data.meta.storageIntegrityChecksum;
 const cloneData=clone(x.data);delete cloneData.meta.storageIntegrityAlgorithm;
 x.data.meta.storageIntegrityChecksum=model.fnv(JSON.stringify(cloneData));
 assert.throws(()=>model.migrate(x),/SOURCE_TECHEM_RECONCILIATION/);
});
test("Invalid archive, duplicate identity or broken source year cannot pass",()=>{
 let x=fixture();x.data.jahresArchiv[0].immutable=false;
 assert.throws(()=>model.migrate(x),/SOURCE_INTEGRITY_FAILED/);
 x=fixture();x.data.meta.abrechnungsjahr="2024";
 assert.throws(()=>model.migrate(x),/SOURCE_SCHEMA_YEAR/);
});
