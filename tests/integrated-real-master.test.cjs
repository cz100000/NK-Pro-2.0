"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const original=require("../private/private-model.js");
const integrated=require("../integrated-data.js");
globalThis.NKPRO2_PRIVATE_MODEL=original;
const copy=x=>JSON.parse(JSON.stringify(x));
function source(){
 const units=Array.from({length:7},(_,i)=>({
  id:i===0?"W000.UG":"W00"+i+".EG",bezeichnung:"Wohnung "+i,
  lage:"Lage "+i,wohnflaeche:65-i,status:i>4?"inaktiv":"aktiv",
  gebaeudeId:"GEB-001"}));
 const tenants=units.slice(0,5).map((u,i)=>({
  id:"M00"+i,wohnung:u.id,name:"Synthetic Tenant "+i,
  einzug:i===0?"2024-01-01":"2020-01-01",
  auszug:"",abrechnungRolle:i===0?"Eigentümer/Privat":"Mieter",personen:1}));
 const costs=[{id:"K002",gesamtbetrag:1642.31,kostenart:"Wasserversorgung",inNK:"Ja"},
  {id:"K006",gesamtbetrag:9965.97,kostenart:"Heiz- und Warmwasserkosten",inNK:"Ja"},
  {id:"K009",gesamtbetrag:1503,kostenart:"Müllbeseitigung",inNK:"Ja"}];
 const archive=(year,id,full=false)=>({
  year,snapshotId:id,snapshotStatus:full?"complete":"legacy-partial",
  snapshotCompleteness:full?"complete":"historical-not-fully-reconstructable",
  immutable:true,data:{kostenarten:copy(costs),mieter:copy(tenants),
   wohnungen:copy(units),meta:{abrechnungsjahr:year}}});
 const d={
  meta:{dataSchemaVersion:5,abrechnungsjahr:"2025",storageIntegrityAlgorithm:"FNV1A32"},
  objektStandard:{objekt:{id:"OBJ-001",bezeichnung:"Objekt Am Rauhen Biehl 5"},
   gebaeude:[{id:"GEB-001",strasse:"Am Rauhen Biehl 5",plz:"55774",ort:"Baumholder"}],
   einheiten:units,kostenarten:costs},
  stammdaten:{wohnungen:units,mieter:tenants},wohnungen:units,mieter:tenants,
  kostenarten:costs,
  zaehlerDaten:{zaehler:Array.from({length:16},(_,i)=>({
   zaehlerId:"MTR-"+i,einheitId:units[i%7].id,
   zaehlerTyp:i===15?"house-water-control":i%2?"hot-water":"cold-water",
   zaehlernummer:"SYN-"+i,status:"aktiv"})),
   messwerte:[{zaehlerId:"MTR-0",wert:123}],messperioden:[]},
  jahresArchiv:[archive("2024","2024a"),archive("2023","2023old"),
   archive("2023","2023full",true),archive("2022","2022a"),
   archive("2021/2022","2021_2022")],
  umlageInputs:{K006:{caseValues:{
   "tenant:1":{amount:9962.09,source:"Techem Gesamtabrechnung 2025"}},
   externalBilling:{includedOwnerShare:3.88,totalCost:9965.97}}},
  waterMeters:{settings:{houseMeterStart:911,houseMeterEnd:1186,houseWaterTotal:275}},
  vorauszahlungen:[{kostenId:"K002",werte:[240,240]}]
 };
 const unsigned=copy(d);delete unsigned.meta.storageIntegrityAlgorithm;
 d.meta.storageIntegrityChecksum=original.fnv(JSON.stringify(unsigned));
 return {format:"nkpro-drive-snapshot-v1",snapshotId:"synthetic-snapshot-2026-xx",
  appVersion:"V99.4.81",createdAt:"2026-11-21T19:34:02Z",data:d};
}
test("Real master and 5 historical archives migrate into one object; 2025 billing is blank",()=>{
 const snapshot=source(),before=JSON.stringify(snapshot);
 const p=integrated.migrate(snapshot),s=integrated.summary(p),o=p.objects[0];
 assert.equal(p.objects.length,1);assert.equal(s.objectCode,"ARB5");
 assert.equal(o.name,"Objekt Am Rauhen Biehl 5");
 assert.equal(o.street,"Am Rauhen Biehl 5");
 assert.equal(s.apartments,7);assert.equal(s.tenancies,5);assert.equal(s.meters,16);
 assert.deepEqual(s.years,["2024","2023","2023","2022","2021/2022"]);
 assert.equal(o.tenancies.find(x=>x.id==="M000").leaseStart,"2010-01-01");
 assert.equal(o.tenancies.find(x=>x.id==="M000").billingParticipant,true);
 assert.equal(o.archives[2].snapshot.data.kostenarten[0].gesamtbetrag,1642.31);
 assert.equal(o.archives[1].snapshot.data.kostenarten[0].gesamtbetrag,1642.31);
 assert.equal(o.annual["2025"].importedFromLegacy,false);
 assert.equal(o.annual["2025"].costs.length,0);
 assert.equal(o.annual["2025"].meterReadings.length,0);
 assert.deepEqual(o.annual["2025"].payments,{});
 assert.deepEqual(o.annual["2025"].allocationInputs,{});
 assert.equal(s.year2025Migrated,false);
 assert.equal(JSON.stringify(snapshot),before,"original source unchanged");
 assert.ok(!("sourceEvidence" in p));
 assert.ok(!("2025" in o.archives));
});
test("2025 archive imported accidentally must block migration",()=>{
 const x=source();
 const a=copy(x.data.jahresArchiv[0]);a.year="2025";a.snapshotId="bad-2025";
 x.data.jahresArchiv.push(a);
 const bare=copy(x.data);delete bare.meta.storageIntegrityAlgorithm;
 delete bare.meta.storageIntegrityChecksum;
 x.data.meta.storageIntegrityChecksum=original.fnv(JSON.stringify(bare));
 assert.throws(()=>integrated.migrate(x),/NO_2025_SETTLEMENT_ARCHIVE_ALLOWED/);
});
test("Broken original checksum is not allowed to enter live-mode data store",()=>{
 const x=source();x.data.kostenarten[0].gesamtbetrag=999;
 assert.throws(()=>integrated.migrate(x),/SOURCE_INTEGRITY_FAILED/);
});
