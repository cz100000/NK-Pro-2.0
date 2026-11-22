# Qualitätskern 0.2 – 44-Regel-Inventar und 10 experimentell ausgeführte Prüfungen

**Quelle:** Gepinntes [NK-Pro V99.4.86 `quality-rules.js`](https://github.com/cz100000/NK-Pro/blob/a089e1fe660dd5502799560efe2bc4b65a09f278/js/quality-rules.js), Git-Blob `75921b3f5800718d56f7dc41f85a8284fae5e937`.

**Umgesetzt:**
- Das neue JSON [`contracts/legacy-quality-registry.json`](../contracts/legacy-quality-registry.json) übernimmt **sämtliche 44 Originalregel-Metadaten** (IDs, Name, Klasse, Gruppe, Quellbezug, Zielseite, Lösungshinweis, Sperr- und Bestätigbarkeitsflag). CI vergleicht die Felder direkt mit dem in einer isolierten JavaScript-VM geladenen Originalmodul.
- [`experimental/quality-contract.js`](../experimental/quality-contract.js) enthält sieben eigenständige **synthetische, noch nicht fachlich paritätsabgenommene** Startprüfungen `NKP-FACH-001` bis `NKP-FACH-007`: gültige Abrechnungsperiode, aktive Wohnungen, Teilnehmer (inkl. Privatanteil), Mietername, Wohnungsreferenz, Mietzeitraum und Überschneidung. Bei einem reinen Stammdaten-Fixure ohne Kosten bleiben die restlichen 37 ausdrücklich `not-run`.
- Das Ergebnisformat ist für ein späteres kompaktes Prüf-Cockpit vorgesehen: Regel-ID, fachliche Gruppe, Befund, Handlungsempfehlung und Ausführungsstatus.

- Die neue Datei [`experimental/quality-cost-phase.js`](../experimental/quality-cost-phase.js) ergänzt für **explizit bereitgestellte synthetische Kosteninformationen** die Pflichtregeln `NKP-FACH-008`, `NKP-FACH-009` und `NKP-FACH-010` (Personenzahl bei Personenschlüssel, mindestens eine aktive Kostenart, positiver Gesamtbetrag). Deren Ausführung wird in [`tests/quality-cost-phase-parity.test.cjs`](../tests/quality-cost-phase-parity.test.cjs) anhand des **tatsächlich ausgeführten** Originalcodes `evaluateFactual()` und `evaluateCosts()` in synthetischen Normal-/Fehlerszenarien geprüft. In der Schema-5-Testpipeline sind nun **10 von 44** Regeln experimentell ausgeführt, **34 nicht portiert**; ohne Kostendomäne bleiben die neuen drei Regeln `not-run`.

**Wichtig:** Diese sieben Checks sind strukturelle Frühprüfungen und **kein Ersatz** für die vollständige Version V99.4.86. Die tatsächliche Laufzeitparität der Ergebnisse ist noch nicht vollständig gegen die Originalauswertung abgenommen. Obwohl einige synthetische Prüfungen bestanden sein können, bleibt `readyForRealFinalization:false` stets gesetzt.

**Nicht enthalten:** Vollständige 44-Regel-Ausführung, Entscheidungen für echte Differenzen, fachliche Endfreigabe, realer 2025-Datenimport, druckfähige Briefe oder Archiv.
