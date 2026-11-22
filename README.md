# NK-Pro 2.0 – Designprototyp (nicht produktiv)

## Architekturwiederherstellung: Original-Navigation v0.13, echtes A und Dummys B/C

Die urspruengliche Baumstruktur mit Icons, Stammdaten und Jahresabrechnungen ist wieder der einzige Navigator. Nur das Musterobjekt A wird in der Ansicht durch das private reale ARB5-Objekt ersetzt. Die Musterobjekte B und C bleiben unveraendert und koennen weiterhin als Testobjekte bearbeitet werden. Zwei historische 2023-Archivfassungen erscheinen innerhalb eines einzigen Jahresknotens 2023. Die Abrechnung 2025 wird neu angelegt; die produktive Berechnung ist noch nicht freigegeben.

Siehe [Korrekturbericht zur v0.13-Navigation](docs/V013_CANONICAL_TREE_REAL_A_DUMMY_B_C_2026-11-22.md).

## Google Drive direkt unter Systemstatus · Echtdatenmigration (22.11.2026)

Die Hauptanwendung [NK-Pro 2.0](https://cz100000.github.io/NK-Pro-2.0/) enthält die Google-Cloud-Anbindung direkt im Systemstatus. Der alte zusätzliche Bereich `/NK-Pro-2.0/private/` wird **nicht mehr veröffentlicht**. Verschlüsselte Speicherung und Google Drive sind jetzt technische Komponenten der einen Hauptanwendung, ohne zusätzlichen Hostinganbieter.

**Kein manueller Dateiimport erforderlich:** Nach **Systemstatus → Google verbinden** erkennt NK-Pro 2.0 den bereits vorhandenen Original-Snapshot im bestehenden privaten Google-Drive-Ordner von Version 1.0. Der Button **Altdaten direkt aus Drive übernehmen** prüft ihn, überführt nur die alten Stammdaten und historischen Archive und legt den neuen verschlüsselten 2.0-Datenbestand in einem separaten Drive-Ordner ab. Die einzige erforderliche Nutzerautorisierung besteht in der Google-Anmeldung und einem einmaligen Datenpasswort; eine Dateiauswahl ist nur der Ersatzweg. Es werden **nur die Stammdaten des echten Objekts ARB5 (Objektname und Anschrift ausschließlich aus privatem Snapshot), seine 7 Wohnungen und 5 Mietverhältnisse, der Zählerstamm sowie die 5 historischen Archiv-Snapshots** migriert. Beide Fassungen für 2023 bleiben erhalten. **Die gesamte Abrechnung 2025 wird nicht migriert:** keine aktuellen Rechnungen, Kostenzuordnungen, Wasserstände, Vorauszahlungen, Techem-Einzelwerte oder Rechenergebnisse. 2025 wird in NK-Pro 2.0 neu angelegt.

Die Echtdaten werden nur verschlüsselt im Browser und in einem getrennten privaten Google-Drive-Ordner gespeichert. GitHub hostet ausschließlich App-Code. Der neue 2.0-Echtdatenmodus ist derzeit eine **lesende Stammdaten-/Archivübersicht**, keine freigegebene produktive Abrechnungssoftware. Insbesondere für 2025 ist die vollständige Rechnungsfunktion noch zu entwickeln und fachlich abzunehmen. Die bisherige 1.0-Version bleibt unverändert funktionsfähig.

**Abnahmetests:** Die Originaldaten wurden lokal ohne Veröffentlichung mit dem neuen selektiven Migrationsmodul überprüft. Automatisierte Browser-, Mobil-/Offline-, Migrations- und Synchronisierungstests verwenden nur synthetische Quellen. Reale Google-OAuth-Verbindung, Cloud-Upload und iPhone-Safari-Wiederherstellung müssen mit Nutzerkonto gesondert verifiziert werden.

Details: [Integrations- und Migrationsbericht](docs/INTEGRATED_DRIVE_MASTER_ARCHIVES_2026-11-22.md).

Dies ist die **eigenständige Neugestaltung** von NK-Pro. Das ursprüngliche Projekt [cz100000/NK-Pro](https://github.com/cz100000/NK-Pro) bleibt unverändert. Die ohne Anmeldung sichtbare Fachtest-Demo enthält ausschließlich **synthetische Musterdaten**; die separate Echtdatenfunktion lädt echte Stammdaten und Archive erst nach autorisierter Google-Anmeldung; der aktuelle Stand ist **kein für Nebenkostenabrechnungen zugelassenes Produkt**.

## Demo

Interaktive, veröffentlichte Design-Demo: **https://cz100000.github.io/NK-Pro-2.0/**

Die Anwendung ist ein interaktiver Entwurf für eine minimalistische Benutzerführung. Sie enthält eine **Startseite** mit hierarchisch aufklappbaren Immobilien, pro Objekt **Stammdaten** und **Jahresabrechnungen**, und darunter die getrennten objektübergreifenden Bereiche **Analysen** sowie **Dokumente & Archiv**. Die sechs Schritte einer Jahresabrechnung bleiben innerhalb der Arbeitsfläche.

## Fachtest 0.13 – Einheitliche Tabellen und originale DIN-A4-Briefe (22.11.2026)

Die am Fachtest 0.12 gesammelten Korrekturen sind umgesetzt:
- Zähler werden nur noch im jeweiligen Wohnungsblock über einen rechtsbündigen blauen Button hinzugefügt. Der übergeordnete doppelte Button ist entfernt.
- In Gesamtkosten, Vorauszahlungen, KW/WW, Techem und sonstigen Verbräuchen stehen **Status** und **Aktion** immer in **zwei getrennten Tabellenspalten**.
- Gesamtkosten- und Ergebnistabellen sind deutlich kompakter; mobile Tabellen scrollen bewusst im eigenen Container.
- Die Kostenbezeichnung ist mit dem Original-K-Katalog konsistent, z. B. K002 = Wasserversorgung. Alte kombinierte Wasser-/Abwasser-Rechnungsbeträge werden nicht ohne Beleg aufgeteilt.
- Vorauszahlungen heißen nun **Vereinbart**, **Vorauszahlung Soll** und **Tatsächlich gezahlt**. Ein redundanter übergeordneter Hauszähler-Button ist entfernt.

**Briefmigration:** Die originalen Dokumentrenderer aus NK-Pro 1.0 wurden mit unverändertem AP13-DIN-A4-Layout, neunspaltiger Abrechnungstabelle, Seitenformat, Schriftgrößen und Fußzeile in isolierte Module der Version 2.0 übernommen. Auch die alten internen A4-Vermieterunterlagen (Objektübersicht, Wohnungsblätter) sind als Originalrenderer eingebunden. Eine neue dreigeteilte Oberfläche zeigt links Empfänger, in der Mitte das echte A4-Dokument samt Zoom, Druck-/PDF- und Sammelfunktionen und rechts die editierbaren Brief-/Text-/Zusatzblatteinstellungen. Alle Ausgaben tragen einen Musterhinweis.

**Keine vollständige Rechen-/Fachparität:** Die neue Version speichert bisher nur gesamte Ist-Vorauszahlungen, keine vollständige 1.0-Kostenart-Aufschlüsselung. Daher wird im A4-Brief eine ausdrücklich als Gesamt-Vorauszahlung gekennzeichnete Zeile gezeigt. Automatische Vorauszahlungsanpassungen, einige Originalkorrekturen und der verbindliche PDF-Golden-Master-Vergleich sind noch nicht portiert bzw. freigegeben. **Manuelle Zusatzblätter sind derzeit Vorschauen; der Druck ist sicherheitshalber gesperrt, solange keine nachgewiesene Kaltmiete vorliegt**, damit das Originalformular keine fiktive Warmmiete ausgibt. Die öffentliche Demo bleibt **synthetisch, ohne Cloud und nicht produktiv**.

[Technische Dokumentation für 0.13](docs/STAGE_0_13_UI_LETTER_MIGRATION_2026-11-22.md)

## Fachtest 0.12 – Jahresabrechnungen, Kosten und Ergebnis (22.11.2026)

- Klick auf **Jahresabrechnungen** im Objektbaum öffnet rechts sofort die Jahresübersicht. Der überflüssige Unterpunkt „Alle Jahre“ wurde entfernt. Jahreszeilen zeigen einheitlich **Bearbeiten** (Entwurf) oder **Ansehen** (historischer, gesperrter Stand).
- Der gemeinsame, blau umrandete Bearbeiten-Button wird auch in Vorauszahlungen, Kostenarten und Verbrauchstabellen eingesetzt. Wo belastbare Datenregeln bestehen, steht der Status **Nicht erfasst / Unvollständig / Vollständig** direkt neben der Aktion.
- Vorauszahlungen unterscheiden Soll aus Monats- oder Jahresvereinbarung (zeitanteilig berechnet) und Ist aus ausdrücklich erfassten Zahlungseingängen. Live-Vorschau für Woche, Monat, Jahr und Soll-Zeitraum, bei Ist optional Monatsbetrag × Anzahl nachweislich gebuchter Zahlungen mit ausdrücklich bezeichneten Durchschnittswerten.
- Gesamtkosten verwenden die bestehenden K-Codes des **NK-Pro-1.0-Katalogs**. Fiktive Kombination K002 „Wasser & Abwasser“ wird als **fachlich zu klärende Kombination von Wasserversorgung K002 und Entwässerung K003** gekennzeichnet; K006 bleibt der kombinierte Heiz-/Warmwasserposten, K009 Müll. Kostenarten sind kompakt und gleichmäßig gelistet, Aktivieren/Deaktivieren und Löschen nur im Bearbeitungsdialog nach Bestätigung.
- Bei Verbrauchsumlage wird die auf der Rechnung ausgewiesene Menge erfasst; das Kostenformular zeigt den berechneten Einheitspreis. Alle Abrechnungsfälle sind **standardmäßig einbezogen** und nur ausdrücklich abgewählte Teilnehmer werden als Ausnahmen gespeichert.
- Kaltwasserfelder sind sanft blau, Warmwasserfelder sanft orange hinterlegt; die Gesamtsumme ist größer. Ergebnisse zeigen die einzelnen verteilten Kostenarten je Abrechnungsfall, Ist-Vorauszahlungen, Umlagekosten und Saldo ohne Bearbeiten-Aktion oder Querverlinkung zur Briefvorschau.
- **Prüfen** bleibt in dieser Stufe bewusst im bisherigen Layout. Fehlerhinweise verhindern nicht die Bearbeitung eines Entwurfs oder die vorläufige Ergebnisansicht, wohl aber eine unzulässige finale Abrechnungsfreigabe. **Briefe werden separat bearbeitet und in 0.12 nicht verändert.**

Nur synthetische Musterdaten; weder vollständige 1.0-Parität noch Google-Cloud-Sync oder produktive Abrechnungsfreigabe. Fachliche Details: [Fachtest 0.12](docs/STAGE_0_12_ANNUAL_WORKSPACE_2026-11-22.md).

## Fachtest 0.11 – einheitliche Navigation und Bearbeiten-Aktionen (22.11.2026)

Die Hierarchie links ist typografisch geklärt: **Startseite**, **OBJEKTBEZOGEN** und **OBJEKTÜBERGREIFEND** sind als Primärebene stärker gewichtet, Objektnamen und aufklappbare Gruppen erscheinen ruhiger und normal gewichtet; nur der aktive Eintrag ist betont.

Die Startseite zeigt eine **kompakte Immobilienliste** statt einzelner Kacheln. In den Objektdaten wurden die Querverlinkungen zu Wohnungen, Mietverhältnissen und Abrechnungsjahren entfernt. Objektwechsel und Funktionsnavigation erfolgen über den linken Baum.

Für Objekt-, Wohnungs-, Mietvertrags- und Zählerstammdaten gilt eine einzige wiederverwendbare **„Bearbeiten“-UI-Komponente** mit Stift und dezentem hellblauem Rahmen. In den Zählerlisten erscheint nur „Bearbeiten“. **Außer Betrieb setzen** und **Löschen** liegen ausschließlich im geöffneten Zählerbearbeitungsdialog, mit separater Bestätigung und unveränderten fachlichen Historien-/Löschsperren. Dieselbe UI- und Datenlogik ist für vorhandene und neu angelegte Immobilien gültig.

**Nur Musterbetrieb.** NK-Pro 1.0 bleibt unangetastet. Google-Cloud-Synchronisierung und Produktivfreigabe sind weiterhin offen.

Technische Notiz: [Fachtest 0.11](docs/STAGE_0_11_UI_CONSISTENCY_2026-11-22.md).

## Fachtest 0.10 – Konsistente Navigation und zentraler Zählerstamm (22.11.2026)

Die Startseite ist eigenständig und durch eine Linie von der Objekt-Navigation getrennt. Die Überschriften heißen **OBJEKTBEZOGEN** und **OBJEKTÜBERGREIFEND**. Alle Icons und Texte unter „Stammdaten“ bzw. „Jahresabrechnungen“ haben auf derselben Hierarchieebene eine identische horizontale Ausrichtung.

**Wohnungen:** Eine einzige Stammdatenliste mit Wohnungs-ID, Lage, Fläche und „Bearbeiten“; keine zusätzliche Detailseite, keine Querverlinkungen zu Mietern, Zählern oder Abrechnungsjahren. **Zähler:** Wohnungen als aufklappbare Tabellen innerhalb der Zählerverwaltung (ohne Seitenwechsel) mit Kaltwasser-, Warmwasser-, Strom- und Techem-Heizkostenverteiler-Datensätzen. Strom hat einen und Techem zwei **ausdrücklich fiktive Platzhalter pro Wohnung** – reale Zimmer-/Heizkörperzahlen werden nicht behauptet. Einzelne Zähler können angelegt und bearbeitet, unbenutzte gelöscht und historisch relevante außer Betrieb gesetzt werden.

Die neue **`meterRegistry[]` ist die bearbeitbare Single Source of Truth** für physische Zähler. Die alte `unit.meters`-Struktur bleibt nur als automatisch abgeleitete Kompatibilitätsprojektion für synthetische 0.7/0.9-Abrechnungsstände. Jahresablesungen bleiben jahresgebunden, physische Zählernummern im Jahresformular sind schreibgeschützt; Zählerwechsel können nur mit einem bereits im Zählerstamm vorhandenen neuen Zähler dokumentiert werden. Historische Jahresstände bleiben unverändert.

**Keine Echtdaten, keine produktiven Jahresabrechnungen, keine Cloud-Synchronisierung.** Die spätere Google-Drive-/Google-Cloud-Anbindung und kontrollierte Umstellung bleiben in den Stufen 3–7.

Details: [Fachtest 0.10 – Navigation und Zählerstamm](docs/STAGE_0_10_NAVIGATION_AND_METER_MASTER_2026-11-22.md).

## Fachtest 0.9 – Immobilienverwaltung und Cloudvorbereitung

Die linke Navigation ist auf **288 px Desktop / 295 px Mobil** verbreitert und zeigt einheitliche SVG-Icons sowie grafische Aufklapppfeile. Auf der neu gestalteten Startseite stehen Immobilienkarten mit Anlegen, Archivieren, Wiederherstellen und sicherem Entfernen **ausschließlich völlig leerer Objekte**. Wohnungen und fiktive Jahresabrechnungen können im neuen Objekt angelegt werden. Die Jahresübersicht ist **strikt objektbezogen**, ohne Objektfilter.

Das überarbeitete Modell enthält stabile IDs, getrennte Versionen für Objektstamm und Jahresstände, unveränderliche historische Abrechnungsdaten, Löschmarkierungen, Rückwärtskompatibilität zum 0.7-Portfolioschlüssel und einen providerneutralen Dreiwege-Synchronisationsplaner mit Konflikterkennung. Ein zweiter Browser-Tab kann den gespeicherten Stand nicht unbemerkt überschreiben.

**Keine aktive Cloud-Synchronisierung.** Google-Zugang, Cloud-Adapter, sichere Echt-Daten-Origin, transaktionale Synchronisierung und Cloud-Backup fehlen und sind in den späteren Entwicklungsstufen umzusetzen. **Keine echten Mieterdaten in diese öffentliche Demo eingeben.**

Technischer Vertrag: [Fachtest 0.9 – Datenmodell und Navigation](docs/STAGE_0_9_DATA_MODEL_NAVIGATION_2026-11-22.md).

## Fachtest 0.8 – einheitliche Immobiliennavigation (22.11.2026)

Die doppelte linke Navigation aus Fachtest 0.7 wurde durch eine einzige Hierarchie ersetzt: **Startseite → Immobilien → Stammdaten/Jahresabrechnungen**. Darunter stehen **Analysen** und **Dokumente & Archiv** als getrennte objektübergreifende Einstiege. Die Sidebar wurde verbreitert, Schriften und Klickflächen sind größer. Das weiterhin synthetische Portfolio und der Speicherschlüssel bleiben unverändert; bestehende Musterstände werden nicht migriert oder gelöscht. Die globalen Auswertungen und der Dokumentenindex sind noch nicht vollständig implementiert.

Details: [Fachtest-0.8-Navigation](docs/STAGE_0_8_NAVIGATION_2026-11-22.md).

## Wichtige Hinweise

- Die Demo ist **nicht** mit dem echten NK-Pro-Rechenkern verbunden. Angezeigte Umlageergebnisse sind ausdrücklich vereinfachte Beispiele.
- Es gibt **keinen Import von NK-Pro-1.0-Daten**, keine echte Google-Drive-Synchronisation, keinen rechtlich belastbaren Abschluss und keine produktive Druck-/Brief-Freigabe.
- Der aktuelle Fachtest speichert synthetische Portfolio-Daten ausschließlich unter `nkpro2_synthetic_portfolio_0_7_v1`. Die Anwendung liest oder schreibt keine NK-Pro-1.0-Schlüssel.
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
- **17 bestehende Menüpunkte und 4 interne Seiten** sowie **44 Qualitätsregeln** sind in einer [maschinell geprüften Ist–Soll-Matrix](docs/MIGRATION_COVERAGE.md) vollständig einem Zielbereich zugeordnet. Zehn Regeln sind nur experimentell für synthetische Fälle umgesetzt (34 noch nicht portiert).
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

- [Qualitätskatalog](docs/QUALITY_MIGRATION.md): alle **44 Original-Regeln** mit unveränderten Metadaten und Zielseiten, direkt gegen den eingefrorenen Original-Registry-Code geprüft. **7** zentrale Stammdaten-/Mietzeitraumprüfungen und **3** neue Personenzahl-/Kostenpflichtprüfungen sind synthetisch ausführbar; die neuen drei sind gegen tatsächlich ausgeführte Originalregeln auf synthetischen Szenarien verglichen. Bei vorhandenem Kostenmodell bleiben **34** Regeln `not-run`. Produktivfreigabe technisch nicht möglich.
- [Dokumenten-Datenprüfung](docs/LETTER_DATA_PREFLIGHT.md): Empfänger-, Kostenzeilen-, Cent-Summen- und Adressprüfung, Signatur/Fingerprint, Sammelprüfung auf fehlende Empfänger. Abrechnungssaldo bei synthetischen Fällen gegen den echten Originalbrief-Datenkern verglichen. **Keine** echte A4-/PDF-/Druckfreigabe.
- [Schema-5-Projektionsadapter](docs/SCHEMA5_BRIDGE.md): kontrollierte, schreibgeschützte Modellüberleitung für **ausschließlich synthetische** Altdatenfelder. Unklare Wohnungs-/Zähleridentitäten, fehlende Werte und nicht migrierte Messperioden werden sichtbar als Issues ausgegeben. Kein Import, keine Speicherung, keine Echtdaten-Verarbeitung.

**Betriebsschutz:** Die alte App `cz100000/NK-Pro` wird nicht beschrieben. Auch nach diesen Entwicklungsschritten bleibt NK-Pro 2.0 ausschließlich Designprototyp und geschütztes Testlabor; für die Abrechnung 2025 wird weiterhin der alte, fachlich zu prüfende Produktivstand verwendet.

## Technischer Entwicklungsmonitor

Eine separate, nicht in die Abrechnungsnavigation eingreifende Seite zeigt den **tatsächlichen letzten erfolgreichen CI-Teststand** und die weiterhin gesperrten produktiven Freigabe-Gates:

**[Entwicklungsstand](https://cz100000.github.io/NK-Pro-2.0/status.html)**

Die Seite wird bei jedem GitHub-Pages-Deployment aus dem vollständig bestandenen Testprotokoll automatisch erzeugt. Sie zeigt ausschließlich aggregierte Test-/Modulmetadaten, **keine Mieter-, Abrechnungs- oder Speicherinhalte**. Der Veröffentlichungsworkflow lässt nur acht ausdrücklich freigegebene öffentliche Dateien durch; die experimentellen Fachmodule und gepinnten Legacy-Quellen bleiben ausschließlich im Code-/Testrepository.

## Synthetische End-to-End-Prüfkette und Original-Qualitätsvergleich

Der neue [integrierte Testläufer](docs/SYNTHETIC_PIPELINE.md) kombiniert erstmals Datenstrukturprüfung, 44-Regel-Statuskatalog, Wasserabrechnung, Techem-Einzelfälle und Brief-Datenkontrolle in einem **gemeinsamen, nicht produktiven** Prüfbericht. Kritische Mängel, zu begründende Differenzen und bewusst nicht ausgeführte Regeln bleiben unterscheidbar. Quellenbezogene Prüfentscheidungen werden bei jeder Datenänderung ungültig.

Zusätzlich vergleichen [separate Laufzeittests](tests/quality-legacy-execution.test.cjs) die ersten sieben synthetischen Stammdaten- und Mietzeitraumprüfungen gegen die tatsächlich ausgeführte `evaluateFactual()`-Funktion der eingefrorenen Originalversion V99.4.86. Drei weitere Regeln werden in [Kosten-Paritätstests](tests/quality-cost-phase-parity.test.cjs) gegen die Originalausführung getestet. Beide Testgruppen decken ausgewählte Normal-/Fehlerfälle ab und ersetzen **keine vollständige Paritätsabnahme mit Echtdaten**.

**Release-Grenze unverändert:** Keine echten Mieterabrechnungen, keine vollständigen 44 Prüfungsberechnungen, keine echten A4-Briefe und keine produktive Archivierung. Die bestehende Anwendung auf `cz100000/NK-Pro` bleibt erhalten.

## Funktionsmuster 0.3 · 22. November 2026

Erste reale Verbindung der bestehenden 7-Wohnungen-Demo mit sechs gegen NK-Pro V99.4.86 synthetisch verglichenen Umlageverfahren. Der neue [synthetische Browseradapter](synthetic-billing.js) verwendet die testgesicherte [Referenzformelportierung](experimental/settlement-cost.js), die als einzige experimentelle Datei ausdrücklich auf Pages ausgeliefert wird. Die bestehenden Oberflächen für Kosten, Zähler, Vorauszahlungen, Umlage, Nachweis und Prüfung verwenden jetzt diese Formeln. Wohnungsdetails bieten Personen, Miettage und Aktivstatus. Ein Mustermieter pro Wohnung; noch keine echten Mietwechsel oder Techem-Einzelabrechnung.

Zahlungen, Umlagebeträge und Brutto-/Vermieter-/Restdifferenzen werden in Cent nachgerechnet; nicht zugeordnete Anteile bleiben als **kritische Musterprüfpunkte** sichtbar, statt sie unbemerkt zu verteilen. Dies ist weiterhin ein reiner synthetischer Fachtest, keine Produktivabrechnung. Die Originalskripte aus `tests/reference`, Nutzer-Backups und sämtliche weiteren experimentellen Komponenten bleiben außerhalb der öffentlichen Demo.

## Wasser 2025 – erster zusätzlicher Erfassungsbaustein

Die quellgetreue Bestandsprüfung ergab, dass NK-Pro V99.4.86 **getrennte KW-/WW-Zählerstände und Ablesedaten je Fall**, Hauszähler-Start/Ende und Ablesedaten, Wasserwerksrechnungsverbrauch, zwei Differenzabgleiche, manuell überschreibbaren Preis je Einheit und Bemerkungen vorsieht. Der zusätzliche synthetische Domänenbaustein `water-detail.js` berechnet und prüft getrennte Mengen, Quellen und vierstelligen Einheitspreis, ohne unvollständige Werte auf null zu setzen. Bei älteren Demodaten werden die alten Einzelzählerwerte nur als KW-Entwurf erhalten; WW, Zähler- und Historiennachweise bleiben offen und müssen neu geprüft werden. Eine echte 2025-Abrechnung ist noch gesperrt.

## UI-Fachtest 0.4 · Getrennte Wasserzähler und Preis je m³

Nach Vergleich mit den Modulen `ui-metering.js`, `ui-costs.js` und `cost-actions.js` der eingefrorenen NK-Pro-1.0-Referenz wurden folgende **synthetische UI-Funktionen** ergänzt: KW/WW je Musterwohnung mit eigener Zählernummer, Anfangs-/Endstand, Ablesedatum und Notiz; Hauszählernummer und -stände, Rechnungsverbrauch und Rechnungsbemerkung; Kontrollabgleich **Rechnung ↔ Haus** und **Haus ↔ Wohnungszähler**; Wasserpreis in €/m³ auf der Verbrauchsseite und Preis je Einheit in der Kostenliste. In jedem Kostenformular steht jetzt ein optionales mehrzeiliges Notizfeld (maximal 2.000 Zeichen); Verbrauchskosten unterstützen zudem den automatisch ermittelten Vier-Nachkommastellen-Preis und manuelle Übersteuerung. Eine manuelle Preisänderung verändert die synthetische Referenzverteilung und zeigt offen verbleibende Kosten an.

**Noch nicht gleichwertig mit NK-Pro 1.0:** echte Zählerstammdaten und Messperioden, Vorjahresübernahme, Zählerwechsel, Messwerte mit Dezimalstellen/Originalrundung für die reale 2025-Abrechnung, weitere Verbrauchskostenarten mit eigenen Zählergruppen, Mieterwechsel und abschließende Fach-/Briefprüfung. Bisherige gespeicherte Demowerte werden ohne erfundene Warmwasserstände als unvollständiger Entwurf übernommen. Die Demo kann weiterhin gefahrlos zurückgesetzt werden; Originaldaten werden nicht gelesen.

## Abgleich mit der bisherigen NK-Pro-1.0-Funktionsvielfalt

Die [vollständige, priorisierte Funktions-Tiefenanalyse vom 22.11.2026](docs/LEGACY_FUNCTION_GAP_AUDIT_2026-11-22.md) vergleicht die Originalmodule mit dem synthetischen Fachtest 0.4 und legt die nächste Umsetzung in integrierten Abrechnungsstufen fest. Es werden **keine echten Mieterdaten** in die Demo übernommen.

## Fachtest 0.5: gemeinsame Entwicklung von Stufe 1 und Stufe 2

Die Funktionen werden auf einem **gemeinsamen synthetischen Datenmodell** entwickelt: Objektstamm, Wohnungen, mehrere Mietverhältnisse je Wohnung, Leerstands-/Privatanteilslogik, Vorauszahlungen je Abrechnungsfall, fallbasierte Umlagen, gesonderte Verbrauchsmengen und Kostenberechtigungen, getrennte KW/WW-Messperioden, Zählerwechsel und unveränderte Rohablesungen. Der neue, schlanke Fünf-Bereiche-Entwurf wird beibehalten. Die neue Anwendung ist noch nicht produktionsreif und noch nicht vollständig fachparitätisch. [Siehe Scope und Abnahmegates](docs/STAGES_1_2_INTEGRATED_2026-11-22.md).

## Verbindlicher Stufenplan 3–7 nach dem Fachtest 0.5

Der [aktualisierte Gesamtentwicklungsplan mit allen 41 Änderungswünschen](docs/ENTWICKLUNGSPLAN_3_BIS_7_FEEDBACK_41_2026-11-22.md) ist die maßgebliche Vorlage für weitere Arbeiten an Stufe 3–7. Bestehende Stufen-1/2-Lücken werden mit Stufe 3 geschlossen. Dieser Planungsstand bedeutet **keine Implementierung der 41 Änderungen**; der öffentlich verfügbare Fachtest bleibt 0.5.

## Fachtest 0.6 · Stufen 3 und 4 zusammengeführt

Die [veröffentlichte Integrationsversion 0.6](https://cz100000.github.io/NK-Pro-2.0/?v=0.6) verbindet erstmals die schrittweise Erfassung von Mietverhältnissen, Vorauszahlungen, Rechnungen, Wasser- und Techem-Einzelwerten mit einer vorgelagerten Qualitätssicht, vorläufigen reinen Ergebnissen und Mieterbrief-Entwürfen. [Aktueller Fertigstellungsgrad, noch offene Fach-/Druck-/Qualitätsgates](docs/STAGES_3_4_INTEGRATED_2026-11-22.md). **Noch kein vollständiger Abschluss der beiden Stufen, keine Echtdaten.**

## Fachtest 0.7 – drei echte synthetische Objekt-/Jahreskontexte

Die [0.7-Web-Demo](https://cz100000.github.io/NK-Pro-2.0/?v=0.7) zeigt drei fiktive Objekte mit **7/3/2 Wohnungen** und **2023/2024** je Objekt sowie einen offenen Entwurf 2025 für Objekt A. Dauerhafte Stammdaten werden zentral gepflegt und in kontrollierte Jahres-Snapshots projiziert. Der [Architektur-, Test- und Freigabebericht](docs/STAGE_0_7_OBJECT_EXPLORER_2026-11-22.md) dokumentiert offene Alt-App-Funktionslücken und das explizite Verbot von echten Daten im öffentlichen Test.
