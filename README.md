# NK-Pro 2.0 – Designprototyp (nicht produktiv)

Dies ist die **eigenständige Neugestaltung** von NK-Pro. Das ursprüngliche Projekt [cz100000/NK-Pro](https://github.com/cz100000/NK-Pro) bleibt unverändert. Alle Inhalte dieser Demo sind **synthetische Musterdaten**; der aktuelle Stand ist **kein für Nebenkostenabrechnungen zugelassenes Produkt**.

## Demo

Interaktive, veröffentlichte Design-Demo: **https://cz100000.github.io/NK-Pro-2.0/**

Die Anwendung ist ein interaktiver Entwurf für eine minimalistische Benutzerführung. Sie enthält die fünf Hauptbereiche **Übersicht, Abrechnungen, Objekt, Analysen, Dokumente & Archiv** sowie den zusammenhängenden Musterworkflow Kosten → Verbräuche → Vorauszahlungen → Ergebnisse → Prüfen → Briefe.

## Wichtige Hinweise

- Die Demo ist **nicht** mit dem echten NK-Pro-Rechenkern verbunden. Angezeigte Umlageergebnisse sind ausdrücklich vereinfachte Beispiele.
- Es gibt **keinen Import von NK-Pro-1.0-Daten**, keine echte Google-Drive-Synchronisation, keinen rechtlich belastbaren Abschluss und keine produktive Druck-/Brief-Freigabe.
- Speichern erfolgt ausschließlich unter dem separaten Browser-Key `nkpro2_design_demo_20261121_v1`. Die Anwendung liest oder schreibt keine NK-Pro-1.0-Schlüssel.
- **Keine echten personenbezogenen Daten eingeben.** Das Projekt ist öffentlich und vorerst nur ein UX-Prototyp.
- Beide GitHub-Pages-Projekte liegen unter derselben Web-Origin `cz100000.github.io`. Ein separater Pfad ist **keine vollständige Browser-Speicherisolation**. Für produktiven Einsatz wird eine eigene Domain/Hosting-Origin geprüft.

## Dateien

- `index.html` – minimalistische Navigations- und Anwendungsstruktur
- `styles.css` – responsive Designsystem-Styles
- `app.js` – reine Demo-Interaktionen mit synthetischen Daten
- `.github/workflows/pages.yml` – Deployment als GitHub-Pages-Site
- `docs/` – Architektur, Funktionsumfang, Roadmap und Teststatus

## Entwicklung

Die aktuelle Entwicklungsstrategie ist **UX zuerst, Fachparität vor Produktivfreigabe**. Die bisherige Abrechnungslogik wird zunächst anhand eines Golden Masters mit allen Sonderfällen überprüft, bevor echte Berechnungen in NK-Pro 2.0 freigegeben werden.

**Projektstatus und Plan:** https://chatgpt.com/space/page_7bbf6b4cfefc8191bd962a700b8caa61

## Demo-Version 0.2: prüfbare Muster-Umlage

- Reiner Demo-Rechenkern in `demo-ledger.js` (keine Produktivabrechnung und kein Datenimport).
- Jeder synthetische Bruttokostenbetrag kann einen ausdrücklich **nicht umgelegten Vermieteranteil** enthalten.
- Cent-genaue Verteilung synthetischer Fläche/Verbrauch mittels deterministischem Restcent-Verfahren; alle Summen prüfbar.
- Neue Berechnungsnachweise je Mustereinheit; Eingabe- und Umlagefehler blockieren die simulierte Freigabe.
- Wasserdifferenzentscheidungen werden bei jeder einzelnen Zähleränderung ungültig, auch wenn die Zählersumme unverändert bleibt.
- Bereits bestätigte Musterbriefe gelten nach jeder Betrags-/Stammdatenänderung als erneut prüfpflichtig.
- Automatisierte Node-Tests: `npm test`. Der GitHub-Pages-Workflow wird erst nach erfolgreichen Tests deployen.

**Wichtig:** Diese Verbesserungen dienen der technisch geprüften Demo-Verarbeitung. Der ursprüngliche NK-Pro-Rechenkern ist weiterhin **nicht migriert** und muss vor Echtdaten-Nutzung centgenau verglichen werden.

## Entwicklungsstand · Fachmigration (experimentell)

Die Oberfläche ist als eigenständiger UX-Prototyp veröffentlicht. Die tatsächliche Abrechnungslogik wird derzeit **getrennt von der Demo** aufgebaut und gegen die bestehende V99.4.86-Version verglichen.

- **Sechs Umlageverfahren** sind in [`experimental/settlement-cost.js`](experimental/settlement-cost.js) als isolierte Referenzportierung implementiert und in synthetischen Fällen direkt gegen den gepinnten Original-Rechenkern getestet: Wohnfläche, Personentage, Miettage, Verbrauch, alle Wohneinheiten und aktive Wohneinheiten.
- **Automatisierte Regressionstests** vergleichen synthetische Fälle mit Originalfunktionen (u. a. Leerstand, Teiljahre, Privatnutzung, Mieterwechsel). Die aktuelle Testanzahl steht auf der [Entwicklungsstatusseite](https://cz100000.github.io/NK-Pro-2.0/status.html).
- **17 bestehende Menüpunkte und 4 interne Seiten** sowie **44 Qualitätsregeln** sind in einer [maschinell geprüften Ist–Soll-Matrix](docs/MIGRATION_COVERAGE.md) vollständig einem Zielbereich zugeordnet. Die Regeln sind ausdrücklich noch nicht portiert.
- Technische Übersicht: [Legacy-Paritätsbericht](docs/EXPERIMENTAL_LEGACY_PARITY.md) und [Original-Kontrakt](docs/LEGACY_PARITY_CONTRACT.md).

**Noch nicht umgesetzt:** vollständige Originalberechnung einschließlich externer Techem-Fälle, vollständige Qualitätssicherung, sichere Datenmigration, professionelle Briefe/PDF, Archiv und Drive-Synchronisation. Die Design-Demo darf nicht für echte Nebenkostenabrechnungen genutzt werden. Die produktive NK-Pro-1.0-Anwendung bleibt unangetastet.

## Experimenteller Legacy-JSON-Inspektor (noch keine Datenübernahme)

Für die spätere sichere Migration gibt es ein [separates, ausschließlich lesendes Prüfmodul](docs/LEGACY_BACKUP_PREVIEW.md). Es unterscheidet rohe NK-Pro-JSON-Exporte von mit Prüfsummen geschützten Sicherungen, kontrolliert die Original-Prüfsummen und liefert nur anonymisierte Strukturangaben. Es ist nicht in die öffentliche Website eingebunden, lädt keine Daten hoch und bietet **keinen Import oder Restore**. Die bestehenden NK-Pro-Dateien werden davon nicht berührt.

## Wasser 2025, Techem und Prüfentscheidungen – experimentelle Fachmodule

Drei ausdrücklich **nicht produktive** Fachbausteine wurden implementiert und über synthetische Referenzfälle getestet:

- [Wasser-2025-Referenzlogik](docs/WATER_2025_PARITY.md): bestätigte K002-Rundungsregel, getrennte KW-/WW-Werte, Haus-/Wohnungsdifferenz sowie Entwurf einer kontrollierten Vorjahresübernahme. Originalfunktionen aus V99.4.86 werden im Node-Test direkt ausgeführt und verglichen.
- [Techem / externe Einzelabrechnung](docs/EXTERNAL_TECHEM_PARITY.md): konkrete Abrechnungsfälle für Mietwechsel, Privatanteil, Leerstand sowie ein getrennt dokumentierter, ausschließlich vermieterseitiger 3,88-€-Posten. Auch hier werden Originalverhalten und neue Implementierung mit synthetischen Fällen abgeglichen.
- [Gemeinsamer Prüfadapter](docs/WATER_EXTERNAL_REVIEW.md): Prototyp für kritische Mängel, bewusst bestätigte Abweichungen und automatische Neubewertung bei Quelländerungen. Eine echte Freigabe bleibt bewusst technisch gesperrt.

**Noch nicht umgesetzt:** Echte Techem-Belegdaten und CO₂-Kosten, vollständiger 2025-Datenimport, alle 44 Qualitätsregeln, vollständige Abrechnungsbriefe, produktive Archivierung und Cloud-Synchronisation. Die öffentliche Demo lädt diese drei experimentellen Komponenten bewusst nicht. Nur die ursprüngliche NK-Pro-1.0-App kann vorerst reale Nebenkosten abrechnen.

## Qualitätsregeln, Briefprüfung und Schema-5-Überleitung (nächste Ausbaustufe)

Alle Fachmodule werden über GitHub Actions automatisiert geprüft. Die nachfolgenden Module bleiben test-only und werden bewusst **nicht** auf die GitHub-Pages-Website ausgeliefert:

- [Qualitätskatalog](docs/QUALITY_MIGRATION.md): alle **44 Original-Regeln** mit unveränderten Metadaten und Zielseiten, direkt gegen den eingefrorenen Original-Registry-Code geprüft. **7** zentrale Daten-/Mietzeitraumprüfungen sind als **synthetische, nicht final paritätsgeprüfte** Ausführung verfügbar; **37** verbleiben explizit `not-run`. Produktivfreigabe technisch nicht möglich.
- [Dokumenten-Datenprüfung](docs/LETTER_DATA_PREFLIGHT.md): Empfänger-, Kostenzeilen-, Cent-Summen- und Adressprüfung, Signatur/Fingerprint, Sammelprüfung auf fehlende Empfänger. Abrechnungssaldo bei synthetischen Fällen gegen den echten Originalbrief-Datenkern verglichen. **Keine** echte A4-/PDF-/Druckfreigabe.
- [Schema-5-Projektionsadapter](docs/SCHEMA5_BRIDGE.md): kontrollierte, schreibgeschützte Modellüberleitung für **ausschließlich synthetische** Altdatenfelder. Unklare Wohnungs-/Zähleridentitäten, fehlende Werte und nicht migrierte Messperioden werden sichtbar als Issues ausgegeben. Kein Import, keine Speicherung, keine Echtdaten-Verarbeitung.

**Betriebsschutz:** Die alte App `cz100000/NK-Pro` wird nicht beschrieben. Auch nach diesen Entwicklungsschritten bleibt NK-Pro 2.0 ausschließlich Designprototyp und geschütztes Testlabor; für die Abrechnung 2025 wird weiterhin der alte, fachlich zu prüfende Produktivstand verwendet.

## Technischer Entwicklungsmonitor

Eine separate, nicht in die Abrechnungsnavigation eingreifende Seite zeigt den **tatsächlichen letzten erfolgreichen CI-Teststand** und die weiterhin gesperrten produktiven Freigabe-Gates:

**[Entwicklungsstand](https://cz100000.github.io/NK-Pro-2.0/status.html)**

Die Seite wird bei jedem GitHub-Pages-Deployment aus dem vollständig bestandenen Testprotokoll automatisch erzeugt. Sie zeigt ausschließlich aggregierte Test-/Modulmetadaten, **keine Mieter-, Abrechnungs- oder Speicherinhalte**. Der Veröffentlichungsworkflow lässt nur acht ausdrücklich freigegebene öffentliche Dateien durch; die experimentellen Fachmodule und gepinnten Legacy-Quellen bleiben ausschließlich im Code-/Testrepository.

## Synthetische End-to-End-Prüfkette und Original-Qualitätsvergleich

Der neue [integrierte Testläufer](docs/SYNTHETIC_PIPELINE.md) kombiniert erstmals Datenstrukturprüfung, 44-Regel-Statuskatalog, Wasserabrechnung, Techem-Einzelfälle und Brief-Datenkontrolle in einem **gemeinsamen, nicht produktiven** Prüfbericht. Kritische Mängel, zu begründende Differenzen und bewusst nicht ausgeführte Regeln bleiben unterscheidbar. Quellenbezogene Prüfentscheidungen werden bei jeder Datenänderung ungültig.

Zusätzlich vergleichen [separate Laufzeittests](tests/quality-legacy-execution.test.cjs) die ersten sieben synthetischen Stammdaten- und Mietzeitraumprüfungen gegen die tatsächlich ausgeführte `evaluateFactual()`-Funktion der eingefrorenen Originalversion V99.4.86. Diese Tests decken ausgewählte Normal-/Fehlerfälle ab, ersetzen aber **keine vollständige Paritätsabnahme mit Echtdaten**.

**Release-Grenze unverändert:** Keine echten Mieterabrechnungen, keine vollständigen 44 Prüfungsberechnungen, keine echten A4-Briefe und keine produktive Archivierung. Die bestehende Anwendung auf `cz100000/NK-Pro` bleibt erhalten.
