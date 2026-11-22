# NK-Pro 1.0 → NK-Pro 2.0 · Funktions-Tiefenanalyse und Migrations-Backlog
**Stichtag:** 22.11.2026 · **Art:** statischer Quellcode-/Funktionsvergleich (keine vollständige Browser-End-to-End-Abnahme) · **Version 1.0:** V99.4.86, Commit a089e1fe660dd5502799560efe2bc4b65a09f278 · **Version 2.0:** Fachtest 0.4, Commit 7b984cd4dfa611cc1a56b9493e52827d75cc0241.

**Verbindliche Leitlinie:** NK-Pro 1.0 nicht verändern. Die fünf freigegebenen Hauptbereiche der schlanken 2.0-UX bleiben erhalten. Funktionen aus 1.0 werden fachlich vollständig integriert, aber nicht durch Kopieren der bisherigen dicht belegten Seiten. Sämtliche Tests im öffentlichen Repo bleiben synthetisch; vor Echtdatenmigration ist eine **andere Browser-Origin** erforderlich (anderes Repository-Verzeichnis unter github.io reicht nicht).

## Untersuchungsbasis
- Original-Navigation: js/navigation.js, js/ui-navigation-pages.js; bestehende Maschinenmatrix contracts/legacy-coverage.json (21 zugeordnete Legacy-Seiten).
- Objekt/Mieter/Perioden: js/object-standard.js, js/master-data-actions.js, js/billing-calculation.js, js/year-transition-actions.js, js/ui-costs.js.
- Kosten/Verbrauch: js/cost-actions.js, js/ui-metering.js, js/ui-individual-values.js, js/meter-master.js, js/meter-readings.js, js/meter-periods.js, js/meter-validation.js, js/billing-review.js, js/cost-reconciliation.js.
- Abrechnung/Qualität/Dokumente: js/billing-workflow.js, js/billing-snapshot.js, js/quality-rules.js, js/quality-system-k4.js, js/document-data.js, js/document-renderer.js, js/ui-documents.js, js/landlord-documents.js.
- Jahre/Analysen: js/analytics-engine.js, js/ui-analytics.js, js/ui-cost-reconciliation.js, js/archive-actions.js, js/archive.js.
- Daten/Verfügbarkeit: js/app-state-persistence.js, js/backup-recovery.js, js/migration.js, js/export-service.js, js/drive-sync.js, service-worker.js, manifest.webmanifest.
- Neue 2.0-Dateien: app.js, synthetic-billing.js, water-detail.js, experimental/*, contracts/legacy-quality-registry.json, tests/*.test.cjs. **Ein Modul im experimentellen Ordner bedeutet keine Integration in den sichtbaren Arbeitsprozess.**

### Status-Legende
**Fehlt**: keine echte 2.0-Funktion; **UI/Simulation**: Ansicht vorhanden, echte Funktion nicht migriert; **Teilweise synthetisch**: Funktion interaktiv, aber nur für Musterdaten mit reduziertem Modell; **Experimentell**: Quellportierung in Node-Tests, nicht in allgemeiner Browser-Domäne; **Vorhanden**: produktionsähnliche 2.0-Funktion (derzeit nur Gestaltungs-/Demoaspekte). Keine Zeile gilt als fachlich abgenommen.

## A. Detaillierte Fachlücken – 57 Arbeitselemente

| ID | 1.0-Quellfunktion | 2.0-Stand | Sollfunktion in schlanker 2.0-UX | Priorität / Originalquelle |
| --- | --- | --- | --- | --- |
| A01 | Objektidentität, Gebäude/Adresse, Datenstandard | UI/Simulation | Objekt → Stammdaten, strukturierter Objekt-Editor, Objekt-ID erhalten | P0 · object-standard.js |
| A02 | Wohnungsliste mit echten IDs, Flächen, Lage, Zimmer, Status und Bemerkung | Teilweise synthetisch | Objekt → Wohnungen; Stammdaten einmalig, Jahresbezug separat | P0 · ui-navigation-pages.js, master-data-actions.js |
| A03 | Historisierte/archivierte Mietverhältnisse und eigenständiger Mieter-Stamm | Fehlt | Objekt → Mietverhältnisse: aktive, beendete, archivierte Fälle | P0 · master-data-actions.js |
| A04 | Adressdaten, Anrede, Rolle, Kontakt, Ein-/Auszug, Personen, Personentage | Fehlt | Mieterdetail-Drawer, Korrektur zeitlich wirksam | P0 · ui-navigation-pages.js |
| A05 | Jahresabrechnung aus Stammdaten erstellen, Werterhalt bei identischer Mieter-ID | Fehlt | Abrechnung → Mietverhältnisse: Übernahmevorschau mit Änderungsprotokoll | P0 · master-data-actions.js |
| A06 | Aktive/inaktive Wohnungen, Leerstand und periodenbezogene Zuweisung | Teilweise synthetisch | Objekt bleibt Stammdatenquelle, Abrechnung zeigt Belegungszeitstrahl | P0 · billing-calculation.js |
| A07 | Privat-/Eigennutzung als regulärer Abrechnungsteilnehmer, separate Analyserolle | Fehlt | Abrechnungslogik ohne Ausschluss, steuerliche Kennzeichnung separat | P0 · billing-calculation.js |
| A08 | Datierte Mieterwechsel, aktive Tage, überlappende Fälle, Zeitanteile | Fehlt | Jahres-Timeline je Wohnung, Teilperioden als eigene Abrechnungsfälle | P0 · billing-calculation.js |
| B01 | Kostenkatalog mit stabilen K-IDs, Aktivierung, freien Kostenarten | Teilweise synthetisch | Gesamtkosten → Katalogauswahl, Freitext, IDs stabil halten | P0 · default-seed.js, ui-costs.js |
| B02 | Kostengruppen einschließlich nicht umlagefähiger Eigentümerkosten | Teilweise synthetisch | Kategorien mit Umlagefähigkeit und Sachgruppen, Details im Drawer | P0 · default-seed.js, cost-actions.js |
| B03 | Abrechnungsart Automatisch/Manuell/Entfällt und Kostenart-Aktivstatus | Fehlt | Kontextabhängige Eingabefelder, kein unnötiges Spaltenmeer | P0 · ui-costs.js |
| B04 | Verschiedene Umlageschlüssel und Datenbasis Miettage/Personen/Fläche/WE/Verbrauch | Teilweise synthetisch (sechs Methoden) | Vollständige Original-Parität je Kostenart samt Unterjahr/Leerstand | P0 · billing-calculation.js |
| B05 | Kostenspezifische Zulassung/Ausschluss pro Mietverhältnis | Fehlt | Kosten-Drawer → „Zuordnung & Ausnahmen“, Matrix nur bei Bedarf | P0 · billing-calculation.js, ui-costs.js |
| B06 | Nicht umlagefähige Kosten, Vermieter-, Leerstands-, Restbeträge und Ausschlussbehandlung | Teilweise synthetisch | Expliziter Vier-Komponenten-Abgleich statt stiller Restverteilung | P0 · billing-calculation.js |
| B07 | Kosten-/Belegnotizen und Preis je Verbrauchseinheit (auto/manuell) | Teilweise synthetisch (0.4) | Notiz zu jeder Kostenart, exakter Rechenpreis vs. Anzeige getrennt | P0 · cost-actions.js, ui-costs.js |
| B08 | Gesamte Kosten je K-ID, zugehöriger Gesamtverbrauch als getrennte Eingaben | Fehlt (Rechnung nur Demo-Hauswasser) | Gesamtkosten → Verbrauchskostenblock und Quelle je Kostenart | P0 · ui-costs.js, cost-actions.js |
| C01 | Physischer Zählerstamm mit Zählernummer, Typ, Einheit, Standort, Identität | Teilweise synthetisch (KW/WW-Nummer) | Objekt → Zähler; Zählerdaten unabhängig von Abrechnung | P0 · meter-master.js |
| C02 | KW-/WW-Zähler je Wohnung mit getrennten Start/Endwerten/-daten | Teilweise synthetisch (0.4) | Abrechnung → Verbräuche mit Einzel-Drawer und Summenzeile | P0 · ui-metering.js |
| C03 | Rohablesungen mit Dezimalstellen, Ableseart, Quelle, Historie | Fehlt | Zählerdetail → Ableseverlauf und Nachweise; Originalwert unverändert | P0 · meter-readings.js |
| C04 | ARB-/Jahres-spezifische Rundungsregel je Anfang/Ende; nur belegter Sonderfall | Experimentell, nicht UI-integriert | Fachadapter entscheidet nach bestätigter Evidenz; Rohwert unangetastet | P0 · billing-calculation.js, experimental/water-2025.js |
| C05 | Hauszählerstand, Rechnungsverbrauch und zwei unabhängige Abgleiche | Teilweise synthetisch (0.4) | Drei KPI-Karten + offener Delta-Nachweis + Begründung | P0 · ui-metering.js |
| C06 | Physische Zuordnung Zähler ↔ Wohnung/Mieter/Periode | Fehlt | Zähler-Sonderfall im Drawer; Zeitraumverlauf statt erzwungener Einzeltabelle | P0 · meter-periods.js |
| C07 | Zählerwechsel, Ausbau-/Einbauablesung, Überlauf | Fehlt | Kontextaktion „Zählerwechsel“ mit Vor-/Nachfolgerbezug und Prüfbeleg | P0 · meter-periods.js |
| C08 | Messperioden, Lücken/Überschneidungen, Fall-Zuordnung | Fehlt | Messperiodenübersicht mit Warnungen je Wohnung | P0 · meter-periods.js, meter-validation.js |
| C09 | Kontrollierte Vorjahresübernahme der End- als Anfangsstände | Fehlt | Vorschau + Identitätsprüfung + explizit bestätigen; nie Endwerte überschreiben | P0 · year-transition-actions.js |
| C10 | Historische KW-/WW-Verbräuche/Ablesungen, Archivvergleich | Fehlt | Zählerdetail → Historie; Abrechnungsjahre in Analysen vergleichen | P1 · ui-metering.js |
| C11 | Weitere Verbrauchskostenarten mit eigenen Zählern und Einheiten | Fehlt | Gleiches Erfassungsmuster für alle Verbrauchskostenarten | P0 · ui-metering.js, meter-master.js |
| D01 | Individuelle Werte pro Abrechnungsfall: Zähler, Menge, Eurobetrag, externe Abrechnung | Experimentell, nicht UI-integriert | Abrechnungen → „Individuelle Werte“ nur wenn nötig, nach Kostenart gruppiert | P0 · billing-calculation.js, ui-individual-values.js |
| D02 | Manuelle Kostenwerte mit Empfänger-/Leerstandsbezug und Summenkontrolle | Experimentell | Detailansicht je Kostenart + Summenabgleich; fehlende Werte nicht nullen | P0 · billing-calculation.js |
| D03 | Externe Heiz-/Warmwasserabrechnung mit Einzelkosten/CO₂/Vermieteranteil | Experimentell | Techem-/Externer-Beleg-Drawer, getrennte Eigentümerposition | P0 · ui-individual-values.js, experimental/external-techem.js |
| D04 | Zählerausnahmen, gesperrte Vorjahresanfänge, Sonderfallfreigabe | Fehlt | Sonderfallbutton an betroffener Zählerzeile statt Dauerspalten | P0 · ui-individual-values.js |
| D05 | Import/Zuordnung individueller Werte und periodengenaue Fallwerte | Experimentell | Validierte Importvorschau, Zuordnungsprüfung, Änderungsprotokoll | P0 · billing-workflow.js |
| E01 | Vorauszahlungen pro Kostenart **und** Mieter, Summenmatrix | UI/Simulation (ein Jahreswert/Wohnung) | Abrechnung → Vorauszahlungen, Matrix aufklappbar und nach Mieter fokussierbar | P0 · ui-costs.js, billing-calculation.js |
| E02 | Kaltmiete Soll/Ist, sonstige Einnahmen, NK-Vorauszahlung | Fehlt | Einnahmen-Details, Unterschiede von Abrechnungsvorauszahlung und echtem Cashflow | P0 · ui-costs.js, analytics-engine.js |
| E03 | NK-Vorjahreskorrekturen und Kaltmietkorrekturen getrennt, Nachweise | Fehlt | Mieter-Drawer → Korrekturen; separater Saldoeinfluss | P0 · billing-calculation.js, ui-costs.js |
| E04 | Neue Vorauszahlungen ab Folgeperiode, Rundung, Mindeständerung, Sicherheitszuschlag | Fehlt | Abrechnung → optional „Vorauszahlungen anpassen“ nach Ergebnis | P1 · billing-calculation.js, ui-documents.js |
| E05 | Kostenprognose und Preisänderung je Kostenart; Druckmodus für Anpassungsbrief | Fehlt | Prognose-Panel mit Berechnung, manuell vs. automatisch | P1 · billing-workflow.js, ui-documents.js |
| F01 | Kompletter Ergebnisrechner mit Mietwechseln, Freigaben, Rundungen und Cent-Parität | Teilweise synthetisch | Ein zentraler Berechnungskern; Originalergebnisse je Fall vergleichen | P0 · billing-calculation.js |
| F02 | Differenz- und Kontenbrücke: mieter-/eigennutzungs-/leerstands-/nichtumlagefähig-/Rest | Teilweise synthetisch | „Kosten und Umlagen abgleichen“: verständliche Gleichung + Drilldown | P0 · billing-calculation.js, ui-billing-allocation.js |
| F03 | Versionierte Fachentscheidungen, Begründung und Entwerten bei Änderung | UI/Simulation | Prüf-/Differenz-Drawer mit Fingerprint und Reopen-Historie | P0 · billing-review.js |
| F04 | 44 Qualitätsregeln (20 Pflicht, 12 Plausibilität, 6 Hinweise, 6 Technik) | 10 experimentell, 34 fehlen; UI nur Simulation | Prüf-Cockpit mit kritisch / Entscheidung / Hinweis / nicht ausgeführt | P0 · quality-rules.js, quality-system-k4.js |
| F05 | Zusätzliche dynamische Prüffälle aus Differenz- und Kostenabgleich | Fehlt | Prüfungen beziehen auch Differenzentscheidungen ein; nicht als „44 fertig“ verstecken | P0 · billing-review.js, quality-system-k4.js |
| F06 | Qualifizierter Abschluss, eingefrorener Snapshot und Schreibschutz | Fehlt (Button simuliert) | „Abschließen“ erst nach voller Qualität und druckfertigen Briefen | P0 · billing-workflow.js, billing-snapshot.js |
| G01 | Vollständige Mieterbriefe mit Kosten, Verteilungsbasis, Saldo, Korrekturen | UI/Simulation (ein Musterbrief) | Abrechnungen → Briefe Vorschau; Dokumente & Archiv → finale Ausgabe | P0 · document-data.js, document-renderer.js |
| G02 | Absender, Empfängeranschrift, Anrede, Texte, Bank, Frist, individuelles Briefprofil | Fehlt | Globale Briefvorlage + persönliche Ausnahmen im Detailpanel | P0 · ui-documents.js |
| G03 | Vollständigkeits-/Längen-/A4-Druck-/Layout-Prüfung pro Empfänger | Fehlt (manuelle Demo-Checkbox) | Sammel-Preflight, Probleme mit direktem Sprung zur Briefursache | P0 · document-data.js, ui-documents.js |
| G04 | Sammeldruck aller Briefe, Seitenvorschau/Skalierung und optionale Anlage | Fehlt | Briefliste → Sammel-PDF/A4-Druck, Druckprüfung je Empfänger | P0 · ui-documents.js, document-renderer.js |
| G05 | Vermieterinterne Jahres-/Wohnungsblätter inkl. Leerstand/Restpositionen | Fehlt | Dokumente & Archiv → „Interne Unterlagen“ | P1 · landlord-documents.js |
| H01 | Jahresabrechnung erstellen, Zeitraum wählen, alte Jahre ansehen | Fehlt | Übersicht → Jahreswahl; Abrechnungen → Anlage-/Öffnungsdialog | P0 · year-transition-actions.js, ui-navigation-pages.js |
| H02 | Vergangene Stände archivieren; schreibgeschützte Archivansicht | UI/Simulation (leeres Archiv) | Dokumente & Archiv → Jahresliste / Ansicht / Download | P0 · archive-actions.js, billing-snapshot.js |
| H03 | Gezielte Archivkorrektur, Reopen, Aktualisieren, Historie/Bestätigung | Fehlt | Kontextaktion mit Sicherungs- und Korrekturprotokoll | P0 · archive-actions.js |
| H04 | Jahreswechsel: Vorjahreszahlungen/Zählerwerte mit kontrollierter Übernahme | Fehlt | „Neues Jahr“ als Assistent mit Übernahmevorschau | P0 · year-transition-actions.js |
| H05 | Aktueller Bearbeitungszustand vs. finalisiert vs. Archiv plus Änderungswarnung | Fehlt | konsistenter globaler Bearbeitungsmodus und Status-Chips | P0 · billing-context.js |
| I01 | Mehrjahres-Analyse: Kosten, Umlage, Beteiligte, Verbrauch, Anomalien | UI/Simulation | Analysen → Nebenkosten, Jahresvergleich, Drilldowns und Quellen | P1 · analytics-engine.js, ui-analytics.js |
| I02 | Wasser-Mengen-/Preiszerlegung sowie Zählervergleich über Jahre | UI/Simulation | Analysen → NK → Wasser-Detail, Verbräuche/Preise getrennt | P1 · analytics-engine.js |
| I03 | Finanzsicht: Ist-/Soll-Mieten, Einnahmen, Objektkosten, Finanzierung, Investition | UI/Simulation | Analysen → Finanzen, echte Ergebnis-/Cashflow-Brücke | P1 · analytics-engine.js |
| I04 | Tatsächlich datierte Zahlungsflüsse, Abrechnungskosten-Overrides und Zuordnung | Fehlt | Analysen → Finanzdaten / Kosten- und Umlagenabgleich (Spezialansicht) | P1 · cost-reconciliation.js |
| I05 | Steuerüberleitung: vermietet, privat, Leerstand, Eigentümerrest, nicht klassifiziert | UI/Simulation | Analysen → Steuern mit belegbarer Aufteilungslogik | P1 · analytics-engine.js |
| I06 | Steuerjahr-Klassifikation und druckbare Steuerwerte **als neue V2-Erweiterung** | Auch in 1.0 nur teilweise (taxYear und taxValue meist offen) | Steuerwerte erst bei eindeutiger Zuordnung ausweisen, keine implizite Steuerberatung | P1 · analytics-engine.js |
| I07 | Analyse-Drilldowns, Diagramme, Vergleiche, CSV/Excel/PDF-Druck | UI/Simulation | gleiche UX-Karten + tiefe Detail-Ebenen, Filter/Exports | P1 · ui-analytics.js |
| J01 | Integritätsgeprüfte lokale Speicherung, Datenversionsvertrag und Speicherdiagnose | UI/Simulation (ein lokaler Demo-Key) | getrennte sichere Speicherengine, nachvollziehbare Fehler | P0 · persistence.js, app-state-persistence.js |
| J02 | JSON-Import mit Prüfbericht, Migrationspfad Schema 1–5, Altbestandszuordnung | Experimentell (Inspektor, kein Import) | sicherer Importassistent mit Dry-Run, Checksummen, Deltaansicht | P0 · migration.js, app-state-persistence.js |
| J03 | Rücksetz-/Restore-Checkpoint, Vor-Migrationsbackup, Rollback | Fehlt | Einstellungen → Daten & Sicherung, Restore nur bestätigt | P0 · backup-recovery.js, app-state-persistence.js |
| J04 | Exportpakete: aktuelles Jahr, Gesamtbestand, CSV, Prüfprotokoll, Archivindex | Fehlt | Dokumente & Archiv → Export, klarer Inhalt und Umfang | P0 · export-service.js |
| J05 | PWA/Service Worker/Manifest, Offline- und Updatepfad | Fehlt | im Hintergrund, nachvollziehbarer Offline-Status | P0 · service-worker.js, manifest.webmanifest |
| J06 | Google Drive: private Ablage, lokale Sicherung, Pull/Push, Konfliktsperre | Fehlt | Einstellungen → Synchronisierung, niemals still überschreiben | P1 · drive-sync.js |
| J07 | App-Selbsttest, Release-Audit, Laufzeit- und Druckdiagnostik | Fehlt (GitHub-CI-Teilstücke) | Einstellungen → Systemstatus, zusätzlich automatisierte Gates | P0 · diagnostics.js, runtime-diagnostics.js |
| J08 | Datenschutz: isolierte Browser-Origin vor Übernahme personenbezogener Daten | Fehlt (2.0 derzeit gleicher github.io-Originpfad wie 1.0) | **Hosting separat** bevor echte Backups/Personen geladen werden | P0 · 2.0-Architekturvorgabe |

## B. Auffällige fachliche Paritätsfallen
1. **Die Browser-Demo ist keine zweite produktive App.** Nur ein synthetischer Teilnehmer je Wohnung, kein echter mehrjähriger Datensatz, kein voller Briefsatz, keine Abschluss-/Archiv-Transaktion.
2. **Verbrauchspreis:** In 1.0 zeigt cost-actions.js einen auf vier Stellen gerundeten Preis an, billing-calculation.js rechnet bei automatischem Wasserpreis aber mit dem exakten Quotienten Kosten / dokumentiertem Gesamtverbrauch; die Anzeige-Rundung darf die Mieteranteile nicht ändern. Manuell vorgegebener Preis ist gesondert zu behandeln.
3. **Wasser-2025-Sonderfall:** Bei bestätigter Referenz werden ursprüngliche KW-/WW-Rohstände aufbewahrt, Anfang/Ende für die Rechnung getrennt auf ganze m³ gerundet. In 2.0 werden derzeit nur ganzzahlige Demowerte erfasst; das ist keine Datenparität.
4. **Mietverhältnis statt Wohnung als Rechnungsempfänger:** Bei unterjährigem Wechsel müssen zwei Abrechnungsfälle derselben Wohnung unterschiedliche Zeiträume, Vorauszahlungen, Verbrauchszuordnungen und Briefe haben können.
5. **Privatanteil ist kein Ausschluss:** Nutzungsart kann für Analysen markiert sein, darf aber in der Nebenkostenabrechnung weder als fehlender Teilnehmer noch als leerstehend behandelt werden.
6. **Verteilungslogik ohne stille Owner-Umwidmung:** Leerstandskosten, dokumentierte nicht umlegbare Eigentümerkosten, nicht zugeordnete Kosten und explizit genehmigte Differenzen sind getrennte Kategorien. Owner-Rest darf fehlende Abrechnungswerte nicht kaschieren.
7. **Externe Techem-Kosten:** Ein gesondert nicht umlegbarer Vermieterrest bleibt bei der externen Abrechnung und ist weder Mieter, Privatanteil noch Leerstand zuzuweisen.
8. **Qualitätsregel-Inventar ≠ vollständiges Prüf-Cockpit:** Der 1.0-Orchestrator ergänzt dynamische Differenz- und Kostenprüffälle zu den 44 deklarierten Regeln. 10 in synthetischer Teilprüfung ersetzen diese Fachlogik nicht.
9. **Briefe sind Abschlussvoraussetzung, Versand nicht:** Das Abschluss-Gate benötigt vollständige, nachweisbar passende und druck-/versandbereite Briefe, nicht den tatsächlichen Briefversand.
10. **Cashflow ist Ist-Zahlungsfluss:** Jahresmieten und Vorauszahlungssoll reichen nicht als Cashflow-Datenquelle. Die 1.0-Analyse liefert ohne vollständig datierte Ein- und Auszahlungen bewusst keinen belastbaren Cashflow.
11. **Steuerkennzahlen sind teilweise Konzept in 1.0:** taxValue, taxCategory und taxYear werden in analytics-engine.js nicht automatisch belastbar gefüllt. 2.0 benötigt hier zusätzliche neue Facharbeit über reine Parität hinaus.

## C. Ziel-UX: fünf Hauptbereiche, progressive Offenlegung
1. **Übersicht:** Objekt-/Jahresauswahl, Status „in Bearbeitung / prüfbar / abgeschlossen / archiviert“, drei Kernkennzahlen, nächste konkrete Aufgabe, nur eine hervorgehobene Hauptaktion.
2. **Abrechnungen:** horizontaler Prozess „Mietverhältnisse → Kosten → Verbräuche → Individuelle Werte (bedingt) → Vorauszahlungen → Umlage → Prüfen → Briefe“. Keine Daueranzeige seltener Spezialtabellen; jeweilige Detail-Panels zeigen Ausnahmen, Quellen, Historie. Bei Kosten und Wasser bleiben kurze Tabellen mit KPIs.
3. **Objekt:** Sekundäransichten „Objektdaten | Wohnungen | Mietverhältnisse | Zähler“. Im Objekt werden Zählerstamm/Zuordnung gepflegt; Abrechnungen bearbeiten die periodischen Ablesungen. Keine doppelten Mieterstammdaten.
4. **Analysen:** drei gleichwertige Subtabs „Nebenkosten | Finanzen/Cashflow | Steuern“, jeweils KPI-Zeile, 1–3 aussagekräftige Diagramme, explizite Datenqualität, umschaltbare Jahre und Drilldown. Kein Abrechnungscockpit im Analysebereich.
5. **Dokumente & Archiv:** vier Untergruppen „Briefe | Interne Unterlagen | Export & Sicherung | Jahresarchiv“. Gesperrte Dokumente bleiben erkennbar, finale Fassungen dokumentiert.
6. **Systemfunktionen sind kein sechster Navigationspunkt:** Datenmigration, Drive und Systemdiagnosen liegen in einem klar benannten Einstellungs-/Systemmenü; technische Expertenregeln sind dort erreichbar.

**Komponentenvertrag:** Eine fachliche Berechnung liefert nur Daten und Prüfstatus; UI-Listen/Karten/Drawer/Tabellen sind Darstellung. Kein direkter Domänenzugriff auf LocalStorage oder Drive aus UI-Formularen. Formularänderung → validierte Transaktion → Daten-Snapshot → Berechnung → Prüffingerprints → UI aktualisieren. Unbekannt/fehlend ist nie Null oder bestanden.

## D. Integrierter Umsetzungsplan (ursprünglicher Punkt 4 + Ist–Soll-Inventar)

| Stufe | Fachlicher Fertigwert, nicht nur Backend-Code | Zu schließen | Abnahmetest |
| --- | --- | --- | --- |
| 1: **Datenfundament** | Synthetische 7-Wohnungs-Abrechnung mit getrennten Mietverhältnissen/Zeiträumen/Stammdaten und transaktionalem Speicher | A01–A08, H01/H05, J01 | zwei Mietverhältnisse je Wohnung, Privatanteil und Leerstand; kein Verlust beim Speichern/Laden |
| 2: **Kosten & Wasser vollständig** | Alle Kostenarten und Umlageverfahren, physische KW/WW-Zähler, Ableseperioden, Sonderfälle, Vorjahr und Haus-/Rechnungsabgleiche | B01–B08, C01–C11 | synthetische Golden-Master-Parität mit altem Rechenkern, Rohwerten, Zählerwechsel, Null-/Fehlwerten |
| 3: **Individuelle Werte & Salden** | Techem/externe Belege, Einzelwerte, Vorauszahlungsmatrix, Korrekturen, Transparenz über Eigentümer-/Leerstandsrest | D01–D05, E01–E03, F01–F03 | jede Kostenart/Fall/Ownerposition centgleich; keine versteckten Restkosten |
| 4: **Qualität & Briefe** | 44 Regelgruppen und dynamische Prüfungen; Brief je abrechenbarem Fall, Sammeldruck, Druckpreflight, finale Freigabe | F04–F06, G01–G04 | Abschluss nur bei vollständig geklärten Prüfungen und richtigen versandbereiten Briefen |
| 5: **Archiv & Datenmigration** | immutable Abschlusssnapshot, Jahreswechsel, sichere JSON-Migration und Restore; **separate Origin vorher** | H02–H04, J02–J05, J08 | Testimport 1.0 → Berechnung → Druck → Archiv → Restore → Byte-/Cent-Abgleich; keine Änderung 1.0 |
| 6: **Vollparität & Analyse** | Vorschau neuer Vorauszahlungen, Vermieterblätter, NK-/Finanz-/Steuermehrjahresanalyse, Cashflow- und Belegabgleich, Exporte | E04–E05, G05, I01–I07 | historisierte Quellen, echte Cashflow-Istdaten, Steueranteile und Datenlücken nachvollziehbar |
| 7: **Synchronisierung & Betriebsabnahme** | Google Drive mit Konflikterkennung, Offline/PWA, Backup-Diagnostik, systematische Regression | J06–J07 plus End-to-End | Offline, zwei Geräte/Konflikt, Recovery, A4-Druck, Browser-/Mobiltests, Go/No-Go |

**Go/No-Go für 2025:** Freigabe frühestens nach erfolgreichen Stufen 1–5 mit vollständigen Abschlussprüfungen (auch wenn Stufe 6/7 noch geplant sind, ist bei fehlendem verlässlichen Offline-/Backup-Betrieb trotzdem kein produktiver GO zulässig). Die alte App bleibt produktiv, bis 2.0 in einem isolierten Origin mit *ausschließlich lokal* eingespielten echten Daten nach fachlicher und technischer Abnahme funktioniert.

## E. Priorisierte nächste Entwicklungsarbeit
1. Als **nächstes direkt umsetzen**: getrennte Mieter-/Belegungsfälle (Mieterwechsel, Privatnutzung, Leerstand), Jahr/Periode und Objektstammdaten — ohne den bestehenden 0.4-Look zu verändern.
2. Parallel: zentrale **Rechen- und Quellenverträge** definieren; bestehende sechs synthetische Referenzverfahren ersetzen keine vollständige Fall- und Kostenparität.
3. Danach: Zählerstamm, datierte Rohablesungen, Vorjahresübernahme, Zählerwechsel, konkrete 2025-Rundungsentscheidung; Verbrauchs-UI als kompaktes Dashboard + Meter-Drawer.
4. Anschließend: Techem-Einzelwerte, Kostenberechtigung, Vorauszahlungsmatrix, Eigentümerrest und Überleitungs-/Prüflogik in einem integrierten Referenzfall.
5. Nicht parallel realisieren: Echtdatenimport in die aktuelle github.io-Demo-Origin. **Erst technisch isolieren.**

*Diese Matrix zeigt vorhandene Quellcodefunktionen und sichtbare 2.0-Funktionsgrenzen, keine bestätigte vollständige Laufzeitparität. Bei späteren Detailprüfungen können zusätzliche Spezialfälle zu ergänzen sein.*
