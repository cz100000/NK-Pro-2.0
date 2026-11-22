"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const review=require("../synthetic-review.js"),letters=require("../synthetic-letters.js");
const fixture=()=>({fixture:true,period:"2025",units:[{id:"W1",label:"Wohnung A",active:true}],
tenancies:[{id:"T1",unitId:"W1",name:"Musterperson A",start:"2025-01-01",end:"2025-12-31",persons:1}],
costs:[{id:"K",name:"Kosten",amount:100,method:"Fläche"}]});
const result=()=>({tenants:[{id:"T1",unitId:"W1",name:"Musterperson A",costCents:10000,advanceCents:8000,balanceCents:2000}],
costs:[{id:"K",name:"Kosten",method:"Fläche",rows:[{tenantId:"T1",cents:10000}]}],issues:[],occupancy:{issues:[]}});
test("44 inventoried with 25 synthetic checks and 19 not-run, cannot close",()=>{
 const x=review.assess(fixture(),result());
 assert.equal(x.rows.length,44);assert.equal(x.counts.executed,25);assert.equal(x.counts.notRun,19);
 assert.equal(x.readyForClose,false);
 assert.equal(x.rows.find(r=>r.id==="NKP-TECH-006").status,"not-run");
});
test("dynamic billing error is not hidden by 44-rule status",()=>{
 const a=result();a.issues=[{code:"EXTERNAL_TOTAL_MISMATCH",message:"Techem difference",action:"go-water"}];
 const x=review.assess(fixture(),a);assert.equal(x.dynamic.length,1);assert.ok(x.counts.critical>=1);
});
test("one complete detail table per case is generated, but print release remains false",()=>{
 const x=letters.make(fixture(),result());
 assert.equal(x.letters.length,1);assert.equal(x.letters[0].items[0].cents,10000);
 assert.equal(x.letters[0].balanceCents,2000);
 assert.equal(x.dataReady,false);assert.equal(x.readyForPrint,false);
 assert.match(letters.html(x.letters[0],x.config),/FACHTEST · NICHT VERSENDEN/);
});
test("synthetic addresses allow data completeness but not print release",()=>{
 const f=fixture();
 Object.assign(f.tenancies[0],{recipientStreet:"Demoweg 1",recipientPostalCode:"00000",recipientCity:"Musterstadt"});
 f.letterSettings={senderName:"Demo",senderStreet:"Demoweg 2",senderCity:"Musterstadt",
 letterDate:"2026-11-22",paymentDue:"2026-12-06",signature:"Fiktiv"};
 const x=letters.make(f,result());assert.equal(x.dataReady,true);assert.equal(x.readyForPrint,false);
});
