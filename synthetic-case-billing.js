/* Stage 1+2 integrated synthetic reference billing with tenancy cases.
 * No real dataset handling; original financial results remain the gold master.
 * Uses the already parity-tested six legacy methods; incomplete data BLOCKS.
 */
(function(root,factory){
 "use strict";const node=typeof module!=="undefined"&&!!module.exports;
 const ref=node?require("./experimental/settlement-cost.js"):root.NKPRO2_EXPERIMENTAL_ALLOCATION;
 const base=node?require("./synthetic-billing.js"):root.NKPRO2_SYNTHETIC_BILLING;
 const demo=node?require("./demo-ledger.js"):root.NKPRO2_DEMO_LEDGER;
 const prop=node?require("./synthetic-property.js"):root.NKPRO2_PROPERTY;
 const water=node?require("./water-detail.js"):root.NKPRO2_WATER_DETAIL;
 const api=Object.freeze(factory(ref,base,demo,prop,water));
 if(node)module.exports=api;else root.NKPRO2_CASE_BILLING=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(ref,base,demo,prop,water){
 "use strict";
 if(!ref||!base||!demo||!prop||!water)throw new Error("Missing synthetic case billing modules");
 const sum=rows=>rows.reduce((a,b)=>a+b,0);
 const cents=demo.amountToCents;
 const canon=x=>x==="Fläche"?"Wohnfläche":x;
 const limited=base.METHODS;
 function calculate(data){
   if(!data||data.fixture!==true||data.period!=="2025"||
     !Array.isArray(data.units)||!Array.isArray(data.costs)||!Array.isArray(data.tenancies))
     throw new TypeError("Synthetic 2025 tenancy billing only; actual datasets rejected");
   const waterReport=water.diagnostics(data);
   const occupancy=prop.inspect(data,waterReport);
   const issues=[...waterReport.issues.map(i=>({...i,message:"Wasser: "+(i.unitId?i.unitId+" · ":"")+(i.reason||i.code),action:"go-water"})),
     ...occupancy.issues.map(i=>({...i,action:"go-tenancies"}))];
   const unitIds=new Set(),costIds=new Set(),caseIndex=new Map();
   const unitRows=data.units.map(u=>{
     const id=String(u.id),advanceCents=0;
     if(unitIds.has(id)||!id)issues.push({code:"DUPLICATE_UNIT",message:"Wohnungs-ID fehlt oder doppelt.",action:"go-tenancies"});
     unitIds.add(id);
     const area=Number(u.area);
     if(!Number.isFinite(area)||area<=0)
       issues.push({code:"INVALID_AREA",message:"Wohnfläche fehlt: "+id,action:"go-tenancies"});
     return {id,label:u.label,areaWeight:Math.round(area*100),waterWeight:waterReport.rows.find(x=>x.id===u.id)?.total??null,
       advanceCents,costCents:0,balanceCents:0,entries:[]};
   });
   const unitIndex=new Map(unitRows.map(u=>[u.id,u]));
   const tenants=occupancy.cases.map(t=>{
     const row={id:t.id,unitId:t.unitId,name:t.name,role:t.role,start:t.start,end:t.end,
       days:t.days,persons:t.persons,personDays:t.personDays,area:t.area,
       advanceCents:cents(t.advance),cold:t.cold,hot:t.hot,consumption:t.consumption,
       costCents:0,balanceCents:0,entries:[]};
     if(row.advanceCents===null)issues.push({code:"INVALID_ADVANCE",message:"Ungültige Vorauszahlung: "+t.id,action:"go-tenancies"});
     caseIndex.set(t.id,row);
     return row;
   });
   for(const tenant of tenants){
     const u=unitIndex.get(tenant.unitId);
     if(u&&tenant.advanceCents!==null)u.advanceCents+=tenant.advanceCents;
   }
   const unitModel=data.units.map(u=>({id:u.id,active:u.active!==false,area:Number(u.area)}));
   const costRows=[];
   let grossCostsCents=0,allocableCostsCents=0,landlordCostsCents=0,ownerResidualCents=0;
   for(const c of data.costs){
     const id=String(c.id||"");
     if(!id||costIds.has(id))issues.push({code:"DUPLICATE_COST",message:"Kostenart-ID fehlt oder doppelt.",action:"go-costs"});
     costIds.add(id);
     if(c.active===false)continue;
     const gross=cents(c.amount),directOwner=cents(c.landlordShare??0);
     if(gross===null||directOwner===null||directOwner>gross){
       issues.push({code:"INVALID_COST",message:"Ungültige Kosten oder Vermieteranteil: "+id,action:"go-costs"});
       continue;
     }
     grossCostsCents+=gross;landlordCostsCents+=directOwner;
     const eligible=gross-directOwner;allocableCostsCents+=eligible;
     if(!limited.includes(c.method))
       issues.push({code:"UNKNOWN_METHOD",message:"Unbekannter Umlageschlüssel: "+id,action:"go-costs"});
     const basis=canon(c.method);
     const total=c.method==="Verbrauch"?
       (c.id==="water"?Number(data.houseWater):Number(c.consumptionTotal)):null;
     const consuming=tenants.map(t=>{
       let volume=null;
       if(c.id==="water")volume=t.consumption;
       else if(c.method==="Verbrauch"){
         const input=c.consumptionByTenant?.[t.id];
         volume=input!==""&&input!==undefined&&input!==null&&Number.isFinite(Number(input))&&Number(input)>=0?
           Number(input):null;
       }
       return {...t,consumption:volume??0};
     });
     if(c.method==="Verbrauch"){
       if(!Number.isFinite(total)||total<=0){
         issues.push({code:"COST_CONSUMPTION_TOTAL",message:"Gesamtverbrauch je Kostenart fehlt: "+id,action:"go-costs"});
       }
       const missing=consuming.some((t,i)=>{
         return c.id==="water"?tenants[i].consumption===null:
           !(c.consumptionByTenant?.[t.id]!==""&&c.consumptionByTenant?.[t.id]!==undefined&&
             c.consumptionByTenant?.[t.id]!==null&&Number.isFinite(Number(c.consumptionByTenant[t.id]))&&Number(c.consumptionByTenant[t.id])>=0);
       });
       if(missing)issues.push({code:"COST_CONSUMPTION_CASES",message:"Einzelverbrauch fehlt: "+id,action:"go-costs"});
     }
     const price=c.method==="Verbrauch"?water.priceFor(c,total):null;
     if(price&&!price.valid)
       issues.push({code:"INVALID_UNIT_PRICE",message:"Einheitspreis/Verbrauch unvollständig: "+id,action:"go-costs"});
     const row={id,name:c.name,method:c.method,grossCents:gross,landlordCents:directOwner,
       eligibleCents:eligible,distributedCents:0,notAllocatedCents:eligible,
       allocated:false,referenceStatus:"Nicht berechnet",rows:[],price,
       consumptionTotal:total,referenceOwnerCents:0};
     let reference=null,parts=null;
     // Missing or inconsistent occupancy or meter data cannot be falsely settled.
     const blocking=issues.some(x=>!["UNALLOCATED_REFERENCE"].includes(x.code));
     if(!blocking&&limited.includes(c.method)&&eligible>0){
       try{
         reference=ref.calculateCost({cost:{id,amount:eligible/100,method:basis,
           houseConsumption:total,manualPrice:price?.mode==="manual",
           pricePerUnit:price?.mode==="manual"?price.effective:null,
           excludedTenantIds:Array.isArray(c.excludedTenantIds)?c.excludedTenantIds:[],
           exclusionMode:c.exclusionMode==="owner"?"owner":"full"},
           tenants:consuming,units:unitModel});
         const raw=tenants.map(t=>Number(reference.allocations[t.id]??0));
         parts=base.proportionalCents(raw,eligible);
         const expected=raw.reduce((s,x)=>s+x,0);
         if(!parts||expected<0||!Number.isFinite(expected))
            issues.push({code:"REFERENCE_NOT_READY",message:"Referenzverteilung unvollständig: "+id,action:"go-costs"});
       }catch(e){
         issues.push({code:"REFERENCE_NOT_READY",message:"Referenzverteilung nicht möglich: "+id,action:"go-costs"});
       }
     }else if(eligible===0&&limited.includes(c.method))parts=tenants.map(()=>0);
     if(!parts&&eligible>0&&!issues.some(x=>x.code==="REFERENCE_NOT_READY"))
       issues.push({code:"REFERENCE_NOT_READY",message:"Berechnung gesperrt: "+id,action:"go-costs"});
     row.referenceStatus=reference?.status??"Nicht berechnet";
     row.allocated=!!parts;
     row.rows=tenants.map((t,i)=>{
       const amount=parts?.[i]??0;
       const u=unitIndex.get(t.unitId);
       if(u)u.costCents+=amount;
       t.costCents+=amount;
       const weight=basis==="Wohnfläche"?t.area*t.days:
         basis==="Personen"?t.personDays:basis==="Miettage"?t.days:
         basis==="Verbrauch"?consuming[i].consumption:1;
       const entry={costId:id,name:c.name,method:c.method,cents:amount,
         tenantId:t.id,unitId:t.unitId,weight};
       t.entries.push(entry);if(u)u.entries.push(entry);
       return{tenantId:t.id,unitId:t.unitId,cents:amount,
         weight,totalWeight:reference?.basisTotal??null,
         referenceExact:reference?.allocations[t.id]??null};
     });
     row.distributedCents=sum(row.rows.map(x=>x.cents));
     row.notAllocatedCents=eligible-row.distributedCents;
     row.referenceOwnerCents=reference?Math.round(Number(reference.ownerShare||0)*100):0;
     ownerResidualCents+=Math.max(0,row.notAllocatedCents);
     if(row.notAllocatedCents!==0)
       issues.push({code:"UNALLOCATED_REFERENCE",
         message:(row.notAllocatedCents/100).toFixed(2)+" € bei "+c.name+
         " nicht zugeordnet (inklusive ggf. Leerstand/Ausschluss).",
         action:c.method==="Verbrauch"?"go-water":"go-review"});
     if(reference&&["Wohnfläche fehlt","Personenzahl fehlt","Miettage fehlen",
        "Wohneinheiten fehlen","Keine berechtigten Mieter"].includes(reference.status))
       issues.push({code:"ZERO_BASIS",message:"Umlagegrundlage fehlt: "+id,action:"go-costs"});
     costRows.push(row);
   }
   for(const t of tenants)t.balanceCents=t.costCents-(t.advanceCents??0);
   for(const u of unitRows)u.balanceCents=u.costCents-u.advanceCents;
   const advancesCents=sum(tenants.map(t=>t.advanceCents??0));
   const distributedCents=sum(tenants.map(t=>t.costCents));
   const totals={grossCostsCents,allocableCostsCents,landlordCostsCents,
     advancesCents,distributedCents,balanceCents:distributedCents-advancesCents,
     differenceCents:allocableCostsCents-distributedCents,
     unallocatedCents:ownerResidualCents};
   return {kind:"synthetic-tenancy-reference-billing",
     units:unitRows,tenants,costs:costRows,issues,occupancy,water:waterReport,totals,
     valid:issues.length===0&&totals.differenceCents===0,
     readyForRealFinalization:false};
 }
 return {calculate,METHODS:limited,version:"synthetic-case-billing-1"};
});