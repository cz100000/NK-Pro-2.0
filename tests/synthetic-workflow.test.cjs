"use strict";
const {test}=require("node:test");
const assert=require("node:assert/strict");
const w=require("../synthetic-workflow.js");
const base=()=>({fixture:true,period:"2025",units:[{id:"A",area:40}],tenancies:[
 {id:"T1",unitId:"A",name:"Musterperson A",start:"2025-01-01",end:"2025-12-31",advance:2400}],
 costs:[{id:"heat",name:"Heizung",amount:1000,landlordShare:10,method:"Fläche"}]});
test("legacy original K001-K035 catalogue retains stable id/category",()=>{
 assert.equal(w.catalog.length,35);
 assert.equal(w.invoiceCatalog("K006").name,"Heiz- und Warmwasserkosten");
 assert.equal(w.invoiceCatalog("K009").name,"Müllbeseitigung");
 assert.equal(w.invoiceCatalog("K020").ownerOnly,true);
});
test("synthetic upgrade is idempotent, preserves existing payment and source",()=>{
 const x=base(),y=w.upgrade(x),z=w.upgrade(y);
 assert.deepEqual(z,y);
 assert.equal(x.payments,undefined);
 assert.equal(y.tenancies[0].lastName,"A");
 assert.equal(y.payments.T1.paidActual,2400);
 assert.equal(y.settlement.status,"draft");
});
test("monthly expected across partial months is prorated but paid stays separate",()=>{
 const x=base();x.tenancies[0].start="2025-02-16";x.tenancies[0].end="2025-03-15";
 const y=w.setPayment(x,"T1",{mode:"monthly",agreed:200,paid:360});
 assert.equal(y.tenancies[0].advance,2400);
 assert.equal(y.payments.T1.paidActual,360);
 assert.equal(w.expected(y.tenancies[0],y.payments.T1),Math.round((200*13/28+200*15/31)*100)/100);
});
test("changing tenant name/salutation only at source, without touching payment",()=>{
 const x=w.upgrade(base());
 const y=w.renameTenant(x,"T1",{firstName:"Muster",lastName:"Person",salutation:"Frau",
 recipientStreet:"Beispielweg 1",recipientPostalCode:"00000",recipientCity:"Musterstadt"});
 assert.equal(y.tenancies[0].name,"Muster Person");
 assert.equal(y.tenancies[0].salutation,"Frau");
 assert.equal(y.payments.T1.paidActual,2400);
 assert.equal(x.tenancies[0].name,"Musterperson A");
});
test("invoice metadata validation and archive-safe deactivation",()=>{
 const a=w.setInvoice(base(),"heat",{invoiceDate:"2025-12-31",documentDate:"2025-12-30",issuer:"DEMO"});
 assert.equal(a.costs[0].invoiceDate,"2025-12-31");
 assert.throws(()=>w.setInvoice(base(),"heat",{invoiceDate:"2025-02-30"}),/Invalid/);
 assert.equal(w.deactivate(base(),"heat").costs[0].active,false);
 assert.throws(()=>w.removeUnused(base(),"heat"),/Only draft/);
});
test("explicit external individual amounts, no implicit Techem cost fabrication on upgrade",()=>{
 const x=w.upgrade(base());
 assert.equal(x.externalValues.heat,undefined);
 const y=w.setExternal(x,"heat","T1",99.25,12.5,"DEMO");
 assert.equal(y.externalValues.heat.rows.T1.amount,99.25);
 assert.equal(y.externalValues.heat.rows.T1.units,12.5);
 assert.equal(x.externalValues.heat,undefined);
});
test("rejects actual dataset or invalid payments",()=>{
 assert.throws(()=>w.upgrade({...base(),fixture:false}),/Synthetic/);
 assert.throws(()=>w.setPayment(base(),"T1",{mode:"monthly",agreed:-1,paid:1}),/Invalid/);
});

test("unused synthetic custom cost may be deleted only in draft and only without external values",()=>{
 const x=w.upgrade(base());
 x.costs.push({id:"SYN-K-TEST",name:"Versehen",amount:22,method:"Fläche"});
 const y=w.removeUnused(x,"SYN-K-TEST");
 assert.equal(y.costs.some(c=>c.id==="SYN-K-TEST"),false);
 assert.equal(x.costs.some(c=>c.id==="SYN-K-TEST"),true);
 const z=w.upgrade(x);z.settlement.status="closed";
 assert.throws(()=>w.removeUnused(z,"SYN-K-TEST"),/Only draft/);
 assert.throws(()=>w.removeUnused(x,"heat"),/Only draft/);
 z.settlement.status="draft";z.externalValues["SYN-K-TEST"]={rows:{}};
 assert.throws(()=>w.removeUnused(z,"SYN-K-TEST"),/Only draft/);
});
