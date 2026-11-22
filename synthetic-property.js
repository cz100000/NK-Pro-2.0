/* NK-Pro 2.0: Synthetic-only tenancy and occupancy model. No real identifiers.
 * Explicit scope 2025; no actual imported records, no persistence or I/O.
 * Validates overlapping periods and incomplete case-wise meter consumption.
 */
(function(root,factory){
 "use strict";const api=Object.freeze(factory());
 if(typeof module!=="undefined"&&module.exports)module.exports=api;else root.NKPRO2_PROPERTY=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
 "use strict";
 const YEAR="2025",FROM="2025-01-01",TO="2025-12-31";
 const date=s=>{if(typeof s!=="string"||!/^\d{4}-\d{2}-\d{2}$/.test(s))return false;
 const n=new Date(s+"T00:00:00Z");return !Number.isNaN(n.valueOf())&&n.toISOString().slice(0,10)===s};
 const ordinal=s=>Math.floor(Date.parse(s+"T00:00:00Z")/86400000);
 const days=(a,b)=>ordinal(b)-ordinal(a)+1;
 const number=v=>v!==""&&v!==undefined&&v!==null&&typeof v!=="boolean"&&Number.isFinite(Number(v));
 const validAmount=v=>number(v)&&Number(v)>=0&&Math.round(Number(v)*100)/100===Number(v);
 function checkState(state){
   if(!state||state.fixture!==true||state.period!==YEAR||!Array.isArray(state.units)||!Array.isArray(state.costs))
      throw new TypeError("Synthetic 2025 fixture required; real data rejected");
 }
 function upgrade(state){
   checkState(state);
   const output={...state,units:state.units.map(x=>({...x})),costs:state.costs.map(c=>({...c}))};
   const base=output.units.map((u,i)=>({
      id:"SYN-T"+String(i+1).padStart(2,"0"),unitId:String(u.id),
      name:"Musterperson "+String.fromCharCode(65+i),start:FROM,end:TO,
      persons:u.people??1,role:"Mieter",advance:u.advance??0,note:"",
      consumptionCold:null,consumptionHot:null
   }));
   output.tenancies=Array.isArray(state.tenancies)?
     state.tenancies.map(t=>({...t})):base;
   output.property={id:"SYN-OBJ-01",name:"Musterobjekt",buildingId:"SYN-G01",
     ...((state.property&&typeof state.property==="object")?state.property:{})};
   output.costs=output.costs.map(c=>({
     ...c,active:c.active!==false,exclusionMode:c.exclusionMode==="owner"?"owner":"full",
     excludedTenantIds:Array.isArray(c.excludedTenantIds)?c.excludedTenantIds.slice():[],
     consumptionUnit:c.consumptionUnit||"m³",
     consumptionTotal:c.consumptionTotal??(c.id==="water"?state.houseWater:null)
   }));
   return output;
 }
 function inspect(state,waterReport){
   checkState(state);
   const errors=[],warnings=[],cases=[],vacancy=[],units=new Map(),tenantIds=new Set();
   const err=(code,message,entityId)=>errors.push({code,message,entityId,action:"go-tenancies"});
   const warn=(code,message,entityId)=>warnings.push({code,message,entityId,action:"go-tenancies"});
   for(const u of state.units){
     if(!u||!u.id||units.has(String(u.id))){err("INVALID_UNIT","Wohnungs-ID fehlt oder ist doppelt.",u?.id);continue}
     units.set(String(u.id),u);
     if(!(Number(u.area)>0))err("INVALID_AREA","Ungültige Wohnfläche für "+u.id,u.id);
   }
   const grouped=new Map([...units.keys()].map(k=>[k,[]]));
   const all=Array.isArray(state.tenancies)?state.tenancies:[];
   if(!all.length)err("NO_TENANCIES","Es gibt keine Abrechnungsfälle.",null);
   for(const t of all){
     if(!t||typeof t.id!=="string"||!t.id||tenantIds.has(t.id)){
       err("DUPLICATE_TENANCY","Mietverhältnis-ID fehlt oder ist doppelt.",t?.id);continue}
     tenantIds.add(t.id);
     const u=units.get(String(t.unitId));
     if(!u){err("TENANCY_UNIT_MISSING","Wohnungszuordnung fehlt: "+t.id,t.id);continue}
     if(!t.name||!String(t.name).trim())err("TENANCY_NAME_MISSING","Name des Abrechnungsfalls fehlt: "+t.id,t.id);
     if(!date(t.start)||!date(t.end)||t.start>t.end){
       err("INVALID_TENANCY_DATES","Ungültige Ein-/Auszugsdaten: "+t.id,t.id);continue}
     if(t.end<FROM||t.start>TO){warn("OUTSIDE_PERIOD","Mietzeitraum außerhalb der Abrechnung: "+t.id,t.id);continue}
     const start=t.start<FROM?FROM:t.start,end=t.end>TO?TO:t.end;
     const people=Number(t.persons);
     if(!Number.isSafeInteger(people)||people<0||people>1000)
       err("INVALID_PERSONS","Ungültige Personenzahl: "+t.id,t.id);
     if(!validAmount(t.advance))
       err("INVALID_ADVANCE","Ungültige Vorauszahlung: "+t.id,t.id);
     if(!["Mieter","Privatanteil","Eigennutzung"].includes(t.role))
       err("INVALID_ROLE","Unbekannte Nutzung: "+t.id,t.id);
     const row={id:t.id,name:String(t.name),unitId:u.id,role:t.role,
       start,end,days:days(start,end),persons:people,personDays:people*days(start,end),
       area:Number(u.area),advance:Number(t.advance),consumption:null,cold:null,hot:null,
       caseInput:t};
     cases.push(row);grouped.get(u.id).push(row);
   }
   const meterRows=new Map((waterReport?.rows||[]).map(x=>[String(x.id),x]));
   for(const [unitId,rows] of grouped){
     rows.sort((a,b)=>a.start.localeCompare(b.start)||a.end.localeCompare(b.end));
     let cursor=FROM;
     for(const row of rows){
       if(row.start<cursor){
         err("OVERLAPPING_TENANCIES","Überschneidende Mietverhältnisse in "+unitId,unitId);
       }else if(row.start>cursor){
         vacancy.push({unitId,start:cursor,end:shift(row.start,-1),
            days:days(cursor,shift(row.start,-1))});
       }
       const next=shift(row.end,1);
       if(next>cursor)cursor=next;
     }
     if(cursor<=TO)vacancy.push({unitId,start:cursor,end:TO,days:days(cursor,TO)});
     const meter=meterRows.get(unitId);
     if(!meter||!meter.cold.valid||!meter.hot.valid)continue;
     if(rows.length===1){
       const r=rows[0];r.cold=meter.cold.consumption;r.hot=meter.hot.consumption;
       r.consumption=r.cold+r.hot;
     }else if(rows.length>1){
       let coldSum=0,hotSum=0,complete=true;
       for(const row of rows){
         const t=row.caseInput;
         if(!number(t.consumptionCold)||Number(t.consumptionCold)<0||
            !number(t.consumptionHot)||Number(t.consumptionHot)<0){
           complete=false;continue;
         }
         row.cold=Number(t.consumptionCold);row.hot=Number(t.consumptionHot);
         row.consumption=row.cold+row.hot;
         coldSum+=row.cold;hotSum+=row.hot;
       }
       if(!complete)err("CASE_WATER_SPLIT_MISSING",
         "Bei Mieterwechsel sind KW-/WW-Mengen je Abrechnungsfall erforderlich: "+unitId,unitId);
       else if(Math.abs(coldSum-meter.cold.consumption)>0.000001||
         Math.abs(hotSum-meter.hot.consumption)>0.000001)
         err("CASE_WATER_MISMATCH","Einzelverbräuche stimmen nicht mit KW-/WW-Zählern überein: "+unitId,unitId);
     }
     if(rows.length===0)warn("VACANT_METER_CONSUMPTION",
       "Wohnungsverbrauch ohne Abrechnungsfall: "+unitId,unitId);
   }
   return {cases,vacancy,issues:errors,warnings,valid:errors.length===0,
       occupiedDays:cases.reduce((s,c)=>s+c.days,0),
       vacancyDays:vacancy.reduce((s,c)=>s+c.days,0)};
 }
 function shift(input,offset){const ms=Date.parse(input+"T00:00:00Z")+offset*86400000;return new Date(ms).toISOString().slice(0,10)}
 function updateTenancy(state,entry){
   checkState(state);
   if(!entry||!entry.id||!entry.unitId||!date(entry.start)||!date(entry.end)||entry.start>entry.end)
     throw new TypeError("Complete synthetic tenancy entry required");
   if(!state.units.some(u=>String(u.id)===String(entry.unitId)))
     throw new RangeError("Unknown synthetic unit");
   if(!validAmount(entry.advance))throw new RangeError("Invalid advance");
   if(!Number.isSafeInteger(Number(entry.persons))||Number(entry.persons)<0)throw new RangeError("Invalid persons");
   const current=upgrade(state);
   const idx=current.tenancies.findIndex(t=>t.id===entry.id);
   const next={...(idx>=0?current.tenancies[idx]:{}),...entry,
     persons:Number(entry.persons),advance:Number(entry.advance)};
   if(idx>=0)current.tenancies[idx]=next;else current.tenancies.push(next);
   return current;
 }
 function removeTenancy(state,id){
   const next=upgrade(state);next.tenancies=next.tenancies.filter(t=>t.id!==id);return next;
 }
 return {upgrade,inspect,updateTenancy,removeTenancy,days,shift,date,
  version:"synthetic-tenancy-v1",FROM,TO};
});