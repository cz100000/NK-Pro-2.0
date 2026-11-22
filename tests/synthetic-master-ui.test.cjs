"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const ui=require("../synthetic-master-ui.js");
const obj={id:"SYN-A",name:"Musterobjekt A",street:"Demoweg",postalCode:"00000",
city:"Teststadt",units:[{id:"W1",label:"Wohnung 1",area:65,position:"EG",meters:{cold:"K",hot:"W"}}],
tenancies:[{id:"T1",unitId:"W1",firstName:"Mara",lastName:"Sommer",name:"Mara Sommer",
leaseStart:"2022-01-01",leaseEnd:null,role:"Mieter",persons:1,salutation:"neutral",postalOverride:null}]};
test("master tenant dialog contains optional move-out, independent address, name and no annual fields",()=>{
 const d=ui.form("master-tenancy",obj,"T1");
 assert.match(d.body,/Auszugsdatum \(optional\)/);
 assert.match(d.body,/Abweichende Zustellanschrift/);
 assert.doesNotMatch(d.body,/Jahresvorauszahlung/);
 assert.doesNotMatch(d.body,/2025/);
});
test("master form fields parsed once with optional address and ongoing lease",()=>{
 const d=ui.form("master-tenancy",obj,"T1");
 const x={unitId:"W1",firstName:"Mara",lastName:"Sommer",role:"Mieter",persons:"1",
 leaseStart:"2022-01-01",leaseEnd:"",salutation:"neutral",customSalutation:"",
 postalStreet:"",postalCode:"",postalCity:"",note:""};
 const els=Object.fromEntries(Object.entries(x).map(([k,v])=>[k,{value:v}]));
 const r=ui.parse("master-tenancy",els,"T1",d.draft);
 assert.equal(r.entry.leaseEnd,null);
 assert.equal(r.entry.postalOverride,null);
 els.postalStreet.value="New St";
 assert.throws(()=>ui.parse("master-tenancy",els,"T1",d.draft),/vollständig/);
});
