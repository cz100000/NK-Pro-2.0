/* NK-Pro 2.0 – isolated UX prototype. NO production calculation or data integration. */
(() => {
  'use strict';
  const STORAGE_KEY = 'nkpro2_design_demo_20261121_v1'; // Never use NK-Pro 1.x keys.
  const demoLedger = window.NKPRO2_DEMO_LEDGER;
  const functionalBilling = window.NKPRO2_SYNTHETIC_BILLING;
  const waterDetails = window.NKPRO2_WATER_DETAIL;
  if (!demoLedger || !functionalBilling || !waterDetails || typeof functionalBilling.calculate !== 'function') throw new Error('Synthetic billing modules missing.');
  const icons = {
    overview:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>',
    bill:'<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h3"/>',
    building:'<path d="M4 21V5l8-2v18M12 9h8v12M7 9h2M7 13h2M15 13h2M15 17h2"/>',
    chart:'<path d="M4 20V12M10 20V5M16 20V9M22 20V2M2 20h21"/>',
    folder:'<path d="M3 6a2 2 0 0 1 2-2h5l2 3h7a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
    reset:'<path d="M3 11a9 9 0 1 1 3 7M3 4v7h7"/>',
    menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',
    close:'<path d="m5 5 14 14M19 5 5 19"/>',
    chevron:'<path d="m9 5 7 7-7 7"/>',
    check:'<path d="m5 12 4 4L19 6"/>',
    info:'<circle cx="12" cy="12" r="9"/><path d="M12 10v6M12 7v.4"/>',
    alert:'<path d="M12 3 2 21h20L12 3Z"/><path d="M12 9v5M12 17v1"/>',
    arrow:'<path d="M5 12h14m-6-6 6 6-6 6"/>',
    save:'<path d="M4 3h14l3 3v15H3V3h1ZM7 3v6h10V3M7 21v-9h10v9"/>',
    pencil:'<path d="m4 20 4.5-1 10-10a2 2 0 0 0-3-3l-10 10L4 20Z"/>',
    calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v5M17 3v5M3 10h18"/>',
    layers:'<path d="m12 3 9 5-9 5-9-5 9-5Zm-9 9 9 5 9-5m-18 5 9 5 9-5"/>',
    print:'<path d="M6 9V3h12v6M6 18H4V9h16v9h-2M6 15h12v6H6z"/>',
    file:'<path d="M6 2h8l5 5v14H6zM14 2v6h5M9 12h7M9 16h7"/>'
  };
  const icon=(name)=>`<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${icons[name]||icons.info}</svg>`;
  const initial=()=>waterDetails.example({
    fixture:true,period:'2025',houseWater:266,waterDecision:null,heatingEvidence:false,heatingEvidenceFingerprint:null,letterChecked:false,demoFinalized:false,
    costs:[
      {id:'water',name:'Wasser & Abwasser',category:'Verbrauch',amount:1850,method:'Verbrauch',label:'Zählerdaten'},
      {id:'waste',name:'Müllbeseitigung',category:'Betriebskosten',amount:1550,method:'Fläche',label:'Kostenbeleg'},
      {id:'heat',name:'Heizung / Warmwasser',category:'Extern',amount:8900,landlordShare:75,method:'Fläche',label:'Musterverteilung'},
      {id:'insurance',name:'Gebäudeversicherung',category:'Betriebskosten',amount:1320,method:'Fläche',label:'Kostenbeleg'},
      {id:'power',name:'Allgemeinstrom',category:'Betriebskosten',amount:480,method:'Fläche',label:'Kostenbeleg'}
    ],
    units:[
      {id:'DEMO-W01',label:'Wohnung A',position:'Erdgeschoss links',area:68,waterStart:112,waterEnd:155,advance:2000,people:1,days:365,active:true},
      {id:'DEMO-W02',label:'Wohnung B',position:'Erdgeschoss rechts',area:74,waterStart:90,waterEnd:126,advance:1900,people:2,days:365,active:true},
      {id:'DEMO-W03',label:'Wohnung C',position:'1. Obergeschoss links',area:80,waterStart:223,waterEnd:258,advance:2250,people:1,days:365,active:true},
      {id:'DEMO-W04',label:'Wohnung D',position:'1. Obergeschoss rechts',area:62,waterStart:110,waterEnd:148,advance:1800,people:3,days:365,active:true},
      {id:'DEMO-W05',label:'Wohnung E',position:'2. Obergeschoss links',area:89,waterStart:71,waterEnd:102,advance:2300,people:2,days:365,active:true},
      {id:'DEMO-W06',label:'Wohnung F',position:'2. Obergeschoss rechts',area:77,waterStart:158,waterEnd:200,advance:2000,people:1,days:365,active:true},
      {id:'DEMO-W07',label:'Wohnung G',position:'Dachgeschoss',area:71,waterStart:194,waterEnd:223,advance:2050,people:2,days:365,active:true}
    ]
  });
  const $=id=>document.getElementById(id);
  const safeText=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const fmt=n=>Number(n||0).toLocaleString('de-DE',{style:'currency',currency:'EUR'});
  const int=n=>Number(n||0).toLocaleString('de-DE',{maximumFractionDigits:0});
  const num=v=>Number.isFinite(Number(v))?Number(v):0;
  const euroNum=n=>Number(n).toLocaleString('de-DE',{minimumFractionDigits:2,maximumFractionDigits:2});
  const round=n=>Math.round(n*100)/100;
  const fmtPrice=n=>Number.isFinite(n)?n.toLocaleString('de-DE',{minimumFractionDigits:4,maximumFractionDigits:4})+' €/m³':'–';
  const parseField=(field)=>{const raw=String(field.value||'').trim().replace(/\s/g,'').replace(',','.');const val=Number(raw);return Number.isFinite(val)?val:NaN};
  function load(){try{const v=JSON.parse(localStorage.getItem(STORAGE_KEY)||'null');if(v&&v.fixture===true&&v.period==='2025'&&Array.isArray(v.units)&&v.units.length===7&&Array.isArray(v.costs))return waterDetails.upgrade(v);}catch(_){/* standalone file localStorage might be blocked */}return initial()}
  let data=load();const ui={view:'overview',step:'costs',analytics:'nk',filter:'',drawer:null,lastFocus:null};
  function persist(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(data));}catch(_){/* safe in-memory fallback; never touch real NK-Pro keys */}}
  function stateChange(){data.demoFinalized=false;persist();render()}
  const ledger=()=>functionalBilling.calculate(data);
  const waterReport=()=>waterDetails.diagnostics(data);
  const consumption=u=>{const kw=waterDetails.meterResult(u.waterMeters?.cold),ww=waterDetails.meterResult(u.waterMeters?.hot);return kw.valid&&ww.valid?kw.consumption+ww.consumption:0};
  const unitConsumption=()=>waterReport().totals.units??0;
  const waterGap=()=>waterReport().delta.houseUnits;
  const waterFingerprint=()=>demoLedger.fingerprintWater(data);
  const heatFingerprint=()=>{const c=data.costs.find(x=>x.id==='heat');return JSON.stringify([c?.id,c?.amount,c?.method,c?.landlordShare??0]);};
  const letterFingerprint=()=>demoLedger.fingerprintLetter(data);
  const letterResolved=()=>!!data.letterChecked&&data.letterFingerprint===letterFingerprint();
  const waterResolved=()=>{const d=waterReport();return d.exactMatch||!!(d.canReview&&data.waterDecision&&data.waterDecision.fingerprint===waterFingerprint()&&data.waterDecision.note.trim().length>=5)};
  const heatResolved=()=>data.heatingEvidence&&data.heatingEvidenceFingerprint===heatFingerprint();
  const checks=()=>ledger().issues.map((issue,i)=>({id:'model-'+i,title:'Eingabe oder Umlagegrundlage prüfen',note:issue.message,done:false,action:issue.action||'go-costs'})).concat([
    {id:'water',title:'Rechnung, Hauszähler und Wohnungen abgleichen',note:waterReport().issues.length?'Es fehlen Zählerwerte oder Ablesedaten.':waterReport().exactMatch?'Beide Abgleiche stimmen.':`Rechnung–Haus ${int(waterReport().delta.invoiceHouse)} m³ · Haus–Wohnungen ${int(waterGap())} m³`,done:waterResolved(),action:'check-water'},
    {id:'heat',title:'Externen Heizkostenbeleg bestätigen',note:'Beleglage der Beispielkosten ausdrücklich dokumentieren.',done:heatResolved(),action:'check-heat'},
    {id:'letter',title:'Musterbrief visuell kontrollieren',note:'Dokumentdarstellung und Seitenlayout bestätigen.',done:letterResolved(),action:'go-letter'},
    {id:'costs',title:'Gesamtkosten sind erfasst',note:'Alle Kostenbeträge sind größer als null.',done:data.costs.length>0&&data.costs.every(c=>c.amount>0),action:'go-costs'}
  ]);
  const unresolved=()=>checks().filter(x=>!x.done);
  const allCost=()=>round(data.costs.reduce((s,c)=>s+num(c.amount),0));
  const allAdvance=()=>round(data.units.reduce((s,u)=>s+num(u.advance),0));
  const allocation=(unit)=>{const row=ledger().units.find(x=>x.id===unit.id);return row?row.costCents/100:0};
  const balance=u=>{const row=ledger().units.find(x=>x.id===u.id);return row?row.balanceCents/100:0};
  const labelStatus=(done,t='Vollständig',f='Offen')=>`<span class="status ${done?'green':'amber'}">${done?t:f}</span>`;
  const iconButton=(action,id,aria='Details öffnen')=>`<button class="row-button" data-action="${action}" data-id="${safeText(id)}" aria-label="${safeText(aria)}" title="${safeText(aria)}" type="button">${icon('chevron')}</button>`;
  const button=(label,action,id,cls='')=>`<button class="button ${cls}" type="button" data-action="${action}"${id?` data-id="${safeText(id)}"`:''}>${label}</button>`;
  const section=(title,inner,extra='',classes='')=>`<section class="section ${classes}"><div class="section-header"><div><h2>${title}</h2></div>${extra}</div>${inner}</section>`;
  const head=(kicker,title,description,action='')=>`<div class="page-heading"><div><div class="eyebrow">${safeText(kicker)}</div><h1>${title}</h1><p>${description}</p></div>${action?`<div class="heading-actions">${action}</div>`:''}</div>`;
  function progress(){const done=checks().filter(c=>c.done).length;let html='<div class="flow-track">';for(let i=0;i<6;i++)html+=`<div class="flow-segment ${i<done?'complete':i===done?'current':''}"></div>`;return html+`</div><div class="flow-labels">${['Kosten','Verbräuche','Zahlungen','Umlage','Prüfen','Briefe'].map((x,i)=>`<span class="${i===Math.min(done,5)?'highlight':''}">${x}</span>`).join('')}</div>`}
  function overview(){
    const done=checks().length-unresolved().length;
    const tasks=unresolved();
    return head('MUSTEROBJEKT · 2025','Übersicht','Ein klarer Arbeitsstand. Die wichtigsten Aufgaben stehen direkt im Mittelpunkt.',button('Abrechnung fortsetzen '+icon('arrow'),'go-costs',null,'button-primary'))+
      `<div class="metric-row"><div class="metric"><span class="metric-label">Aktive Abrechnung</span><div class="metric-number">2025</div><span class="metric-helper">Entwurf · 7 Wohnungen</span></div><div class="metric"><span class="metric-label">Noch zu erledigen</span><div class="metric-number">${tasks.length} <small>Prüfpunkte</small></div><span class="metric-helper">Direkt aus dem Workflow</span></div><div class="metric"><span class="metric-label">Abrechnungsvolumen</span><div class="metric-number" style="font-size:23px">${fmt(allCost())}</div><span class="metric-helper">Synthetische Musterwerte</span></div></div>`+
      `<div class="two-col"><div class="section"><div class="section-header"><div><h2>Als Nächstes</h2><p>${tasks.length?'Diese Punkte verhindern aktuell die Musterfreigabe.':'Alle Musterprüfpunkte wurden bearbeitet.'}</p></div></div>`+
      (tasks.length?tasks.slice(0,4).map((x,i)=>`<div class="task-row"><div class="task-icon">${icon(i===0?'alert':'file')}</div><div class="task-copy"><strong>${safeText(x.title)}</strong><span>${safeText(x.note)}</span></div><button class="link" type="button" data-action="${x.action}">Bearbeiten →</button></div>`).join(''):`<div class="empty" style="padding:35px"><div class="empty-icon">${icon('check')}</div><h3>Keine offenen Prüfpunkte</h3><p>Der Musterablauf ist für eine simulierte Freigabe vorbereitet.</p></div>`)+
      `</div><div class="section"><div class="section-header"><div><h2>Bearbeitungsstand</h2><p>${done} von ${checks().length} Kontrollen erledigt</p></div>${labelStatus(tasks.length===0,'Bereit','In Bearbeitung')}</div><div class="section-body">${progress()}<p class="note" style="margin:24px 0 0">Ein Schritt führt direkt zu den betroffenen Daten. Technische Prüflisten bleiben im Hintergrund.</p></div><div class="progress-foot">${button('Prüfcockpit öffnen','go-review',null,'button-quiet')}</div></div></div>`+
      `<div class="divider-title">FINANZIELLE MOMENTAUFNAHME</div><div class="section"><div class="stat-inline"><div><small>Umlagefähige Musterkosten</small><strong>${fmt(ledger().totals.allocableCostsCents/100)}</strong></div><div><small>Vorauszahlungen</small><strong>${fmt(allAdvance())}</strong></div><div><small>Saldo Gesamt (Muster)</small><strong>${fmt(ledger().totals.balanceCents/100)}</strong></div></div><p class="section-note">Illustrative Werte. Bruttokosten: ${fmt(ledger().totals.grossCostsCents/100)}; davon Muster-Vermieteranteil: ${fmt(ledger().totals.landlordCostsCents/100)}. Kein produktiver Abrechnungsstand.</p></div>`;
  }
  const steps=[['costs','Gesamtkosten'],['water','Verbräuche'],['advance','Vorauszahlungen'],['allocation','Umlage'],['review','Prüfen'],['letters','Briefe']];
  const renderSteps=()=>`<div class="tab-bar" role="tablist" aria-label="Abrechnungsprozess">${steps.map(([id,label])=>`<button class="tab-button ${ui.step===id?'active':''}" role="tab" aria-selected="${ui.step===id}" type="button" data-step="${id}">${label}</button>`).join('')}</div>`;
  function billing(){
    const ending=data.demoFinalized?'Musterabschluss simuliert':'Synthetischer Fachtest';
    let content='';let action='';let title='Abrechnung 2025';let description='Alle Arbeitsschritte in einem gemeinsamen Arbeitsplatz. Details bearbeiten, ohne den Kontext zu verlieren.';
    if(ui.step==='costs'){action=button('Kostenart hinzufügen','new-cost',null,'button-primary');content=costs();}
    else if(ui.step==='water'){action=button('Hauszähler prüfen','edit-house',null,'button-primary');content=water();}
    else if(ui.step==='advance'){content=advances();}
    else if(ui.step==='allocation'){content=allocations();}
    else if(ui.step==='review'){content=review();}
    else if(ui.step==='letters'){action=button(icon('print')+' Musterbrief drucken','print-letter',null,'button-primary');content=letters();}
    return head(`ABRECHNUNG 2025 · ${ending}`,title,description,action)+renderSteps()+content;
  }
  function costs(){
    let q=ui.filter.toLowerCase();const c=data.costs.filter(x=>(x.name+' '+x.category+' '+(x.note||'')).toLowerCase().includes(q));
    return `<div class="inline-toolbar"><h2>Gesamtkosten</h2><div class="filterbar"><input class="search" id="tableSearch" aria-label="Kosten durchsuchen" placeholder="Kostenarten suchen …" value="${safeText(ui.filter)}"></div></div>`+
      `<section class="section"><div class="stat-inline"><div><small>Gesamtkosten</small><strong>${fmt(allCost())}</strong></div><div><small>Kostenarten</small><strong>${data.costs.length}</strong></div><div><small>Vermieteranteile</small><strong>${fmt(ledger().totals.landlordCostsCents/100)}</strong></div></div><div class="table-wrap"><table class="data-table"><thead><tr><th>Kostenart</th><th>Bereich</th><th>Umlageschlüssel</th><th class="money">Preis je Einheit</th><th class="money">Gesamtbetrag</th><th>Notiz</th><th>Status</th><th aria-label="Aktion"></th></tr></thead><tbody>`+
      (c.length?c.map(x=>`<tr><td><strong>${safeText(x.name)}</strong></td><td>${safeText(x.category)}</td><td>${safeText(x.method)}</td><td class="money">${x.method==='Verbrauch'?(waterDetails.priceFor(x,data.houseWater).valid?fmtPrice(waterDetails.priceFor(x,data.houseWater).effective):'Preis fehlt'):'–'}</td><td class="money">${fmt(x.amount)}</td><td class="cost-note-cell">${x.note?safeText(x.note):'<span class="soft">–</span>'}</td><td>${labelStatus(x.amount>0)}</td><td>${iconButton('edit-cost',x.id,'Kostenart bearbeiten')}</td></tr>`).join(''):`<tr><td colspan="8" class="muted">Keine Treffer.</td></tr>`)+
      `</tbody></table></div><div class="table-caption">Klicken Sie auf eine Kostenart. Alle Einstellungen öffnen rechts – die Übersicht bleibt bestehen.</div></section><p class="footnote">Funktionsmuster: Sechs Originalverfahren werden für synthetische Ein-Mieter-Wohnungen berechnet. Kein Produktivbetrieb, keine Mieterwechsel, keine vollständige Techem-Einzelabrechnung.</p>`;
  }
  function water(){
    const report=waterReport(),units=report.totals.units,house=report.house.valid?report.house.consumption:null;
    const waterCost=data.costs.find(c=>c.id==='water');
    const price=waterDetails.priceFor(waterCost,data.houseWater);
    const waterAllocation=ledger().costs.find(c=>c.id==='water');
    const show=v=>v===null?'–':int(v)+' m³';
    const diff=v=>v===null?'–':(v>0?'+':'')+int(v)+' m³';
    const metric=(label,value,sub)=>'<div class="water-metric"><small>'+safeText(label)+'</small><strong>'+safeText(value)+'</strong><span>'+safeText(sub)+'</span></div>';
    const rows=data.units.map((u,i)=>{
      const m=u.waterMeters||{},r=report.rows[i];
      const half=key=>{
        const meter=m[key]||{},part=r[key];
        return '<td class="money">'+(waterDetails.volume(meter.start)?int(meter.start):'–')+'</td>'+
          '<td class="money">'+(waterDetails.volume(meter.end)?int(meter.end):'–')+'</td>'+
          '<td class="money"><strong>'+(part.valid?show(part.consumption):'–')+'</strong></td>';
      };
      const share=waterAllocation?.rows.find(x=>x.unitId===u.id);
      return '<tr><td><strong>'+safeText(u.label)+'</strong><span class="water-unit-sub">'+safeText(u.id)+'</span></td>'+
        half('cold')+half('hot')+'<td class="money"><strong>'+show(r.total)+'</strong></td>'+
        '<td class="money">'+(share?fmt(share.cents/100):'–')+'</td><td>'+
        labelStatus(r.valid,'Vollständig','Prüfen')+'</td><td>'+
        iconButton('edit-water',u.id,'Kalt- und Warmwasserzähler bearbeiten')+'</td></tr>';
    }).join('');
    const KPIs='<div class="water-metric-grid">'+
      metric('Wasserwerksrechnung',show(report.invoice),'Rechnungsverbrauch')+
      metric('Hauszähler',show(house),'Endstand minus Anfangsstand')+
      metric('Summe Wohnungszähler',show(units),'Kalt- und Warmwasser')+
      metric('Preis je m³',price.valid?fmtPrice(price.effective):'–',
        price.mode==='manual'?'Manuell vorgegeben':'Automatisch aus Kosten / m³')+'</div>';
    const differences='<section class="section"><div class="section-header"><div><h2>Verbrauchsabgleich</h2>'+
      '<p>Rechnungsverbrauch, Hauszähler und Wohnungszähler bleiben unabhängige Prüfwerte.</p></div>'+
      labelStatus(waterResolved(),'Geprüft','Prüfung offen')+'</div>'+
      '<div class="water-comparison">'+
        '<div><span>Rechnung ↔ Hauszähler</span><strong class="'+(report.delta.invoiceHouse===0?'is-ok':'is-open')+'">'+diff(report.delta.invoiceHouse)+'</strong></div>'+
        '<div><span>Hauszähler ↔ Wohnungen</span><strong class="'+(report.delta.houseUnits===0?'is-ok':'is-open')+'">'+diff(report.delta.houseUnits)+'</strong></div>'+
        '<div><span>KW / WW gesamt</span><strong>'+show(report.totals.cold)+' / '+show(report.totals.hot)+'</strong></div></div>'+
      '<div class="water-actions">'+button('Preis je m³ bearbeiten','edit-water-price',null,'button-quiet')+
        (!report.exactMatch&&report.canReview?button('Abweichungen begründen','check-water',null,'button-quiet'):'')+'</div>'+
      (report.issues.length?'<div class="water-issues"><strong>Offene Zähler- oder Rechnungsangaben</strong><ul>'+
        report.issues.slice(0,12).map(x=>'<li>'+safeText((x.unitId?x.unitId+' · ':'')+x.reason)+'</li>').join('')+
        '</ul></div>':'')+'</section>';
    const table='<section class="section" style="margin-top:18px"><div class="section-header"><div><h2>Wohnungszähler</h2>'+
      '<p>Anfangs- und Endstände, Datum, Zählernummer und Notiz werden je Wohnung im Detailpanel bearbeitet.</p></div></div>'+
      '<div class="table-wrap"><table class="data-table water-table"><thead><tr><th rowspan="2">Wohnung</th>'+
      '<th colspan="3">Kaltwasser (m³)</th><th colspan="3">Warmwasser (m³)</th>'+
      '<th rowspan="2" class="money">Gesamt</th><th rowspan="2" class="money">Kostenanteil</th>'+
      '<th rowspan="2">Status</th><th rowspan="2">Aktion</th></tr><tr>'+
      '<th class="money">Anfang</th><th class="money">Ende</th><th class="money">Verbrauch</th>'+
      '<th class="money">Anfang</th><th class="money">Ende</th><th class="money">Verbrauch</th>'+
      '</tr></thead><tbody>'+rows+'</tbody><tfoot><tr><td><strong>Summe</strong></td>'+
      '<td colspan="2"></td><td class="money"><strong>'+show(report.totals.cold)+'</strong></td>'+
      '<td colspan="2"></td><td class="money"><strong>'+show(report.totals.hot)+'</strong></td>'+
      '<td class="money"><strong>'+show(units)+'</strong></td><td colspan="3"></td></tr></tfoot></table></div>'+
      '<div class="table-caption">Zwei getrennte Musterzähler je Wohnung, insgesamt 14. Die Originalversion hat weitere Funktionen wie Zählerwechsel, historischen Ableseverlauf und kontrollierte Vorjahresübernahme; diese sind noch nicht migriert.</div></section>';
    return '<div class="inline-toolbar"><div><h2>Wasser · Kalt- und Warmwasser</h2>'+
      '<p class="small muted">Erfassung und Kontrolle · 2025 · nur synthetische Musterdaten</p></div>'+
      button('Hauszähler & Rechnung bearbeiten','edit-house',null,'button-primary')+'</div>'+
      KPIs+differences+table+
      (data.units.some(u=>u.waterSourceNotice)?'<p class="footnote"><strong>Ältere Demowerte:</strong> Die früheren Ein-Zähler-Daten bleiben als KW-Entwurf erhalten. Warmwasser wurde nicht erfunden. Bitte vervollständigen oder die Demo zurücksetzen.</p>':'');
  }
  function advances(){return `<div class="inline-toolbar"><h2>Vorauszahlungen</h2><span class="small muted">Jahreswerte · Musterstand</span></div><section class="section"><div class="stat-inline"><div><small>Summe Vorauszahlungen</small><strong>${fmt(allAdvance())}</strong></div><div><small>Erfasste Wohnungen</small><strong>${data.units.length} von 7</strong></div></div><div class="table-wrap"><table class="data-table"><thead><tr><th>Wohnung</th><th class="money">Vorauszahlung/Jahr</th><th class="money">Monatsäquivalent*</th><th>Status</th><th aria-label="Aktion"></th></tr></thead><tbody>`+
      data.units.map(u=>`<tr><td><strong>${safeText(u.label)}</strong><div class="small soft">${safeText(u.position)}</div></td><td class="money">${fmt(u.advance)}</td><td class="money">${fmt(u.advance/12)}</td><td>${labelStatus(u.advance>0)}</td><td>${iconButton('edit-advance',u.id,'Vorauszahlung bearbeiten')}</td></tr>`).join('')+`</tbody></table></div><div class="table-caption">*Nur rechnerisches Monatsäquivalent, keine Prüfung tatsächlich gezahlter Einzelmonate.</div></section>`;}
  function allocations(){let res=data.units.map(u=>({unit:u,cost:allocation(u),saldo:balance(u)}));let sum=res.reduce((s,r)=>s+r.saldo,0);return `<div class="inline-toolbar"><h2>Abrechnungsergebnis</h2><span class="status amber">Nicht produktiv</span></div><section class="section"><div class="big-total"><div><small>Gesamtsaldo · synthetische Beispielrechnung</small><strong>${fmt(round(sum))}</strong></div><span class="small muted">Kosten minus Vorauszahlungen</span></div><div class="table-wrap"><table class="data-table"><thead><tr><th>Wohnung</th><th class="money">Umlagekosten</th><th class="money">Vorauszahlungen</th><th class="money">Saldo</th><th aria-label="Aktion"></th></tr></thead><tbody>`+
    res.map(r=>`<tr><td><strong>${safeText(r.unit.label)}</strong></td><td class="money">${fmt(r.cost)}</td><td class="money">${fmt(r.unit.advance)}</td><td class="money"><span class="outcome ${r.saldo>0?'neg':'pos'}">${fmt(r.saldo)}</span></td><td>${iconButton('show-unit-result',r.unit.id,'Berechnungsgrundlage öffnen')}</td></tr>`).join('')+`</tbody></table></div><div class="table-caption">Referenzbasierter Musterabgleich: Brutto ${fmt(ledger().totals.grossCostsCents/100)}, gesonderte Vermieteranteile ${fmt(ledger().totals.landlordCostsCents/100)}, umlagefähig ${fmt(ledger().totals.allocableCostsCents/100)}, verteilt ${fmt(ledger().totals.distributedCents/100)}, noch nicht zugeordnet ${fmt(ledger().totals.differenceCents/100)}. Keine echte Abrechnungsfreigabe.</div></section><div style="margin-top:18px;text-align:right">${button('Zur Prüfung','go-review',null,'button-primary')}</div>`;}
  function review(){const list=checks();const todo=list.filter(x=>!x.done);return `<div class="inline-toolbar"><h2>Prüfen und abschließen</h2><span class="status ${todo.length?'amber':'green'}">${todo.length?todo.length+' offene Punkte':'Alle Musterpunkte geprüft'}</span></div><section class="section"><div class="section-header"><div><h2>Abschlusskontrolle</h2><p>Jede Auffälligkeit führt direkt zur Ursache und möglichen Lösung.</p></div></div>`+
    list.map(c=>`<div class="check-item"><div class="check-dot ${c.done?'pass':'todo'}">${icon(c.done?'check':'alert')}</div><div class="check-content"><strong>${safeText(c.title)}</strong><span>${safeText(c.note)}</span></div>${c.done?'<span class="status green">Erledigt</span>':`<button class="link" type="button" data-action="${c.action}">Bearbeiten →</button>`}</div>`).join('')+
    `<div class="progress-foot" style="display:flex;align-items:center;justify-content:space-between;gap:14px"><span class="note">${list.length-todo.length}/${list.length} Musterkontrollen erledigt</span>${button(data.demoFinalized?'Musterabschluss erfolgt': 'Musterabschluss simulieren','demo-finish',null,'button-primary'+(todo.length?' disabled-look':''))}</div></section>`+
    `<div class="info-line">Der Musterabschluss ist eine reine Simulation. Die echte Freigabe bleibt bis zur vollständigen Prüfung aller 44 Originalregeln, Briefe, Archiv und Datenmigration gesperrt.</div>`;}
  function docPaper(){const u=data.units[0];const cost=allocation(u),adv=u.advance,saldo=balance(u);return `<article class="doc-paper"><div class="doc-top">MUSTERHAUS · DEMO-VERMIETUNG</div><div class="doc-address">Musterempfänger<br>Wohnung A<br>Beispielstraße 1<br>00000 Musterstadt</div><div class="doc-title">Nebenkostenabrechnung 2025</div><div class="doc-prose">Sehr geehrte Damen und Herren,<br><br>für den Abrechnungszeitraum 01.01.2025 bis 31.12.2025 ergibt sich aus diesem unverbindlichen Muster folgende Übersicht:</div><div class="doc-results"><div><small>Umlagekosten</small><b>${fmt(cost)}</b></div><div><small>Vorauszahlungen</small><b>${fmt(adv)}</b></div><div><small>${saldo>0?'Nachzahlung':'Guthaben'}</small><b>${fmt(Math.abs(saldo))}</b></div></div><div class="doc-prose">Dies ist ausschließlich eine Layoutvorschau mit synthetischen Beträgen. Sie stellt keine versandfertige Abrechnung dar.</div><div class="doc-sign">Mit freundlichen Grüßen<strong>Mustermann Immobilien</strong>Vermietung</div><div class="demo-watermark">DESIGNDEMO · NICHT VERSENDEN</div></article>`;}
  function letters(){return `<div class="inline-toolbar"><h2>Briefvorschau</h2><span class="status ${letterResolved()?'green':'amber'}">${letterResolved()?'Layout geprüft (Demo)':'Layoutprüfung offen'}</span></div><p class="print-note">Diese Vorschau nutzt keine realen Mieterdaten. Der spätere Dokumentengenerator muss auf dem bestehenden geprüften Briefsystem aufbauen.</p><section class="section printable"><div class="section-header"><div><h2>Musterbrief – Wohnung A</h2></div><button type="button" class="link" data-action="mark-letter">${letterResolved()?'Prüfung zurücksetzen':'Musterlayout als geprüft markieren'}</button></div><div class="section-body">${docPaper()}</div></section>`;}
  function object(){return head('STAMMDATEN','Objekt','Wohnungen und Zähler sind einmalig gepflegt. Jahresbezogene Daten werden im Abrechnungsarbeitsplatz bearbeitet.')+
    `<div class="section"><div class="section-header"><div><h2>Musterobjekt</h2><p>7 Wohnungen · 1 Gebäude · ausschließlich synthetische Daten</p></div><span class="status green">Demo aktiv</span></div><div class="stat-inline"><div><small>Wohneinheiten</small><strong>${data.units.length}</strong></div><div><small>Gesamtfläche</small><strong>${int(data.units.reduce((s,u)=>s+u.area,0))} m²</strong></div><div><small>Zähler erfasst</small><strong>7 Musterzähler</strong></div></div><div class="table-wrap"><table class="data-table"><thead><tr><th>Wohnung</th><th>Kennung</th><th>Lage</th><th class="money">Fläche</th><th aria-label="Aktion"></th></tr></thead><tbody>`+
    data.units.map(u=>`<tr><td><strong>${safeText(u.label)}</strong></td><td>${safeText(u.id)}</td><td>${safeText(u.position)}</td><td class="money">${int(u.area)} m²</td><td>${iconButton('edit-unit',u.id,'Wohnung bearbeiten')}</td></tr>`).join('')+`</tbody></table></div><div class="table-caption">Im Wohnungs-Detailpanel können Personen, Miettage und Aktivstatus des synthetischen Fachtests geändert werden.</div></div>`;}
  function analytics(){const choices=[['nk','Nebenkosten'],['finance','Finanzen'],['tax','Steuern']];let body='';
    if(ui.analytics==='nk'){let max=Math.max(...data.costs.map(c=>c.amount));body=`<div class="metric-row"><div class="metric"><span class="metric-label">Gesamtkosten 2025</span><div class="metric-number" style="font-size:23px">${fmt(allCost())}</div><span class="metric-helper">Musterwerte</span></div><div class="metric"><span class="metric-label">Kosten je m²</span><div class="metric-number">${euroNum(allCost()/data.units.reduce((s,u)=>s+u.area,0))} <small>€/m²</small></div><span class="metric-helper">Rein illustrative Kennzahl</span></div><div class="metric"><span class="metric-label">Wohnungsverbrauch</span><div class="metric-number">${int(unitConsumption())} <small>m³</small></div><span class="metric-helper">Vereinfachte Musterzähler</span></div></div>`+
      section('Kostenstruktur 2025',`<div class="section-body"><div class="bars">${data.costs.map(c=>`<div class="bar-row"><span>${safeText(c.name)}</span><div class="bar-rail"><div class="bar-fill" style="width:${Math.round(c.amount/max*100)}%"></div></div><span class="bar-value">${fmt(c.amount)}</span></div>`).join('')}</div><p class="footnote" style="margin-top:24px">Preis-/Verbrauchseffekte und Mehrjahresvergleiche werden erst gezeigt, wenn vergleichbare Vorjahresdaten nachweislich verfügbar sind.</p></div>`);
    }else if(ui.analytics==='finance'){body=`<div class="no-data-box"><strong>Cashflow derzeit nicht berechenbar</strong><p>Die Demo enthält Kosten und Vorauszahlungen, aber keine verifizierten tatsächlichen Miet- oder Lieferantenzahlungen. NK-Pro 2.0 wird Soll, Ist, Forderungen und Cashflow getrennt erfassen.</p></div>`+section('Finanzielle Überleitung (Beispiel)',`<div class="stat-inline"><div><small>Nebenkosten (Soll)</small><strong>${fmt(allCost())}</strong></div><div><small>Vorauszahlungen (Abrechnungswert)</small><strong>${fmt(allAdvance())}</strong></div><div><small>Tatsächliche Zahlungen</small><strong>–</strong></div></div><div class="table-caption">Keine fiktiven Zahlungseingänge oder Renditen.</div>`);
    }else{body=`<div class="no-data-box"><strong>Steuerliche Werte noch nicht klassifiziert</strong><p>Privatanteile, Steuerjahr, abzugsfähige Kosten und Belege müssen gesondert fachlich zugeordnet und bestätigt werden. Die Demo nimmt keine steuerlichen Einstufungen vor.</p></div>`+section('Steuerliche Überleitung',`<div class="stat-inline"><div><small>Unklassifizierte Kostenarten</small><strong>${data.costs.length}</strong></div><div><small>Bestätigtes Steuerjahr</small><strong>–</strong></div><div><small>Abzugsfähige Beträge</small><strong>–</strong></div></div><div class="table-caption">Kein Ersatz für steuerliche Prüfung.</div>`);}
    return head('ANALYSEN','Analysezentrum','Drei fachlich getrennte Perspektiven. Werte ohne belastbare Datenbasis bleiben bewusst leer.')+`<div class="analytic-switch" role="tablist" aria-label="Analyseperspektive">${choices.map(([id,label])=>`<button type="button" role="tab" aria-selected="${ui.analytics===id}" class="${ui.analytics===id?'selected':''}" data-analytics="${id}">${label}</button>`).join('')}</div>`+body;
  }
  function documents(){return head('DOKUMENTE & HISTORIE','Dokumente & Archiv','Briefe, Prüfungen, Ausgabe und historische Stände – klar getrennt von der Bearbeitung.')+
    `<section class="section"><div class="section-header"><div><h2>Dokumente · 2025</h2><p>Erstellte Dokumente werden erst nach der fachlichen Freigabe verbindlich.</p></div></div><div class="task-row"><div class="task-icon">${icon('file')}</div><div class="task-copy"><strong>Musterbrief · Wohnung A</strong><span>Vorschau · synthetische Beträge · nicht versandfertig</span></div><button class="link" type="button" data-action="go-letter">Vorschau →</button></div><div class="task-row"><div class="task-icon">${icon('layers')}</div><div class="task-copy"><strong>Prüf- und Abschlussprotokoll</strong><span>Erst nach Fachfreigabe des vollständigen Systems verfügbar</span></div><button class="link" type="button" data-action="go-review">Prüfstatus →</button></div></section>`+
    `<section class="section"><div class="section-header"><div><h2>Archiv</h2></div><span class="status neutral">Leer</span></div><div class="empty"><div class="empty-icon">${icon('folder')}</div><h3>Keine historischen Abrechnungen in der Demo</h3><p>Das echte Archiv wird später vollständig separat und schreibgeschützt migriert. Die bisherige NK-Pro-App bleibt unverändert.</p></div></section>`;}
  const viewTitles={overview:'Übersicht',billing:'Abrechnungen',object:'Objekt',analytics:'Analysen',documents:'Dokumente & Archiv'};
  function render(){document.querySelectorAll('.nav-item').forEach(el=>{const active=el.dataset.view===ui.view;el.classList.toggle('active',active);if(active)el.setAttribute('aria-current','page');else el.removeAttribute('aria-current')});$('breadcrumbView').textContent=viewTitles[ui.view];const target=$('appMain');target.innerHTML=({overview, billing,object,analytics,documents}[ui.view]||overview)();$('appMain').querySelectorAll('[data-icon]').forEach(n=>n.innerHTML=icon(n.dataset.icon));}
  function navigate(view,step){ui.view=view;if(step)ui.step=step;ui.filter='';render();window.scrollTo({top:0,behavior:'instant'});document.body.classList.remove('menu-open');}
  function toast(message){const el=$('toast');el.textContent=message;el.hidden=false;clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.hidden=true,3200)}
  function closeDrawer(){ui.drawer=null;$('drawer').hidden=true;$('overlay').hidden=true;document.body.style.overflow='';if(ui.lastFocus&&ui.lastFocus.isConnected)ui.lastFocus.focus()}
  // Cents-exact synthetic reference trace; complete production domain engine remains out of scope.
  function demoBreakdown(unitId) {
    const l = ledger(), row = l.units.find(x=>x.id===unitId);
    if (!row) return '';
    const costRows = l.costs.map(c=>{
      const unitPart = c.rows.find(x=>x.unitId===unitId);
      const weight = unitPart ? unitPart.weight : 0;
      const base = unitPart ? unitPart.totalWeight : 0;
      const detail = c.method==='Fläche'||c.method==='Wohnfläche' ? 'Fläche × Miettage' : c.method==='Personen' ? 'Personentage' : c.method==='Miettage' ? 'Miettage' : c.method==='Verbrauch' ? 'Verbrauch / Hauswert' : 'Wohneinheiten';
      return '<tr><td><strong>'+safeText(c.name)+'</strong><div class="small soft">'+safeText(detail)+' '+int(weight===null?0:weight)+' / '+int(base)+'</div></td><td class="money">'+fmt(c.eligibleCents/100)+'</td><td class="money">'+fmt((unitPart?.cents??0)/100)+'</td></tr>';
    }).join('');
    return '<div class="drawer-breakdown"><div class="eyebrow">Kostenpositionen · Muster-Nachweis</div><div class="drawer-table-scroll"><table class="data-table"><thead><tr><th>Position</th><th class="money">Umlagefähig</th><th class="money">Wohnungsanteil</th></tr></thead><tbody>'+costRows+'</tbody></table></div><div class="drawer-note">Getestete Referenzformeln, Centverteilung mit Restcents. Nicht zugeordnete Beträge bleiben offen. Keine produktive Umlageabrechnung.</div></div>';
  }
  function openDrawer(type,id){const d={type,id};ui.drawer=d;ui.lastFocus=document.activeElement;let title='',eyebrow='',body='',actionLabel='Änderungen speichern';
    if(type==='cost'||type==='new-cost'){
      const c=type==='new-cost'?{name:'',amount:'',landlordShare:0,category:'Betriebskosten',method:'Fläche'}:data.costs.find(x=>x.id===id);if(!c)return;
      title=type==='new-cost'?'Kostenart hinzufügen':c.name;eyebrow='GESAMTKOSTEN';body=`<form id="editForm" data-type="${type}"><div class="form-row"><label for="d-name">Kostenart</label><input id="d-name" name="name" required maxlength="60" value="${safeText(c.name)}"></div><div class="form-row"><label for="d-amount">Gesamtbetrag (€)</label><input id="d-amount" name="amount" type="number" required step="0.01" min="0.01" value="${c.amount}"></div><div class="form-row"><label for="d-landlord">Davon Vermieteranteil (€) · Muster</label><input id="d-landlord" name="landlordShare" type="number" step="0.01" min="0" value="${c.landlordShare??0}"><p class="form-help">Dieser Betrag wird nicht den Wohnungen zugerechnet. Eine echte Techem-Verteilung ist noch nicht implementiert.</p></div><div class="form-row"><label for="d-method">Umlageschlüssel · synthetischer Fachtest</label><select id="d-method" name="method">${functionalBilling.METHODS.filter(m=>m!=='Wohnfläche').map(m=>'<option value="'+safeText(m)+'" '+(c.method===m?'selected':'')+'>'+safeText(m==='Fläche'?'Wohnfläche':m)+'</option>').join('')}</select><p class="form-help">Sechs portierte Originalverfahren. Zunächst ein fiktiver Teilnehmer pro Wohnung.</p></div><div class="form-row" data-price-group ${c.method==='Verbrauch'?'':'hidden'}><label for="d-price-mode">Preis je Verbrauchseinheit</label><select id="d-price-mode" name="priceMode"><option value="auto" ${c.priceMode!=='manual'?'selected':''}>Automatisch aus umlagefähigen Kosten / Rechnungsmenge</option><option value="manual" ${c.priceMode==='manual'?'selected':''}>Manuelle Preisvorgabe</option></select><p class="form-help">Bei Wasser gilt €/m³. Der automatische Preis wird mit vier Nachkommastellen angezeigt.</p></div><div class="form-row" data-manual-price ${c.method==='Verbrauch'&&c.priceMode==='manual'?'':'hidden'}><label for="d-unit-price">Manueller Preis je Einheit (€)</label><input id="d-unit-price" name="unitPrice" type="number" step="0.0001" min="0.0001" max="100000" value="${safeText(c.unitPrice??'')}"><p class="form-help">Abweichende Einheitspreise können nicht zugeordnete Restkosten ergeben; diese bleiben prüfpflichtig.</p></div><div class="form-row"><label for="d-cost-note">Notiz / Bemerkung (optional)</label><textarea id="d-cost-note" name="note" rows="5" maxlength="2000" placeholder="Belegnummer, Hinweise oder interne Erläuterungen …">${safeText(c.note||'')}</textarea><p class="form-help">Interne Notiz, nicht automatisch Teil der Mieterbriefe.</p></div><div class="drawer-note">Veränderte Musterwerte werden nur im isolierten Demo-Speicher abgelegt. Es erfolgt kein Zugriff auf die bestehende NK-Pro-App.</div></form>`;
    } else if(type==='water'||type==='advance'||type==='unit'){
      const u=data.units.find(x=>x.id===id);if(!u)return;title=u.label;eyebrow=type==='water'?'VERBRAUCHSDATEN':type==='advance'?'VORAUSZAHLUNGEN':'WOHNUNGSSTAMM';
      if(type==='water'){
        const meterGroup=key=>{
          const meter=u.waterMeters?.[key]||{},label=key==='cold'?'Kaltwasser (KW)':'Warmwasser (WW)';
          return '<fieldset class="water-fieldset"><legend>'+label+'</legend>'+
            '<div class="form-row"><label>Zählernummer<input name="'+key+'Number" maxlength="60" value="'+safeText(meter.number||'')+'"></label></div>'+
            '<div class="water-form-grid">'+
            '<div class="form-row"><label>Anfangsstand (m³)<input name="'+key+'Start" type="number" min="0" step="1" value="'+safeText(meter.start??'')+'"></label></div>'+
            '<div class="form-row"><label>Endstand (m³)<input name="'+key+'End" type="number" min="0" step="1" value="'+safeText(meter.end??'')+'"></label></div>'+
            '<div class="form-row"><label>Ablesedatum Beginn<input name="'+key+'StartDate" type="date" value="'+safeText(meter.startDate||'')+'"></label></div>'+
            '<div class="form-row"><label>Ablesedatum Ende<input name="'+key+'EndDate" type="date" value="'+safeText(meter.endDate||'')+'"></label></div></div></fieldset>';
        };
        body='<form id="editForm" data-type="water">'+meterGroup('cold')+meterGroup('hot')+
          '<div class="form-row"><label>Notiz zu den Zählerständen (optional)<textarea name="waterNote" maxlength="2000" rows="4">'+safeText(u.waterNote||'')+'</textarea></label></div>'+
          '<div class="drawer-note">Die beiden Musterzähler werden getrennt erfasst; unvollständige oder ungültige Angaben bleiben prüfpflichtig. Noch keine echte Zählerhistorie oder Vorjahresübernahme.</div></form>';
      }
      else if(type==='advance')body=`<form id="editForm" data-type="advance"><div class="form-row"><label for="d-advance">Jahresvorauszahlung (€)</label><input id="d-advance" name="advance" type="number" step="0.01" min="0" value="${u.advance}" required></div><div class="drawer-note">Musterjahreswert. Keine tatsächlichen Zahlungseingänge hinterlegt.</div></form>`;
      else body=`<form id="editForm" data-type="unit"><div class="form-row"><label for="d-label">Wohnungsbezeichnung</label><input id="d-label" name="label" required value="${safeText(u.label)}"></div><div class="form-row"><label for="d-position">Lage</label><input id="d-position" name="position" required value="${safeText(u.position)}"></div><div class="form-row"><label for="d-area">Wohnfläche (m²)</label><input id="d-area" name="area" type="number" min="1" step="0.01" required value="${u.area}"></div><div class="form-row"><label for="d-people">Personen (Muster)</label><input id="d-people" name="people" type="number" min="0" max="1000" step="1" required value="${u.people??1}"></div><div class="form-row"><label for="d-days">Miettage 2025 (Muster)</label><input id="d-days" name="days" type="number" min="0" max="365" step="1" required value="${u.days??365}"></div><div class="form-row"><label><input name="active" type="checkbox" style="width:auto;margin-right:8px" ${u.active!==false?'checked':''}>Aktive Musterwohnung</label></div><div class="drawer-note">Nur Musterwerte. Echte Mietverhältnisse und Wechsel kommen später.</div></form>`;
    }else if(type==='house'){
      const h=data.waterSettings||{};
      title='Hauszähler & Wasserwerksrechnung';eyebrow='VERBRAUCHSABGLEICH';
      body='<form id="editForm" data-type="house">'+
        '<div class="form-row"><label>Hauszählernummer<input name="houseMeterNumber" maxlength="60" value="'+safeText(h.houseMeterNumber||'')+'"></label></div>'+
        '<div class="water-form-grid">'+
        '<div class="form-row"><label>Hauszähler Anfang (m³)<input name="houseStart" type="number" min="0" step="1" value="'+safeText(h.houseStart??'')+'"></label></div>'+
        '<div class="form-row"><label>Hauszähler Ende (m³)<input name="houseEnd" type="number" min="0" step="1" value="'+safeText(h.houseEnd??'')+'"></label></div>'+
        '<div class="form-row"><label>Ablesedatum Beginn<input name="houseStartDate" type="date" value="'+safeText(h.houseStartDate||'')+'"></label></div>'+
        '<div class="form-row"><label>Ablesedatum Ende<input name="houseEndDate" type="date" value="'+safeText(h.houseEndDate||'')+'"></label></div></div>'+
        '<div class="form-row"><label>Wasserwerksrechnung · Verbrauch (m³)<input name="invoice" type="number" min="1" step="1" required value="'+safeText(data.houseWater)+'"></label></div>'+
        '<div class="form-row"><label>Rechnungsnummer / Bemerkungen (optional)<textarea name="invoiceNote" rows="4" maxlength="2000">'+safeText(h.invoiceNote||'')+'</textarea></label></div>'+
        '<div class="drawer-note">Hauszählerverbrauch = Endstand − Anfangsstand. Abgleich zur Rechnungsmenge und zur Summe der Wohnungszähler. Abweichungen werden nicht still verteilt.</div></form>';
    }else if(type==='water-decision'){title='Wasserdifferenz prüfen';eyebrow='PRÜFENTSCHEIDUNG';const r=waterReport();body=`<form id="editForm" data-type="water-decision"><div class="key-value" style="margin-bottom:15px"><small>Abweichung Rechnung ↔ Hauszähler</small><strong>${int(r.delta.invoiceHouse)} m³</strong></div><div class="key-value" style="margin-bottom:23px"><small>Abweichung Hauszähler ↔ Wohnungen</small><strong>${int(r.delta.houseUnits)} m³</strong></div><div class="form-row"><label for="d-reason">Begründung der Musterentscheidung</label><textarea id="d-reason" name="reason" minlength="5" required placeholder="Warum wird die Differenz als geprüft akzeptiert?">${safeText(data.waterDecision?.note||'')}</textarea><p class="form-help">Mindestens fünf Zeichen. Ändern sich die zugrunde liegenden Zählerwerte, wird die Entscheidung erneut prüfpflichtig.</p></div><div class="drawer-note">Im produktiven System gelten zusätzlich alle bestehenden fachlichen Prüfschritte und dokumentierten Entscheidungstypen.</div></form>`;actionLabel='Entscheidung dokumentieren';
    }else if(type==='heat-evidence'){title='Heizkostenbeleg';eyebrow='PRÜFENTSCHEIDUNG';body=`<form id="editForm" data-type="heat-evidence"><div class="key-value" style="margin-bottom:20px"><small>Externe Heizkosten (Muster)</small><strong>${fmt(data.costs.find(x=>x.id==='heat')?.amount||0)}</strong></div><div class="form-row"><label><input name="confirmed" type="checkbox" style="width:auto;margin-right:8px" ${heatResolved()?'checked':''} required> Musterbeleg ist geprüft</label><p class="form-help">Diese Checkbox simuliert nur die später einzubindende Belegprüfung.</p></div></form>`;actionLabel='Belegstatus speichern';
    }else if(type==='result'){const u=data.units.find(x=>x.id===id);if(!u)return;title=u.label;eyebrow='BERECHNUNGSNACHWEIS';let a=data.units.reduce((s,x)=>s+x.area,0),w=unitConsumption();body=`<div class="drawer-note">Ausschließlich vereinfachter Beispielnachweis. Die produktive Umlage besitzt zusätzliche Schlüssel, Nachweise und Sonderfälle.</div><div class="key-value" style="margin-bottom:17px"><small>Wohnflächenanteil</small><strong>${int(u.area)} / ${int(a)} m²</strong></div><div class="key-value" style="margin-bottom:17px"><small>Verbrauchsanteil</small><strong>${int(consumption(u))} / ${int(w)} m³</strong></div><div class="key-value" style="margin-bottom:17px"><small>Berechnete Kosten</small><strong>${fmt(allocation(u))}</strong></div><div class="key-value"><small>Saldo nach Vorauszahlungen</small><strong>${fmt(balance(u))}</strong></div>${demoBreakdown(u.id)}`;actionLabel='Schließen';
    }
    $('drawerTitle').textContent=title;$('drawerEyebrow').textContent=eyebrow;$('drawerBody').innerHTML=body;
    $('drawerFooter').innerHTML=`<button class="button" type="button" data-action="close-drawer">Abbrechen</button>${type==='result'?'':`<button form="editForm" class="button button-primary" type="submit">${actionLabel}</button>`}`;
    $('overlay').hidden=false;$('drawer').hidden=false;document.body.style.overflow='hidden';setTimeout(()=>{const input=$('drawerBody').querySelector('input,textarea,select');if(input)input.focus();else $('closeDrawer').focus()},10);
  }
  function saveDrawer(form){const {type,id}=ui.drawer||{};let good=true,msg='Musterwert gespeichert.';
    if(type==='cost'||type==='new-cost'){
      const name=form.elements.name.value.trim(),amt=parseField(form.elements.amount),
        method=form.elements.method.value,landlordShare=parseField(form.elements.landlordShare);
      if(!name||!Number.isFinite(amt)||amt<=0||!Number.isFinite(landlordShare)||
        landlordShare<0||landlordShare>amt||!functionalBilling.METHODS.includes(method))
        return toast('Bitte gültige Beträge und Umlageschlüssel eingeben.');
      const mode=method==='Verbrauch'&&form.elements.priceMode.value==='manual'?'manual':'auto';
      const rawPrice=String(form.elements.unitPrice.value||'').trim();
      const unitPrice=mode==='manual'?parseField(form.elements.unitPrice):null;
      if(mode==='manual'&&(!rawPrice||!Number.isFinite(unitPrice)||unitPrice<=0||unitPrice>100000||
        Math.abs(unitPrice*10000-Math.round(unitPrice*10000))>1e-6))
        return toast('Einheitspreis: positiv, höchstens vier Nachkommastellen.');
      const value={name,amount:round(amt),landlordShare:round(landlordShare),method,
        priceMode:mode,unitPrice:mode==='manual'?unitPrice:null,
        note:form.elements.note.value.trim().slice(0,2000)};
      if(type==='cost')Object.assign(data.costs.find(x=>x.id===id),value);
      else data.costs.push({id:'new-'+Date.now(),category:'Betriebskosten',label:'Musterdaten',...value});
      if(id==='heat'){data.heatingEvidence=false;data.heatingEvidenceFingerprint=null}
    }else if(type==='water'){
      const u=data.units.find(x=>x.id===id),next={};
      for(const channel of ['cold','hot']){
        const rawStart=String(form.elements[channel+'Start'].value).trim();
        const rawEnd=String(form.elements[channel+'End'].value).trim();
        const start=rawStart===''?'':Number(rawStart),end=rawEnd===''?'':Number(rawEnd);
        const startDate=form.elements[channel+'StartDate'].value,endDate=form.elements[channel+'EndDate'].value;
        if((start!==''&&!waterDetails.volume(start))||(end!==''&&!waterDetails.volume(end))||
          (start!==''&&end!==''&&end<start)||
          (startDate&&!waterDetails.date(startDate))||(endDate&&!waterDetails.date(endDate))||
          (startDate&&endDate&&startDate>endDate))
          return toast('Bitte gültige Zählerstände und Ablesedaten eingeben.');
        next[channel]={number:form.elements[channel+'Number'].value.trim().slice(0,60),
          start,end,startDate,endDate};
      }
      u.waterMeters=next;u.waterNote=form.elements.waterNote.value.trim().slice(0,2000);
      delete u.waterSourceNotice;
    }
    else if(type==='advance'){const val=parseField(form.elements.advance);if(!Number.isFinite(val)||val<0)return toast('Ungültige Vorauszahlung.');data.units.find(x=>x.id===id).advance=round(val);}
    else if(type==='unit'){const u=data.units.find(x=>x.id===id);const area=parseField(form.elements.area),people=parseField(form.elements.people),days=parseField(form.elements.days);if(!Number.isFinite(area)||area<1||area>1000000||!Number.isInteger(people)||people<0||people>1000||!Number.isInteger(days)||days<0||days>365)return toast('Bitte gültige Fläche, Personenzahl und Miettage eingeben.');const label=form.elements.label.value.trim(),position=form.elements.position.value.trim();if(!label||!position)return toast('Bezeichnung und Lage fehlen.');Object.assign(u,{label,position,area,people,days,active:form.elements.active.checked});}
    else if(type==='house'){
      const get=key=>{const raw=String(form.elements[key].value).trim();return raw===''?'':Number(raw)};
      const start=get('houseStart'),end=get('houseEnd'),invoice=get('invoice'),
        startDate=form.elements.houseStartDate.value,endDate=form.elements.houseEndDate.value;
      if(!waterDetails.volume(start)||!waterDetails.volume(end)||end<start||
         !waterDetails.volume(invoice)||invoice<=0||
         !waterDetails.date(startDate)||!waterDetails.date(endDate)||startDate>endDate)
        return toast('Bitte gültige Hauszählerstände, Ablesedaten und Rechnungsverbrauch eingeben.');
      data.houseWater=invoice;
      data.waterSettings={houseMeterNumber:form.elements.houseMeterNumber.value.trim().slice(0,60),
        houseStart:start,houseEnd:end,houseStartDate:startDate,houseEndDate:endDate,
        invoiceNote:form.elements.invoiceNote.value.trim().slice(0,2000)};
    }
    else if(type==='water-decision'){let note=form.elements.reason.value.trim();if(note.length<5)return toast('Bitte eine fachliche Begründung erfassen.');data.waterDecision={fingerprint:waterFingerprint(),note,created:new Date().toISOString()};msg='Musterentscheidung dokumentiert.';}
    else if(type==='heat-evidence'){if(!form.elements.confirmed.checked)return toast('Bitte die Musterprüfung ausdrücklich bestätigen.');data.heatingEvidence=true;data.heatingEvidenceFingerprint=heatFingerprint();msg='Musterbeleg bestätigt.';}
    else good=false;
    if(good){closeDrawer();stateChange();toast(msg)}
  }
  function doAction(action,id){
    if(action==='new-cost'){openDrawer('new-cost');return}if(action==='edit-cost'){openDrawer('cost',id);return}if(action==='edit-water'){openDrawer('water',id);return}if(action==='edit-house'){openDrawer('house');return}
    if(action==='edit-advance'){openDrawer('advance',id);return}if(action==='edit-unit'){openDrawer('unit',id);return}if(action==='show-unit-result'){openDrawer('result',id);return}
    if(action==='check-water'){const r=waterReport();if(!r.canReview){navigate('billing','water');toast('Bitte fehlende Zählerstände und Ablesedaten ergänzen.');return}if(r.exactMatch){toast('Beide Wasserabgleiche stimmen überein.');return}openDrawer('water-decision');return}
    if(action==='edit-water-price'){openDrawer('cost','water');return}
    if(action==='go-water'){navigate('billing','water');return}if(action==='go-advance'){navigate('billing','advance');return}if(action==='check-heat'){openDrawer('heat-evidence');return}if(action==='go-costs'){navigate('billing','costs');return}if(action==='go-review'){navigate('billing','review');return}if(action==='go-letter'){navigate('billing','letters');return}
    if(action==='mark-letter'){if(letterResolved()){data.letterChecked=false;data.letterFingerprint=null}else{data.letterChecked=true;data.letterFingerprint=letterFingerprint()}stateChange();toast(letterResolved()?'Musterlayout als geprüft markiert.':'Musterprüfung zurückgesetzt.');return}
    if(action==='print-letter'){window.print();return}
    if(action==='demo-finish'){if(unresolved().length){toast('Bitte zunächst alle offenen Musterprüfungen bearbeiten.');return}data.demoFinalized=true;persist();render();toast('Musterabschluss simuliert – keine echte Freigabe.');return}
    if(action==='close-drawer'){closeDrawer();return}
  }
  document.addEventListener('click',e=>{
    const nav=e.target.closest('[data-view]');if(nav){navigate(nav.dataset.view);return}
    const st=e.target.closest('[data-step]');if(st){ui.step=st.dataset.step;ui.filter='';render();return}
    const an=e.target.closest('[data-analytics]');if(an){ui.analytics=an.dataset.analytics;render();return}
    const action=e.target.closest('[data-action]');if(action){doAction(action.dataset.action,action.dataset.id||'')}
  });
  document.addEventListener('submit',e=>{if(e.target.id==='editForm'){e.preventDefault();saveDrawer(e.target)}});
  document.addEventListener('change',e=>{
    if(e.target.id==='d-method'||e.target.id==='d-price-mode'){
      const f=$('editForm');if(!f)return;
      const consume=f.elements.method.value==='Verbrauch';
      f.querySelectorAll('[data-price-group]').forEach(el=>el.hidden=!consume);
      f.querySelectorAll('[data-manual-price]').forEach(el=>el.hidden=!consume||f.elements.priceMode.value!=='manual');
    }
  });
  document.addEventListener('input',e=>{if(e.target.id==='tableSearch'){ui.filter=e.target.value;const pos=e.target.selectionStart;render();const input=$('tableSearch');if(input){input.focus();input.setSelectionRange(pos,pos)}}});
  $('closeDrawer').addEventListener('click',closeDrawer);$('overlay').addEventListener('click',closeDrawer);
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(!$('drawer').hidden)closeDrawer();document.body.classList.remove('menu-open')}if(e.key==='Tab'&&!$('drawer').hidden){const nodes=[...$('drawer').querySelectorAll('button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled)')].filter(x=>x.offsetParent!==null);if(!nodes.length)return;const first=nodes[0],last=nodes.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}});
  $('openMenu').addEventListener('click',()=>document.body.classList.toggle('menu-open'));
  $('resetDemo').addEventListener('click',()=>{if(!window.confirm('Alle Änderungen an den synthetischen Demodaten zurücksetzen? Die bestehende NK-Pro-App bleibt unberührt.'))return;data=initial();persist();navigate('overview');toast('Demo zurückgesetzt.');});
  document.querySelectorAll('[data-icon]').forEach(node=>node.innerHTML=icon(node.dataset.icon));
  render();
  // API only for automated prototype smoke testing; never expose data from any real NK-Pro system.
  window.NKPRO2_DEMO_TEST=Object.freeze({getState:()=>JSON.parse(JSON.stringify(data)),checks,ledger:()=>JSON.parse(JSON.stringify(ledger())),allocate:()=>data.units.map(u=>({id:u.id,amount:allocation(u),balance:balance(u)})),storageKey:STORAGE_KEY});
})();
