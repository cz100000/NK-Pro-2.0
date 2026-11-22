/* NK-Pro 2.0 synthetic-only water & meter-period engine.
 * Two independent KW/WW channels per unit, multiple physical segments,
 * original decimal readings preserved, optional evidence-gated 2025 rounding,
 * replacement events and controlled year-start previews. Not a production port.
 */
(function(root,factory){
 "use strict";const api=Object.freeze(factory());
 if(typeof module!=="undefined"&&module.exports)module.exports=api;
 else root.NKPRO2_WATER_DETAIL=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
 "use strict";
 const date=s=>{
   if(typeof s!=="string"||!/^\d{4}-\d{2}-\d{2}$/.test(s))return false;
   const d=new Date(s+"T00:00:00Z");
   return Number.isFinite(d.valueOf())&&d.toISOString().slice(0,10)===s;
 };
 const volume=v=>typeof v!=="boolean"&&v!==""&&v!==null&&v!==undefined&&
   Number.isFinite(Number(v))&&Number(v)>=0;
 const money=volume;
 const round4=n=>Math.round((n+Number.EPSILON)*10000)/10000;
 const defaults=(start="",end="")=>({start,end,startDate:"2025-01-01",endDate:"2025-12-30",number:""});
 const clone=x=>JSON.parse(JSON.stringify(x));
 function assertSynthetic(state){
   if(!state||state.fixture!==true||state.period!=="2025"||
      !Array.isArray(state.units)||!Array.isArray(state.costs))
     throw new TypeError("Synthetic 2025 water fixture required");
 }
 function example(state){
   assertSynthetic(state);
   const units=state.units.map((u,i)=>{
     const total=Number(u.waterEnd)-Number(u.waterStart);
     if(!Number.isSafeInteger(total)||total<10)throw new Error("Unexpected example water unit");
     const cold={...defaults(Number(u.waterStart),Number(u.waterEnd)-10),
       number:"DEMO-KW-"+String(i+1).padStart(2,"0")};
     const hot={...defaults(300+i*20,310+i*20),
       number:"DEMO-WW-"+String(i+1).padStart(2,"0")};
     return {...u,waterMeters:{cold,hot},waterNote:""};
   });
   return {...state,waterSettings:{houseMeterNumber:"DEMO-HZ-2025",
     houseStart:700,houseEnd:966,houseStartDate:"2025-01-01",
     houseEndDate:"2025-12-30",invoiceNote:"Nur synthetische Musterrechnung."},
     units};
 }
 function upgrade(state){
   assertSynthetic(state);
   const units=state.units.map(u=>{
     if(u.waterMeters&&u.waterMeters.cold&&u.waterMeters.hot)
       return {...u,waterMeters:clone(u.waterMeters)};
     return {...u,waterMeters:{
       cold:{...defaults(u.waterStart??"",u.waterEnd??"")},
       hot:{...defaults("","")}
     },waterSourceNotice:"Frühere Ein-Zähler-Demo: KW-Stand übernommen, WW nicht bekannt.",waterNote:u.waterNote||""};
   });
   const costs=state.costs.map(c=>({...c,note:String(c.note??""),
     priceMode:c.priceMode==="manual"?"manual":"auto"}));
   return {...state,units,costs,waterSettings:state.waterSettings&&
     typeof state.waterSettings==="object"?{...state.waterSettings}:{
       houseMeterNumber:"",houseStart:"",houseEnd:"",
       houseStartDate:"2025-01-01",houseEndDate:"2025-12-30",invoiceNote:""
     }};
 }
 function readingResult(row,roundEach){
   if(!row||!volume(row.start)||!volume(row.end))
     return {complete:false,valid:false,consumption:null,rawConsumption:null,reason:"Zählerstand fehlt"};
   const start=Number(row.start),end=Number(row.end);
   if(end<start)
     return {complete:true,valid:false,consumption:null,rawConsumption:null,reason:"Endstand liegt unter Anfang"};
   if(!date(row.startDate)||!date(row.endDate)||row.startDate>row.endDate)
     return {complete:true,valid:false,consumption:null,rawConsumption:null,reason:"Ablesedatum fehlt oder ist unplausibel"};
   const raw=end-start,billed=roundEach?Math.round(end)-Math.round(start):raw;
   return {complete:true,valid:true,consumption:billed,rawConsumption:raw,reason:"OK"};
 }
 function meterResult(meter,options={}){
   const rounded=options&&options.roundEachToWhole===true;
   if(!meter)return readingResult(meter,rounded);
   if(!Array.isArray(meter.segments)||meter.segments.length===0)
     return readingResult(meter,rounded);
   const rows=meter.segments;
   const numbers=new Set();let last=null,raw=0,total=0;
   for(const row of rows){
     const r=readingResult(row,rounded);
     if(!r.valid)return {...r,reason:"Messperiode: "+r.reason};
     const key=String(row.id||row.number||"").trim();
     if(!key)return {complete:false,valid:false,consumption:null,rawConsumption:null,
       reason:"Messperiode ohne Zählerkennung"};
     if(numbers.has(key))return {complete:false,valid:false,consumption:null,rawConsumption:null,
       reason:"Zählerkennung ist in Wechselkette doppelt"};
     numbers.add(key);
     if(last&&row.startDate<last)
       return {complete:true,valid:false,consumption:null,rawConsumption:null,
         reason:"Messperioden überschneiden sich"};
     last=row.endDate;
     raw+=r.rawConsumption;total+=r.consumption;
   }
   return {complete:true,valid:true,consumption:total,rawConsumption:raw,segments:rows.length,reason:"OK"};
 }
 function previousDay(s){return new Date(Date.parse(s+"T00:00:00Z")-86400000).toISOString().slice(0,10)}
 function followingDay(s){return new Date(Date.parse(s+"T00:00:00Z")+86400000).toISOString().slice(0,10)}
 function vacancyFromReadings(state){
   assertSynthetic(state);
   const out={};
   if(!Array.isArray(state.tenancies))return out;
   for(const u of state.units){
     const tenancy=state.tenancies.filter(t=>t.unitId===u.id&&date(t.start)&&date(t.end))
       .map(t=>({...t,start:t.start<"2025-01-01"?"2025-01-01":t.start,
         end:t.end>"2025-12-31"?"2025-12-31":t.end}))
       .filter(t=>t.start<=t.end).sort((a,b)=>a.start.localeCompare(b.start));
     const gaps=[],channels=["cold","hot"],gapRows=[];
     let nextStart="2025-01-01",previous=null;
     for(const t of tenancy){
       if(t.start>nextStart)gaps.push({start:nextStart,end:previousDay(t.start),
         before:previous?.end||"2025-01-01",after:t.start});
       if(followingDay(t.end)>nextStart)nextStart=followingDay(t.end);
       previous=t;
     }
     if(nextStart<="2025-12-31")gaps.push({start:nextStart,end:"2025-12-31",
       before:previous?.end||"2025-01-01",after:"2025-12-31"});
     let complete=true,cold=0,hot=0;
     for(const gap of gaps){
       const quantities={};
       for(const key of channels){
         const meter=u.waterMeters?.[key],history=meter?.interimReadings||[];
         const read=when=>{
           if(meter?.segments?.length>1)return null; // never subtract across replaced physical meters
           const record=history.find(x=>x.date===when);
           if(record&&volume(record.value))return Number(record.value);
           if(meter?.startDate===when&&volume(meter.start))return Number(meter.start);
           if(meter?.endDate===when&&volume(meter.end))return Number(meter.end);
           return null;
         };
         const before=read(gap.before),after=read(gap.after);
         if(before===null||after===null||after<before){quantities[key]=null;complete=false;}
         else quantities[key]=after-before;
       }
       if(quantities.cold!==null)cold+=quantities.cold;
       if(quantities.hot!==null)hot+=quantities.hot;
       gapRows.push({...gap,days:(Date.parse(gap.end)-Date.parse(gap.start))/86400000+1,
         cold:quantities.cold,hot:quantities.hot,valid:quantities.cold!==null&&quantities.hot!==null});
     }
     out[u.id]={valid:complete,cold:gaps.length&&complete?cold:0,
       hot:gaps.length&&complete?hot:0,gaps:gapRows};
   }
   return out;
 }
 function addInterimReading(state,unitId,kind,at,value){
   assertSynthetic(state);
   if(!date(at)||!["cold","hot"].includes(kind)||!volume(value))
     throw new RangeError("Invalid synthetic interim reading");
   const result=upgrade(state),u=result.units.find(x=>x.id===unitId);
   if(!u?.waterMeters?.[kind])throw new RangeError("Unknown meter");
   const meter=u.waterMeters[kind];
   if(!date(meter.startDate)||!date(meter.endDate)||at<meter.startDate||at>meter.endDate)
     throw new RangeError("Reading date outside physical period");
   const history=Array.isArray(meter.interimReadings)?meter.interimReadings.slice():[];
   if(history.some(x=>x.date===at))throw new RangeError("Duplicate interim reading date");
   const all=[{date:meter.startDate,value:meter.start},...history,
     {date:meter.endDate,value:meter.end},{date:at,value:Number(value)}]
     .sort((a,b)=>a.date.localeCompare(b.date));
   for(let i=1;i<all.length;i++)if(all[i].date>all[i-1].date&&Number(all[i].value)<Number(all[i-1].value))
     throw new RangeError("Interim reading reverses meter sequence");
   meter.interimReadings=[...history,{date:at,value:Number(value)}].sort((a,b)=>a.date.localeCompare(b.date));
   return result;
 }
 function precisionPolicy(state){
   const v=state?.meta?.confirmed2025Evidence?.water;
   return state?.period==="2025"&&v?.houseConsumption===275&&v?.readingDate==="2025-12-30";
 }
 function priceFor(cost,invoice){
   if(!cost||!money(cost.amount)||!money(cost.landlordShare??0)||
     Number(cost.landlordShare??0)>Number(cost.amount)||!volume(invoice)||Number(invoice)<=0)
     return {valid:false,auto:null,effective:null,mode:"auto",reason:"Kosten oder Rechnungsverbrauch unvollständig"};
   const amount=Number(cost.amount)-Number(cost.landlordShare??0);
   const automaticRaw=amount/Number(invoice),auto=round4(automaticRaw);
   const isManual=cost.priceMode==="manual";
   const manual=Number(cost.unitPrice);
   if(isManual&&(!money(cost.unitPrice)||manual<=0||manual>100000))
     return {valid:false,auto,effective:null,mode:"manual",reason:"Manueller Einheitspreis muss positiv sein"};
   return {valid:true,auto,autoRaw:automaticRaw,effective:isManual?round4(manual):auto,
     effectiveRaw:isManual?manual:automaticRaw,mode:isManual?"manual":"auto",reason:""};
 }
 function diagnostics(state){
   assertSynthetic(state);
   const issues=[],roundEach=precisionPolicy(state),vacancyByUnit=vacancyFromReadings(state);
   const rows=state.units.map(u=>{
     const cold=meterResult(u.waterMeters?.cold,{roundEachToWhole:roundEach});
     const hot=meterResult(u.waterMeters?.hot,{roundEachToWhole:roundEach});
     for(const [key,m] of [["KW",cold],["WW",hot]])
       if(!m.valid)issues.push({code:"METER_"+key+"_INCOMPLETE",unitId:String(u.id),reason:m.reason});
     return {id:u.id,label:u.label,cold,hot,valid:cold.valid&&hot.valid,
       total:cold.valid&&hot.valid?cold.consumption+hot.consumption:null};
   });
   const totals={
     cold:rows.every(r=>r.cold.valid)?rows.reduce((s,r)=>s+r.cold.consumption,0):null,
     hot:rows.every(r=>r.hot.valid)?rows.reduce((s,r)=>s+r.hot.consumption,0):null,
     units:rows.every(r=>r.valid)?rows.reduce((s,r)=>s+r.total,0):null
   };
   const setting=state.waterSettings||{},house=meterResult({
     start:setting.houseStart,end:setting.houseEnd,
     startDate:setting.houseStartDate,endDate:setting.houseEndDate
   });
   if(!house.valid)issues.push({code:"HOUSE_METER_INCOMPLETE",reason:house.reason});
   const invoice=volume(state.houseWater)?Number(state.houseWater):null;
   if(invoice===null||invoice<=0)issues.push({code:"INVOICE_VOLUME_INVALID",reason:"Rechnungsverbrauch fehlt"});
   const delta={
     invoiceHouse:invoice!==null&&house.valid?invoice-house.consumption:null,
     houseUnits:house.valid&&totals.units!==null?house.consumption-totals.units:null,
     invoiceUnits:invoice!==null&&totals.units!==null?invoice-totals.units:null
   };
   return {rows,totals,invoice,house,delta,issues,vacancyByUnit,roundEachToWhole:roundEach,
     canReview:issues.length===0,exactMatch:issues.length===0&&delta.invoiceHouse===0&&delta.houseUnits===0};
 }
 function registerReplacement(state,unitId,kind,event){
   assertSynthetic(state);
   if(!["cold","hot"].includes(kind))throw new RangeError("Unknown channel");
   const current=upgrade(state),unit=current.units.find(u=>String(u.id)===String(unitId));
   if(!unit)throw new RangeError("Unknown synthetic unit");
   const m=unit.waterMeters?.[kind];
   if(!m)throw new RangeError("Missing meter");
   if(!event||!date(event.at)||!volume(event.oldEnd)||!volume(event.newStart)||
      !volume(event.newEnd)||Number(event.newEnd)<Number(event.newStart)||
      !String(event.newNumber||"").trim())throw new TypeError("Invalid replacement readings");
   const first=m.segments&&m.segments.length?m.segments.map(x=>({...x})):[
     {id:String(m.number||kind+"-PREVIOUS"),number:String(m.number||kind+"-PREVIOUS"),
      start:m.start,end:m.end,startDate:m.startDate,endDate:m.endDate}
   ];
   const last=first[first.length-1];
   if(!volume(last.start)||Number(event.oldEnd)<Number(last.start)||
     !date(last.startDate)||event.at<=last.startDate||event.at>=last.endDate)
     throw new RangeError("Invalid meter replacement date / old reading");
   if(first.some(row=>String(row.id||row.number)===String(event.newNumber)))
     throw new RangeError("Replacement meter ID already used");
   last.end=Number(event.oldEnd);last.endDate=event.at;
   first.push({id:String(event.newNumber),number:String(event.newNumber),
     start:Number(event.newStart),end:Number(event.newEnd),
     startDate:event.at,endDate:String(m.endDate),
     note:String(event.note||"").slice(0,2000)});
   const proposed={...m,segments:first};
   if(!meterResult(proposed).valid)throw new RangeError("Replacement measurement periods are invalid");
   unit.waterMeters[kind]=proposed;
   return current;
 }
 function carryForwardPreview(previous,current){
   assertSynthetic(current);
   if(!previous||previous.fixture!==true||previous.period!=="2024"||!Array.isArray(previous.units))
     throw new TypeError("Synthetic previous-year sample required");
   const currentMap=new Map(current.units.map(u=>[u.id,u]));
   const proposals=[];
   for(const u of previous.units){
     const next=currentMap.get(u.id);if(!next)continue;
     for(const kind of ["cold","hot"]){
       const p=u.waterMeters?.[kind],n=next.waterMeters?.[kind];
       if(!p||!n)continue;
       const source=p.segments?.length?p.segments.at(-1):p;
       const number=String(source.number||source.id||"");
       const matches=number!==""&&number===String(n.number||"");
       proposals.push({unitId:u.id,kind,meterNumber:number,previousEnd:source.end,
         currentStart:n.start,status:!matches?"meter-changed":
           !volume(source.end)?"missing-previous-end":
           n.start!==""&&n.start!==undefined&&n.start!==null?"current-start-already-set":"ready"});
     }
   }
   return proposals;
 }
 return {example,upgrade,meterResult,diagnostics,priceFor,round4,volume,date,
   precisionPolicy,registerReplacement,carryForwardPreview,vacancyFromReadings,addInterimReading,version:"synthetic-water-domain-v2"};
});