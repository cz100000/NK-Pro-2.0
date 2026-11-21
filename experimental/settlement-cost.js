/* NK-Pro 2.0 – experimental reference-compatible cost distribution.
   NOT wired into the live demo. NOT a replacement for the full V99.4.86 engine.
   Covers six selected methods only; use exclusively with synthetically constructed test fixtures.
   No DOM, network, storage, imports or actual tenants. */
(function(root,factory){
"use strict";
const api=Object.freeze(factory());
if(typeof module!=="undefined"&&module.exports)module.exports=api;
else root.NKPRO2_EXPERIMENTAL_ALLOCATION=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
"use strict";
const SUPPORTED=Object.freeze(["Wohnfläche","Personen","Miettage","Verbrauch","Verteilung auf alle Wohneinheiten","Verteilung nur auf aktive Wohneinheiten"]);
const num=v=>Number.isFinite(Number(v))?Number(v):0;
const days=t=>num(t.days);
const area=t=>num(t.area);
const personDays=t=>num(t.personDays)||num(t.persons)*days(t);
const moneyRound=n=>Math.round((n+Number.EPSILON)*100)/100;
const status=owner=>Math.abs(owner)<=.01?"Vollständig":owner>0?"Nicht auf Mieter umgelegt":"Überverteilung prüfen";
const result=(cost,allocations,ownerShare,basisTotal,inputSum,state,extra={})=>({costId:cost.id,allocations,ownerShare,basisTotal,inputSum,status:state,...extra});
function calculateCost(input){
  if(!input||typeof input!=="object")throw new TypeError("Explicit reference input required");
  const {cost,tenants,units}=input;
  if(!cost||!Array.isArray(tenants)||!Array.isArray(units))throw new TypeError("Incomplete settlement context");
  if(!SUPPORTED.includes(cost.method))throw new RangeError("Unsupported legacy method: "+cost.method);
  const ids=tenants.map(t=>String(t.id));
  if(new Set(ids).size!==ids.length)throw new RangeError("Duplicate participant IDs");
  const all=Object.fromEntries(ids.map(id=>[id,0]));
  const total=num(cost.amount);
  if(!Number.isFinite(Number(cost.amount))||total<0)throw new RangeError("Invalid cost amount");
  if(total<=0)return result(cost,all,0,0,0,"Gesamtbetrag fehlt");
  const eligible=tenants.filter(t=>!Array.isArray(cost.excludedTenantIds)||!cost.excludedTenantIds.includes(t.id));
  if(!eligible.length)return result(cost,all,total,0,0,"Keine berechtigten Mieter");
  const ownerMode=cost.exclusionMode==="owner";
  const basis=ownerMode?tenants:eligible;
  let ownerShare=0,basisTotal=0,inputSum=0;
  const finalize=(description,extra={})=>{
    if(ownerMode)for(const tenant of tenants)if(!eligible.includes(tenant)){
      ownerShare+=all[tenant.id]||0;all[tenant.id]=0;
    }
    const state=ownerMode&&["Vollständig","Nicht auf Mieter umgelegt","Überverteilung prüfen"].includes(description)?status(ownerShare):description;
    return result(cost,all,ownerShare,basisTotal,inputSum,state,extra);
  };
  if(cost.method==="Verbrauch"){
    const house=num(cost.houseConsumption);
    const price=cost.manualPrice||house<=0?num(cost.pricePerUnit):total/house;
    for(const tenant of basis)inputSum+=num(tenant.consumption);
    for(const tenant of basis)all[tenant.id]=moneyRound(num(tenant.consumption)*price);
    ownerShare=moneyRound(total-basis.reduce((sum,t)=>sum+all[t.id],0));
    return finalize(status(ownerShare));
  }
  if(cost.method==="Wohnfläche"){
    const period=Math.max(0,...basis.map(days))||365;
    const activeAreaDays=units.filter(u=>u.active).reduce((sum,u)=>sum+num(u.area)*period,0);
    const tenantAreaDays=basis.reduce((sum,t)=>sum+area(t)*days(t),0);
    basisTotal=ownerMode?(activeAreaDays||tenantAreaDays):tenantAreaDays;
    for(const tenant of basis)all[tenant.id]=basisTotal>0?total*area(tenant)*days(tenant)/basisTotal:0;
    ownerShare=total-basis.reduce((sum,t)=>sum+all[t.id],0);
    return finalize(basisTotal>0?status(ownerShare):"Wohnfläche fehlt");
  }
  if(cost.method==="Personen"||cost.method==="Miettage"){
    const weight=t=>cost.method==="Personen"?personDays(t):days(t);
    basisTotal=basis.reduce((sum,t)=>sum+weight(t),0);
    for(const tenant of basis)all[tenant.id]=basisTotal>0?total*weight(tenant)/basisTotal:0;
    return finalize(basisTotal>0?"Vollständig":cost.method==="Personen"?"Personenzahl fehlt":"Miettage fehlen");
  }
  const physical=cost.method==="Verteilung nur auf aktive Wohneinheiten"?units.filter(u=>u.active):units;
  basisTotal=physical.length;
  const per=physical.length?total/physical.length:0;
  const unitAllocations={};
  for(const unit of physical){
    unitAllocations[unit.id]=per;
    const present=basis.filter(t=>t.unitId===unit.id&&days(t)>0);
    const unitDays=present.reduce((sum,t)=>sum+days(t),0);
    for(const tenant of present)all[tenant.id]+=unitDays>0?per*days(tenant)/unitDays:0;
  }
  const tenantSum=Object.values(all).reduce((sum,value)=>sum+value,0);
  const unitTotal=Object.values(unitAllocations).reduce((sum,value)=>sum+value,0);
  ownerShare=unitTotal-tenantSum;
  return finalize(physical.length?status(ownerShare):"Wohneinheiten fehlen",{
    unitAllocations,unitTotal,notAssignedToTenantShare:unitTotal-tenantSum
  });
}
return {calculateCost,SUPPORTED,version:"legacy-parity-experimental-1"};
});
