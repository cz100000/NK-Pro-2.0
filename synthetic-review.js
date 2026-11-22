/* Synthetic-only Stufe-4-Prüfvorschau: keine produktive Freigabe.
 * 44 Original-IDs, davon 10 frühe Eingabechecks; 34 explizit NICHT AUSGEFÜHRT.
 */
(function(root,factory){const api=Object.freeze(factory());if(typeof module!=="undefined"&&module.exports)module.exports=api;else root.NKPRO2_REVIEW=api;})(typeof globalThis!=="undefined"?globalThis:this,function(){
"use strict";
const rules=[["NKP-FACH-001","Abrechnungszeitraum ist gültig","start"],["NKP-FACH-002","Mindestens eine aktive Wohnung ist vorhanden","wohnungsverwaltung"],["NKP-FACH-003","Mindestens ein Abrechnungsteilnehmer ist vorhanden","mieterverwaltung"],["NKP-FACH-004","Mietername ist vorhanden","mieterverwaltung"],["NKP-FACH-005","Wohnungszuordnung ist vorhanden","mieterverwaltung"],["NKP-FACH-006","Mietzeitraum ist logisch","mieterverwaltung"],["NKP-FACH-007","Mietverhältnisse überschneiden sich nicht","mieterverwaltung"],["NKP-PLAU-001","Aktive Tage stimmen mit dem Mietzeitraum überein","mieterverwaltung"],["NKP-FACH-008","Personenzahl ist für verwendete Schlüssel vorhanden","mieterverwaltung"],["NKP-HINW-001","Unterjähriges Mietverhältnis","mieterverwaltung"],["NKP-HINW-002","Leerstand erkannt","mieterverwaltung"],["NKP-HINW-003","Nutzungsart Privat- oder Eigenanteil erkannt","mieterverwaltung"],["NKP-FACH-009","Aktive Kostenarten sind vorhanden","einstellungen"],["NKP-FACH-010","Gesamtbetrag der Kostenart ist vorhanden","einstellungen"],["NKP-FACH-011","Berechtigte Empfänger der Kostenart sind vorhanden","einstellungen"],["NKP-FACH-012","Erforderliche Verteilungsgrundlage ist vorhanden","einstellungen"],["NKP-FACH-013","Manuelle Verteilung entspricht dem Gesamtbetrag","manuellewerte"],["NKP-PLAU-002","Kostenart weicht stark vom Vorjahr ab","einstellungen"],["NKP-PLAU-003","Möglicherweise doppelt erfasste Kosten","einstellungen"],["NKP-FACH-014","Erforderliche Verbrauchswerte sind vorhanden","verbraeuche"],["NKP-PLAU-004","Nullverbrauch bei belegter Wohnung","verbraeuche"],["NKP-PLAU-005","Zählerendstand liegt unter dem Anfangsstand","verbraeuche"],["NKP-PLAU-006","Hausverbrauch und Wohnungsverbräuche sind plausibel","verbraeuche"],["NKP-PLAU-012","Gesamtwasserverbrauch und individuelle Messperioden stimmen überein","manuellewerte"],["NKP-PLAU-007","Verbrauch weicht stark vom Vorjahr ab","verbraeuche"],["NKP-PLAU-008","Auffällig identische Verbrauchswerte","verbraeuche"],["NKP-HINW-004","Kein geeigneter Vorjahresvergleich möglich","verbraeuche"],["NKP-FACH-015","Vorauszahlungsmatrix und Mieterwerte stimmen überein","einnahmen"],["NKP-PLAU-009","Erwartete Vorauszahlung fehlt","einnahmen"],["NKP-FACH-020","NK- und Kaltmietkorrekturen sind getrennt und berechenbar","einnahmen"],["NKP-HINW-005","Vorauszahlungsanpassung wird nicht gedruckt","vorauszahlungsanpassung"],["NKP-FACH-016","Umlagesummen stimmen mit den Ausgangskosten überein","umlage"],["NKP-PLAU-010","Unerklärter Eigentümer- oder Restanteil","umlage"],["NKP-PLAU-011","Abrechnungsergebnis ist ungewöhnlich hoch","umlage"],["NKP-FACH-017","Erforderliche Empfänger- und Adressdaten sind vorhanden","briefe"],["NKP-FACH-018","Briefwerte stimmen mit dem Berechnungsergebnis überein","briefe"],["NKP-HINW-006","Druckbild sollte wegen langer Inhalte kontrolliert werden","briefe"],["NKP-FACH-019","Abschlussvoraussetzungen sind erfüllt","qualitaet"],["NKP-TECH-001","Datenschema und Datenebenenvertrag","sicherung"],["NKP-TECH-002","Datensatz ist serialisierbar","sicherung"],["NKP-TECH-003","Start- und Renderdiagnose","sicherung"],["NKP-TECH-004","Persistenz- und Snapshot-Integrität","sicherung"],["NKP-TECH-005","PWA-, Service-Worker- und Offlinebasis","sicherung"],["NKP-TECH-006","Interne Regressionstests","sicherung"]].map(([id,title,tab])=>({id,title,tab}));
const ported=new Set(["NKP-FACH-001","NKP-FACH-002","NKP-FACH-003","NKP-FACH-004","NKP-FACH-005","NKP-FACH-006","NKP-FACH-007","NKP-FACH-008","NKP-FACH-009","NKP-FACH-010"]);
const isDate=s=>{if(typeof s!=="string"||!/^\d{4}-\d{2}-\d{2}$/.test(s))return false;const d=new Date(s+"T00:00:00Z");return !Number.isNaN(d.valueOf())&&d.toISOString().slice(0,10)===s};
function assess(state,ledger,letters){
 if(!state||state.fixture!==true||state.period!=="2025")throw new TypeError("Synthetic review only");
 const t=state.tenancies||[],u=state.units||[],c=(state.costs||[]).filter(x=>x.active!==false),ids=new Set(u.map(x=>x.id));
 const failed={
  "NKP-FACH-001":state.period!=="2025",
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
 const rows=rules.map(r=>({...r,
   status:!ported.has(r.id)?"not-run":failed[r.id]?"critical":
      r.id==="NKP-FACH-008"&&!c.some(x=>x.method==="Personen")?"not-applicable":"passed",
   execution:ported.has(r.id)?"independent-synthetic-subset":"not-ported",
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
   critical:rows.filter(x=>x.status==="critical").length+dynamic.length},
   complete:false,readyForPrint:false,readyForClose:false,
   reason:"34 Originalprüfungen und dokumentenechte A4-Abnahme sind noch nicht portiert."};
}
return{assess,registry:rules,version:"stage4-synthetic-review-1"};
});