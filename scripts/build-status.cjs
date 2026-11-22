"use strict";
/* Build public, data-free progress metadata only from a successful CI TAP run. */
const fs=require("node:fs");
const catalog=require("../contracts/legacy-quality-registry.json");
const coverage=require("../contracts/legacy-coverage.json");
const quality=require("../experimental/quality-contract.js");
const costQuality=require("../experimental/quality-cost-phase.js");
const review=require("../synthetic-review.js");
function tapCount(text,key){
 const hits=[...String(text).matchAll(new RegExp("^# "+key+" (\\d+)\\s*$","gm"))];
 if(!hits.length)throw new Error("Missing TAP counter "+key);
 return Number(hits.at(-1)[1]);
}
function manifest(tap,revision){
 const tests=tapCount(tap,"tests"),passed=tapCount(tap,"pass"),failed=tapCount(tap,"fail");
 if(tests<=0||passed!==tests||failed!==0)throw new Error("Tests not all passing");
 if(catalog.rules.length!==44||coverage.pages.length!==21||quality.EARLY_RULES.length!==7||costQuality.ids.length!==3)
  throw new Error("Rule inventory unexpectedly changed");
 const implemented=new Set(review.portedIds||[]);
 if(implemented.size!==25||[...implemented].some(id=>!catalog.rules.some(r=>r.id===id))||
   [...quality.EARLY_RULES,...costQuality.ids].some(id=>!implemented.has(id)))
  throw new Error("Synthetic quality subset is inconsistent with original registry");
 return{
  schemaVersion:1,
  revision:/^[a-f0-9]{40}$/.test(String(revision))?revision:"unknown",
  tests:{total:tests,passed,failed},
  inventory:{legacyPages:coverage.pages.length,qualityRules:catalog.rules.length,
    experimentalQualityRules:implemented.size,notPortedRules:catalog.rules.length-implemented.size},
  features:[
   ["Objekt-/Jahresverwaltung","Synthetischer Fachtest 0.7","Drei getrennte Objekte mit 12 Wohnungen, sieben Jahresständen und Objekt-Explorer"],
   ["Umlageberechnung","Interaktiver Referenztest","Sechs Originalmethoden im Musterworkflow, ohne echte Datenübernahme"],
   ["Wasser 2025","Teilweise getestet","KW/WW, Messperioden, Zwischenablesungen und belegter Leerstandsverbrauch"],
   ["Techem-Einzelabrechnung","Teilweise getestet","Externe Eurobeträge pro Mietverhältnis statt künstlicher Einheitspreisverteilung"],
   ["Qualitätsmanagement","Teilweise getestet","44 erfasst; 25 synthetische Teilprüfungen ausführbar, 19 noch offen"],
   ["Abrechnungsbriefe","Synthetische Vorschau","Einzel- und Sammelentwürfe mit Briefvorlage; kein fachlich freigegebener A4/PDF-Druck"],
   ["Stammdaten/Jahresfälle","Synthetisches Datenmodell","Permanente Mietverhältnisse und abgeleitete, isolierte Jahresfälle; kein Echtdatenimport"],
   ["Integrierter Prüflauf","Testlabor","Teilnehmer, tatsächliche Zahlungen, externes Techem, Prüfung und Briefwerte verbunden"],
   ["Archiv und endgültiger Abschluss","Offen","Keine produktive Finalisierung"]
  ],
  gates:{realBilling:false,realDataImport:false,all44Rules:false,printPdf:false,archive:false,separateOrigin:false},
  warning:"Noch nicht abrechnungsfähig. Testerfolg ist keine produktive Fachfreigabe. NK-Pro 1.0 bleibt unverändert."
 };
}
if(require.main===module){
 const [,,tapPath,outPath]=process.argv;
 if(!tapPath||!outPath)throw new Error("Expected TAP input and JSON output paths");
 const result=manifest(fs.readFileSync(tapPath,"utf8"),process.env.GITHUB_SHA);
 fs.writeFileSync(outPath,JSON.stringify(result,null,2)+"\n");
 console.log("Generated public data-free status for "+result.tests.passed+" passing tests");
}
module.exports={manifest,tapCount};
