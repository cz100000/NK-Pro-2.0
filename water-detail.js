/* NK-Pro 2.0 / explicitly synthetic-only 2025 water-entry domain.
 * No use of actual NK-Pro data. Preserves old demo edits on upgrade; it NEVER
 * invents a warm-water reading or historic carry-forward in an upgraded state.
 */
(function(root,factory){
  "use strict";
  const api=Object.freeze(factory());
  if(typeof module!=="undefined"&&module.exports)module.exports=api;
  else root.NKPRO2_WATER_DETAIL=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
  "use strict";
  const channels=Object.freeze(["cold","hot"]);
  const date=s=>{
    if(typeof s!=="string"||!/^\d{4}-\d{2}-\d{2}$/.test(s))return false;
    const d=new Date(s+"T00:00:00Z");
    return Number.isFinite(d.valueOf())&&d.toISOString().slice(0,10)===s;
  };
  const volume=v=>typeof v!=="boolean"&&v!==""&&v!==null&&v!==undefined&&
    Number.isSafeInteger(Number(v))&&Number(v)>=0;
  const money=v=>typeof v!=="boolean"&&v!==""&&v!==null&&v!==undefined&&
    Number.isFinite(Number(v))&&Number(v)>=0;
  const round4=n=>Math.round((n+Number.EPSILON)*10000)/10000;
  const emptyNumber=v=>v===null||v===undefined||v==="";
  const defaults=(start="",end="")=>({start,end,startDate:"2025-01-01",endDate:"2025-12-30",number:""});
  function example(state){
    if(!state||state.fixture!==true||state.period!=="2025")
      throw new TypeError("Synthetic demo fixture required");
    const units=state.units.map((u,i)=>{
      const total=Number(u.waterEnd)-Number(u.waterStart);
      const cold={...defaults(Number(u.waterStart),Number(u.waterEnd)-10),
        number:"DEMO-KW-"+String(i+1).padStart(2,"0")};
      const hot={...defaults(300+i*20,310+i*20),
        number:"DEMO-WW-"+String(i+1).padStart(2,"0")};
      if(!Number.isSafeInteger(total)||total<10)throw new Error("Unexpected example water unit");
      return {...u,waterMeters:{cold,hot},waterNote:""};
    });
    return {...state,waterSettings:{houseMeterNumber:"DEMO-HZ-2025",
      houseStart:700,houseEnd:966,houseStartDate:"2025-01-01",
      houseEndDate:"2025-12-30",invoiceNote:"Nur synthetische Musterrechnung."},
      units};
  }
  function upgrade(state){
    if(!state||state.fixture!==true||state.period!=="2025"||
       !Array.isArray(state.units)||!Array.isArray(state.costs))
      throw new TypeError("Synthetic demo fixture required");
    const units=state.units.map(u=>{
      if(u.waterMeters&&u.waterMeters.cold&&u.waterMeters.hot)return {...u};
      // Historic one-meter demo cannot be claimed to be physically real KW/WW.
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
  function meterResult(meter){
    if(!meter||!volume(meter.start)||!volume(meter.end))
      return {complete:false,valid:false,consumption:null,reason:"Zählerstand fehlt"};
    if(Number(meter.end)<Number(meter.start))
      return {complete:true,valid:false,consumption:null,reason:"Endstand liegt unter Anfang"};
    if(!date(meter.startDate)||!date(meter.endDate)||
      meter.startDate>meter.endDate)
      return {complete:true,valid:false,consumption:null,reason:"Ablesedatum fehlt oder ist unplausibel"};
    return {complete:true,valid:true,consumption:Number(meter.end)-Number(meter.start),reason:"OK"};
  }
  function priceFor(cost,invoice){
    if(!cost||!money(cost.amount)||!money(cost.landlordShare??0)||
      Number(cost.landlordShare??0)>Number(cost.amount)||!volume(invoice)||Number(invoice)<=0)
      return {valid:false,auto:null,effective:null,mode:"auto",reason:"Kosten oder Rechnungsverbrauch unvollständig"};
    const amount=Number(cost.amount)-Number(cost.landlordShare??0);
    const automatic=round4(amount/Number(invoice));
    const isManual=cost.priceMode==="manual";
    const manual=Number(cost.unitPrice);
    if(isManual&&(!money(cost.unitPrice)||manual<=0||manual>100000))
      return {valid:false,auto:automatic,effective:null,mode:"manual",reason:"Manueller Einheitspreis muss positiv sein"};
    return {valid:true,auto:automatic,
      effective:isManual?round4(manual):automatic,mode:isManual?"manual":"auto",reason:""};
  }
  function diagnostics(data){
    if(!data||data.fixture!==true||data.period!=="2025"||!Array.isArray(data.units))
      throw new TypeError("Synthetic 2025 water diagnostics only");
    const issues=[], rows=data.units.map(u=>{
      const cold=meterResult(u.waterMeters?.cold),hot=meterResult(u.waterMeters?.hot);
      for(const [key,m] of [["KW",cold],["WW",hot]])
        if(!m.valid)issues.push({code:"METER_"+key+"_INCOMPLETE",unitId:String(u.id),
          reason:m.reason});
      return{id:u.id,label:u.label,cold,hot,valid:cold.valid&&hot.valid,
        total:cold.valid&&hot.valid?cold.consumption+hot.consumption:null};
    });
    const totals={
      cold:rows.every(r=>r.cold.valid)?rows.reduce((s,r)=>s+r.cold.consumption,0):null,
      hot:rows.every(r=>r.hot.valid)?rows.reduce((s,r)=>s+r.hot.consumption,0):null,
      units:rows.every(r=>r.valid)?rows.reduce((s,r)=>s+r.total,0):null
    };
    const setting=data.waterSettings||{},house=meterResult({
      start:setting.houseStart,end:setting.houseEnd,
      startDate:setting.houseStartDate,endDate:setting.houseEndDate
    });
    if(!house.valid)issues.push({code:"HOUSE_METER_INCOMPLETE",reason:house.reason});
    const invoice=volume(data.houseWater)?Number(data.houseWater):null;
    if(invoice===null||invoice<=0)
      issues.push({code:"INVOICE_VOLUME_INVALID",reason:"Rechnungsverbrauch fehlt"});
    const delta={
      invoiceHouse:invoice!==null&&house.valid?invoice-house.consumption:null,
      houseUnits:house.valid&&totals.units!==null?house.consumption-totals.units:null,
      invoiceUnits:invoice!==null&&totals.units!==null?invoice-totals.units:null
    };
    return{rows,totals,invoice,house,
      delta,issues,canReview:issues.length===0,
      exactMatch:issues.length===0&&delta.invoiceHouse===0&&delta.houseUnits===0};
  }
  return{example,upgrade,meterResult,diagnostics,priceFor,round4,volume,date,version:"synthetic-water-ux-1"};
});