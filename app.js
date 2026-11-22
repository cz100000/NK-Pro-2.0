/* NK-Pro 2.0 – isolated UX prototype. NO production calculation or data integration. */
(() => {
  'use strict';
  const LEGACY_DEMO_KEY = 'nkpro2_design_demo_20261121_v1'; // old 0.6 untouched.
  const STORAGE_KEY = 'nkpro2_synthetic_portfolio_0_7_v1'; // no NK-Pro 1.x keys.
  const demoLedger = window.NKPRO2_DEMO_LEDGER;
  const functionalBilling = window.NKPRO2_SYNTHETIC_BILLING;
  const waterDetails = window.NKPRO2_WATER_DETAIL;
  const propertyModel = window.NKPRO2_PROPERTY;
  const caseBilling = window.NKPRO2_CASE_BILLING;
  const workflow = window.NKPRO2_WORKFLOW;
  const qualityModule = window.NKPRO2_REVIEW;
  const letterModule = window.NKPRO2_LETTERS;
  const estates = window.NKPRO2_ESTATES;
  const masterUi = window.NKPRO2_MASTER_UI;
  if (!demoLedger || !functionalBilling || !waterDetails || !propertyModel || !caseBilling || !workflow || !qualityModule || !letterModule || !estates || !masterUi || typeof caseBilling.calculate !== 'function') throw new Error('Synthetic billing modules missing.');
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
    file:'<path d="M6 2h8l5 5v14H6zM14 2v6h5M9 12h7M9 16h7"/>',
    door:'<rect x="5" y="3" width="14" height="18" rx="1"/><path d="M10 11h.01M14 3v18"/>',
    users:'<circle cx="9" cy="8" r="3"/><path d="M3 20v-2a6 6 0 0 1 12 0v2M16 5a3 3 0 0 1 0 6M17 14a5 5 0 0 1 4 5v1"/>',
    gauge:'<path d="M4 18a9 9 0 1 1 16 0H4Z"/><path d="m12 15 4-6M7 13h.01M12 8h.01M17 13h.01"/>',
    more:'<circle cx="5" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="19" cy="12" r="1.3"/>',
    plus:'<path d="M12 4v16M4 12h16"/>'
  };
  const icon=(name)=>`<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${icons[name]||icons.info}</svg>`;
  const initial=()=>workflow.example(propertyModel.upgrade(waterDetails.example({
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
  })));
  const $=id=>document.getElementById(id);
  const safeText=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const fmt=n=>Number(n||0).toLocaleString('de-DE',{style:'currency',currency:'EUR'});
  const int=n=>Number(n||0).toLocaleString('de-DE',{maximumFractionDigits:0});
  const num=v=>Number.isFinite(Number(v))?Number(v):0;
  const euroNum=n=>Number(n).toLocaleString('de-DE',{minimumFractionDigits:2,maximumFractionDigits:2});
  const round=n=>Math.round(n*100)/100;
  const fmtPrice=(n,unit='m³')=>Number.isFinite(n)?n.toLocaleString('de-DE',{minimumFractionDigits:4,maximumFractionDigits:4})+' €/'+unit:'–';
  const fmtVolume=v=>Number(v).toLocaleString('de-DE',{maximumFractionDigits:3});
  const parseField=(field)=>{const raw=String(field.value||'').trim().replace(/\s/g,'').replace(',','.');const val=Number(raw);return Number.isFinite(val)?val:NaN};
  const clone=x=>JSON.parse(JSON.stringify(x));
  let storedRevision=null;
  function load(){
    const raw=localStorage.getItem(STORAGE_KEY);
    storedRevision=raw;
    if(raw!==null){
      // Fail closed on corrupt or unknown data: never silently overwrite the only local copy.
      try{return estates.upgradePortfolio(JSON.parse(raw));}
      catch(error){throw new Error("Lokaler Fachtestbestand kann nicht sicher gelesen werden. "+
        "Bitte vor einem Zurücksetzen die bestehenden Browserdaten sichern. "+error.message);}
    }
    return estates.create(initial());
  }
  let portfolio=load(),data=estates.current(portfolio);
  const ui={view:'overview',step:'advance',billingHome:true,objectListFilter:null,
    analytics:'nk',objectTab:'overview',unitDetailId:null,consumptionTab:'water',
    letterId:null,showAllLetters:false,filter:'',drawer:null,lastFocus:null,
    treeOpenObjectId:null,treeSections:{master:false,years:true}};
  const master=()=>estates.object(portfolio);
  const activeYear=()=>portfolio.selectedYear;
  const annualLocked=()=>estates.readonly(data);
  function savePortfolio(){
    // Optimistic local write guard: another browser tab must never be silently overwritten.
    const onDisk=localStorage.getItem(STORAGE_KEY);
    if(onDisk!==storedRevision)throw new Error("Der lokale Bestand wurde in einem anderen Tab geändert. Bitte die Seite neu laden.");
    const serialized=JSON.stringify(portfolio);
    localStorage.setItem(STORAGE_KEY,serialized);
    storedRevision=serialized;
  }
  function rollbackLocal(){
    portfolio=storedRevision!==null?estates.upgradePortfolio(JSON.parse(storedRevision)):
      estates.create(initial());
    data=estates.current(portfolio);
  }
  function persist(){
    if(annualLocked())throw new Error("Historical synthetic annual cannot be edited");
    portfolio=estates.saveYear(portfolio,master().id,activeYear(),data);
    data=estates.current(portfolio);
    savePortfolio();
  }
  function switchPortfolio(next){
    portfolio=estates.validate(next);
    data=estates.current(portfolio);
    ui.unitDetailId=null;ui.letterId=null;ui.filter='';
    savePortfolio();
    render();
  }
  function stateChange(){data.demoFinalized=false;persist();render()}
  const ledger=()=>caseBilling.calculate(data);
  const letterBundle=()=>letterModule.make(data,ledger());
  const qualityReport=()=>qualityModule.assess(data,ledger(),letterBundle());
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
  const checks=()=>{
    const q=qualityReport();
    const tasks=[
      {id:'quality',title:'Original-Prüfregeln noch nicht vollständig umgesetzt',
       note:q.counts.notRun+' von 44 Regeln nicht ausgeführt. Abschluss bleibt gesperrt.',
       done:false,action:'go-review'},
      ...q.dynamic.map((d,i)=>({id:d.id||'dynamic-'+i,title:'Berechnungs- oder Briefmangel',
       note:d.title,done:false,action:d.route||'go-review'})),
      ...q.rows.filter(x=>x.status==='critical').map(x=>({id:x.id,title:x.title,
       note:'Kritische Vorprüfung',done:false,action:x.route}))
    ];
    return tasks;
  };
  const unresolved=()=>checks().filter(x=>!x.done);
  const allCost=()=>round(data.costs.filter(c=>c.active!==false).reduce((s,c)=>s+num(c.amount),0));
  const allAdvance=()=>round(ledger().totals.advancesCents/100);
  const allocation=(unit)=>{const row=ledger().units.find(x=>x.id===unit.id);return row?row.costCents/100:0};
  const balance=u=>{const row=ledger().units.find(x=>x.id===u.id);return row?row.balanceCents/100:0};
  const labelStatus=(done,t='Vollständig',f='Offen')=>`<span class="status ${done?'green':'amber'}">${done?t:f}</span>`;
  const iconButton=(action,id,aria='Details öffnen')=>`<button class="row-button" data-action="${action}" data-id="${safeText(id)}" aria-label="${safeText(aria)}" title="${safeText(aria)}" type="button">${icon('chevron')}</button>`;
  const button=(label,action,id,cls='')=>`<button class="button ${cls}" type="button" data-action="${action}"${id?` data-id="${safeText(id)}"`:''}>${label}</button>`;
  // Shared master-data editing control for EVERY object (existing or newly created).
  const editAction=(action,id,subject)=>`<button type="button" class="button edit-action" data-action="${safeText(action)}"${id?` data-id="${safeText(id)}"`:''} aria-label="${safeText(subject+' bearbeiten')}">${icon('pencil')}<span>Bearbeiten</span></button>`;
  const viewAction=(action,id,subject)=>`<button type="button" class="button edit-action view-action" data-action="${safeText(action)}"${id?` data-id="${safeText(id)}"`:''} aria-label="${safeText(subject+' ansehen')}">${icon('file')}<span>Ansehen</span></button>`;
  const statusFor=(complete,partial=false)=>'<span class="status '+(complete?'green':partial?'amber':'neutral')+'">'+
    (complete?'Vollständig':partial?'Unvollständig':'Nicht erfasst')+'</span>';
  const actionCell=(status,action)=>'<span class="table-action-pair">'+status+action+'</span>';
  const section=(title,inner,extra='',classes='')=>`<section class="section ${classes}"><div class="section-header"><div><h2>${title}</h2></div>${extra}</div>${inner}</section>`;
  const head=(kicker,title,description,action='')=>`<div class="page-heading"><div><div class="eyebrow">${safeText(kicker)}</div><h1>${title}</h1><p>${description}</p></div>${action?`<div class="heading-actions">${action}</div>`:''}</div>`;
  function progress(){const done=Math.min(6,qualityReport().counts.executed===44?6:4);let html='<div class="flow-track">';for(let i=0;i<7;i++)html+=`<div class="flow-segment ${i<done?'complete':i===done?'current':''}"></div>`;return html+`</div><div class="flow-labels">${['Mietverhältnisse','Vorauszahlungen','Gesamtkosten','Verbräuche','Prüfen','Ergebnis','Briefe'].map((x,i)=>`<span class="${i===Math.min(done,6)?'highlight':''}">${x}</span>`).join('')}</div>`}
  function overview(){
    const live=portfolio.objects.filter(o=>o.lifecycle?.status!=="archived"),
      archived=portfolio.objects.filter(o=>o.lifecycle?.status==="archived");
    const listing=(items,isArchived)=>{
      const row=o=>{
        const years=Object.keys(o.settlements).length;
        const menu='<details class="estate-menu"><summary aria-label="Weitere Aktionen für '+safeText(o.name)+
          '" title="Objektaktionen">'+icon('more')+'</summary><div class="estate-menu-items">'+
          (isArchived?button('Wiederherstellen','restore-object',o.id,'button-quiet'):
            button('Archivieren','archive-object',o.id,'button-quiet'))+
          (!o.units.length&&!o.tenancies.length&&!years?
            button('Leeres Objekt löschen','delete-empty-object',o.id,'button-quiet'):'')+
          '</div></details>';
        return '<tr><td><strong>'+safeText(o.name)+'</strong>'+
          '<span class="water-unit-sub mono">'+safeText(o.id)+'</span></td>'+
          '<td>'+safeText(o.street)+'<span class="estate-postal">'+
          safeText(o.postalCode)+' '+safeText(o.city)+'</span></td>'+
          '<td class="estate-count">'+o.units.length+'</td>'+
          '<td class="estate-count">'+years+'</td>'+
          '<td><div class="estate-row-actions">'+(isArchived?
            '<span class="status neutral">Archiviert</span>':
            button('Öffnen '+icon('arrow'),'select-property',o.id,'button-quiet estate-open'))+
          menu+'</div></td></tr>';
      };
      return '<div class="table-wrap"><table class="data-table estate-table"><thead><tr>'+
        '<th>Immobilie</th><th>Anschrift</th><th>Wohnungen</th>'+
        '<th>Jahresabrechnungen</th><th>Aktion</th></tr></thead><tbody>'+
        items.map(row).join('')+'</tbody></table></div>';
    };
    return head('IMMOBILIENBESTAND · NUR MUSTERDATEN','Startseite',
      'Verwaltete Immobilien im Überblick. Wählen Sie ein Objekt zur Bearbeitung.',
      button(icon('plus')+' Neues Objekt','new-object',null,'button-primary'))+
      '<section class="section estate-list"><div class="section-header"><div>'+
      '<h2>Immobilien</h2><p>'+live.length+' aktive Objekte</p></div></div>'+
      (live.length?listing(live,false):
        '<div class="empty"><h3>Keine aktiven Objekte</h3>'+
        '<p>Erstellen Sie ein neues Objekt oder stellen Sie ein archiviertes Objekt wieder her.</p></div>')+
      '</section>'+
      (archived.length?'<details class="estate-archive-group"><summary>Archivierte Immobilien ('+
        archived.length+')</summary>'+listing(archived,true)+'</details>':'')+
      '<p class="footnote">Nur synthetische Musterobjekte. Archivieren bewahrt sämtliche Abrechnungsjahre; endgültiges Löschen ist nur bei vollständig leeren Objekten möglich.</p>';
  }
  const steps=[['advance','Vorauszahlungen'],['costs','Gesamtkosten'],['water','Verbräuche'],['review','Prüfen'],['allocation','Ergebnis'],['letters','Briefe']];
  const renderSteps=()=>`<div class="tab-bar" role="tablist" aria-label="Abrechnungsprozess">${steps.map(([id,label])=>`<button class="tab-button ${ui.step===id?'active':''}" role="tab" aria-selected="${ui.step===id}" type="button" data-step="${id}">${label}</button>`).join('')}</div>`;
  function renderTree(){
    const el=$('portfolioTree');if(!el)return;
    const activeObjects=portfolio.objects.filter(o=>o.lifecycle?.status!=="archived");
    el.innerHTML='<div class="tree-heading"><span>OBJEKTBEZOGEN</span><span class="tree-count">'+
      activeObjects.length+'</span></div>'+
      activeObjects.map(o=>{
        const expanded=o.id===ui.treeOpenObjectId;
        const related=o.id===portfolio.selectedObjectId &&
          (ui.view==='object'||(ui.view==='billing'&&(!ui.billingHome||ui.objectListFilter===o.id)));
        const years=Object.keys(o.settlements).sort((a,b)=>b.localeCompare(a));
        const item=(label,action,id,count,selected,ico)=>'<button type="button" class="tree-subitem'+
          (selected?' selected':'')+'" data-action="'+action+'" data-id="'+safeText(id)+
          '"'+(selected?' aria-current="page"':'')+'><span class="tree-icon">'+icon(ico)+'</span>'+safeText(label)+
          (count!=null?'<span class="tree-meta">'+count+'</span>':'')+'</button>';
        const group=(id,label,count,children)=>{
          const open=ui.treeSections[id];
          const years=id==='years';
          return '<div class="tree-section"><button type="button" class="tree-group-toggle'+
            (years&&related&&ui.view==='billing'&&ui.billingHome?' selected':'')+'"'+
            ' data-action="'+(years?'object-billings':'toggle-tree-section')+
            '" data-id="'+(years?safeText(o.id):id)+'" aria-expanded="'+open+'">'+
            '<span class="tree-arrow'+(open?' open':'')+'" aria-hidden="true">'+icon('chevron')+'</span>'+
            '<span class="tree-icon">'+icon(id==='master'?'layers':'calendar')+'</span>'+
            '<span class="tree-group-label">'+label+'</span>'+
            (count!=null?'<span class="tree-meta">'+count+'</span>':'')+'</button>'+
            (open?'<div class="tree-section-children">'+children+'</div>':'')+'</div>';
        };
        const masterItems=item('Objektdaten','open-object-tab','overview',null,
            related&&ui.view==='object'&&ui.objectTab==='overview','building')+
          item('Wohnungen','open-object-tab','units',o.units.length,
            related&&ui.view==='object'&&ui.objectTab==='units','door')+
          item('Mietverhältnisse','open-object-tab','tenancies',o.tenancies.length,
            related&&ui.view==='object'&&ui.objectTab==='tenancies','users')+
          item('Zähler','open-object-tab','meters',o.meterRegistry.length,
            related&&ui.view==='object'&&ui.objectTab==='meters','gauge');
        const yearItems=years.map(year=>{
            const a=o.settlements[year];
            const selected=related&&ui.view==='billing'&&!ui.billingHome&&
              portfolio.selectedYear===year;
            return '<button type="button" class="tree-year'+(selected?' selected':'')+
              '" data-action="open-year" data-id="'+safeText(o.id)+'|'+year+'"'+
              (selected?' aria-current="page"':'')+'>'+
              '<span class="tree-year-name"><span class="tree-icon">'+icon('calendar')+'</span>'+
              year+'</span><small>'+safeText(a.settlement?.status==='draft'?'In Bearbeitung':'Musterstand')+
              '</small></button>';
          }).join('');
        return '<div class="tree-property'+(expanded?' expanded':'')+'">'+
          '<button class="tree-property-button'+(related?' is-current':'')+
            '" type="button" aria-expanded="'+expanded+'"'+
            (related?' aria-current="location"':'')+
            ' aria-label="'+safeText(o.name)+' öffnen" data-action="select-property" data-id="'+
            safeText(o.id)+'"><span class="tree-arrow'+(expanded?' open':'')+'" aria-hidden="true">'+
            icon('chevron')+'</span><span class="tree-icon">'+icon('building')+
            '</span><span class="tree-property-label">'+safeText(o.name)+
            '</span><span class="tree-units">'+o.units.length+' WE</span></button>'+
          (expanded?'<div class="tree-children">'+
            group('master','Stammdaten',null,masterItems)+
            group('years','Jahresabrechnungen',years.length,yearItems)+
            '</div>':'')+'</div>';
      }).join('')+
      '<p class="tree-footnote">Ausschließlich fiktive Musterobjekte.</p>';
  }
  function billingList(){
    const o=master(),years=Object.keys(o.settlements).sort((a,b)=>b.localeCompare(a));
    return head('JAHRESABRECHNUNGEN · '+safeText(o.name),'Jahresabrechnungen',
      'Hier werden ausschließlich Jahresabrechnungen dieser Immobilie angezeigt.',
      button(icon('plus')+' Jahr anlegen','new-year',null,'button-primary'))+
      '<div class="portfolio-summary">'+
        '<div><small>Objekt</small><strong class="portfolio-object-name">'+safeText(o.name)+'</strong></div>'+
        '<div><small>Wohnungen</small><strong>'+o.units.length+'</strong></div>'+
        '<div><small>Jahresabrechnungen</small><strong>'+years.length+'</strong></div></div>'+
      '<section class="section annual-property">'+
        '<div class="section-header"><div><h2>Jahresübersicht</h2>'+
        '<p>'+safeText(o.street)+', '+safeText(o.postalCode)+' '+safeText(o.city)+'</p></div></div>'+
        (years.length?'<div class="annual-rows">'+years.map(y=>{
          const a=o.settlements[y],active=a.settlement?.status==='draft',
            stale=estates.rebasePreview(portfolio,o.id,y).stale;
          return '<div class="annual-row" data-year="'+y+'">'+
            '<span class="annual-icon">'+icon('calendar')+'</span>'+
            '<span class="annual-primary"><strong>Abrechnung '+y+'</strong><small>01.01.'+y+
              ' – 31.12.'+y+' · '+a.tenancies.length+' Abrechnungsfälle</small></span>'+
            '<span class="annual-status '+(active?'active':'')+'">'+safeText(estates.statusLabel(a.settlement?.status))+
              (stale?' · Stammdatenabweichung':'')+'</span>'+
            '<span class="annual-link">'+(active?
               editAction('open-year',o.id+'|'+y,'Abrechnung '+y):
               viewAction('open-year',o.id+'|'+y,'Abrechnung '+y))+
            '</span></div>';
        }).join('')+'</div>':
        '<div class="empty"><h3>Noch keine Jahresabrechnungen</h3><p>Erfassen Sie zunächst Wohnungen und Mietverhältnisse unter Stammdaten. Danach können Sie ein Musterabrechnungsjahr anlegen.</p></div>')+
        '</section><div class="info-line">Jahresabrechnungen sind diesem Objekt fest zugeordnet. Objektwechsel erfolgen ausschließlich links im Immobilienbaum.</div>';
  }
  function billing(){
    if(ui.billingHome)return billingList();
    if(!data)return head('JAHRESABRECHNUNGEN','Kein Jahresstand',
      'Bitte zunächst unter Jahresabrechnungen eine synthetische Jahresabrechnung anlegen.');
    const ending=estates.statusLabel(data.settlement?.status);
    let content='';let action='';let title='Abrechnung '+activeYear();
    let description='Abrechnungsfälle werden automatisch aus den Objektstammdaten abgeleitet.';
    if(ui.billingHome)return billingList();
    if(ui.step==='costs'){if(!annualLocked())action=button('Kostenart hinzufügen','new-cost',null,'button-primary');content=costs();}
    else if(ui.step==='water'){if(!annualLocked())action=button('Hauszähler prüfen','edit-house',null,'button-primary');content=water();}
    else if(ui.step==='advance'){content=advances();}
    else if(ui.step==='allocation'){content=allocations();}
    else if(ui.step==='review'){content=review();}
    else if(ui.step==='letters'){if(!annualLocked())action=button(icon('print')+' Musterentwurf drucken','print-letter',null,'button-quiet');content=letters();}
    return '<div class="context-return">'+button('← Jahresabrechnungen','back-billings',null,'button-quiet')+
      '<span>'+safeText(master().name)+' · '+safeText(ending)+'</span></div>'+
      (estates.rebasePreview(portfolio,master().id,activeYear()).stale?
        '<div class="warning-line"><strong>Stammdaten wurden geändert. Dieser Jahresstand bleibt zunächst unverändert.</strong> '+
        (!annualLocked()?button('Stammdatenabgleich prüfen','rebase-year',null,'button-quiet'):'Historischer Musterstand: keine automatische Überschreibung.')+'</div>':'')+
      head('ABRECHNUNG '+activeYear()+' · '+safeText(ending),title,description,action)+renderSteps()+content;
  }
  function tenancies(){
    const model=propertyModel.inspect(data,waterReport()),state=ledger();
    const c=new Map(state.tenants.map(t=>[t.id,t]));
    const rows=data.tenancies.map(t=>{
      const r=c.get(t.id),unit=data.units.find(u=>u.id===t.unitId);
      const errors=model.issues.filter(x=>x.entityId===t.id||x.entityId===t.unitId);
      return '<tr><td><strong>'+safeText(t.name)+'</strong><span class="small soft water-unit-sub">'+safeText(t.id)+' · '+safeText(t.role)+'</span></td>'+
        '<td>'+safeText(unit?.label||t.unitId)+'</td>'+
        '<td>'+safeText(t.start)+'<br><span class="soft">bis</span> '+safeText(t.end)+'</td>'+
        '<td class="money">'+(r?r.days:'–')+'</td><td class="money">'+safeText(t.persons)+'</td>'+
        '<td class="money">'+(r?fmt(r.costCents/100):'–')+'</td>'+
        '<td class="money">'+fmt(data.payments?.[t.id]?.paidActual??t.advance)+'</td><td>'+labelStatus(!errors.length,'Erfasst','Prüfen')+'</td>'+
        '<td>'+editAction('edit-tenancy',t.id,'Abrechnungsfall')+'</td></tr>';
    }).join('');
    const gaps=model.vacancy.filter(v=>v.days>0);
    const info='<div class="case-summary"><div><small>Abrechnungsfälle</small><strong>'+data.tenancies.length+'</strong></div>'+
       '<div><small>Wohnungen</small><strong>'+data.units.length+'</strong></div>'+
       '<div><small>Leerstandstage</small><strong>'+model.vacancyDays+'</strong></div>'+
       '<div><small>Zu prüfende Einträge</small><strong>'+model.issues.length+'</strong></div></div>';
    return '<div class="inline-toolbar"><div><h2>Mietverhältnisse und Abrechnungsfälle</h2>'+
      '<p class="small muted">Ein-/Auszug und Nutzung je Abrechnungsfall · '+activeYear()+'</p></div>'+
      button('Musterfall hinzufügen','new-tenancy',null,'button-primary')+'</div>'+
      info+'<section class="section"><div class="section-header"><div><h2>Teilnehmer und Zeiträume</h2>'+
      '<p>Eine Wohnung kann mehrere aufeinanderfolgende Mietverhältnisse besitzen. Privatanteile nehmen an der Abrechnung teil.</p></div></div>'+
      '<div class="table-wrap"><table class="data-table case-table"><thead><tr><th>Abrechnungsfall</th><th>Wohnung</th><th>Zeitraum</th><th class="money">Tage</th><th class="money">Personen</th><th class="money">Kostenanteil</th><th class="money">Vorauszahlung</th><th>Status</th><th>Aktion</th></tr></thead><tbody>'+
      rows+'</tbody></table></div>'+
      (gaps.length?'<div class="table-caption">Leerstand: '+
        gaps.map(x=>safeText(x.unitId)+' · '+safeText(x.start)+' bis '+safeText(x.end)+' ('+x.days+' Tage)').join('; ')+'</div>':'')+
      (model.issues.length?'<div class="water-issues"><strong>Fachliche Lücken</strong><ul>'+
        model.issues.map(x=>'<li>'+safeText(x.message)+'</li>').join('')+'</ul></div>':'')+
      '</section><p class="footnote">Ausschließlich fiktive Personen verwenden. Bei Mieterwechsel KW/WW-Verbrauch pro Fall ergänzen; die Summe muss zur Messung der Wohnung passen. Keine echten Mieterdaten in diese Demo eingeben.</p>';
  }
  const costCatalogId=c=>c.sourceId||({water:'K002',waste:'K009',heat:'K006',
    insurance:'K015',power:'K013'}[c.id]||'');
  const costQuantity=c=>c.id==='water'?Number(data.houseWater):Number(c.consumptionTotal);
  const costReadiness=c=>{
    if(c.active===false)return'<span class="status neutral">Inaktiv</span>';
    const amount=Number(c.amount),quantity=costQuantity(c);
    const hasAmount=Number.isFinite(amount)&&amount>0;
    const hasQuantity=c.method!=='Verbrauch'||(Number.isFinite(quantity)&&quantity>0);
    return statusFor(hasAmount&&hasQuantity,hasAmount||hasQuantity);
  };
  function costs(){
    const filter=ui.filter.toLowerCase(),items=data.costs.filter(c=>
      (c.name+' '+c.category+' '+costCatalogId(c)).toLowerCase().includes(filter));
    return '<div class="inline-toolbar"><div><h2>Gesamtkosten</h2>'+
      '<p class="small muted">Original-Kostenartenkatalog und Rechnungsangaben · ausschließlich Testdaten</p></div>'+
      '<div class="filterbar"><input class="search" id="tableSearch" aria-label="Kosten durchsuchen" '+
      'placeholder="Kostenarten suchen …" value="'+safeText(ui.filter)+'"></div></div>'+
      '<section class="section"><div class="stat-inline">'+
      '<div><small>Gesamtkosten</small><strong>'+fmt(allCost())+'</strong></div>'+
      '<div><small>Kostenarten</small><strong>'+data.costs.length+'</strong></div>'+
      '<div><small>Vermieteranteile</small><strong>'+fmt(ledger().totals.landlordCostsCents/100)+'</strong></div></div>'+
      '<div class="table-wrap"><table class="data-table cost-master-table"><thead><tr>'+
      '<th>Kostenart</th><th>Umlageschlüssel</th><th class="money">Rechnungsbetrag</th>'+
      '<th class="money">Preis je Einheit</th><th>Status / Aktion</th></tr></thead><tbody>'+
      (items.length?items.map(c=>{
        const source=costCatalogId(c),price=c.method==='Verbrauch'?
          waterDetails.priceFor(c,costQuantity(c)):null;
        return '<tr><td><span class="cost-id">'+safeText(source||'EIGEN')+'</span>'+
          '<strong>'+safeText(c.name)+'</strong>'+
          '<span class="cost-sub">'+safeText(c.category||'–')+'</span></td>'+
          '<td>'+safeText(c.method==='Fläche'?'Wohnfläche':c.method)+'</td>'+
          '<td class="money">'+fmt(c.amount)+'</td>'+
          '<td class="money">'+(price?(price.valid?
            fmtPrice(price.effective,c.consumptionUnit||'m³'):'Nicht erfasst'):'–')+'</td>'+
          '<td>'+actionCell(costReadiness(c),
            annualLocked()?viewAction('view-cost',c.id,c.name):
              editAction('edit-cost',c.id,c.name))+'</td></tr>';
      }).join(''):'<tr><td colspan="5" class="muted">Keine Treffer.</td></tr>')+
      '</tbody></table></div><div class="table-caption">Beträge, Belege, Zuordnung und Kostenstatus werden ausschließlich über Bearbeiten gepflegt. Aktivieren, Deaktivieren und Löschen sind dort gesondert geschützt.</div></section>'+
      '<p class="footnote">K002 Wasserversorgung und K003 Entwässerung sind im Originalkatalog getrennt. Die synthetische Kombination „Wasser & Abwasser“ ist bisher K002 zugeordnet und wird bei einer späteren fachlichen Migration gesondert geprüft. K006 bezeichnet kombinierte Heiz- und Warmwasserkosten.</p>';
  }
  function water(){
    const tabs=[['water','Wasser · KW / WW'],['techem','Heizung & Warmwasser · Techem'],['other','Weitere Verbräuche']];
    const chooser='<div class="object-switch" role="tablist" aria-label="Verbrauchsarten">'+
      tabs.map(([id,label])=>'<button role="tab" type="button" aria-selected="'+(ui.consumptionTab===id)+'" data-consumption-tab="'+id+'" class="'+(ui.consumptionTab===id?'active':'')+'">'+label+'</button>').join('')+'</div>';
    return chooser+(ui.consumptionTab==='techem'?techemConsumption():
      ui.consumptionTab==='other'?otherConsumption():waterMeters());
  }
  function techemConsumption(){
    const costs=data.costs.filter(c=>c.active!==false&&c.method==='Externe Einzelabrechnung');
    if(!costs.length)return '<div class="empty"><h3>Keine externen Einzelkostenarten</h3><p>Eine externe Heizkostenabrechnung wird unter Gesamtkosten als Abrechnungsart „Externe Einzelabrechnung“ hinterlegt. Hier erscheinen dann ihre Einzelwerte.</p></div>';
    return costs.map(cost=>{
      const source=data.externalValues?.[cost.id]||{},rows=source.rows||{};
      let sum=0,missing=0;
      const items=data.tenancies.map(t=>{
        const r=rows[t.id],unit=data.units.find(u=>u.id===t.unitId)?.label||t.unitId;
        if(r&&Number.isFinite(Number(r.amount)))sum+=Number(r.amount);else missing++;
        return '<tr><td><strong>'+safeText(t.name)+'</strong><span class="water-unit-sub">'+safeText(unit)+' · '+safeText(t.id)+'</span></td>'+
         '<td class="money">'+(r?fmt(r.amount):'Nicht erfasst')+'</td>'+
         '<td class="money">'+(r?.units==null?'–':fmtVolume(r.units))+'</td>'+
         '<td>'+actionCell(statusFor(r&&Number.isFinite(Number(r.amount)),Boolean(r)),
             annualLocked()?viewAction('view-external',cost.id+'|'+t.id,'Techem-Einzelwerte'):
               editAction('edit-external',cost.id+'|'+t.id,'Techem-Einzelwerte'))+'</td></tr>';
      }).join('');
      const bill=Number(cost.amount)-Number(cost.landlordShare||0);
      return '<section class="section" style="margin-bottom:18px"><div class="section-header"><div><h2>'+safeText(cost.name)+'</h2>'+
       '<p>Externe Einzelabrechnung · Rechnungsbetrag nur in Gesamtkosten bearbeiten</p></div>'+
       labelStatus(missing===0&&Math.abs(bill-sum)<0.005,'Abgestimmt','Prüfen')+'</div>'+
       '<div class="stat-inline"><div><small>Rechnungsbetrag</small><strong>'+fmt(cost.amount)+'</strong></div>'+
       '<div><small>Belegter Vermieterposten</small><strong>'+fmt(cost.landlordShare||0)+'</strong></div>'+
       '<div><small>Summe Einzelwerte</small><strong>'+fmt(sum)+'</strong></div>'+
       '<div><small>Ungeklärte Differenz</small><strong>'+fmt(bill-sum)+'</strong></div></div>'+
       '<div class="table-wrap"><table class="data-table"><thead><tr><th>Abrechnungsfall · Wohnung</th><th class="money">Kosten laut Techem</th><th class="money">Einheiten (optional)</th><th>Aktion</th></tr></thead><tbody>'+
       items+'</tbody></table></div><div class="table-caption">Die extern ausgewiesenen Eurobeträge werden exakt übernommen – nicht aus Verbrauchseinheiten erneut berechnet. Fehlende Fälle oder Summendifferenzen bleiben kritisch.</div></section>';
    }).join('');
  }
  function otherConsumption(){
    const costs=data.costs.filter(c=>c.active!==false&&c.method==='Verbrauch'&&c.id!=='water');
    if(!costs.length)return '<div class="empty"><h3>Keine weiteren Verbrauchskostenarten</h3>'+
      '<p>Hier erscheinen zusätzliche verbrauchsabhängige Kostenarten, z. B. gesondert abgerechneter, einzeln gemessener Strom. Voraussetzung ist eine Kostenart mit Umlageschlüssel „Verbrauch“ und separaten Mengen je Mietverhältnis. Bereits in Wasser, Techem oder Allgemeinstrom enthaltene Kosten dürfen nicht doppelt berechnet werden.</p></div>';
    return '<section class="section"><div class="section-header"><h2>Weitere Verbrauchseinheiten</h2></div>'+
      '<div class="table-wrap"><table class="data-table"><thead><tr><th>Kostenart</th><th>Einheit</th><th class="money">Gesamtmenge</th><th>Einzelwerte</th><th>Aktion</th></tr></thead><tbody>'+
      costs.map(c=>'<tr><td><strong>'+safeText(c.name)+'</strong></td><td>'+safeText(c.consumptionUnit||'Einheiten')+'</td>'+
       '<td class="money">'+(c.consumptionTotal==null?'–':fmtVolume(c.consumptionTotal))+'</td>'+
       '<td>'+Object.keys(c.consumptionByTenant||{}).length+' / '+data.tenancies.length+'</td>'+
       '<td>'+actionCell(statusFor(Number.isFinite(Number(c.consumptionTotal))&&
          Number(c.consumptionTotal)>0&&data.tenancies.every(t=>c.consumptionByTenant?.[t.id]!=null),
          Number.isFinite(Number(c.consumptionTotal))&&Number(c.consumptionTotal)>0),
          annualLocked()?viewAction('view-other-consumption',c.id,'Weitere Verbräuche'):
            editAction('edit-other-consumption',c.id,'Weitere Verbräuche'))+'</td></tr>').join('')+
      '</tbody></table></div></section>';
  }
  function waterMeters(){
    const report=waterReport(),units=report.totals.units,house=report.house.valid?report.house.consumption:null;
    const waterCost=data.costs.find(c=>c.id==='water');
    const price=waterDetails.priceFor(waterCost,data.houseWater);
    const waterAllocation=ledger().costs.find(c=>c.id==='water');
    const show=v=>v===null?'–':fmtVolume(v)+' m³';
    const diff=v=>v===null?'–':(v>0?'+':'')+fmtVolume(v)+' m³';
    const metric=(label,value,sub)=>'<div class="water-metric"><small>'+safeText(label)+'</small><strong>'+safeText(value)+'</strong><span>'+safeText(sub)+'</span></div>';
    const rows=data.units.map((u,i)=>{
      const m=u.waterMeters||{},r=report.rows[i];
      const half=key=>{
        const meter=m[key]||{},part=r[key],first=meter.segments?.[0]||meter,last=meter.segments?.at(-1)||meter;
        const band=key==='cold'?'water-cold':'water-hot';
        return '<td class="money '+band+'">'+(waterDetails.volume(first.start)?fmtVolume(first.start):'–')+'</td>'+
          '<td class="money '+band+'">'+(waterDetails.volume(last.end)?fmtVolume(last.end):'–')+'</td>'+
          '<td class="money '+band+'"><strong>'+(part.valid?show(part.consumption):'–')+'</strong></td>';
      };
      const shares=waterAllocation?.rows.filter(x=>x.unitId===u.id)||[];
      return '<tr><td><strong>'+safeText(u.label)+'</strong><span class="water-unit-sub">'+safeText(u.id)+'</span></td>'+
        half('cold')+half('hot')+'<td class="money"><strong class="water-total-value">'+show(r.total)+'</strong></td>'+
        '<td class="money">'+(shares.length?fmt(shares.reduce((sum,x)=>sum+x.cents,0)/100):'–')+'</td><td>'+
        actionCell(statusFor(r.valid,r.cold.valid||r.hot.valid),
           annualLocked()?viewAction('view-water',u.id,'Wasserverbräuche'):
             editAction('edit-water',u.id,'Kalt- und Warmwasser'))+'</td></tr>';
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
      '<div class="water-actions">'+editAction('edit-water-price',null,'Preis je m³')+
        (!report.exactMatch&&report.canReview?button('Abweichungen begründen','check-water',null,'button-quiet'):'')+'</div>'+
      (report.issues.length?'<div class="water-issues"><strong>Offene Zähler- oder Rechnungsangaben</strong><ul>'+
        report.issues.slice(0,12).map(x=>'<li>'+safeText((x.unitId?x.unitId+' · ':'')+x.reason)+'</li>').join('')+
        '</ul></div>':'')+'</section>';
    const table='<section class="section" style="margin-top:18px"><div class="section-header"><div><h2>Wohnungszähler</h2>'+
      '<p>Jahresablesungen und Ablesedaten werden hier erfasst. Die physische Zählernummer stammt unveränderbar aus den Stammdaten.</p></div></div>'+
      '<div class="table-wrap"><table class="data-table water-table"><thead><tr><th rowspan="2">Wohnung</th>'+
      '<th colspan="3" class="water-cold">Kaltwasser (m³)</th><th colspan="3" class="water-hot">Warmwasser (m³)</th>'+
      '<th rowspan="2" class="money">Gesamt</th><th rowspan="2" class="money">Kostenanteil</th>'+
      '<th rowspan="2">Status / Aktion</th></tr><tr>'+
      '<th class="money water-cold">Anfang</th><th class="money water-cold">Ende</th><th class="money water-cold">Verbrauch</th>'+
      '<th class="money water-hot">Anfang</th><th class="money water-hot">Ende</th><th class="money water-hot">Verbrauch</th>'+
      '</tr></thead><tbody>'+rows+'</tbody><tfoot><tr><td><strong>Summe</strong></td>'+
      '<td colspan="2" class="water-cold"></td><td class="money water-cold"><strong>'+show(report.totals.cold)+'</strong></td>'+
      '<td colspan="2" class="water-hot"></td><td class="money water-hot"><strong>'+show(report.totals.hot)+'</strong></td>'+
      '<td class="money"><strong class="water-total-value">'+show(units)+'</strong></td><td colspan="2"></td></tr></tfoot></table></div>'+
      '<div class="table-caption">Zwei getrennte Musterzähler je Wohnung, insgesamt 14. Die Originalversion hat weitere Funktionen wie Zählerwechsel, historischen Ableseverlauf und kontrollierte Vorjahresübernahme; diese sind noch nicht migriert.</div></section>';
    const split='<section class="section" style="margin-top:18px"><div class="section-header"><div><h2>Wasserverbräuche je Mietverhältnis</h2>'+
      '<p>Insbesondere bei Mieterwechseln und Leerständen: dokumentierte Einzelmengen, keine geschätzte Verteilung.</p></div></div>'+
      '<div class="table-wrap"><table class="data-table"><thead><tr><th>Teilnehmer · Wohnung</th><th>Zeitraum</th><th class="money">Kaltwasser</th><th class="money">Warmwasser</th><th>Aktion</th></tr></thead><tbody>'+
      data.tenancies.map(t=>'<tr><td>'+safeText(t.name)+' · '+safeText(data.units.find(u=>u.id===t.unitId)?.label||t.unitId)+'</td>'+
       '<td>'+safeText(t.start)+' bis '+safeText(t.end)+'</td>'+
       '<td class="money">'+(t.consumptionCold==null?'Automatisch bei Einzelbelegung':fmtVolume(t.consumptionCold)+' m³')+'</td>'+
       '<td class="money">'+(t.consumptionHot==null?'Automatisch bei Einzelbelegung':fmtVolume(t.consumptionHot)+' m³')+'</td>'+
       '<td>'+actionCell(statusFor(
           (t.consumptionCold!=null&&t.consumptionHot!=null)||
           (data.tenancies.filter(other=>other.unitId===t.unitId).length===1&&
            t.start===activeYear()+'-01-01'&&t.end===activeYear()+'-12-31'&&
            waterReport().rows.find(row=>row.id===t.unitId)?.valid),
           t.consumptionCold!=null||t.consumptionHot!=null),
         annualLocked()?viewAction('view-case-water',t.id,'Wasserverbrauch'):
           editAction('edit-case-water',t.id,'Wasserverbrauch'))+'</td></tr>').join('')+
      '</tbody></table></div><div class="table-caption">Werte werden hier einmalig eingegeben. Im Mietverhältnis bleiben sie ausschließlich Ergebnisinformationen.</div></section>';
    return '<div class="inline-toolbar"><div><h2>Wasser · Kalt- und Warmwasser</h2>'+
      '<p class="small muted">Erfassung und Kontrolle · 2025 · nur synthetische Musterdaten</p></div>'+
      editAction('edit-house',null,'Hauszähler und Wasserwerksrechnung')+'</div>'+
      KPIs+differences+table+split+
      (data.units.some(u=>u.waterSourceNotice)?'<p class="footnote"><strong>Ältere Demowerte:</strong> Die früheren Ein-Zähler-Daten bleiben als KW-Entwurf erhalten. Warmwasser wurde nicht erfunden. Bitte vervollständigen oder die Demo zurücksetzen.</p>':'');
  }
  function advances(){
    const rows=data.tenancies.map(t=>{
      const p=data.payments?.[t.id]||{},expected=workflow.expected(t,p),
        agreement=workflow.agreementPreview(t,p);
      const u=data.units.find(x=>x.id===t.unitId)?.label||t.unitId;
      return '<tr><td><strong>'+safeText(t.name)+'</strong><span class="water-unit-sub">'+safeText(t.id)+' · '+safeText(u)+'</span></td>'+
        '<td>'+safeText(t.start)+' bis '+safeText(t.end)+'</td>'+
        '<td class="money">'+(!agreement.valid?'–':
          (p.mode==='monthly'?fmt(agreement.monthly)+' / Mon.':fmt(agreement.annual)+' / Jahr'))+'</td>'+
        '<td class="money">'+(expected===null?'Nicht erfasst':fmt(expected))+'</td>'+
        '<td class="money"><strong>'+fmt(p.paidActual??t.advance)+'</strong></td><td>'+
        actionCell(statusFor(agreement.valid&&expected!==null&&Number.isFinite(Number(p.paidActual)),
          agreement.valid||Number.isFinite(Number(p.paidActual))),
          annualLocked()?viewAction('view-payment',t.id,'Vorauszahlungen'):
            editAction('edit-payment',t.id,'Vorauszahlungen'))+'</td></tr>';
    }).join('');
    return '<div class="inline-toolbar"><h2>Vorauszahlungen nach Abrechnungsfall</h2></div>'+
      '<section class="section"><div class="stat-inline"><div><small>Tatsächlich gezahlt</small><strong>'+
      fmt(allAdvance())+'</strong></div><div><small>Abrechnungsfälle</small><strong>'+data.tenancies.length+'</strong></div></div>'+
      '<div class="table-wrap"><table class="data-table"><thead><tr><th>Mieter · Wohnung</th>'+
      '<th>Zeitraum (nur Anzeige)</th><th class="money">Vereinbarung</th>'+
      '<th class="money">Soll Zeitraum</th><th class="money">Ist gezahlt</th><th>Status / Aktion</th>'+
      '</tr></thead><tbody>'+rows+'</tbody></table></div>'+
      '<div class="table-caption">Mieter, Wohnung, Rolle und Mietzeitraum können hier nicht geändert werden. Nur die Vorauszahlungen werden an dieser Stelle gepflegt. Der Abrechnungssaldo verwendet Ist-Zahlungen.</div></section>';
  }
  function allocations(){
    const r=ledger(),costs=r.costs.filter(c=>c&&c.id),tenants=r.tenants,totals=r.totals;
    const rows=tenants.map(t=>{
      const unit=data.units.find(u=>u.id===t.unitId);
      const allocations=new Map((t.entries||[]).map(entry=>[entry.costId,entry.cents]));
      return '<tr><td><strong>'+safeText(unit?.label||t.unitId)+'</strong>'+
        '<span class="water-unit-sub">'+safeText(t.name)+' · '+safeText(t.id)+
        ' · '+t.days+' Tage</span></td>'+
        costs.map(c=>'<td class="money">'+fmt((allocations.get(c.id)||0)/100)+'</td>').join('')+
        '<td class="money result-grand"><strong>'+fmt(t.costCents/100)+'</strong></td>'+
        '<td class="money">'+fmt((t.advanceCents||0)/100)+'</td>'+
        '<td class="money"><span class="outcome '+(t.balanceCents>0?'neg':'pos')+'">'+
          fmt(t.balanceCents/100)+'</span></td></tr>';
    }).join('');
    const totalsRow='<tr><th>Gesamt</th>'+
      costs.map(c=>'<th class="money">'+fmt(c.distributedCents/100)+'</th>').join('')+
      '<th class="money">'+fmt(totals.distributedCents/100)+'</th>'+
      '<th class="money">'+fmt(totals.advancesCents/100)+'</th>'+
      '<th class="money">'+fmt(totals.balanceCents/100)+'</th></tr>';
    return '<div class="inline-toolbar"><h2>Abrechnungsergebnis je Wohnung und Mietverhältnis</h2>'+
      '<span class="status amber">Vorläufig · nicht freigegeben</span></div>'+
      '<section class="section"><div class="big-total"><div>'+
      '<small>Gesamtsaldo · synthetischer Fachtest</small><strong>'+
      fmt(totals.balanceCents/100)+'</strong></div>'+
      '<span class="small muted">'+tenants.length+' Abrechnungsfälle · '+costs.length+
      ' Kostenarten</span></div>'+
      '<div class="table-wrap"><table class="data-table result-detail-table"><thead><tr>'+
      '<th>Wohnung · Abrechnungsfall</th>'+
      costs.map(c=>'<th class="money result-category"><small>'+
        safeText(costCatalogId(data.costs.find(x=>x.id===c.id)||c))+'</small>'+
        safeText(c.name)+'</th>').join('')+
      '<th class="money">Umlagekosten gesamt</th>'+
      '<th class="money">Tatsächlich gezahlt</th><th class="money">Saldo</th>'+
      '</tr></thead><tbody>'+rows+'</tbody><tfoot>'+totalsRow+'</tfoot></table></div>'+
      '<div class="table-caption">Umlagekosten werden je Kostenart und Abrechnungsfall ausgewiesen. Die tatsächlich gezahlten Vorauszahlungen sind eine Gesamtsumme je Mietverhältnis; es gibt im Fachtest keine erfundene Aufteilung auf einzelne Kostenarten.</div>'+
      '<div class="result-reconcile">'+
      '<div><small>Rechnungen brutto</small><strong>'+fmt(totals.grossCostsCents/100)+'</strong></div>'+
      '<div><small>Belegter Vermieteranteil</small><strong>'+fmt(totals.landlordCostsCents/100)+'</strong></div>'+
      '<div><small>Umlagefähig</small><strong>'+fmt(totals.allocableCostsCents/100)+'</strong></div>'+
      '<div><small>Nicht zugeordnet</small><strong>'+fmt(totals.differenceCents/100)+'</strong></div>'+
      '</div></section>'+
      '<div class="info-line">Die Ergebnisanzeige ist unabhängig von der Briefvorschau. Prüfhinweise verhindern die Anzeige nicht; endgültige Freigabe bleibt bei offenen Pflichtprüfungen gesperrt.</div>';
  }
  function review(){
    const q=qualityReport(),real=q.rows.filter(x=>x.status!=='not-run'),
      waiting=q.rows.filter(x=>x.status==='not-run');
    const item=x=>'<div class="check-item"><div class="check-dot '+(x.status==='passed'?'pass':'todo')+'">'+
      icon(x.status==='passed'?'check':'alert')+'</div><div class="check-content"><strong>'+
      safeText(x.id)+' · '+safeText(x.title)+'</strong><span>'+
      safeText(x.detail||((x.status==='not-run')?'Originalprüfung noch nicht umgesetzt.':x.status==='passed'?'Vorprüfung bestanden (synthetisch)':x.status==='not-applicable'?'Nicht anwendbar':x.status==='hint'?'Fachlicher Hinweis':
      x.status==='review'?'Entscheidung erforderlich':'Kritischer Abrechnungsmangel'))+
      '</span></div>'+(x.status==='critical'?'<button class="link" type="button" data-action="'+safeText(x.route)+'">Ursache →</button>':'')+'</div>';
    return '<div class="inline-toolbar"><div><h2>Prüfen · vollständiges Regelregister</h2>'+
      '<p class="small muted">Die Abrechnung wird intern vorab berechnet. Nur tatsächlich ausgeführte Regeln erhalten einen Prüfstatus.</p></div>'+
      '<span class="status amber">Abschluss gesperrt</span></div>'+
      '<div class="case-summary">'+
        '<div><small>Originalregeln</small><strong>'+q.counts.total+'</strong></div>'+
        '<div><small>Experimentell ausgeführt</small><strong>'+q.counts.executed+'</strong></div>'+
        '<div><small>Noch nicht ausgeführt</small><strong>'+q.counts.notRun+'</strong></div>'+
        '<div><small>Kritische Meldungen</small><strong>'+q.counts.critical+'</strong></div></div>'+
      '<section class="section"><div class="section-header"><div><h2>Vorprüfungen und aktuelle Abrechnungsfehler</h2>'+
        '<p>25 Teilprüfungen arbeiten mit synthetischen Musterdaten; 19 Originalregeln und die druckfertige Briefprüfung fehlen weiterhin.</p></div></div>'+
        real.map(item).join('')+q.dynamic.map(d=>'<div class="check-item"><div class="check-dot todo">'+icon('alert')+
          '</div><div class="check-content"><strong>'+safeText(d.title)+'</strong><span>Dynamischer Berechnungs- oder Briefmangel</span></div>'+
          '<button class="link" type="button" data-action="'+safeText(d.route)+'">Bearbeiten →</button></div>').join('')+
        '<details class="review-remaining"><summary>'+waiting.length+' weitere Originalregeln · noch nicht portiert</summary>'+
          waiting.map(item).join('')+'</details>'+
        '<div class="progress-foot"><strong>Keine Abrechnungsfreigabe möglich</strong><span class="note">'+
          safeText(q.reason)+'</span></div></section>'+
        '<div class="info-line">Die 44 Originalregeln sind jetzt sichtbar inventarisiert. „Nicht ausgeführt“ bedeutet ausdrücklich NICHT bestanden. Finalisierung, Archiv und echte Brieffreigabe bleiben gesperrt.</div>';
  }
  function letters(){
    const bundle=letterBundle(),list=bundle.letters,chosen=ui.letterId&&list.find(x=>x.id===ui.letterId)||list[0];
    const selected=ui.showAllLetters?list:chosen?[chosen]:[];
    const incomplete=bundle.missingRecipients.length+bundle.errors.length;
    return '<div class="inline-toolbar"><div><h2>Briefe · Einzelvorschau und Sammelentwurf</h2>'+
      '<p class="small muted">Vollständige Muster-Empfängerliste aus dem Abrechnungskern · keine Versandfreigabe</p></div>'+
      button('Briefvorlage bearbeiten','edit-letter-settings',null,'button-quiet')+'</div>'+
      '<div class="case-summary"><div><small>Abrechnungsfälle</small><strong>'+data.tenancies.length+'</strong></div>'+
      '<div><small>Briefentwürfe</small><strong>'+bundle.letters.length+'</strong></div>'+
      '<div><small>Fehlende Daten</small><strong>'+incomplete+'</strong></div>'+
      '<div><small>A4-/Fachfreigabe</small><strong>Gesperrt</strong></div></div>'+
      '<section class="section printable"><div class="section-header"><div><h2>Entwurfsauswahl</h2>'+
      '<p>Alle Entwürfe enthalten eine Nicht-versenden-Kennzeichnung.</p></div>'+
      '<button class="link" type="button" data-action="all-letters">'+(ui.showAllLetters?'Einzelbrief anzeigen':'Alle Entwürfe anzeigen')+'</button></div>'+
      '<div class="letter-picker">'+list.map(x=>'<button type="button" class="'+(chosen?.id===x.id?'active':'')+
         '" data-action="select-letter" data-id="'+safeText(x.id)+'">'+safeText(x.name)+' · '+safeText(x.unit)+'</button>').join('')+'</div>'+
      '<div class="section-body letter-paper-stack">'+selected.map(x=>letterModule.html(x,bundle.config)).join('')+'</div></section>'+
      '<div class="info-line">Die Briefdaten und Beträge stammen aus dem fallbezogenen Abrechnungsmodell. Dokumentpreflight: '+safeText(bundle.status)+
      '. Druck- und A4-Layoutparität, alle Original-Briefeinstellungen und finale Freigabe sind noch nicht abgeschlossen.</div>';
  }
  function object(){
    const o=master();
    let content='';
    if(ui.objectTab==='overview'){
      content=head('IMMOBILIENSTAMM · '+safeText(o.id),o.name,
        'Objekt, Wohnungen und Mietverhältnisse sind dauerhaft angelegt. Jahresabrechnungen beziehen sich auf diese Stammdaten.',
        editAction('edit-master-property',null,'Objektdaten'))+
        '<section class="section"><div class="section-header"><div><h2>Objektstammdaten</h2>'+
        '<p>'+safeText(o.street)+', '+safeText(o.postalCode)+' '+safeText(o.city)+'</p></div>'+
        '<span class="status green">Stammdaten · Revision '+o.revision+'</span></div>'+
        '<div class="stat-inline"><div><small>Objekt-ID</small><strong>'+safeText(o.id)+'</strong></div>'+
        '<div><small>Wohnungen</small><strong>'+o.units.length+'</strong></div>'+
        '<div><small>Fläche</small><strong>'+fmtVolume(o.units.reduce((n,u)=>n+Number(u.area),0))+' m²</strong></div>'+
        '<div><small>Mietverhältnisse</small><strong>'+o.tenancies.length+'</strong></div></div>'+
        '</section>'+ 
        '<div class="info-line">Die Briefanschrift wird grundsätzlich aus der Objektadresse abgeleitet. Abweichende Zustellanschriften werden nur beim jeweiligen Mietverhältnis eingetragen. Änderungen an Stammdaten verändern bestehende Jahresabrechnungen nicht automatisch.</div>';
    }else if(ui.objectTab==='units'){
      content=head('WOHNUNGSSTAMMDATEN',o.name+' · Wohnungen',
        'Wohnungen werden ausschließlich hier verwaltet. Eine eigene Wohnungs-Detailseite ist nicht notwendig.',
        button(icon('plus')+' Wohnung hinzufügen','new-master-unit',null,'button-primary'))+
        '<section class="section"><div class="stat-inline">'+
          '<div><small>Wohnungen</small><strong>'+o.units.length+'</strong></div>'+
          '<div><small>Gesamtwohnfläche</small><strong>'+
            fmtVolume(o.units.reduce((n,u)=>n+Number(u.area),0))+' m²</strong></div>'+
          '<div><small>Stammdatensätze</small><strong>'+o.units.length+'</strong></div></div>'+
        '<div class="table-wrap"><table class="data-table"><thead><tr><th>Wohnung</th>'+
        '<th>Wohnungs-ID</th><th>Lage / Geschoss</th><th class="money">Fläche</th>'+
        '<th>Aktion</th></tr></thead><tbody>'+
        o.units.map(u=>'<tr><td><strong>'+safeText(u.label)+'</strong></td>'+
          '<td class="mono small">'+safeText(u.id)+'</td>'+
          '<td>'+safeText(u.position)+'</td>'+
          '<td class="money">'+fmtVolume(u.area)+' m²</td>'+
          '<td>'+editAction('edit-master-unit',u.id,u.label)+
          '</td></tr>').join('')+
        '</tbody></table></div></section>'+
        '<div class="info-line">Nur Wohnungsstammdaten: Mietverhältnisse, Zähler und Jahresabrechnungen haben jeweils ihren eigenen Eintrag in der linken Navigation.</div>';
    }else if(ui.objectTab==='tenancies'){
      const ordered=o.tenancies.slice().sort((a,b)=>a.unitId.localeCompare(b.unitId)||a.leaseStart.localeCompare(b.leaseStart));
      content=head('DAUERHAFTE MIETERSTAMMDATEN',o.name+' · Mietverhältnisse',
        'Einzug, Auszug, Wohnung, Nutzungsart und Zustellanschrift werden nur hier gepflegt.',
        button('Muster-Mietverhältnis anlegen','new-master-tenancy',null,'button-primary'))+
        '<section class="section"><div class="stat-inline"><div><small>Verträge</small><strong>'+o.tenancies.length+
        '</strong></div><div><small>Offene Auszüge</small><strong>'+
        o.tenancies.filter(t=>!t.leaseEnd).length+'</strong></div></div>'+
        '<div class="table-wrap"><table class="data-table"><thead><tr><th>Person</th><th>Wohnung</th>'+
        '<th>Nutzungsart</th><th>Einzug</th><th>Auszug</th><th>Aktion</th></tr></thead><tbody>'+
        ordered.map(t=>'<tr><td><strong>'+safeText(t.name)+'</strong><span class="water-unit-sub">'+
          safeText(t.id)+'</span></td><td>'+safeText(o.units.find(u=>u.id===t.unitId)?.label||t.unitId)+
          '</td><td>'+safeText(t.role)+'</td><td>'+safeText(t.leaseStart)+
          '</td><td>'+(t.leaseEnd?safeText(t.leaseEnd):'<span class="status green">Nicht ausgezogen</span>')+
          '</td><td>'+editAction('edit-master-tenancy',t.id,t.name)+'</td></tr>').join('')+
        '</tbody></table></div><div class="table-caption">Die Jahresfälle werden aus diesen Zeiträumen abgeleitet. Eine Änderung an einem Mietvertrag überschreibt abgeschlossene oder historische Jahresstände niemals still.</div></section>';
    }else{
      const groups=o.units.map((u,i)=>{
        const rows=o.meterRegistry.filter(m=>m.unitId===u.id);
        const active=rows.filter(m=>m.status==='active').length,
          placeholders=rows.filter(m=>m.status==='placeholder').length;
        const row=m=>{
          const where=[m.room,m.radiator].filter(Boolean).join(' · ')||'–';
          return '<tr><td><strong>'+safeText(estates.METER_TYPES[m.type])+'</strong>'+
            '<span class="water-unit-sub mono">'+safeText(m.id)+'</span></td>'+
            '<td class="mono">'+(m.number?safeText(m.number):
              '<span class="meter-not-set">Noch nicht hinterlegt</span>')+'</td>'+
            '<td>'+safeText(where)+'</td>'+
            '<td><span class="status '+(m.status==='active'?'green':'neutral')+'">'+
              safeText(estates.meterStatus[m.status])+'</span></td>'+
            '<td><div class="meter-actions">'+
              editAction('edit-master-meter',m.id,estates.METER_TYPES[m.type]+' '+(m.number||m.id))+
              '</div></td></tr>';
        };
        return '<details class="meter-unit"'+(i===0?' open':'')+'>'+
          '<summary class="meter-unit-head"><span class="meter-unit-title">'+
            icon('building')+'<strong>'+safeText(u.label)+'</strong>'+
            '<small>'+safeText(u.position)+'</small></span>'+
            '<span class="meter-unit-meta">'+rows.length+' Zähler · '+active+' aktiv'+
            (placeholders?' · '+placeholders+' Muster':'')+'</span>'+
            '<span class="meter-disclosure">'+icon('chevron')+'</span></summary>'+
          '<div class="meter-unit-body">'+
            '<div class="meter-unit-tools">'+button(icon('plus')+' Zähler für diese Wohnung',
              'new-master-meter',u.id,'button-quiet')+'</div>'+
            '<div class="table-wrap"><table class="data-table meter-table"><thead><tr>'+
            '<th>Zählertyp / ID</th><th>Zählernummer</th><th>Raum / Heizkörper</th>'+
            '<th>Status</th><th>Aktionen</th></tr></thead><tbody>'+
            rows.map(row).join('')+'</tbody></table></div></div></details>';
      }).join('');
      content=head('ZÄHLERSTAMMDATEN',o.name+' · Zähler',
        'Wasser-, Strom- und Techem-Zähler werden hier wohnungsweise erfasst und gepflegt. Jahresablesungen gehören ausschließlich in die Jahresabrechnung.',
        o.units.length?button(icon('plus')+' Zähler hinzufügen','new-master-meter',null,'button-primary'):'')+
        '<div class="meter-summary">'+
          '<span><strong>'+o.units.length+'</strong> Wohnungen</span>'+
          '<span><strong>'+o.meterRegistry.length+'</strong> Zählerdatensätze</span>'+
          '<span><strong>'+o.meterRegistry.filter(m=>m.status==='placeholder').length+
          '</strong> Musterplatzhalter</span></div>'+
        (groups||'<div class="empty"><h3>Noch keine Wohnungen</h3>'+
          '<p>Bitte zunächst unter Wohnungen eine Wohnung anlegen.</p></div>')+
        '<div class="info-line">Ein Zähler ist ein dauerhaftes Stammdatum. Bei Austausch wird der bisherige Datensatz außer Betrieb gesetzt; historische Abrechnungsjahre und Ablesungen bleiben unverändert. Techem- und Strom-Dummys enthalten keine echten Messwerte.</div>';
    }
    return content;
  }
  function analytics(){
    if(!data)return head('OBJEKTÜBERGREIFEND','Analysezentrum',
      'Objektübergreifende Auswertungen folgen in einer späteren Entwicklungsstufe.')+
      '<div class="info-line">Im aktuellen Objekt liegt noch kein Abrechnungsjahr vor. Keine Kennzahlen verfügbar.</div>';
    const choices=[['nk','Nebenkosten'],['finance','Finanzen'],['tax','Steuern']];let body='';
    if(ui.analytics==='nk'){let max=Math.max(...data.costs.map(c=>c.amount));body=`<div class="metric-row"><div class="metric"><span class="metric-label">Gesamtkosten 2025</span><div class="metric-number" style="font-size:23px">${fmt(allCost())}</div><span class="metric-helper">Musterwerte</span></div><div class="metric"><span class="metric-label">Kosten je m²</span><div class="metric-number">${euroNum(allCost()/data.units.reduce((s,u)=>s+u.area,0))} <small>€/m²</small></div><span class="metric-helper">Rein illustrative Kennzahl</span></div><div class="metric"><span class="metric-label">Wohnungsverbrauch</span><div class="metric-number">${int(unitConsumption())} <small>m³</small></div><span class="metric-helper">Vereinfachte Musterzähler</span></div></div>`+
      section('Kostenstruktur 2025',`<div class="section-body"><div class="bars">${data.costs.map(c=>`<div class="bar-row"><span>${safeText(c.name)}</span><div class="bar-rail"><div class="bar-fill" style="width:${Math.round(c.amount/max*100)}%"></div></div><span class="bar-value">${fmt(c.amount)}</span></div>`).join('')}</div><p class="footnote" style="margin-top:24px">Preis-/Verbrauchseffekte und Mehrjahresvergleiche werden erst gezeigt, wenn vergleichbare Vorjahresdaten nachweislich verfügbar sind.</p></div>`);
    }else if(ui.analytics==='finance'){body=`<div class="no-data-box"><strong>Cashflow derzeit nicht berechenbar</strong><p>Die Demo enthält Kosten und Vorauszahlungen, aber keine verifizierten tatsächlichen Miet- oder Lieferantenzahlungen. NK-Pro 2.0 wird Soll, Ist, Forderungen und Cashflow getrennt erfassen.</p></div>`+section('Finanzielle Überleitung (Beispiel)',`<div class="stat-inline"><div><small>Nebenkosten (Soll)</small><strong>${fmt(allCost())}</strong></div><div><small>Vorauszahlungen (Abrechnungswert)</small><strong>${fmt(allAdvance())}</strong></div><div><small>Tatsächliche Zahlungen</small><strong>–</strong></div></div><div class="table-caption">Keine fiktiven Zahlungseingänge oder Renditen.</div>`);
    }else{body=`<div class="no-data-box"><strong>Steuerliche Werte noch nicht klassifiziert</strong><p>Privatanteile, Steuerjahr, abzugsfähige Kosten und Belege müssen gesondert fachlich zugeordnet und bestätigt werden. Die Demo nimmt keine steuerlichen Einstufungen vor.</p></div>`+section('Steuerliche Überleitung',`<div class="stat-inline"><div><small>Unklassifizierte Kostenarten</small><strong>${data.costs.length}</strong></div><div><small>Bestätigtes Steuerjahr</small><strong>–</strong></div><div><small>Abzugsfähige Beträge</small><strong>–</strong></div></div><div class="table-caption">Kein Ersatz für steuerliche Prüfung.</div>`);}
    return head('OBJEKTÜBERGREIFEND','Analysezentrum',
      'Zentraler Zugang für Analysen sämtlicher Immobilien und Jahre. Eine gemeinsame Auswertung folgt in einer späteren Entwicklungsstufe.')+
      '<div class="info-line">Fachtest: Angezeigte Musterkennzahlen stammen derzeit nur aus '+safeText(master().name)+' / '+safeText(activeYear())+'. Keine objektübergreifende Aggregation.</div>'+
      `<div class="analytic-switch" role="tablist" aria-label="Analyseperspektive">${choices.map(([id,label])=>`<button type="button" role="tab" aria-selected="${ui.analytics===id}" class="${ui.analytics===id?'selected':''}" data-analytics="${id}">${label}</button>`).join('')}</div>`+body;
  }
  function documents(){if(!data)return head('OBJEKTÜBERGREIFEND','Dokumente & Archiv',
      'Zentrale Ablage für sämtliche Immobilien und Jahre – noch im Aufbau.')+
      '<div class="empty"><h3>Noch keine Dokumente verfügbar</h3><p>Für das aktuelle Objekt wurden noch keine Musterabrechnungen angelegt.</p></div>';
    return head('OBJEKTÜBERGREIFEND','Dokumente & Archiv',
      'Zentraler Zugang für Unterlagen sämtlicher Immobilien und Jahre. Der übergreifende Dokumentenindex ist noch nicht umgesetzt.')+
    '<div class="info-line">Aktuelle Musteransicht: '+safeText(master().name)+' / '+safeText(activeYear())+'. Keine produktiv freigegebenen Dokumente.</div>'+
    `<section class="section"><div class="section-header"><div><h2>Dokumente · ${safeText(master().name)} · ${safeText(activeYear())}</h2><p>Erstellte Dokumente werden erst nach der fachlichen Freigabe verbindlich.</p></div></div><div class="task-row"><div class="task-icon">${icon('file')}</div><div class="task-copy"><strong>Musterbrief · Wohnung A</strong><span>Vorschau · synthetische Beträge · nicht versandfertig</span></div><button class="link" type="button" data-action="go-letter">Vorschau →</button></div><div class="task-row"><div class="task-icon">${icon('layers')}</div><div class="task-copy"><strong>Prüf- und Abschlussprotokoll</strong><span>Erst nach Fachfreigabe des vollständigen Systems verfügbar</span></div><button class="link" type="button" data-action="go-review">Prüfstatus →</button></div></section>`+
    `<section class="section"><div class="section-header"><div><h2>Archiv</h2></div><span class="status neutral">Leer</span></div><div class="empty"><div class="empty-icon">${icon('folder')}</div><h3>Keine fachlich archivierten Abrechnungen</h3><p>Das echte Archiv wird später vollständig separat und schreibgeschützt migriert. Die bisherige NK-Pro-App bleibt unverändert.</p></div></section>`;}
  const objectTitles={overview:'Objektdaten',units:'Wohnungen',tenancies:'Mietverhältnisse',meters:'Zähler'};
  function render(){
    document.querySelectorAll('.nav-item').forEach(el=>{
      const active=el.dataset.view===ui.view;
      el.classList.toggle('active',active);
      if(active)el.setAttribute('aria-current','page');else el.removeAttribute('aria-current');
    });
    let path='Startseite';
    if(ui.view==='analytics')path='Objektübergreifend / Analysen';
    else if(ui.view==='documents')path='Objektübergreifend / Dokumente & Archiv';
    else if(ui.view==='object')path='Startseite / '+master().name+' / Stammdaten / '+
      (objectTitles[ui.objectTab]||'Objektdaten');
    else if(ui.view==='billing')path='Startseite / '+master().name+
      ' / Jahresabrechnungen'+(ui.billingHome?'':' / '+activeYear());
    $('breadcrumbView').textContent=path;
    renderTree();
    const target=$('appMain');
    target.innerHTML=({overview,billing,object,analytics,documents}[ui.view]||overview)();
    target.querySelectorAll('[data-icon]').forEach(n=>n.innerHTML=icon(n.dataset.icon));
    if(ui.view==='billing'&&!ui.billingHome&&annualLocked()){
      const forbidden=new Set(['new-cost','toggle-cost','delete-unused-cost','edit-cost','edit-water',
       'edit-house','edit-payment','edit-external','edit-case-water','edit-other-consumption',
       'add-interim','replace-meter','edit-letter-settings','edit-water-price','check-water',
       'check-heat','edit-advance','edit-unit','new-tenancy','edit-tenancy']);
      target.querySelectorAll('[data-action]').forEach(el=>{
        if(forbidden.has(el.dataset.action)){el.disabled=true;el.title='Historischer Musterstand – nur Ansicht';}
      });
    }
  }
  function navigate(view,step){
    ui.view=view;
    if(view==='overview'||view==='analytics'||view==='documents')ui.treeOpenObjectId=null;
    if(view==='billing'&&!step){ui.billingHome=true;ui.objectListFilter=master()?.id||null;ui.treeOpenObjectId=master()?.id||null;}
    if(step){ui.step=step;ui.billingHome=false;ui.treeOpenObjectId=master().id;ui.treeSections.years=true;}
    ui.filter='';render();
    window.scrollTo({top:0,behavior:'instant'});
    document.body.classList.remove('menu-open');
  }
  function toast(message){const el=$('toast');el.textContent=message;el.hidden=false;clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.hidden=true,3200)}
  function closeDrawer(){ui.drawer=null;$('drawer').hidden=true;$('overlay').hidden=true;document.body.style.overflow='';if(ui.lastFocus&&ui.lastFocus.isConnected)ui.lastFocus.focus()}
  // Cents-exact synthetic reference trace; complete production domain engine remains out of scope.
  function demoBreakdown(unitId) {
    const l = ledger(), row = l.units.find(x=>x.id===unitId);
    if (!row) return '';
    const costRows = l.costs.map(c=>{
      const related=c.rows.filter(x=>x.unitId===unitId),unitPart=related[0];
      const weight = unitPart ? unitPart.weight : 0;
      const base = unitPart ? unitPart.totalWeight : 0;
      const detail = c.method==='Fläche'||c.method==='Wohnfläche' ? 'Fläche × Miettage' : c.method==='Personen' ? 'Personentage' : c.method==='Miettage' ? 'Miettage' : c.method==='Verbrauch' ? 'Verbrauch / Hauswert' : 'Wohneinheiten';
      return '<tr><td><strong>'+safeText(c.name)+'</strong><div class="small soft">'+safeText(detail)+' '+int(weight===null?0:weight)+' / '+int(base)+'</div></td><td class="money">'+fmt(c.eligibleCents/100)+'</td><td class="money">'+fmt(related.reduce((s,x)=>s+x.cents,0)/100)+'</td></tr>';
    }).join('');
    return '<div class="drawer-breakdown"><div class="eyebrow">Kostenpositionen · Muster-Nachweis</div><div class="drawer-table-scroll"><table class="data-table"><thead><tr><th>Position</th><th class="money">Umlagefähig</th><th class="money">Wohnungsanteil</th></tr></thead><tbody>'+costRows+'</tbody></table></div><div class="drawer-note">Getestete Referenzformeln, Centverteilung mit Restcents. Nicht zugeordnete Beträge bleiben offen. Keine produktive Umlageabrechnung.</div></div>';
  }
  function openDrawer(type,id){
    if((type==='new-master-tenancy'||type==='new-master-meter')&&!master().units.length)return toast('Bitte zuerst eine Wohnung anlegen.');
    const d={type,id};ui.drawer=d;ui.lastFocus=document.activeElement;let title='',eyebrow='',body='',actionLabel='Änderungen speichern';
    if(type==='new-object'){
      title='Neue Immobilie';eyebrow='OBJEKTSTAMM · NUR FIKTIVE DATEN';
      body='<form id="editForm" data-type="new-object">'+
        '<div class="form-row"><label>Objektbezeichnung<input name="name" required maxlength="90" placeholder="Musterobjekt D"></label></div>'+
        '<div class="form-row"><label>Straße und Hausnummer<input name="street" required maxlength="120" placeholder="Musterweg 4"></label></div>'+
        '<div class="water-form-grid"><div class="form-row"><label>PLZ<input name="postalCode" required maxlength="12" placeholder="00004"></label></div>'+
        '<div class="form-row"><label>Ort<input name="city" required maxlength="80" placeholder="Musterstadt"></label></div></div>'+
        '<div class="drawer-note">Die neue Immobilie erhält eine dauerhafte, eindeutige ID. Wohnungen, Verträge und Abrechnungsjahre werden anschließend im Objekt angelegt. Hier keine echten personenbezogenen Daten verwenden.</div></form>';
      actionLabel='Objekt anlegen';
    }else if(type==='new-master-unit'){
      title='Wohnung hinzufügen';eyebrow='DAUERHAFTE STAMMDATEN · '+safeText(master().name);
      body='<form id="editForm" data-type="new-master-unit">'+
        '<div class="form-row"><label>Wohnungsbezeichnung<input name="label" required maxlength="70" placeholder="Wohnung 1"></label></div>'+
        '<div class="form-row"><label>Lage / Geschoss<input name="position" required maxlength="100" placeholder="EG links"></label></div>'+
        '<div class="form-row"><label>Wohnfläche (m²)<input name="area" required type="number" min="0.01" max="1000000" step="0.01"></label></div>'+
        '<div class="drawer-note">Eine stabile Wohnungs-ID sowie fiktive KW-/WW-Zählerkennungen werden vergeben. Es entsteht keine Jahresabrechnung.</div></form>';
      actionLabel='Wohnung anlegen';
    }else if(type==='new-year'){
      title='Jahresabrechnung anlegen';eyebrow='JAHR · '+safeText(master().name);
      body='<form id="editForm" data-type="new-year">'+
        '<div class="form-row"><label>Abrechnungsjahr<input name="year" type="number" required min="2000" max="2100" step="1" value="2025"></label></div>'+
        '<div class="drawer-note">Ausschließlich synthetischer Jahresentwurf. Vorher sind Wohnungen und zeitlich gültige Mietverhältnisse erforderlich. Bereits vorhandene Jahresstände werden nie überschrieben.</div></form>';
      actionLabel='Musterjahr anlegen';
    }else if(type.startsWith('master-')||type==='new-master-tenancy'||type==='new-master-meter'){
      const result=masterUi.form(type,master(),id);
      if(!result)return toast('Stammdatensatz nicht gefunden.');
      title=result.title;eyebrow=result.eyebrow;body=result.body;
      ui.draftMasterTenancy=result.draft;
    }else     if(type==='property'){
      const p=data.property||{};
      title='Objektdaten';eyebrow='SYNTHETISCHER OBJEKTSTAMM';
      body='<form id="editForm" data-type="property">'+
        '<div class="form-row"><label>Objektname<input name="propertyName" maxlength="100" required value="'+safeText(p.name||'Musterobjekt')+'"></label></div>'+
        '<div class="form-row"><label>Straße (nur Musteradresse)<input name="propertyStreet" maxlength="120" value="'+safeText(p.street||'')+'"></label></div>'+
        '<div class="water-form-grid"><div class="form-row"><label>PLZ<input name="propertyPostalCode" maxlength="12" value="'+safeText(p.postalCode||'')+'"></label></div>'+
        '<div class="form-row"><label>Ort<input name="propertyCity" maxlength="100" value="'+safeText(p.city||'')+'"></label></div></div>'+
        '<div class="form-row"><label>Notiz<textarea name="propertyNote" maxlength="2000" rows="4">'+safeText(p.note||'')+'</textarea></label></div>'+
        '<div class="drawer-note">Objekt-ID '+safeText(p.id||'SYN-OBJ-01')+
        ', Gebäude-ID '+safeText(p.buildingId||'SYN-G01')+
        '. IDs bleiben stabil; bitte hier keine reale Adresse eingeben.</div></form>';
    }else if(type==='tenancy'||type==='new-tenancy'){
      const existing=data.tenancies.find(t=>t.id===id);
      const t=type==='new-tenancy'?{id:'SYN-T'+Date.now().toString(36).toUpperCase(),unitId:data.units[0]?.id,
       name:'Neue Musterperson',start:'2025-01-01',end:'2025-12-31',persons:1,role:'Mieter',
       advance:0,consumptionCold:null,consumptionHot:null,note:''}:existing;
      if(!t)return;
      ui.draftTenancyId=t.id;
      title=type==='new-tenancy'?'Muster-Mietverhältnis hinzufügen':t.name;
      eyebrow='ABRECHNUNGSFALL · 2025';
      const opts=(values,selected)=>values.map(([value,label])=>'<option value="'+safeText(value)+'" '+(value===selected?'selected':'')+'>'+safeText(label)+'</option>').join('');
      body='<form id="editForm" data-type="'+type+'">'+
        '<div class="water-form-grid"><div class="form-row"><label>Vorname<input name="firstName" maxlength="80" value="'+safeText(t.firstName||'')+'"></label></div>'+
        '<div class="form-row"><label>Nachname<input name="lastName" maxlength="80" required value="'+safeText(t.lastName||'')+'"></label></div></div>'+
        '<div class="form-row"><label>Briefanrede<select name="salutation">'+opts([['neutral','Neutral'],['Herr','Herr'],['Frau','Frau'],['individuell','Individuell']],t.salutation||'neutral')+'</select></label></div>'+
        '<div class="form-row"><label>Individuelle Anrede<input name="customSalutation" maxlength="160" value="'+safeText(t.customSalutation||'')+'"></label></div>'+
        '<details class="cost-exceptions"><summary>Briefanschrift</summary>'+
        '<div class="form-row"><label>Straße (nur Muster)<input name="recipientStreet" maxlength="120" value="'+safeText(t.recipientStreet||'')+'"></label></div>'+
        '<div class="water-form-grid"><div class="form-row"><label>PLZ<input name="recipientPostalCode" maxlength="12" value="'+safeText(t.recipientPostalCode||'')+'"></label></div>'+
        '<div class="form-row"><label>Ort<input name="recipientCity" maxlength="80" value="'+safeText(t.recipientCity||'')+'"></label></div></div></details>'+
        '<div class="form-row"><label>Wohnung<select name="unitId">'+
          opts(data.units.map(u=>[u.id,u.label+' · '+u.id]),t.unitId)+'</select></label></div>'+
        '<div class="form-row"><label>Nutzungsart<select name="role">'+
          opts([['Mieter','Mieter'],['Privatanteil','Privatanteil'],['Eigennutzung','Eigennutzung']],t.role)+'</select></label></div>'+
        '<div class="water-form-grid">'+
          '<div class="form-row"><label>Einzug / Beginn<input type="date" name="start" value="'+safeText(t.start)+'" required></label></div>'+
          '<div class="form-row"><label>Auszug / Ende<input type="date" name="end" value="'+safeText(t.end)+'" required></label></div>'+
          '<div class="form-row"><label>Personen<input type="number" name="persons" min="0" max="1000" step="1" value="'+safeText(t.persons)+'" required></label></div>'+
          '<div class="form-row"><label>Vorauszahlung (nur Anzeige)<input readonly value="'+safeText(data.payments?.[t.id]?.paidActual??t.advance)+' € – unter Vorauszahlungen ändern"></label></div></div>'+
        '<div class="form-row"><label>Notizen<textarea name="tenantNote" maxlength="2000" rows="3">'+safeText(t.note||'')+'</textarea></label></div>'+
        '<div class="drawer-note">Nur fiktive Musterpersonen erfassen – keine echten Mieterdaten. Überlappungen oder fehlende Verbrauchsaufteilungen verhindern die Musterabrechnung.</div></form>';
    }else if(type==='letter-settings'){
      const x=data.letterSettings||{};
      title='Briefvorlage · Muster';eyebrow='DOKUMENTE · EINSTELLUNGEN';
      const field=(label,name,value,type='text')=>
        '<div class="form-row"><label>'+label+'<input name="'+name+'" type="'+type+'" maxlength="500" value="'+safeText(value||'')+'"></label></div>';
      const txt=(label,name,value)=>
        '<div class="form-row"><label>'+label+'<textarea name="'+name+'" rows="4" maxlength="4000">'+safeText(value||'')+'</textarea></label></div>';
      body='<form id="editForm" data-type="letter-settings">'+
        field('Absendername','senderName',x.senderName)+
        field('Absenderstraße','senderStreet',x.senderStreet)+
        field('Absenderort','senderCity',x.senderCity)+
        '<div class="water-form-grid">'+field('Briefdatum','letterDate',x.letterDate,'date')+
        field('Zahlungsziel','paymentDue',x.paymentDue,'date')+'</div>'+
        field('Bankverbindung','bankAccount',x.bankAccount)+
        field('Betreff','subject',x.subject||'Nebenkostenabrechnung 2025')+
        txt('Einleitungstext ({zeitraum} als Variable)','openingText',x.openingText)+
        txt('Abschlusstext','closingText',x.closingText)+
        txt('Zusatztext Nachzahlung','paymentText',x.paymentText)+
        txt('Hinweis bei Guthaben','creditText',x.creditText)+
        txt('Anlagenhinweis / Techem','annexText',x.annexText)+
        field('Grußformel','greeting',x.greeting||'Mit freundlichen Grüßen')+
        field('Unterschrift / Signatur','signature',x.signature)+
        '<div class="drawer-note">Nur synthetische Mustertexte. Die umfangreichen Original-Briefeinstellungen, A4-Druckprüfung und Originalparität werden weiter portiert; diese Felder stellen noch keine Versandfreigabe dar.</div></form>';

      const t=data.tenancies.find(x=>x.id===id);if(!t)return;
      const p=data.payments?.[id]||{},mode=p.mode||'annual';
      title='Vorauszahlungen · '+t.name;eyebrow='ZAHLUNGEN · 2025';
      body='<form id="editForm" data-type="payment">'+
        '<div class="drawer-note">'+safeText(t.name)+' · '+safeText(data.units.find(u=>u.id===t.unitId)?.label||t.unitId)+
        ' · '+safeText(t.start)+' bis '+safeText(t.end)+' (nicht editierbar)</div>'+
        '<div class="form-row"><label>Vereinbarte Vorauszahlung<select name="mode"><option value="monthly" '+(mode==='monthly'?'selected':'')+'>Monatsbetrag</option><option value="annual" '+(mode==='annual'?'selected':'')+'>Jahresbetrag</option></select></label></div>'+
        '<div class="form-row"><label>Vereinbarter Betrag (€)<input name="agreed" type="number" step="0.01" min="0" required value="'+safeText(mode==='monthly'?p.agreedMonthly??'':p.agreedAnnual??'')+'"></label><p class="form-help">Der Sollbetrag wird bei Monatsangaben für den Mietzeitraum berechnet.</p></div>'+
        '<div class="form-row"><label>Tatsächlich gezahlt im Jahr (€)<input name="paid" type="number" min="0" step="0.01" required value="'+safeText(p.paidActual??t.advance)+'"></label></div>'+
        '<div class="drawer-note">Nur Zahlungsbeträge editieren. Die Stammdaten stammen ausschließlich aus Mietverhältnisse.</div></form>';
    }else if(type==='payment'){
      const t=data.tenancies.find(x=>x.id===id);if(!t)return;
      const p=data.payments?.[id]||{},mode=p.mode||'annual',
        actualMode=p.paidMode||'annual',
        unit=data.units.find(x=>x.id===t.unitId)?.label||t.unitId,
        agreement=workflow.agreementPreview(t,p);
      title='Vorauszahlungen · '+t.name;eyebrow='ZAHLUNGEN · '+activeYear();
      body='<form id="editForm" data-type="payment" data-payment-case="'+safeText(t.id)+
       '" data-previous-mode="'+mode+'">'+
       '<div class="drawer-note">Abrechnungsfall: '+safeText(t.name)+' · '+safeText(unit)+
       ' · '+safeText(t.start)+' bis '+safeText(t.end)+
       '. Mietverhältnis und Zeitraum sind ausschließlich im Stammdatenbereich bearbeitbar.</div>'+
       '<h3 class="payment-title">Vereinbarte Vorauszahlung (Soll)</h3>'+
       '<div class="water-form-grid"><div class="form-row"><label>Vereinbarung gilt pro'+
       '<select name="mode"><option value="monthly" '+(mode==='monthly'?'selected':'')+
       '>Monat</option><option value="annual" '+(mode==='annual'?'selected':'')+
       '>Jahr</option></select></label></div>'+
       '<div class="form-row"><label>Vereinbarter Betrag (€)<input name="agreed" type="number" min="0" step="0.01" required value="'+
        safeText(mode==='monthly'?p.agreedMonthly??'':p.agreedAnnual??'')+'"></label></div></div>'+
       '<div id="paymentPreview" class="payment-preview" aria-live="polite">'+
       '<div><small>Pro Woche (vergleichbar)</small><strong>'+(!agreement.valid?'–':fmt(agreement.weekly))+'</strong></div>'+
       '<div><small>Pro Monat (vergleichbar)</small><strong>'+(!agreement.valid?'–':fmt(agreement.monthly))+'</strong></div>'+
       '<div><small>Pro Jahr (vergleichbar)</small><strong>'+(!agreement.valid?'–':fmt(agreement.annual))+'</strong></div>'+
       '<div><small>Soll im Mietzeitraum</small><strong>'+(!agreement.valid?'–':fmt(agreement.expected))+'</strong></div></div>'+
       '<p class="form-help">Monatswerte werden für angefangene Monate tagesgenau anteilig gerechnet. Neu eingegebene Jahresvereinbarungen werden für das betreffende Kalenderjahr tagesanteilig berechnet. Historisch gespeicherte Beträge bleiben unverändert, bis sie aktiv bearbeitet werden.</p>'+
       '<h3 class="payment-title">Tatsächlich geleistete Zahlungen (Ist)</h3>'+
       '<div class="form-row"><label>Erfassung der tatsächlich gebuchten Zahlungseingänge'+
       '<select name="paidMode"><option value="annual" '+(actualMode!=='monthly'?'selected':'')+
       '>Gesamtbetrag tatsächlich eingegangen</option><option value="monthly" '+
         (actualMode==='monthly'?'selected':'')+'>Gleiche Monatszahlungen mit gebuchter Anzahl</option>'+
       '</select></label></div>'+
       '<div class="form-row" data-paid-annual '+(actualMode==='monthly'?'hidden':'')+
       '><label>Summe der tatsächlich eingegangenen Zahlungen (€)'+
       '<input name="paid" type="number" min="0" step="0.01" value="'+
         safeText(p.paidActual??t.advance)+'"></label></div>'+
       '<div class="water-form-grid" data-paid-monthly '+(actualMode==='monthly'?'':'hidden')+'>'+
       '<div class="form-row"><label>Betrag je tatsächlich gebuchter Zahlung (€)'+
       '<input name="paidMonthly" type="number" min="0" step="0.01" value="'+
         safeText(p.paidMonthly??'')+'"></label></div>'+
       '<div class="form-row"><label>Anzahl tatsächlich gebuchter Monatszahlungen'+
       '<input name="paidMonths" type="number" min="0" max="12" step="1" value="'+
         safeText(p.paidMonths??'')+'"></label></div></div>'+
       '<div class="payment-actual-total">Tatsächlich gezahlt im Abrechnungszeitraum: <strong id="paidPreview">'+
         fmt(p.paidActual??t.advance)+'</strong></div>'+
       '<div class="drawer-note">Soll ist eine Berechnung aus der Vereinbarung. Ist wird ausschließlich aus tatsächlich erfassten Zahlungseingängen übernommen; keine Zahlung wird allein aufgrund des Mietvertrags als geleistet unterstellt.</div></form>';
    }else if(type==='cost'||type==='new-cost'||type==='cost-view'){
      const viewing=type==='cost-view';
      const c=type==='new-cost'?{name:'',amount:'',landlordShare:0,category:'Betriebskosten',method:'Fläche'}:data.costs.find(x=>x.id===id);if(!c)return;
      const costBasisFields='<div class="drawer-note">Einzelverbräuche und Techem-Einzelwerte werden ausschließlich unter Verbräuche gepflegt.</div>';
      const costAllocationFields='<details class="cost-exceptions"><summary>Zuordnung und Ausnahmen</summary>'+
        '<div class="form-row"><label>Bei ausgeschlossenen Fällen<select name="exclusionMode">'+
          '<option value="full" '+(c.exclusionMode!=='owner'?'selected':'')+'>Auf berechtigte Teilnehmer verteilen</option>'+
          '<option value="owner" '+(c.exclusionMode==='owner'?'selected':'')+'>Anteil nicht berechtigter Fälle ausweisen</option></select></label></div>'+
        data.tenancies.map(t=>'<label class="case-checkbox"><input type="checkbox" data-case-include="'+safeText(t.id)+'" '+
          (!(c.excludedTenantIds||[]).includes(t.id)?'checked':'')+'> '+safeText(t.name)+' · '+
          safeText(data.units.find(u=>u.id===t.unitId)?.label||t.unitId)+' ('+
          safeText(t.id)+') einbeziehen</label>').join('')+
        '<p class="form-help">Standard: alle Abrechnungsfälle sind einbezogen. Deaktivierte Häkchen bedeuten einen ausdrücklich gespeicherten Ausschluss. Privatanteile sind standardmäßig gleichberechtigt.</p></details>';
      title=type==='new-cost'?'Kostenart hinzufügen':c.name;eyebrow='GESAMTKOSTEN';body=`<form id="editForm" data-type="${type}" data-cost-id="${safeText(c.id||'')}"><div class="form-row"><label for="d-catalog">Kostenartenkatalog NK-Pro 1.0</label><select name="sourceId" id="d-catalog"><option value="">Eigene Kostenart</option>${workflow.catalog.filter(x=>!x.placeholder).map(x=>'<option value="'+safeText(x.id)+'" '+(costCatalogId(c)===x.id?'selected':'')+'>'+safeText(x.id)+' · '+safeText(x.name)+'</option>').join('')}</select><p class="form-help">Original-Kostenkennungen als Auswahl, eigene Kostenarten bleiben möglich. Die Umlagefähigkeit ist pro Fall zu prüfen.</p></div><div class="form-row"><label for="d-name">Kostenart</label><input id="d-name" name="name" required maxlength="60" value="${safeText(c.name)}"></div><details class="cost-exceptions" open><summary>Rechnung & Beleg</summary><div class="form-row"><label>Rechnungsdatum<input name="invoiceDate" type="date" value="${safeText(c.invoiceDate||'')}"></label></div><div class="form-row"><label>Belegdatum<input name="documentDate" type="date" value="${safeText(c.documentDate||'')}"></label></div><div class="form-row"><label>Rechnungsnummer<input name="invoiceNumber" maxlength="100" value="${safeText(c.invoiceNumber||'')}"></label></div><div class="form-row"><label>Rechnungsaussteller<input name="issuer" maxlength="150" value="${safeText(c.issuer||'')}"></label></div><div class="form-row"><label>Belegverweis<input name="invoiceReference" maxlength="150" value="${safeText(c.invoiceReference||'')}"></label></div></details><div class="form-row"><label for="d-amount">Gesamtbetrag (€)</label><input id="d-amount" name="amount" type="number" required step="0.01" min="0.01" value="${c.amount}"></div><div class="form-row"><label for="d-landlord">Belegter nicht umlagefähiger Rechnungsanteil (€)</label><input id="d-landlord" name="landlordShare" type="number" step="0.01" min="0" value="${c.landlordShare??0}"><p class="form-help">Nur explizit auf dem Beleg ausgewiesene Eigentümerkosten hier erfassen. Leerstand und ungeklärte Differenzen werden separat berechnet.</p></div><div class="form-row"><label for="d-method">Umlageschlüssel · synthetischer Fachtest</label><select id="d-method" name="method">${functionalBilling.METHODS.filter(m=>m!=='Wohnfläche').concat(['Externe Einzelabrechnung']).map(m=>'<option value="'+safeText(m)+'" '+(c.method===m?'selected':'')+'>'+safeText(m==='Fläche'?'Wohnfläche':m)+'</option>').join('')}</select><p class="form-help">Sechs portierte Originalverfahren. Berechnung nach individuellen Mietverhältnissen und Zeiträumen; weiterhin nur synthetische Daten.</p></div><div class="form-row" data-price-group ${c.method==='Verbrauch'?'':'hidden'}><label for="d-price-mode">Preis je Verbrauchseinheit</label><select id="d-price-mode" name="priceMode"><option value="auto" ${c.priceMode!=='manual'?'selected':''}>Automatisch aus umlagefähigen Kosten / Rechnungsmenge</option><option value="manual" ${c.priceMode==='manual'?'selected':''}>Manuelle Preisvorgabe</option></select><p class="form-help">Bei Wasser gilt €/m³. Der automatische Preis wird mit vier Nachkommastellen angezeigt.</p></div><div class="form-row" data-consumption-context ${c.method==='Verbrauch'?'':'hidden'}><label for="d-invoice-quantity">Verbrauch laut Rechnung (${safeText(c.consumptionUnit||'m³')})</label><input id="d-invoice-quantity" name="invoiceConsumption" type="number" step="0.001" min="0.001" value="${safeText(c.id==='water'?data.houseWater:c.consumptionTotal??'')}"><p class="form-help">Bei Wasser ist dies der Original-Rechnungsverbrauch, unabhängig vom Hauszählerstand. Ohne Rechnungsmenge ist kein automatischer Einheitspreis möglich.</p><div class="cost-price-preview">Berechneter Preis: <strong id="costPricePreview">${c.method==='Verbrauch'&&waterDetails.priceFor(c,costQuantity(c)).valid?fmtPrice(waterDetails.priceFor(c,costQuantity(c)).effective,c.consumptionUnit||'m³'):'–'}</strong></div></div>${costBasisFields}${costAllocationFields}<div class="form-row" data-manual-price ${c.method==='Verbrauch'&&c.priceMode==='manual'?'':'hidden'}><label for="d-unit-price">Manueller Preis je Einheit (€)</label><input id="d-unit-price" name="unitPrice" type="number" step="0.0001" min="0.0001" max="100000" value="${safeText(c.unitPrice??'')}"><p class="form-help">Abweichende Einheitspreise können nicht zugeordnete Restkosten ergeben; diese bleiben prüfpflichtig.</p></div><div class="form-row"><label for="d-cost-note">Notiz / Bemerkung (optional)</label><textarea id="d-cost-note" name="note" rows="5" maxlength="2000" placeholder="Belegnummer, Hinweise oder interne Erläuterungen …">${safeText(c.note||'')}</textarea><p class="form-help">Interne Notiz, nicht automatisch Teil der Mieterbriefe.</p></div><div class="drawer-note">Veränderte Musterwerte werden nur im isolierten Demo-Speicher abgelegt. Es erfolgt kein Zugriff auf die bestehende NK-Pro-App.</div></form>`;
    } else if(type==='water'||type==='advance'||type==='unit'){
      const u=data.units.find(x=>x.id===id);if(!u)return;title=u.label;eyebrow=type==='water'?'VERBRAUCHSDATEN':type==='advance'?'VORAUSZAHLUNGEN':'WOHNUNGSSTAMM';
      if(type==='water'){
        const meterGroup=key=>{
          const meter=u.waterMeters?.[key]||{},label=key==='cold'?'Kaltwasser (KW)':'Warmwasser (WW)';
          const segments=Array.isArray(meter.segments)?meter.segments:[];
          const readOnly=segments.length>1;
          return '<fieldset class="water-fieldset"><legend>'+label+'</legend>'+
            '<div class="form-row"><label>Zählernummer (Stammdatum)<input name="'+key+'Number" maxlength="60" readonly value="'+safeText(meter.number||'')+'"></label></div>'+
            '<div class="water-form-grid">'+
            '<div class="form-row"><label>Anfangsstand (m³)<input name="'+key+'Start" type="number" min="0" step="0.001" '+(readOnly?'readonly ':'')+'value="'+safeText(meter.start??'')+'"></label></div>'+
            '<div class="form-row"><label>Endstand (m³)<input name="'+key+'End" type="number" min="0" step="0.001" '+(readOnly?'readonly ':'')+'value="'+safeText(meter.end??'')+'"></label></div>'+
            '<div class="form-row"><label>Ablesedatum Beginn<input name="'+key+'StartDate" type="date" '+(readOnly?'readonly ':'')+'value="'+safeText(meter.startDate||'')+'"></label></div>'+
            '<div class="form-row"><label>Ablesedatum Ende<input name="'+key+'EndDate" type="date" '+(readOnly?'readonly ':'')+'value="'+safeText(meter.endDate||'')+'"></label></div></div>'+
            (readOnly?'<p class="form-help">'+segments.length+' Messperioden · Einzelwerte sind nach einem Wechsel gesperrt. Neuer Wechsel über eigenen Dialog.</p>'+
              '<div class="meter-history">'+segments.map(s=>'<div><strong>'+safeText(s.number||s.id)+'</strong><span>'+safeText(s.startDate)+' bis '+safeText(s.endDate)+'</span><span>'+fmtVolume(s.start)+' → '+fmtVolume(s.end)+' m³</span></div>').join('')+'</div>':'')+
            '<div class="water-actions" style="padding:8px 0">'+button('Zählerwechsel dokumentieren','replace-meter',u.id+'|'+key,'button-quiet')+'</div></fieldset>';
        };
        body='<form id="editForm" data-type="water">'+meterGroup('cold')+meterGroup('hot')+
          '<fieldset class="water-fieldset"><legend>Verbrauch und Leerstand · automatische Berechnung</legend>'+
          '<div id="water-live-sum" class="drawer-note">KW/WW-Verbrauch wird aus den Zählerständen berechnet.</div>'+
          '<p class="form-help">Leerstandstage entstehen aus Mietverhältnissen. Leerstandsverbrauch entsteht nur aus dokumentierten Zwischenablesungen an den Zeitgrenzen – kein frei veränderlicher Pauschalwert.</p>'+
          '<div class="water-actions">'+button('KW-Zwischenablesung','add-interim',u.id+'|cold','button-quiet')+
          button('WW-Zwischenablesung','add-interim',u.id+'|hot','button-quiet')+'</div>'+
          '<div class="meter-history">'+['cold','hot'].map(key=>(u.waterMeters?.[key]?.interimReadings||[]).map(x=>
           '<div><strong>'+safeText(key==='cold'?'KW':'WW')+'</strong><span>'+safeText(x.date)+'</span><span>'+fmtVolume(x.value)+' m³</span></div>').join('')).join('')+'</div>'+
          '<div class="drawer-note">Leerstand laut Ablesungen: '+
            (waterReport().vacancyByUnit?.[u.id]?.valid?
               fmtVolume(waterReport().vacancyByUnit[u.id].cold)+' m³ KW / '+
               fmtVolume(waterReport().vacancyByUnit[u.id].hot)+' m³ WW':'Für den Zeitraum nicht vollständig messbar')+
          '</div></fieldset>'+
          '<div class="form-row"><label>Notiz zu den Zählerständen (optional)<textarea name="waterNote" maxlength="2000" rows="4">'+safeText(u.waterNote||'')+'</textarea></label></div>'+
          '<div class="drawer-note">KW und WW mit Originalwerten und Messperioden. Zeitliche Leerstände benötigen dokumentierte KW-/WW-Anteile. Historische Vorjahresübernahme ist nur als kontrollierte Prüfvorschau vorbereitet.</div></form>';
      }
      else if(type==='advance')body=`<form id="editForm" data-type="advance"><div class="form-row"><label for="d-advance">Jahresvorauszahlung (€)</label><input id="d-advance" name="advance" type="number" step="0.01" min="0" value="${u.advance}" required></div><div class="drawer-note">Musterjahreswert. Keine tatsächlichen Zahlungseingänge hinterlegt.</div></form>`;
      else body=`<form id="editForm" data-type="unit"><div class="form-row"><label for="d-label">Wohnungsbezeichnung</label><input id="d-label" name="label" required value="${safeText(u.label)}"></div><div class="form-row"><label for="d-position">Lage</label><input id="d-position" name="position" required value="${safeText(u.position)}"></div><div class="form-row"><label for="d-area">Wohnfläche (m²)</label><input id="d-area" name="area" type="number" min="1" step="0.01" required value="${u.area}"></div><div class="form-row"><label><input name="active" type="checkbox" style="width:auto;margin-right:8px" ${u.active!==false?'checked':''}>Aktive Musterwohnung</label></div><div class="drawer-note">Wohnfläche und Status gelten dauerhaft. Personen und Miettage werden aus den einzelnen Mietverhältnissen ermittelt; bitte dort bearbeiten.</div></form>`;
    }else if(type==='case-water'){
      const t=data.tenancies.find(x=>x.id===id);if(!t)return;
      title='Verbrauch · '+t.name;eyebrow='METER-FALLZUORDNUNG · 2025';
      body='<form id="editForm" data-type="case-water">'+
        '<div class="drawer-note">Abrechnungsfall: '+safeText(t.name)+' · '+safeText(data.units.find(u=>u.id===t.unitId)?.label||t.unitId)+
         ' · '+safeText(t.start)+' bis '+safeText(t.end)+'. Mieter- und Zeitraumdaten sind nur lesend.</div>'+
        '<div class="water-form-grid">'+
        '<div class="form-row"><label>Kaltwasser-Verbrauch (m³)<input name="caseCold" type="number" min="0" step="0.001" value="'+safeText(t.consumptionCold??'')+'"></label></div>'+
        '<div class="form-row"><label>Warmwasser-Verbrauch (m³)<input name="caseHot" type="number" min="0" step="0.001" value="'+safeText(t.consumptionHot??'')+'"></label></div></div>'+
        '<div class="drawer-note">Die Summe der Einzelfälle und belegten Leerstandsmengen muss je KW/WW zum Wohnungszähler passen. Fehlende Werte sind nicht null.</div></form>';
    }else if(type==='external'){
      const sep=String(id).indexOf('|'),costId=String(id).slice(0,sep),caseId=String(id).slice(sep+1);
      const c=data.costs.find(x=>x.id===costId),t=data.tenancies.find(x=>x.id===caseId);
      if(!c||!t)return;
      const r=data.externalValues?.[costId]?.rows?.[caseId]||{};
      title=t.name+' · '+(data.units.find(u=>u.id===t.unitId)?.label||t.unitId);
      eyebrow='EXTERNE EINZELABRECHNUNG · '+safeText(c.name);
      body='<form id="editForm" data-type="external">'+
        '<div class="drawer-note">Rechnungsbetrag und belegter Vermieterposten sind unter Gesamtkosten schreibbar. Hier ausschließlich externe Einzelwerte.</div>'+
        '<div class="form-row"><label>Einzelkosten laut Techem (€)<input name="externalAmount" type="number" min="0" step="0.01" required value="'+safeText(r.amount??'')+'"></label></div>'+
        '<div class="form-row"><label>Verbrauchseinheiten (optional)<input name="externalUnits" type="number" min="0" step="0.001" value="'+safeText(r.units??'')+'"></label></div>'+
        '<div class="form-row"><label>Notiz / externer Beleg<input name="externalNote" maxlength="2000" value="'+safeText(r.note||'')+'"></label></div>'+
        '<div class="drawer-note">Die übernommene Einzelkostenhöhe wird nicht aus den Einheiten hochgerechnet. Alle Fälle müssen vor einer fachlichen Freigabe abgestimmt werden.</div></form>';
    }else if(type==='other-consumption'){
      const c=data.costs.find(x=>x.id===id);if(!c)return;
      title=c.name+' · Verbrauchseinheiten';eyebrow='VERBRÄUCHE · 2025';
      body='<form id="editForm" data-type="other-consumption">'+
        '<div class="water-form-grid"><div class="form-row"><label>Gesamtverbrauch<input name="consumptionTotal" min="0.001" step="0.001" type="number" required value="'+safeText(c.consumptionTotal??'')+'"></label></div>'+
        '<div class="form-row"><label>Einheit<input name="consumptionUnit" maxlength="12" value="'+safeText(c.consumptionUnit||'Einheit')+'"></label></div></div>'+
        data.tenancies.map(t=>'<div class="form-row"><label>'+safeText(t.name)+' · '+safeText(data.units.find(u=>u.id===t.unitId)?.label||t.unitId)+
        '<input data-case-consumption="'+safeText(t.id)+'" type="number" min="0" step="0.001" value="'+safeText(c.consumptionByTenant?.[t.id]??'')+'"></label></div>').join('')+
        '<div class="drawer-note">Gesamtmenge und Mengen der Einzelabrechnungsfälle werden getrennt geprüft. Fehlt ein Wert, gilt er nicht automatisch als null.</div></form>';
    }else if(type==='interim-reading'){
      const parts=String(id).split('|'),kind=parts.pop(),unitId=parts.join('|');
      const u=data.units.find(x=>x.id===unitId);
      if(!u||!['cold','hot'].includes(kind))return;
      title=u.label+' · Zwischenablesung';eyebrow=kind==='cold'?'KALTWASSER':'WARMWASSER';
      body='<form id="editForm" data-type="interim-reading">'+
        '<div class="form-row"><label>Ablesedatum<input name="readingDate" type="date" required value="2025-06-30"></label></div>'+
        '<div class="form-row"><label>Zählerstand (m³)<input name="readingValue" type="number" step="0.001" min="0" required></label></div>'+
        '<div class="drawer-note">Ablesungen an Auszugs- und Einzugsgrenzen ermöglichen die automatische Berechnung des Leerstandsverbrauchs. Fehlende Ablesungen erzeugen einen Prüfhinweis.</div></form>';
    }else if(type==='meter-replacement'){
      const parts=String(id||'').split('|'),channel=parts.pop(),unitId=parts.join('|');
      const u=data.units.find(x=>x.id===unitId),m=u?.waterMeters?.[channel];
      if(!u||!m||!['cold','hot'].includes(channel))return;
      const last=m.segments?.at(-1)||m;
      title=u.label+' · '+(channel==='cold'?'Kaltwasser':'Warmwasser');
      eyebrow='ZÄHLERWECHSEL · SYNTHETISCH';
      body='<form id="editForm" data-type="meter-replacement">'+
        '<div class="drawer-note">Bisheriger Zähler: '+safeText(last.number||last.id||m.number||'')+
          ' · Beginn '+safeText(last.startDate)+' · Anfangsstand '+safeText(last.start)+
          ' m³. Ein Ausbau- und ein Einbauzähler werden zu getrennten Messperioden.</div>'+
        '<div class="form-row"><label>Wechseldatum<input type="date" name="at" required value="2025-06-01"></label></div>'+
        '<div class="form-row"><label>Ausbau-Endstand alter Zähler (m³)<input type="number" step="0.001" min="0" name="oldEnd" required></label></div>'+
        '<div class="form-row"><label>Neuer Zähler aus den Stammdaten<select name="newNumber" required>'+
        '<option value="">Bitte zuerst im Zählerstamm anlegen</option>'+
        master().meterRegistry.filter(x=>x.unitId===unitId&&x.type===channel&&
          x.status==='active'&&x.number&&x.number!==last.number).map(x=>
            '<option value="'+safeText(x.number)+'">'+safeText(x.number)+'</option>').join('')+
        '</select></label></div>'+
        '<div class="water-form-grid">'+
          '<div class="form-row"><label>Einbau-Anfang (m³)<input name="newStart" type="number" step="0.001" min="0" value="0" required></label></div>'+
          '<div class="form-row"><label>Neuer Endstand 2025 (m³)<input name="newEnd" type="number" step="0.001" min="0" required></label></div></div>'+
        '<div class="form-row"><label>Begründung / Belegnotiz<textarea name="note" maxlength="2000" rows="3"></textarea></label></div>'+
        '<div class="drawer-note">Der ursprüngliche Demostand bleibt in der Zählerhistorie erhalten. Die Abrechnung nutzt nur die validierten Messperioden. Keine automatische Rückrechnung.</div></form>';
    }else if(type==='house'){
      const h=data.waterSettings||{};
      title='Hauszähler & Wasserwerksrechnung';eyebrow='VERBRAUCHSABGLEICH';
      body='<form id="editForm" data-type="house">'+
        '<div class="form-row"><label>Hauszählernummer<input name="houseMeterNumber" maxlength="60" value="'+safeText(h.houseMeterNumber||'')+'"></label></div>'+
        '<div class="water-form-grid">'+
        '<div class="form-row"><label>Hauszähler Anfang (m³)<input name="houseStart" type="number" min="0" step="0.001" value="'+safeText(h.houseStart??'')+'"></label></div>'+
        '<div class="form-row"><label>Hauszähler Ende (m³)<input name="houseEnd" type="number" min="0" step="0.001" value="'+safeText(h.houseEnd??'')+'"></label></div>'+
        '<div class="form-row"><label>Ablesedatum Beginn<input name="houseStartDate" type="date" value="'+safeText(h.houseStartDate||'')+'"></label></div>'+
        '<div class="form-row"><label>Ablesedatum Ende<input name="houseEndDate" type="date" value="'+safeText(h.houseEndDate||'')+'"></label></div></div>'+
        '<div class="form-row"><label>Wasserwerksrechnung · Verbrauch (m³)<input name="invoice" type="number" min="1" step="0.001" required value="'+safeText(data.houseWater)+'"></label></div>'+
        '<div class="form-row"><label>Rechnungsnummer / Bemerkungen (optional)<textarea name="invoiceNote" rows="4" maxlength="2000">'+safeText(h.invoiceNote||'')+'</textarea></label></div>'+
        '<div class="drawer-note">Hauszählerverbrauch = Endstand − Anfangsstand. Abgleich zur Rechnungsmenge und zur Summe der Wohnungszähler. Abweichungen werden nicht still verteilt.</div></form>';
    }else if(type==='water-decision'){title='Wasserdifferenz prüfen';eyebrow='PRÜFENTSCHEIDUNG';const r=waterReport();body=`<form id="editForm" data-type="water-decision"><div class="key-value" style="margin-bottom:15px"><small>Abweichung Rechnung ↔ Hauszähler</small><strong>${int(r.delta.invoiceHouse)} m³</strong></div><div class="key-value" style="margin-bottom:23px"><small>Abweichung Hauszähler ↔ Wohnungen</small><strong>${int(r.delta.houseUnits)} m³</strong></div><div class="form-row"><label for="d-reason">Begründung der Musterentscheidung</label><textarea id="d-reason" name="reason" minlength="5" required placeholder="Warum wird die Differenz als geprüft akzeptiert?">${safeText(data.waterDecision?.note||'')}</textarea><p class="form-help">Mindestens fünf Zeichen. Ändern sich die zugrunde liegenden Zählerwerte, wird die Entscheidung erneut prüfpflichtig.</p></div><div class="drawer-note">Im produktiven System gelten zusätzlich alle bestehenden fachlichen Prüfschritte und dokumentierten Entscheidungstypen.</div></form>`;actionLabel='Entscheidung dokumentieren';
    }else if(type==='heat-evidence'){title='Heizkostenbeleg';eyebrow='PRÜFENTSCHEIDUNG';body=`<form id="editForm" data-type="heat-evidence"><div class="key-value" style="margin-bottom:20px"><small>Externe Heizkosten (Muster)</small><strong>${fmt(data.costs.find(x=>x.id==='heat')?.amount||0)}</strong></div><div class="form-row"><label><input name="confirmed" type="checkbox" style="width:auto;margin-right:8px" ${heatResolved()?'checked':''} required> Musterbeleg ist geprüft</label><p class="form-help">Diese Checkbox simuliert nur die später einzubindende Belegprüfung.</p></div></form>`;actionLabel='Belegstatus speichern';
    }else if(type==='result'){const u=data.units.find(x=>x.id===id);if(!u)return;title=u.label;eyebrow='BERECHNUNGSNACHWEIS';let a=data.units.reduce((s,x)=>s+x.area,0),w=unitConsumption();body=`<div class="drawer-note">Ausschließlich vereinfachter Beispielnachweis. Die produktive Umlage besitzt zusätzliche Schlüssel, Nachweise und Sonderfälle.</div><div class="key-value" style="margin-bottom:17px"><small>Wohnflächenanteil</small><strong>${int(u.area)} / ${int(a)} m²</strong></div><div class="key-value" style="margin-bottom:17px"><small>Verbrauchsanteil</small><strong>${int(consumption(u))} / ${int(w)} m³</strong></div><div class="key-value" style="margin-bottom:17px"><small>Berechnete Kosten</small><strong>${fmt(allocation(u))}</strong></div><div class="key-value"><small>Saldo nach Vorauszahlungen</small><strong>${fmt(balance(u))}</strong></div>${demoBreakdown(u.id)}`;actionLabel='Schließen';
    }
    if(type==='cost'){
      const c=data.costs.find(v=>v.id===id);
      if(c)body+='<div class="meter-admin cost-admin"><div class="meter-admin-heading">Kostenart verwalten</div>'+
        '<p>Änderungen am Aktivstatus oder endgültiges Löschen werden ausschließlich hier vorgenommen und benötigen eine gesonderte Bestätigung.</p>'+
        button(c.active===false?'Kostenart aktivieren':'Kostenart deaktivieren','toggle-cost',id,'button-danger')+
        (c.id.startsWith('SYN-K-')?button('Eigene Kostenart löschen','delete-unused-cost',id,'button-danger'):'')+
        '</div>';
    }
    if(type==='master-meter'){
      const m=master().meterRegistry.find(v=>v.id===id);
      if(m){
        const cited=estates.meterReferenced(master(),m);
        const canRetire=m.status==='active';
        const canDelete=!cited&&m.status!=='active';
        body+='<div class="meter-admin"><div class="meter-admin-heading">Zählerverwaltung</div>'+
          '<p>Diese Aktionen ändern den Zählerstamm, niemals historische Abrechnungen. '+
          'Sie erfordern eine gesonderte Bestätigung.</p>'+
          (canRetire?button('Zähler außer Betrieb setzen','retire-master-meter',id,'button-danger'):'')+
          (canDelete?button('Zähler endgültig löschen','delete-master-meter',id,'button-danger'):'')+
          (cited&&!canRetire?'<span class="meter-admin-lock">Historisch verwendeter Zähler: Löschen gesperrt.</span>':'')+
          '</div>';
      }
    }
    $('drawerTitle').textContent=title;$('drawerEyebrow').textContent=eyebrow;$('drawerBody').innerHTML=body;
    if(type==='cost-view')body+='<div class="drawer-note">Historische Jahresdaten sind schreibgeschützt.</div>';
    $('drawerBody').innerHTML=body;
    if(type==='cost-view'){
      $('drawerBody').querySelectorAll('input,select,textarea').forEach(el=>el.disabled=true);
    }
    $('drawerFooter').innerHTML=`<button class="button" type="button" data-action="close-drawer">${type==='result'||type==='cost-view'?'Schließen':'Abbrechen'}</button>${type==='result'||type==='cost-view'?'':`<button form="editForm" class="button button-primary" type="submit">${actionLabel}</button>`}`;
    $('overlay').hidden=false;$('drawer').hidden=false;document.body.style.overflow='hidden';setTimeout(()=>{const input=$('drawerBody').querySelector('input,textarea,select');if(input)input.focus();else $('closeDrawer').focus()},10);
  }
  function saveDrawer(form){const {type,id}=ui.drawer||{};let good=true,msg='Musterwert gespeichert.';
    if(type==='new-object'||type==='new-master-unit'||type==='new-year'){
      try{
        if(type==='new-object'){
          portfolio=estates.addObject(portfolio,{
            name:form.elements.name.value,street:form.elements.street.value,
            postalCode:form.elements.postalCode.value,city:form.elements.city.value});
          data=null;ui.view='object';ui.objectTab='overview';
          ui.treeOpenObjectId=portfolio.selectedObjectId;
          ui.treeSections.master=true;ui.unitDetailId=null;ui.billingHome=true;
          msg='Musterobjekt angelegt.';
        }else if(type==='new-master-unit'){
          portfolio=estates.addUnit(portfolio,master().id,{
            label:form.elements.label.value,position:form.elements.position.value,
            area:form.elements.area.value});
          data=estates.current(portfolio);ui.view='object';ui.objectTab='units';
          ui.treeOpenObjectId=portfolio.selectedObjectId;ui.treeSections.master=true;
          msg='Wohnung angelegt. Es sind noch Mietverhältnisse zu erfassen.';
        }else{
          portfolio=estates.addYear(portfolio,master().id,form.elements.year.value);
          data=estates.current(portfolio);ui.view='billing';ui.billingHome=false;
          ui.step='advance';ui.treeOpenObjectId=portfolio.selectedObjectId;
          ui.treeSections.years=true;msg='Synthetisches Abrechnungsjahr angelegt.';
        }
        savePortfolio();closeDrawer();render();toast(msg);
      }catch(e){rollbackLocal();render();toast('Anlage nicht möglich: '+e.message)}
      return;
    }
    if(type.startsWith('master-')||type==='new-master-tenancy'||type==='new-master-meter'){
      try{
        const parsed=masterUi.parse(type,form.elements,id,ui.draftMasterTenancy);
        if(parsed.kind==='meter')
          portfolio=type==='new-master-meter'?
            estates.addMeter(portfolio,master().id,parsed.entry):
            estates.editMeter(portfolio,master().id,id,parsed.entry);
        else
          portfolio=estates.editMaster(portfolio,master().id,parsed.kind,parsed.entry);
        data=estates.current(portfolio);
        savePortfolio();
        closeDrawer();render();toast('Stammdaten gespeichert. Jahresabrechnungen bleiben unverändert.');
      }catch(e){rollbackLocal();render();toast('Stammdaten nicht gespeichert: '+e.message)}
      return;
    }
    if(annualLocked())return toast('Historischer Musterstand: Änderungen gesperrt.');
        if(type==='property'){
      const name=form.elements.propertyName.value.trim();
      if(!name)return toast('Ein Objektname ist erforderlich.');
      data.property={...data.property,name,
        street:form.elements.propertyStreet.value.trim().slice(0,120),
        postalCode:form.elements.propertyPostalCode.value.trim().slice(0,12),
        city:form.elements.propertyCity.value.trim().slice(0,100),
        note:form.elements.propertyNote.value.trim().slice(0,2000)};
    }else if(type==='tenancy'||type==='new-tenancy'){
      // Individual consumptions are exclusively edited in the Verbräuche step.
      const prior=data.tenancies.find(t=>t.id===ui.draftTenancyId);
      const base={id:ui.draftTenancyId,unitId:form.elements.unitId.value,
        name:[form.elements.firstName.value.trim(),form.elements.lastName.value.trim()].filter(Boolean).join(' '),role:form.elements.role.value,
        start:form.elements.start.value,end:form.elements.end.value,
        persons:Number(form.elements.persons.value),advance:Number(prior?.advance??0),
        consumptionCold:prior?.consumptionCold??null,consumptionHot:prior?.consumptionHot??null,
        note:form.elements.tenantNote.value.trim().slice(0,2000)};
      if(!base.name||!propertyModel.date(base.start)||!propertyModel.date(base.end)||
        base.end<base.start||!Number.isSafeInteger(base.persons)||base.persons<0||
        !Number.isFinite(base.advance)||base.advance<0)
        return toast('Bitte Mietzeitraum, Personenzahl, Beträge und KW/WW prüfen.');
      try{
        data=propertyModel.updateTenancy(data,base);
        data=workflow.renameTenant(data,base.id,{firstName:form.elements.firstName.value,
         lastName:form.elements.lastName.value,salutation:form.elements.salutation.value,
         customSalutation:form.elements.customSalutation.value,
         recipientStreet:form.elements.recipientStreet.value,
         recipientPostalCode:form.elements.recipientPostalCode.value,
         recipientCity:form.elements.recipientCity.value});
      }
      catch(e){return toast('Abrechnungsfall kann nicht gespeichert werden: '+e.message)}
      msg='Muster-Abrechnungsfall gespeichert; Kontrollregeln erneut berechnet.';
    }else if(type==='letter-settings'){
      const names=['senderName','senderStreet','senderCity','letterDate','paymentDue',
        'bankAccount','subject','openingText','closingText','paymentText',
        'creditText','annexText','greeting','signature'];
      const next={...data.letterSettings};
      for(const key of names)next[key]=String(form.elements[key].value||'').trim().slice(0,4000);
      if(next.letterDate&&!/^\d{4}-\d{2}-\d{2}$/.test(next.letterDate))
        return toast('Briefdatum ungültig.');
      data.letterSettings=next;msg='Briefvorlage (Muster) gespeichert.';
    }else if(type==='payment'){
      try{data=workflow.setPayment(data,id,{mode:form.elements.mode.value,
         agreed:parseField(form.elements.agreed),paid:parseField(form.elements.paid),
         paidMode:form.elements.paidMode?.value||'annual',
         paidMonthly:form.elements.paidMonthly?parseField(form.elements.paidMonthly):null,
         paidMonths:form.elements.paidMonths?.value??null});}
      catch(e){return toast('Zahlungsdaten prüfen: '+e.message)}
      msg='Vorauszahlungen gespeichert.';
    }else if(type==='cost'||type==='new-cost'){
      const name=form.elements.name.value.trim(),amt=parseField(form.elements.amount),
        method=form.elements.method.value,landlordShare=parseField(form.elements.landlordShare);
      if(!name||!Number.isFinite(amt)||amt<=0||!Number.isFinite(landlordShare)||
        landlordShare<0||landlordShare>amt||!(functionalBilling.METHODS.includes(method)||method==='Externe Einzelabrechnung'))
        return toast('Bitte gültige Beträge und Umlageschlüssel eingeben.');
      const mode=method==='Verbrauch'&&form.elements.priceMode.value==='manual'?'manual':'auto';
      const rawPrice=String(form.elements.unitPrice.value||'').trim();
      const unitPrice=mode==='manual'?parseField(form.elements.unitPrice):null;
      if(mode==='manual'&&(!rawPrice||!Number.isFinite(unitPrice)||unitPrice<=0||unitPrice>100000||
        Math.abs(unitPrice*10000-Math.round(unitPrice*10000))>1e-6))
        return toast('Einheitspreis: positiv, höchstens vier Nachkommastellen.');
      // Checked = included. Empty exclusion list means every case is included by default.
      const includedInputs=[...form.querySelectorAll('[data-case-include]')];
      // Test DOM adapters may not expose checkbox nodes; an actual browser always does.
      const included=new Set(includedInputs.length?
        includedInputs.filter(el=>el.checked).map(el=>el.dataset.caseInclude):
        data.tenancies.map(t=>t.id));
      const exclusions=data.tenancies.filter(t=>!included.has(t.id)).map(t=>t.id);
      const invoiceQty=method==='Verbrauch'?parseField(form.elements.invoiceConsumption):null;
      if(method==='Verbrauch'&&(!Number.isFinite(invoiceQty)||invoiceQty<=0||
        Math.abs(invoiceQty*1000-Math.round(invoiceQty*1000))>1e-6))
        return toast('Rechnungsverbrauch: positive Menge mit maximal drei Nachkommastellen erforderlich.');
      const existingCost=data.costs.find(x=>x.id===id)||{};
      const sourceId=form.elements.sourceId.value,canonical=workflow.invoiceCatalog(sourceId);
      if(sourceId&&data.costs.some(c=>c.id!==id&&costCatalogId(c)===sourceId))
        return toast('Diese Original-Kostenart ist bereits vorhanden. Bitte den vorhandenen Eintrag bearbeiten.');
      const value={name,sourceId,category:canonical?.category||existingCost.category||'Betriebskosten',amount:round(amt),landlordShare:round(landlordShare),method,
        exclusionMode:form.elements.exclusionMode.value,excludedTenantIds:exclusions,
        consumptionTotal:method==='Verbrauch'?invoiceQty:null,
        consumptionUnit:existingCost.consumptionUnit||'m³',consumptionByTenant:existingCost.consumptionByTenant||{},
        priceMode:mode,unitPrice:mode==='manual'?unitPrice:null,
        note:form.elements.note.value.trim().slice(0,2000)};
      if(type==='cost')Object.assign(data.costs.find(x=>x.id===id),value);
      if(type==='cost'&&id==='water'&&method==='Verbrauch')data.houseWater=invoiceQty;
      else data.costs.push({id:'SYN-K-'+Date.now().toString(36).toUpperCase(),active:true,label:'Musterdaten',...value});
      try{data=workflow.setInvoice(data,type==='cost'?id:data.costs.at(-1).id,{
        invoiceDate:form.elements.invoiceDate.value,documentDate:form.elements.documentDate.value,
        invoiceNumber:form.elements.invoiceNumber.value,issuer:form.elements.issuer.value,
        invoiceReference:form.elements.invoiceReference.value});}
      catch(e){return toast('Rechnungsangaben prüfen: '+e.message)}
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
        next[channel]={...(u.waterMeters?.[channel]||{}),
          // Never allow a yearly reading form to rewrite a permanent meter identity.
          number:u.waterMeters?.[channel]?.number||"",
          start,end,startDate,endDate};
      }
      u.waterMeters=next;u.waterNote=form.elements.waterNote.value.trim().slice(0,2000);
      delete u.waterSourceNotice;
    }
    else if(type==='advance'){const val=parseField(form.elements.advance);if(!Number.isFinite(val)||val<0)return toast('Ungültige Vorauszahlung.');const matches=data.tenancies.filter(t=>t.unitId===id);if(matches.length!==1)return toast('Bitte Vorauszahlungen je Abrechnungsfall bearbeiten.');matches[0].advance=round(val);data.units.find(x=>x.id===id).advance=round(val);}
    else if(type==='unit'){const u=data.units.find(x=>x.id===id);const area=parseField(form.elements.area);if(!Number.isFinite(area)||area<1||area>1000000)return toast('Bitte gültige Fläche, Personenzahl und Miettage eingeben.');const label=form.elements.label.value.trim(),position=form.elements.position.value.trim();if(!label||!position)return toast('Bezeichnung und Lage fehlen.');Object.assign(u,{label,position,area,active:form.elements.active.checked});}
    else if(type==='case-water'){
      const t=data.tenancies.find(x=>x.id===id);
      if(!t)return toast('Mietverhältnis fehlt.');
      const rawCold=String(form.elements.caseCold.value).trim(),rawHot=String(form.elements.caseHot.value).trim();
      const cold=rawCold===''?null:parseField(form.elements.caseCold),
         hot=rawHot===''?null:parseField(form.elements.caseHot);
      if((cold!==null&&(!Number.isFinite(cold)||cold<0))||
         (hot!==null&&(!Number.isFinite(hot)||hot<0)))
         return toast('Bitte zulässige KW-/WW-Mengen eingeben.');
      try{data=propertyModel.updateTenancy(data,{...t,consumptionCold:cold,consumptionHot:hot});}
      catch(e){return toast('Fallverbrauch ungültig: '+e.message)}
      msg='Verbrauchswerte für den Abrechnungsfall gespeichert.';
    }
    else if(type==='external'){
      const sep=String(id).indexOf('|'),costId=String(id).slice(0,sep),caseId=String(id).slice(sep+1);
      const units=String(form.elements.externalUnits.value).trim();
      try{data=workflow.setExternal(data,costId,caseId,
        parseField(form.elements.externalAmount),units===''?null:parseField(form.elements.externalUnits),
        form.elements.externalNote.value);}
      catch(e){return toast('Externe Einzelwerte prüfen: '+e.message)}
      msg='Techem-Einzelwerte gespeichert.';
    }
    else if(type==='other-consumption'){
      const c=data.costs.find(x=>x.id===id),total=parseField(form.elements.consumptionTotal);
      if(!c||!Number.isFinite(total)||total<=0)return toast('Ungültiger Gesamtverbrauch.');
      const by={};
      for(const el of form.querySelectorAll('[data-case-consumption]')){
        const raw=String(el.value).trim();
        if(raw!==''){const n=Number(raw);if(!Number.isFinite(n)||n<0)return toast('Ungültiger Einzelverbrauch.');by[el.dataset.caseConsumption]=n;}
      }
      c.consumptionTotal=total;c.consumptionUnit=form.elements.consumptionUnit.value.trim()||'Einheit';
      c.consumptionByTenant=by;msg='Verbrauchswerte je Abrechnungsfall gespeichert.';
    }
    else if(type==='interim-reading'){
      const parts=String(id).split('|'),kind=parts.pop(),unitId=parts.join('|');
      try{data=waterDetails.addInterimReading(data,unitId,kind,
         form.elements.readingDate.value,parseField(form.elements.readingValue));}
      catch(e){return toast('Zwischenablesung prüfen: '+e.message)}
      msg='Zwischenablesung gespeichert – Leerstand wird neu berechnet.';
    }
    else if(type==='meter-replacement'){
      const parts=String(id||'').split('|'),channel=parts.pop(),unitId=parts.join('|');
      try{
        const nextNumber=form.elements.newNumber.value.trim();
        if(!master().meterRegistry.some(m=>m.unitId===unitId&&m.type===channel&&
          m.status==='active'&&m.number===nextNumber))
          throw new RangeError('Der neue Zähler muss zuvor im Zählerstamm angelegt und aktiviert werden');
        data=waterDetails.registerReplacement(data,unitId,channel,{
          at:form.elements.at.value,oldEnd:parseField(form.elements.oldEnd),
          newNumber:nextNumber,
          newStart:parseField(form.elements.newStart),
          newEnd:parseField(form.elements.newEnd),
          note:form.elements.note.value.trim()
        });
      }catch(e){return toast('Zählerwechsel nicht gültig: '+e.message)}
      msg='Zählerwechsel mit zwei Messperioden gespeichert.';
    }
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
    if(action==='new-object'){openDrawer('new-object');return;}
    if(action==='new-master-unit'){openDrawer('new-master-unit');return;}
    if(action==='new-year'){openDrawer('new-year');return;}
    if(['archive-object','restore-object','delete-empty-object'].includes(action)){
      const o=portfolio.objects.find(x=>x.id===id);if(!o)return;
      const prompt=action==='archive-object'?
        'Objekt "'+o.name+'" archivieren? Alle Stammdaten und Jahresabrechnungen bleiben erhalten; die Immobilie wird aus dem aktiven Navigationsbaum entfernt.':
        action==='delete-empty-object'?
        'Leeres Objekt "'+o.name+'" endgültig löschen? Der Löschvermerk bleibt für eine spätere Synchronisierung erhalten.':
        'Objekt "'+o.name+'" wiederherstellen?';
      if(!window.confirm(prompt))return;
      try{
        portfolio=action==='archive-object'?estates.archiveObject(portfolio,id):
          action==='restore-object'?estates.restoreObject(portfolio,id):
          estates.deleteEmptyObject(portfolio,id);
        data=estates.current(portfolio);ui.view='overview';ui.treeOpenObjectId=null;
        ui.unitDetailId=null;ui.billingHome=true;
        savePortfolio();render();toast(action==='archive-object'?'Objekt archiviert.':
          action==='restore-object'?'Objekt wiederhergestellt.':'Leeres Objekt gelöscht.');
      }catch(e){rollbackLocal();render();toast('Aktion nicht möglich: '+e.message);}
      return;
    }
    if(action==='select-property'){
      const collapse=ui.treeOpenObjectId===id&&ui.view==='object';
      if(portfolio.selectedObjectId!==id)switchPortfolio(estates.selectObject(portfolio,id));
      ui.treeOpenObjectId=collapse?null:id;
      ui.view='object';ui.objectTab='overview';ui.billingHome=true;render();
      document.body.classList.remove('menu-open');return;
    }
    if(action==='toggle-tree-section'){
      if(id==='master'||id==='years'){
        ui.treeSections[id]=!ui.treeSections[id];render();
      }
      return;
    }
    if(action==='open-object-tab'){ui.view='object';ui.objectTab=id;ui.unitDetailId=null;
      ui.treeOpenObjectId=master().id;ui.treeSections.master=true;
      ui.billingHome=true;render();document.body.classList.remove('menu-open');return;}
    if(action==='object-billings'){ui.objectListFilter=id;ui.billingHome=true;ui.view='billing';
      if(portfolio.selectedObjectId!==id)switchPortfolio(estates.selectObject(portfolio,id));
      ui.treeOpenObjectId=id;ui.treeSections.years=true;
      render();document.body.classList.remove('menu-open');return;}
    if(action==='all-billings'||action==='back-billings'){ui.objectListFilter=master().id;ui.billingHome=true;
      ui.treeOpenObjectId=master().id;ui.treeSections.years=true;
      ui.view='billing';render();document.body.classList.remove('menu-open');return;}
    if(action==='open-year'){
      const pos=id.lastIndexOf('|'),oid=id.slice(0,pos),year=id.slice(pos+1);
      if(pos<0)return;
      try{portfolio=estates.selectYear(portfolio,oid,year);
        data=estates.current(portfolio);savePortfolio();
        ui.billingHome=false;ui.objectListFilter=null;ui.step='advance';ui.view='billing';
        ui.treeOpenObjectId=oid;ui.treeSections.years=true;
        ui.letterId=null;ui.showAllLetters=false;ui.consumptionTab='water';
        render();document.body.classList.remove('menu-open');
        window.scrollTo({top:0,behavior:'instant'});}
      catch(e){toast('Jahresabrechnung kann nicht geöffnet werden: '+e.message)}
      return;
    }
    if(action==='rebase-year'){
      const diff=estates.rebasePreview(portfolio,master().id,activeYear());
      if(!diff.stale)return toast('Stammdaten sind aktuell.');
      if(!window.confirm('Entwurf '+activeYear()+' an neue Stammdaten anpassen? Alle Jahresbeträge und erfassten Verbrauchswerte bleiben über stabile IDs erhalten. Prüfergebnisse werden ungültig.'))return;
      try{switchPortfolio(estates.rebaseDraft(portfolio,master().id,activeYear()));
        toast('Stammdaten kontrolliert übernommen; Prüfungen erneut erforderlich.');}
      catch(e){toast('Abgleich gesperrt: '+e.message)}return;
    }
    const writeActions=new Set(['new-cost','toggle-cost','delete-unused-cost','edit-cost','edit-water',
      'edit-house','edit-payment','edit-external','edit-case-water','edit-other-consumption',
      'add-interim','replace-meter','edit-letter-settings','edit-water-price','check-water',
      'check-heat','edit-advance','edit-unit','new-tenancy','edit-tenancy']);
    if(annualLocked()&&writeActions.has(action)){
      toast('Dieser historische Musterstand ist schreibgeschützt.');return;
    }
    if(action==='delete-unused-cost'){
      if(ui.drawer?.type!=='cost'||ui.drawer?.id!==id)
        return toast('Kostenverwaltung nur über Bearbeiten öffnen.');
      if(!window.confirm('Diese nur in der synthetischen Jahresdemo angelegte Kostenart endgültig löschen?'))return;
      try{data=workflow.removeUnused(data,id);closeDrawer();stateChange();toast('Unbenutzte Demo-Kostenart gelöscht.');}
      catch(e){toast('Löschen gesperrt: '+e.message)}
      return
    }
    if(action==='toggle-cost'){
      if(ui.drawer?.type!=='cost'||ui.drawer?.id!==id)
        return toast('Kostenverwaltung nur über Bearbeiten öffnen.');
      const c=data.costs.find(x=>x.id===id);if(!c)return;
      if(!window.confirm('Kostenart "'+c.name+'" '+(c.active===false?'aktivieren':'deaktivieren')+
        '? Die Jahresumlage wird neu berechnet.'))return;
      if(c.active===false)c.active=true;else data=workflow.deactivate(data,id);
      closeDrawer();stateChange();toast('Kostenstatus geändert.');return;
    }
    if(action==='edit-master-property'){openDrawer('master-property');return}
    if(action==='edit-master-unit'){openDrawer('master-unit',id);return}
    if(action==='edit-master-tenancy'){openDrawer('master-tenancy',id);return}
    if(action==='new-master-tenancy'){openDrawer('new-master-tenancy');return}
    if(action==='new-master-meter'){openDrawer('new-master-meter',id);return}
    if(action==='edit-master-meter'){openDrawer('master-meter',id);return}
    if(action==='retire-master-meter'||action==='delete-master-meter'){
      // Destructive actions are available only from the open matching editing dialog.
      if(ui.drawer?.type!=='master-meter'||ui.drawer?.id!==id)
        return toast('Zählerverwaltung nur über Bearbeiten öffnen.');
      const m=master().meterRegistry.find(v=>v.id===id);if(!m)return;
      const verb=action==='retire-master-meter'?'außer Betrieb setzen':'endgültig löschen';
      if(!window.confirm('Zähler '+(m.number||m.id)+' '+verb+'? Vorhandene Jahresabrechnungen werden nicht verändert.'))return;
      try{
        portfolio=action==='retire-master-meter'?
          estates.retireMeter(portfolio,master().id,id):
          estates.deleteUnusedMeter(portfolio,master().id,id);
        data=estates.current(portfolio);savePortfolio();closeDrawer();render();
        toast(action==='retire-master-meter'?'Zähler außer Betrieb.':'Unbenutzter Zähler gelöscht.');
      }catch(e){rollbackLocal();render();toast('Zähleraktion nicht möglich: '+e.message)}
      return;
    }
    if(action==='edit-letter-settings'){openDrawer('letter-settings');return}
    if(action==='edit-case-water'){openDrawer('case-water',id);return}
    if(action==='edit-external'){openDrawer('external',id);return}
    if(action==='edit-other-consumption'){openDrawer('other-consumption',id);return}
    if(action==='edit-property'){openDrawer('master-property');return}
    if(action==='add-interim'){openDrawer('interim-reading',id);return}
    if(action==='replace-meter'){openDrawer('meter-replacement',id);return}
    if(action==='new-tenancy'||action==='edit-tenancy'){toast('Mietverhältnisse nur unter Objekt → Mietverhältnisse bearbeiten.');ui.objectTab='tenancies';navigate('object');return}
    if(action==='edit-payment'){openDrawer('payment',id);return}
    if(action==='go-tenancies'){ui.objectTab='tenancies';navigate('object');return}
    if(action==='new-cost'){openDrawer('new-cost');return}if(action==='edit-cost'){openDrawer('cost',id);return}
    if(action.startsWith('view-')){
      const types={cost:'cost-view',payment:'payment',water:'water',external:'external',
        'case-water':'case-water','other-consumption':'other-consumption'};
      const type=types[action.slice(5)];if(!type)return;
      openDrawer(type,id);
      const node=$('drawerBody');
      node.querySelectorAll('input,select,textarea').forEach(el=>el.disabled=true);
      node.querySelectorAll('[data-action]').forEach(el=>el.hidden=true);
      $('drawerFooter').innerHTML=button('Schließen','close-drawer',null,'button-quiet');
      return;
    }
    if(action==='edit-water'){openDrawer('water',id);return}if(action==='edit-house'){openDrawer('house');return}
    if(action==='edit-advance'){openDrawer('payment',id);return}if(action==='edit-unit'){openDrawer('master-unit',id);return}if(action==='show-unit-result'){openDrawer('result',id);return}
    if(action==='check-water'){const r=waterReport();if(!r.canReview){navigate('billing','water');toast('Bitte fehlende Zählerstände und Ablesedaten ergänzen.');return}if(r.exactMatch){toast('Beide Wasserabgleiche stimmen überein.');return}openDrawer('water-decision');return}
    if(action==='edit-water-price'){openDrawer('cost','water');return}
    if(action==='go-water'){navigate('billing','water');return}if(action==='go-advance'){navigate('billing','advance');return}if(action==='check-heat'){openDrawer('heat-evidence');return}if(action==='go-costs'){navigate('billing','costs');return}if(action==='go-review'){navigate('billing','review');return}if(action==='go-letter'){navigate('billing','letters');return}
    if(action==='all-letters'){ui.showAllLetters=!ui.showAllLetters;render();return}
    if(action==='select-letter'){ui.letterId=id;ui.showAllLetters=false;render();return}
    if(action==='print-letter'){if(annualLocked())return toast('Historischer Musterstand: Druck gesperrt.');
      ui.showAllLetters=true;render();window.print();return}
    if(action==='demo-finish'){toast('Abschluss gesperrt: 19 Originalregeln, Briefdruck und Archiv sind nicht freigegeben.');return}
    if(action==='close-drawer'){closeDrawer();return}
  }
  document.addEventListener('click',e=>{
    const nav=e.target.closest('[data-view]');if(nav){navigate(nav.dataset.view);return}
    const st=e.target.closest('[data-step]');if(st){ui.step=st.dataset.step;ui.filter='';render();return}
    const an=e.target.closest('[data-analytics]');if(an){ui.analytics=an.dataset.analytics;render();return}
    const objectTab=e.target.closest('[data-object-tab]');if(objectTab){ui.objectTab=objectTab.dataset.objectTab;render();return}
    const consumptionTab=e.target.closest('[data-consumption-tab]');if(consumptionTab){ui.consumptionTab=consumptionTab.dataset.consumptionTab;render();return}
    const action=e.target.closest('[data-action]');if(action){
      try{doAction(action.dataset.action,action.dataset.id||'')}
      catch(error){rollbackLocal();render();toast('Aktion nicht gespeichert: '+error.message)}
    }
  });
  document.addEventListener('submit',e=>{if(e.target.id==='editForm'){
    e.preventDefault();
    try{saveDrawer(e.target)}catch(error){rollbackLocal();render();toast('Änderung nicht gespeichert: '+error.message)}
  }});
  function costLivePreview(form){
    if(!form||!['cost','new-cost'].includes(form.dataset.type))return;
    const el=form.querySelector('#costPricePreview');if(!el)return;
    const amount=parseField(form.elements.amount),landlord=parseField(form.elements.landlordShare),
      total=parseField(form.elements.invoiceConsumption);
    if(form.elements.method.value!=='Verbrauch'||!Number.isFinite(total)||total<=0||
      !Number.isFinite(amount)||amount<=0||!Number.isFinite(landlord)||landlord<0||landlord>amount){
      el.textContent='–';return;
    }
    const manual=form.elements.priceMode.value==='manual';
    const unitPrice=manual?parseField(form.elements.unitPrice):null;
    el.textContent=manual&&(!Number.isFinite(unitPrice)||unitPrice<=0)?'–':
      fmtPrice(manual?unitPrice:(amount-landlord)/total);
  }
  function paymentLivePreview(form){
    if(!form||form.dataset.type!=='payment')return;
    const t=data?.tenancies.find(x=>x.id===form.dataset.paymentCase);
    if(!t)return;
    const mode=form.elements.mode.value,agreed=parseField(form.elements.agreed);
    const p=workflow.agreementPreview(t,{
      mode,agreedMonthly:mode==='monthly'?agreed:null,
      agreedAnnual:mode==='annual'?agreed:null,annualBasis:'fullYear'
    });
    const display=[p.weekly,p.monthly,p.annual,p.expected];
    const cells=form.querySelectorAll('#paymentPreview strong');
    cells.forEach((el,i)=>{el.textContent=p.valid&&Number.isFinite(display[i])?fmt(display[i]):'–'});
    const actualMonthly=form.elements.paidMode.value==='monthly';
    form.querySelectorAll('[data-paid-monthly]').forEach(el=>el.hidden=!actualMonthly);
    form.querySelectorAll('[data-paid-annual]').forEach(el=>el.hidden=actualMonthly);
    const paid=actualMonthly?workflow.actualPreview({paidMode:'monthly',
      paidMonthly:form.elements.paidMonthly.value,paidMonths:form.elements.paidMonths.value}):
      workflow.actualPreview({paidMode:'annual',paidActual:form.elements.paid.value});
    const target=form.querySelector('#paidPreview');
    if(target)target.textContent=paid.valid?fmt(paid.actual):'–';
  }
  document.addEventListener('change',e=>{
    if(e.target.name==='mode'&&e.target.closest('#editForm')?.dataset.type==='payment'){
      const form=e.target.closest('#editForm'),now=form.elements.mode.value;
      const before=form.dataset.previousMode;
      const amt=parseField(form.elements.agreed);
      if(Number.isFinite(amt)&&before!==now)
        form.elements.agreed.value=String(round(before==='monthly'?amt*12:amt/12));
      form.dataset.previousMode=now;
      paymentLivePreview(form);
    }
    if(e.target.closest('#editForm')?.dataset.type==='payment'&&e.target.name!=='mode')
      paymentLivePreview(e.target.closest('#editForm'));
    if(e.target.id==='d-catalog'){
      const choice=workflow.invoiceCatalog(e.target.value);
      if(choice&&$('d-name'))$('d-name').value=choice.name;
    }
    if(e.target.id==='d-method'||e.target.id==='d-price-mode'){
      const f=$('editForm');if(!f)return;
      const consume=f.elements.method.value==='Verbrauch';
      f.querySelectorAll('[data-price-group]').forEach(el=>el.hidden=!consume);
      f.querySelectorAll('[data-consumption-context]').forEach(el=>el.hidden=!consume);
      f.querySelectorAll('[data-manual-price]').forEach(el=>el.hidden=!consume||f.elements.priceMode.value!=='manual');
    }
    const cf=e.target.closest?.('#editForm');if(cf&&['cost','new-cost'].includes(cf.dataset.type))costLivePreview(cf);
  });
  document.addEventListener('input',e=>{
    const paymentForm=e.target.closest?.('#editForm');
    if(paymentForm?.dataset.type==='payment')paymentLivePreview(paymentForm);
    if(paymentForm&&['cost','new-cost'].includes(paymentForm.dataset.type))costLivePreview(paymentForm);
    if(['coldStart','coldEnd','hotStart','hotEnd'].includes(e.target.name)){
      const f=$('editForm'),el=$('water-live-sum');
      if(f&&el&&f.dataset.type==='water'){
        const read=key=>{
          const a=String(f.elements[key+'Start'].value).trim(),b=String(f.elements[key+'End'].value).trim();
          if(a===''||b==='')return null;
          const delta=Number(b)-Number(a);
          return Number.isFinite(delta)&&delta>=0?delta:null;
        };
        const kw=read('cold'),ww=read('hot');
        el.textContent=kw===null||ww===null?'Zählerstand fehlt oder ist unplausibel':
          'KW '+fmtVolume(kw)+' m³ · WW '+fmtVolume(ww)+' m³ · Summe '+fmtVolume(kw+ww)+' m³ (vor Prüfung)';
      }
    }
    if(e.target.id==='tableSearch'){ui.filter=e.target.value;const pos=e.target.selectionStart;render();const input=$('tableSearch');if(input){input.focus();input.setSelectionRange(pos,pos)}}});
  $('closeDrawer').addEventListener('click',closeDrawer);$('overlay').addEventListener('click',closeDrawer);
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(!$('drawer').hidden)closeDrawer();document.body.classList.remove('menu-open')}if(e.key==='Tab'&&!$('drawer').hidden){const nodes=[...$('drawer').querySelectorAll('button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled)')].filter(x=>x.offsetParent!==null);if(!nodes.length)return;const first=nodes[0],last=nodes.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}});
  $('openMenu').addEventListener('click',()=>document.body.classList.toggle('menu-open'));
  $('resetDemo').addEventListener('click',()=>{
    if(!window.confirm('Gesamten lokalen Fachtestbestand einschließlich neu angelegter Objekte zurücksetzen? Alle lokalen Änderungen an Musterdaten gehen verloren. NK-Pro 1.0 wird nicht verändert.'))return;
    portfolio=estates.create(initial());data=estates.current(portfolio);
    try{savePortfolio()}catch(error){rollbackLocal();render();toast('Zurücksetzen nicht gespeichert: '+error.message);return;}
    ui.objectTab='overview';ui.unitDetailId=null;ui.billingHome=true;
    ui.treeOpenObjectId=null;ui.treeSections={master:false,years:true};
    navigate('overview');toast('Drei Musterobjekte zurückgesetzt.');
  });
  document.querySelectorAll('[data-icon]').forEach(node=>node.innerHTML=icon(node.dataset.icon));
  render();
  // API only for automated prototype smoke testing; never expose data from any real NK-Pro system.
  window.NKPRO2_DEMO_TEST=Object.freeze({getPortfolio:()=>clone(portfolio),getState:()=>clone(data),checks,ledger:()=>JSON.parse(JSON.stringify(ledger())),allocate:()=>data.units.map(u=>({id:u.id,amount:allocation(u),balance:balance(u)})),storageKey:STORAGE_KEY});
})();
