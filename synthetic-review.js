/* Synthetic-only Stufe-4-Prüfvorschau: keine produktive Freigabe.
 * 44 Original-IDs, davon 25 synthetische Teilchecks; 19 explizit NICHT AUSGEFÜHRT.
 */
(function(root,factory){const api=Object.freeze(factory());if(typeof module!=="undefined"&&module.exports)module.exports=api;else root.NKPRO2_REVIEW=api;})(typeof globalThis!=="undefined"?globalThis:this,function(){
"use strict";
const rules=[["NKP-FACH-001","Abrechnungszeitraum ist gültig","start"],["NKP-FACH-002","Mindestens eine aktive Wohnung ist vorhanden","wohnungsverwaltung"],["NKP-FACH-003","Mindestens ein Abrechnungsteilnehmer ist vorhanden","mieterverwaltung"],["NKP-FACH-004","Mietername ist vorhanden","mieterverwaltung"],["NKP-FACH-005","Wohnungszuordnung ist vorhanden","mieterverwaltung"],["NKP-FACH-006","Mietzeitraum ist logisch","mieterverwaltung"],["NKP-FACH-007","Mietverhältnisse überschneiden sich nicht","mieterverwaltung"],["NKP-PLAU-001","Aktive Tage stimmen mit dem Mietzeitraum überein","mieterverwaltung"],["NKP-FACH-008","Personenzahl ist für verwendete Schlüssel vorhanden","mieterverwaltung"],["NKP-HINW-001","Unterjähriges Mietverhältnis","mieterverwaltung"],["NKP-HINW-002","Leerstand erkannt","mieterverwaltung"],["NKP-HINW-003","Nutzungsart Privat- oder Eigenanteil erkannt","mieterverwaltung"],["NKP-FACH-009","Aktive Kostenarten sind vorhanden","einstellungen"],["NKP-FACH-010","Gesamtbetrag der Kostenart ist vorhanden","einstellungen"],["NKP-FACH-011","Berechtigte Empfänger der Kostenart sind vorhanden","einstellungen"],["NKP-FACH-012","Erforderliche Verteilungsgrundlage ist vorhanden","einstellungen"],["NKP-FACH-013","Manuelle Verteilung entspricht dem Gesamtbetrag","manuellewerte"],["NKP-PLAU-002","Kostenart weicht stark vom Vorjahr ab","einstellungen"],["NKP-PLAU-003","Möglicherweise doppelt erfasste Kosten","einstellungen"],["NKP-FACH-014","Erforderliche Verbrauchswerte sind vorhanden","verbraeuche"],["NKP-PLAU-004","Nullverbrauch bei belegter Wohnung","verbraeuche"],["NKP-PLAU-005","Zählerendstand liegt unter dem Anfangsstand","verbraeuche"],["NKP-PLAU-006","Hausverbrauch und Wohnungsverbräuche sind plausibel","verbraeuche"],["NKP-PLAU-012","Gesamtwasserverbrauch und individuelle Messperioden stimmen überein","manuellewerte"],["NKP-PLAU-007","Verbrauch weicht stark vom Vorjahr ab","verbraeuche"],["NKP-PLAU-008","Auffällig identische Verbrauchswerte","verbraeuche"],["NKP-HINW-004","Kein geeigneter Vorjahresvergleich möglich","verbraeuche"],["NKP-FACH-015","Vorauszahlungsmatrix und Mieterwerte stimmen überein","einnahmen"],["NKP-PLAU-009","Erwartete Vorauszahlung fehlt","einnahmen"],["NKP-FACH-020","NK- und Kaltmietkorrekturen sind getrennt und berechenbar","einnahmen"],["NKP-HINW-005","Vorauszahlungsanpassung wird nicht gedruckt","vorauszahlungsanpassung"],["NKP-FACH-016","Umlagesummen stimmen mit den Ausgangskosten überein","umlage"],["NKP-PLAU-010","Unerklärter Eigentümer- oder Restanteil","umlage"],["NKP-PLAU-011","Abrechnungsergebnis ist ungewöhnlich hoch","umlage"],["NKP-FACH-017","Erforderliche Empfänger- und Adressdaten sind vorhanden","briefe"],["NKP-FACH-018","Briefwerte stimmen mit dem Berechnungsergebnis überein","briefe"],["NKP-HINW-006","Druckbild sollte wegen langer Inhalte kontrolliert werden","briefe"],["NKP-FACH-019","Abschlussvoraussetzungen sind erfüllt","qualitaet"],["NKP-TECH-001","Datenschema und Datenebenenvertrag","sicherung"],["NKP-TECH-002","Datensatz ist serialisierbar","sicherung"],["NKP-TECH-003","Start- und Renderdiagnose","sicherung"],["NKP-TECH-004","Persistenz- und Snapshot-Integrität","sicherung"],["NKP-TECH-005","PWA-, Service-Worker- und Offlinebasis","sicherung"],["NKP-TECH-006","Interne Regressionstests","sicherung"]].map(([id,title,tab])=>({id,title,tab}));
const ported=new Set(["NKP-FACH-001","NKP-FACH-002","NKP-FACH-003","NKP-FACH-004","NKP-FACH-005","NKP-FACH-006","NKP-FACH-007","NKP-FACH-008","NKP-FACH-009","NKP-FACH-010","NKP-HINW-001","NKP-HINW-002","NKP-HINW-003",
"NKP-FACH-011","NKP-FACH-012","NKP-PLAU-003","NKP-FACH-014",
"NKP-PLAU-004","NKP-PLAU-005","NKP-PLAU-006","NKP-PLAU-012",
"NKP-FACH-016","NKP-PLAU-010","NKP-FACH-017","NKP-FACH-018"]);
const isDate=s=>{if(typeof s!=="string"||!/^\d{4}-\d{2}-\d{2}$/.test(s))return false;const d=new Date(s+"T00:00:00Z");return !Number.isNaN(d.valueOf())&&d.toISOString().slice(0,10)===s};
function assess(state,ledger,letters){
 if(!state||state.fixture!==true||!["2023","2024","2025"].includes(state.period))throw new TypeError("Synthetic review only");
 const t=state.tenancies||[],u=state.units||[],c=(state.costs||[]).filter(x=>x.active!==false),ids=new Set(u.map(x=>x.id));
 const failed={
  "NKP-FACH-001":!["2023","2024","2025"].includes(state.period),
  "NKP-FACH-002":!u.some(x=>x.active!==false),
  "NKP-FACH-003":!t.length,
  "NKP-FACH-004":t.some(x=>!String(x.name||"").trim()),
  "NKP-FACH-005":t.some(x=>!ids.has(x.unitId)),
  "NKP-FACH-006":t.some(x=>!isDate(x.start)||!isDate(x.end)||x.start>x.end),
  "NKP-FACH-007":!!ledger?.occupancy?.issues?.some(x=>x.code==="OVERLAPPING_TENANCIES"),
  "NKP-FACH-008":c.some(x=>x.method==="Personen")&&t.some(x=>Number(x.persons)<=0),
  "NKP-FACH-009":!c.length,
  "NKP-FACH-010":c.some(x=>!Number.isFinite(Number(x.amount))||Number(x.amount)<=0)
 };

 const errors=(ledger?.issues||[]),meter=ledger?.water,base=ledger?.totals;
 const meterErrors=meter?.issues||[];
 const anyCode=(...codes)=>errors.some(e=>codes.includes(e.code));
 const uncertain=new Map(),info=new Map(),na=new Set();
 const remark=(id,status,message)=>{const store=status==="review"?uncertain:info;store.set(id,message)};
 const consumptionCost=c.some(x=>x.method==="Verbrauch"&&Number(x.amount)>0);
 const externalCost=c.some(x=>x.method==="Externe Einzelabrechnung");
 const hasConsumption=consumptionCost||externalCost;
 // The following are synthetic counterparts of individual original rule branches.
 if(t.some(x=>x.start>state.period+"-01-01"||(x.end&&x.end<state.period+"-12-31")))
   remark("NKP-HINW-001","hint","Unterjähriges Mietverhältnis: Datumsanteile prüfen.");
 if((ledger?.occupancy?.vacancyDays||0)>0)
   remark("NKP-HINW-002","hint","Zeitlicher Leerstand erkannt.");
 if(t.some(x=>["Privatanteil","Eigennutzung"].includes(x.role)))
   remark("NKP-HINW-003","hint","Privat-/Eigennutzung ist regulärer Abrechnungsteilnehmer.");
 failed["NKP-FACH-011"]=c.some(cost=>t.every(x=>(cost.excludedTenantIds||[]).includes(x.id)));
 failed["NKP-FACH-012"]=anyCode("ZERO_BASIS","COST_CONSUMPTION_TOTAL",
    "COST_CONSUMPTION_CASES","REFERENCE_NOT_READY");
 const duplicate=c.some((x,i)=>c.some((y,j)=>j>i&&x.id!==y.id&&
   String(x.name||"").trim().toLowerCase()===String(y.name||"").trim().toLowerCase()&&
   Math.abs(Number(x.amount)-Number(y.amount))<0.01));
 if(duplicate)remark("NKP-PLAU-003","review","Möglicherweise doppelte Kostenart mit gleichem Betrag.");
 if(!hasConsumption){na.add("NKP-FACH-014");na.add("NKP-PLAU-004");}
 else{
   failed["NKP-FACH-014"]=anyCode("CASE_WATER_SPLIT_MISSING",
     "COST_CONSUMPTION_CASES","METER_KW_INCOMPLETE","METER_WW_INCOMPLETE",
     "EXTERNAL_CASES_MISSING");
   if((ledger?.tenants||[]).some(x=>x.days>=30&&consumptionCost&&
      x.consumption!==null&&x.consumption===0))
     remark("NKP-PLAU-004","review","Nullverbrauch bei mindestens 30 belegten Tagen prüfen.");
 }
 const reversed=state.units?.some(u=>["cold","hot"].some(key=>{
   const m=u.waterMeters?.[key];if(!m)return false;
   const segs=Array.isArray(m.segments)&&m.segments.length?m.segments:[m];
   return segs.some(v=>v.start!==""&&v.end!==""&&
     Number.isFinite(Number(v.start))&&Number.isFinite(Number(v.end))&&
     Number(v.end)<Number(v.start));
 }));
 if(reversed)remark("NKP-PLAU-005","review","Zählerendstand unter Anfangsstand.");
 if(!meter?.house?.valid||meter?.totals?.units===null){
   na.add("NKP-PLAU-006");na.add("NKP-PLAU-012");
 }else{
   const delta=Number(meter.delta.houseUnits),house=Number(meter.house.consumption);
   if(house>0&&Math.abs(delta)>0.5&&Math.abs(delta/house)*100>5)
     remark("NKP-PLAU-006","review","Haus- und Wohnungswasser weichen über Toleranz ab.");
   if(meter.invoice!==null&&Math.abs(Number(meter.delta.invoiceUnits))>0.01)
     remark("NKP-PLAU-012","review","Rechnungsmenge und individuelle Zähler differieren.");
 }
 if(!base){failed["NKP-FACH-016"]=true;}
 else{
   failed["NKP-FACH-016"]=Math.abs(base.differenceCents||0)>2;
   if(Math.abs(base.unallocatedCents||0)>2)
     remark("NKP-PLAU-010","review","Unerklärte Restkosten/Eigentümeranteile prüfen.");
 }
 failed["NKP-FACH-017"]=!letters||!letters.dataReady;
 failed["NKP-FACH-018"]=!letters||(letters.letters||[]).some(l=>{
   const associated=ledger.tenants.find(t=>t.id===l.id);
   return !associated||l.items.reduce((a,x)=>a+x.cents,0)!==associated.costCents||
     l.balanceCents!==associated.balanceCents;
 });
 const rows=rules.map(r=>({...r,
   status:!ported.has(r.id)?"not-run":failed[r.id]?"critical":
      uncertain.has(r.id)?"review":info.has(r.id)?"hint":na.has(r.id)?"not-applicable":
      r.id==="NKP-FACH-008"&&!c.some(x=>x.method==="Personen")?"not-applicable":"passed",
   execution:ported.has(r.id)?"independent-synthetic-subset":"not-ported",
   detail:uncertain.get(r.id)||info.get(r.id)||"",
   route:r.tab==="mieterverwaltung"?"go-tenancies":r.tab==="einnahmen"?"go-advance":
      r.tab==="verbraeuche"?"go-water":r.tab==="briefe"?"go-letter":"go-costs"
 }));
 const dynamic=(ledger?.issues||[]).map((x,i)=>({id:"DYN-"+i,status:"critical",
  title:x.message||x.code,route:x.action||"go-review"}));
 if(letters?.missingRecipients?.length)dynamic.push({id:"LETTER-RECIPIENTS",status:"critical",
  title:"Briefanschriften fehlen für "+letters.missingRecipients.length+" Abrechnungsfall/-fälle",route:"go-letter"});
 const notRun=rows.filter(x=>x.status==="not-run").length;
 return{rows,dynamic,counts:{total:44,executed:44-notRun,notRun,
   passed:rows.filter(x=>x.status==="passed").length,
   hint:rows.filter(x=>x.status==="hint").length,
   review:rows.filter(x=>x.status==="review").length,
   critical:rows.filter(x=>x.status==="critical").length+dynamic.length},
   complete:false,readyForPrint:false,readyForClose:false,
   reason:notRun+" Originalprüfungen und dokumentenechte A4-Abnahme sind noch nicht portiert."};
}
return{assess,registry:rules,portedIds:[...ported],version:"stage4-synthetic-review-2"};
});