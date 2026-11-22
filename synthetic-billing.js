/* Synthetic-only bridge: selected legacy-compatible allocation algorithms in the
 * existing demo journey. Does not import or handle actual NK-Pro backups. */
(function(root,factory){
  "use strict";
  const node=typeof module!=="undefined"&&!!module.exports;
  const ref=node?require("./experimental/settlement-cost.js"):root.NKPRO2_EXPERIMENTAL_ALLOCATION;
  const demo=node?require("./demo-ledger.js"):root.NKPRO2_DEMO_LEDGER;
  const water=node?require("./water-detail.js"):root.NKPRO2_WATER_DETAIL;
  const api=Object.freeze(factory(ref,demo,water));
  if(node)module.exports=api;else root.NKPRO2_SYNTHETIC_BILLING=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(ref,demo,water){
  "use strict";
  if(!ref||!demo||!water)throw new Error("Missing synthetic billing dependencies");
  const METHODS=Object.freeze(["Fläche","Wohnfläche","Personen","Miettage","Verbrauch",
    "Verteilung auf alle Wohneinheiten","Verteilung nur auf aktive Wohneinheiten"]);
  const sum=xs=>xs.reduce((s,v)=>s+v,0);
  const canon=m=>m==="Fläche"?"Wohnfläche":m;
  function proportionalCents(raw,limit){
    if(!Array.isArray(raw)||!Number.isSafeInteger(limit)||limit<0||
      raw.some(v=>!Number.isFinite(v)||v<0))return null;
    const aggregate=sum(raw)*100;
    if(!Number.isFinite(aggregate)||aggregate>limit+1.01)return null;
    const target=Math.min(limit,Math.max(0,Math.round(aggregate+Number.EPSILON)));
    if(target===0)return raw.map(()=>0);
    const max=Math.max(...raw);
    if(max<=0)return null;
    const weights=raw.map(v=>Math.round(v/max*1000000000));
    return demo.allocateCents(target,weights);
  }
  function calculate(data){
    if(!data||data.fixture!==true||data.period!=="2025"||
      !Array.isArray(data.units)||!Array.isArray(data.costs))
      throw new TypeError("Synthetic 2025 demo only: actual datasets are rejected");
    const waterReport=water.diagnostics(data);
    const unitsForLedger=data.units.map((u,i)=>({
      ...u,waterStart:0,waterEnd:waterReport.rows[i].total??-1
    }));
    const fake=data.costs.map(c=>({...c,method:c.method==="Verbrauch"?"Verbrauch":"Fläche"}));
    const preliminary=demo.calculate({...data,units:unitsForLedger,costs:fake});
    const issues=preliminary.issues.filter(x=>x.code!=="RECONCILIATION");
    const resultUnits=preliminary.units.map(u=>({...u,costCents:0,balanceCents:0,entries:[]}));
    const unitModel=data.units.map(u=>({
      id:u.id,area:Number(u.area),active:u.active!==false
    }));
    const tenants=data.units.map(u=>({
      id:"T-"+u.id,unitId:u.id,area:Number(u.area),days:Number(u.days??365),
      persons:Number(u.people??1),personDays:Number(u.days??365)*Number(u.people??1),
      consumption:waterReport.rows.find(r=>r.id===u.id)?.total??0
    }));
    const house=Number(data.houseWater);
    if(!Number.isSafeInteger(house)||house<=0)
      issues.push({code:"INVALID_HOUSE",message:"Ungültiger Rechnungsverbrauch.",action:"go-water"});
    for(const x of waterReport.issues)
      issues.push({code:x.code,message:"Wasser: "+(x.unitId?x.unitId+" · ":"")+(x.reason||x.code),action:"go-water"});
    for(const u of data.units){
      const people=Number(u.people??1),days=Number(u.days??365);
      if(!Number.isSafeInteger(people)||people<0||people>1000)
        issues.push({code:"INVALID_PEOPLE",message:"Ungültige Personenzahl bei "+u.id+".",action:"go-review"});
      if(!Number.isSafeInteger(days)||days<0||days>365)
        issues.push({code:"INVALID_DAYS",message:"Ungültige Miettage bei "+u.id+".",action:"go-review"});
    }
    const costs=data.costs.map((c,i)=>{
      const original=preliminary.costs[i];
      const row={...original,method:c.method,distributedCents:0,rows:[],
        referenceStatus:"Nicht berechnet",notAllocatedCents:original.eligibleCents};
      if(!METHODS.includes(c.method))
        issues.push({code:"UNKNOWN_METHOD",message:"Unbekannte Umlageart: "+c.id,action:"go-costs"});
      if(original.eligibleCents===0){
        row.allocated=true;
        row.rows=resultUnits.map(u=>({unitId:u.id,cents:0,weight:0,totalWeight:0,referenceExact:0}));
        return row;
      }
      const valid=METHODS.includes(c.method)&&issues.every(x=>x.code!=="INVALID_HOUSE"&&
        x.code!=="INVALID_AREA"&&x.code!=="INVALID_WATER"&&x.code!=="INVALID_PEOPLE"&&
        x.code!=="INVALID_DAYS"&&x.code!=="INVALID_LANDLORD"&&x.code!=="INVALID_COST"&&x.code!=="INVALID_ADVANCE"&&
        x.code!=="DUPLICATE_UNIT"&&x.code!=="DUPLICATE_COST");
      let reference=null,parts=null;
      const price=c.method==="Verbrauch"?water.priceFor(c,house):null;
      if(price&&!price.valid)issues.push({code:"INVALID_UNIT_PRICE",
        message:"Preis je Verbrauchseinheit bei "+c.name+" ist ungültig.",action:"go-costs"});
      if(valid&&(!price||price.valid)){
        try{
          reference=ref.calculateCost({cost:{id:c.id,amount:original.eligibleCents/100,
            method:canon(c.method),houseConsumption:house,
            manualPrice:price?.mode==="manual",
            pricePerUnit:price?.mode==="manual"?price.effective:undefined},
            units:unitModel,tenants});
          parts=proportionalCents(tenants.map(t=>Number(reference.allocations[t.id])),original.eligibleCents);
        }catch(_){/* errors must remain visible and blocking */}
      }
      if(!parts)
        issues.push({code:"REFERENCE_NOT_READY",message:"Referenzberechnung für "+c.id+" nicht möglich.",action:"go-costs"});
      const weights=tenants.map((t,j)=>canon(c.method)==="Wohnfläche"?t.area*t.days:
        c.method==="Personen"?t.personDays:c.method==="Miettage"?t.days:
        c.method==="Verbrauch"?t.consumption:
        c.method==="Verteilung nur auf aktive Wohneinheiten"?(unitModel[j].active?1:0):1);
      const totalWeight=c.method==="Verbrauch"?house:sum(weights);
      row.referenceStatus=reference?.status||"Nicht berechnet";
      row.price=price;
      row.allocated=!!parts;
      row.rows=tenants.map((t,j)=>{
        const cents=parts?parts[j]:0;
        resultUnits[j].costCents+=cents;
        resultUnits[j].entries.push({costId:c.id,name:c.name,method:c.method,cents});
        return {unitId:data.units[j].id,cents,weight:weights[j],totalWeight,
          referenceExact:reference?.allocations[t.id]??null};
      });
      row.distributedCents=sum(row.rows.map(x=>x.cents));
      row.notAllocatedCents=original.eligibleCents-row.distributedCents;
      if(row.notAllocatedCents>0){
        issues.push({code:"UNALLOCATED_REFERENCE",
          message:"Bei "+c.name+" bleiben "+(row.notAllocatedCents/100).toFixed(2)+
            " € nicht zugeordnet. Keine stille Umlage.",action:c.method==="Verbrauch"?"go-water":"go-costs"});
      }
      if(reference&&["Personenzahl fehlt","Miettage fehlen","Wohnfläche fehlt",
        "Wohneinheiten fehlen","Keine berechtigten Mieter"].includes(reference.status))
        issues.push({code:"ZERO_BASIS",message:"Umlagegrundlage für "+c.name+" fehlt.",action:"go-costs"});
      return row;
    });
    let advancesCents=0,distributedCents=0;
    for(const unit of resultUnits){
      unit.balanceCents=unit.costCents-unit.advanceCents;
      advancesCents+=unit.advanceCents;distributedCents+=unit.costCents;
    }
    const totals={...preliminary.totals,advancesCents,distributedCents,
      balanceCents:distributedCents-advancesCents,
      differenceCents:preliminary.totals.allocableCostsCents-distributedCents};
    return {kind:"synthetic-reference-billing",units:resultUnits,costs,issues,totals,
      valid:issues.length===0&&totals.differenceCents===0,
      readyForRealFinalization:false};
  }
  return {calculate,proportionalCents,METHODS};
});