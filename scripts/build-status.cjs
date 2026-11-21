"use strict";
/* Build public, data-free progress metadata only from a successful CI TAP run. */
const fs=require("node:fs");
const catalog=require("../contracts/legacy-quality-registry.json");
const coverage=require("../contracts/legacy-coverage.json");
const quality=require("../experimental/quality-contract.js");
function tapCount(text,key){
 const hits=[...String(text).matchAll(new RegExp("^# "+key+" (\\d+)\\s*$","gm"))];
 if(!hits.length)throw new Error("Missing TAP counter "+key);
 return Number(hits.at(-1)[1]);
}
function manifest(tap,revision){
 const tests=tapCount(tap,"tests"),passed=tapCount(tap,"pass"),failed=tapCount(tap,"fail");
 if(tests<=0||passed!==tests||failed!==0)throw new Error("Tests not all passing");
 if(catalog.rules.length!==44||coverage.pages.length!==21||quality.EARLY_RULES.length!==7)
  throw new Error("Rule inventory unexpectedly changed");
 return{
  schemaVersion:1,
  revision:/^[a-f0-9]{40}$/.test(String(revision))?revision:"unknown",
  tests:{total:tests,passed,failed},
  inventory:{legacyPages:coverage.pages.length,qualityRules:catalog.rules.length,
    experimentalQualityRules:quality.EARLY_RULES.length,notPortedRules:catalog.rules.length-quality.EARLY_RULES.length},
  features:[
   ["Neue Benutzeroberfläche","Design-Demo","Fünf Bereiche und synthetische Musterwerte"],
   ["Umlageberechnung","Teilweise getestet","Sechs ausgewählte Methoden an synthetischen Originalreferenzen getestet"],
   ["Wasser 2025","Teilweise getestet","Kalt- und Warmwasser, Rundung, Hausabgleich"],
   ["Techem-Einzelabrechnung","Teilweise getestet","Synthetische Fallwerte inklusive privater Nutzung und Vermieteranteil"],
   ["Qualitätsmanagement","Teilweise getestet","44 erfasst; 7 experimentell ausführbar, 37 noch offen"],
   ["Abrechnungsbriefe","Datenprüfung","Brief-Datensummen und Empfänger, aber kein A4/PDF"],
   ["Schema-5-Überleitung","Testadapter","Nur In-memory-Musterdaten, kein Echtdatenimport"],
   ["Integrierter Prüflauf","Testlabor","Struktur, Qualität, Wasser, Techem und Briefdaten kombiniert"],
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
