# Roadmap für NK-Pro 2.0

## Fachtest 0.13 · UI-Korrekturen und Originalbriefmigration (22.11.2026)

- [x] Doppelte Zähleranlage entfernt; Primärbutton pro Wohnung rechts, mit vorausgewähltem Wohnungsbezug.
- [x] Status und Aktion als zwei physisch getrennte Tabellenspalten in allen betroffenen Jahresansichten.
- [x] Gesamtkosten- und Ergebnistabellen verdichtet, mobile Overflow-Container berücksichtigt.
- [x] Katalogbezeichnungen in Anzeige und bei Bearbeitung aus der K-Code-Quelle abgeleitet.
- [x] Vorauszahlungsbegriffe präzisiert; redundanten allgemeinen Hauszähler-Button entfernt.
- [x] Vollständigen Original-AP13-DIN-A4-Dokumentrenderer und internen Vermieter-A4-Renderer aus NK-Pro 1.0 unverändert innerhalb isolierter Module eingebunden.
- [x] Originalquellen als Referenzen gepinnt, Git-Blob-SHA sowie bytegetreue Quelle im Adapter testbar.
- [x] Drei-Bereichs-Briefverwaltung: Empfänger, Original-A4-Vorschau und Brief-/Zahlungseinstellungen. Persönliche Anreden, Textbausteine, Zusatzblatt, Schwarzweiß, Zoom, Einzel-/Sammeldruck, PDF über Browser und interne Vermieterunterlagen.
- [x] Test-Sicherheitskennzeichnung und Pflichtdaten-Preflight vor Musterbriefdruck.
- [ ] Fehlende Kostenart-spezifische Ist-Vorauszahlungsverteilung und automatische zukünftige Vorauszahlungsanpassung fachlich portieren.
- [ ] Gesamte alte Korrektur- und Regelwelt sowie verbindlichen 1.0-gegen-2.0-PDF-Bildvergleich nachholen.
- [ ] Produktive Echt-Daten-Freigabe, Google-Sync, Backup/Restore, Freigabe und Versand weiterhin gesperrt.

[Technische Details 0.13](STAGE_0_13_UI_LETTER_MIGRATION_2026-11-22.md)

## Fachtest 0.12 · Jahresabrechnungs-Workflow und konsistente Bearbeitung (22.11.2026)

- [x] „Jahresabrechnungen“ im Baum öffnet das objektbezogene Jahresverzeichnis; separater „Alle Jahre“-Zweig entfernt.
- [x] Gemeinsamer Bearbeiten-/Ansehen-Stil in Jahreslisten, Vorauszahlungen, Gesamtkosten, Wasser/Techem und weiteren Verbräuchen.
- [x] Monatlicher/jährlicher Sollbetrag mit exakter zeitanteiliger Berechnung und Woche/Monat/Jahr-Vorschau; Ist-Eingänge separat als Zeitraumssumme oder tatsächlich gebuchte Monatsbeträge × Anzahl, ohne Soll=Ist-Unterstellung.
- [x] Gesamtkostenliste konsolidiert; Status vor Bearbeiten, inaktiver/gelöschter Kostenstatus ausschließlich im Bearbeitungsdialog mit Bestätigungsprüfung.
- [x] K002/K003-Wasser-Abwasser-Abgrenzung transparent, K006 Kombiheizung und K009 Müll; Original-Katalog statt eigenständiger neuer Kategorien für bereits bekannte Kosten.
- [x] Rechnungsmenge für verbrauchsabhängige Positionen erfasst und Live-Einheitspreis aus Nettoumlage/Rechnungsmenge berechnet; Mieter und Wohnungen standardmäßig einbezogen, ausdrücklich gespeicherte Ausschlüsse bleiben erhalten.
- [x] Kaltwasser hellblau, Warmwasser hellorange, Gesamtverbrauch hervorgehoben. Status Nicht erfasst/Unvollständig/Vollständig neben Edit-Aktion, soweit fachlich beurteilbar.
- [x] Ergebnisansicht als Kostengruppen-Matrix je Wohnung/Mietverhältnis, Gesamtkosten, Ist-Vorauszahlungen und Saldo – ohne Aktion/Brief-Shortcut.
- [x] Prüfen-Anzeige ohne zusätzliche Entwurfsblockade; Finalisierung nach wie vor gesperrt, solange Originalregeln fehlen.
- [ ] **Briefe** werden in einer separaten Runde bearbeitet; keinerlei produktive Freigabe und kein aktiver Google-Sync.
- [ ] Weitere fachliche Bestandsmigration/Originalparität inklusive historischer Zählerstände, Detailprüfungen und revisionssicherem Cloudbetrieb ausstehend.

Details: [STAGE_0_12_ANNUAL_WORKSPACE_2026-11-22.md](STAGE_0_12_ANNUAL_WORKSPACE_2026-11-22.md).

## Fachtest 0.11 · Konsistentes Objekt-UI und sichere Zähleraktionen (22.11.2026)

- [x] Startseite und Objekt-/Globalüberschriften typografisch stärker hervorgehoben; Objektnamen etwas größer und normal gewichtet, Stammdaten/Jahresabrechnungen ebenfalls normal.
- [x] Startseite zu kompakter Immobilienliste umgebaut; aktive/archivierte Objekte und bestehende Verwaltungsaktionen bleiben erhalten.
- [x] Querverlinkungen aus der Objektstammdaten-Ansicht entfernt; Navigation bleibt auf den linken Baum konzentriert.
- [x] Einheitliche wiederverwendbare Bearbeiten-Komponente für Objektdaten, Wohnungen, Mietverhältnisse und Zähler: Stift, Text, dünner blauer Rahmen, Fokuszustand.
- [x] Zählerliste zeigt ausschließlich Bearbeiten; Lebenszyklusaktionen sind nur im geöffneten Bearbeitungsdialog vorhanden, separat bestätigt.
- [x] Bestehende Zähler-Historien-/Löschschutzregeln und Versionsmodell unverändert, auch für neue Immobilien.
- [ ] Produktivparität, getrennte sichere Origin, Google-Sync-Adapter, produktive Abrechnung und fachliche Abnahme weiterhin offen.

Mehr: [STAGE_0_11_UI_CONSISTENCY_2026-11-22.md](STAGE_0_11_UI_CONSISTENCY_2026-11-22.md).

## Fachtest 0.10 · Navigationskonsistenz und Single-Source-of-Truth-Zählerstamm (22.11.2026)

- [x] Startseite eigener Bereich mit Trenner; „OBJEKTBEZOGEN“ und „OBJEKTÜBERGREIFEND“ in einheitlicher Typografie.
- [x] Untereinträge (Icons, Texte, Zähler) konsistent linksbündig und je Baumebene einheitlich eingerückt.
- [x] Einheitliche primäre Bearbeitungsbuttons; Objektkarte lässt sich ausschließlich im Stammdatenbereich pflegen.
- [x] Wohnungsdetails zu einer Liste zusammengeführt; ausschließlich Wohnungsstammdaten und eine Bearbeiten-Aktion je Zeile, keine Querverweise auf andere Stammdaten-/Jahresabschnitte.
- [x] Zähler pro Wohnung gruppiert in eigener Arbeitsfläche, keine Navigation zurück zur Wohnung bei Auswahl.
- [x] Zählerstamm als dauerhafte `meterRegistry[]` mit stabiler Meter-ID, Wohnung, Typ, Nummer, Raum, Heizkörper, Status und Ein-/Ausbaudaten; Kalt-/Warmwasser, Strom und Techem-Heizkostenverteiler.
- [x] Fiktive Platzhalter je Wohnung: ein Stromzähler, zwei Techem-Verteiler; echte Meterdaten werden nicht fingiert.
- [x] Zähler anlegen/bearbeiten; unreferenzierte löschen; historisch verwendete Wasserzähler nur außer Betrieb setzen. Revisionierung, Datenisolierung, Syncrecord des Objektstamms.
- [x] Jahresablesungsformular darf Zählernummern nicht verändern. Zählerwechsel benötigt einen registrierten neuen Stammdatenzähler.
- [ ] Echte Cloud-Synchronisierung, historische Zählermigrationsabnahme, vollständige Techem-Einzelmessungen und Produktivfreigabe weiterhin ausstehend.

Details: [STAGE_0_10_NAVIGATION_AND_METER_MASTER_2026-11-22.md](STAGE_0_10_NAVIGATION_AND_METER_MASTER_2026-11-22.md).

## Fachtest 0.9 · Objektverwaltung und Cloud-Vorbereitung (22.11.2026)

- [x] Einheitliche SVG-Icons und grafische Chevrons im Objektbaum; Sidebar Desktop 288 px, Mobil 295 px.
- [x] Jahresübersicht ausschließlich für aktuell ausgewählte Immobilie; kein Objekt-/Alle-Objekte-Filter im Arbeitsbereich.
- [x] Startseite mit responsiven Immobilienkarten, aktiven/archivierten Objekten und eindeutiger Objektöffnung.
- [x] Objekt, Wohnung und synthetischen Jahresstand anlegen; archivieren/wiederherstellen; endgültiges Löschen nur leerer Objekte mit Tombstone.
- [x] Providerneutraler Objekt- und Jahres-Syncvertrag mit unabhängigen Record-Versionen und Dreiwege-Konfliktplaner, Datenmodell-Upgrade von 0.7 ohne Schlüssel-/Datenverlust.
- [x] Schutz gegen stilles Überschreiben bei Änderungen in einem zweiten Browser-Tab und gegen stilles Zurücksetzen defekter Portfolios.
- [ ] Echte Google-Drive-/Google-Cloud-Synchronisierung, Identität/OAuth, sichere getrennte Origin, produktive Datenbank/Backups, Konfliktbehebung und Fachfreigabe weiterhin offen.

Details: [Fachtest 0.9 – Objektverwaltung und Datenmodell](STAGE_0_9_DATA_MODEL_NAVIGATION_2026-11-22.md).

## Fachtest 0.8 · Einfache, objektzentrierte Navigation (22.11.2026)

- [x] Doppelte Hauptnavigation entfernt; Startseite und **ein** Objektbaum für Stammdaten und Jahresabrechnungen.
- [x] Pro Immobilie die Gruppen Stammdaten und Jahresabrechnungen aufklappbar; sämtliche Jahresabläufe bleiben rechts in sechs Schritten.
- [x] Analysen und Dokumente & Archiv als getrennte objektübergreifende Navigationseinstiege; Breadcrumbs unterscheiden Objekt- und globale Kontexte.
- [x] Sidebar von 232 auf 268 px (Desktop) verbreitert, mobile Navigationsbreite 280 px, Navigationsschrift vergrößert.
- [x] Synthetische Daten/LocalStorage-Key unverändert; das bisherige NK-Pro 1.0 nicht beschrieben.
- [ ] Fachliche Aggregation über alle Objekte und Jahre und übergreifender Dokumentenindex sind noch ausstehend, ebenso Produktivfreigabe.

Weitere Details: [STAGE_0_8_NAVIGATION_2026-11-22.md](STAGE_0_8_NAVIGATION_2026-11-22.md).

## Maßgeblicher Entwicklungsplan für Stufen 3–7 (konsolidiertes Feedback 41 Punkte, 22.11.2026)

**Für alle neuen Entwicklungsaufträge ist [ENTWICKLUNGSPLAN_3_BIS_7_FEEDBACK_41_2026-11-22.md](ENTWICKLUNGSPLAN_3_BIS_7_FEEDBACK_41_2026-11-22.md) der verbindliche Arbeitsplan.** Er ordnet sämtliche 41 Nutzeranforderungen einzeln den überarbeiteten Stufen 3 bis 7 zu, mit übergreifenden UX-/Datenregeln, fachlichen Abhängigkeiten und Stufen-Abnahmegates. Frühere Stufenpläne unten dienen als historische Grundlage, nicht als widersprechende Umsetzungspriorität. Stufe 1+2 ist synthetisch angebunden, aber noch nicht fachlich vollständig abgenommen. **Diese Änderung ist Planung, nicht App-Funktionalität; keine produktive Abnahme.**


1. Vollständige Ist-/Soll-Funktionsmatrix der bestehenden Version V99.4.86.
2. Design-/UX-Gate für alle Kernjourneys und die fünf neuen Hauptbereiche.
3. Komponentenbasiertes neues PWA-Fundament mit klaren Schnittstellen.
4. Golden-Master-Tests für Mietverhältnisse, Wasser, Techem, Umlagen, Sonderfälle, Salden, Rundung und Prüfungen.
5. Sichere Datenmigration und getrennte Echtdaten-Origin.
6. Vollständige Briefe, Prüffreigabe und Archivierung.
7. Verbesserte Analysen: Nebenkosten, eigenständige Finanz-/Cashflow-Sicht und Steuerüberleitungen.
8. Externe/eigene Offline- und Cloud-Tests, fachliche Abnahme und kontrollierte Umstellung.

Das alte NK-Pro-Repositorium ist ausdrücklich nicht Teil dieses Deployments und bleibt produktiv nutzbar.

## Funktionsmuster 0.3 (22.11.2026)

- [x] Sechs Original-Umlageverfahren in bestehender synthetischer Browser-Demo eingebunden; Kosten, Personen/Miettage, Wasser, Vorauszahlungen, Restdifferenzen und Detailnachweise durchspielbar.
- [ ] Echte Teilnehmer-/Mietwechsel- und KW-/WW-Domänen; vollständiger Legacy-Abrechnungskern und 44 Qualitätsregeln.
- [ ] Sicherer Import und Speicher mit separater Browser-Origin.
- [ ] Briefe, Druckabnahme, Archiv, Analysen, Drive und kontrollierter Parallelbetrieb.

## Anwenderfeedback vom 22.11.2026 · Wasser und Kostenfreitext

- [x] Zwei getrennte KW-/WW-Kanäle je synthetischer Wohnung; Zählernummer, Datum, Anfang/Ende und optionale Bemerkung.
- [x] Hauszählerstand, Rechnungsverbrauch, beide Abweichungsabgleiche und €/m³-Anzeige; automatische Preisermittlung mit vier Nachkommastellen und manuelle Preisvorgabe im Kostenformular.
- [x] Freitext/Bemerkung zu jeder angelegten Kostenart mit Speicherung im Demo-Datensatz.
- [ ] Vollständige Bestandsparität für physische Zähleridentität, Messperioden, Zählerwechsel, Leerstand, Mieterwechsel und Vorjahresübernahme.
- [ ] 2025-Sonderregel der tatsächlichen Abrechnung mit den bestätigten Originalzählerständen centgenau abnehmen, ehe Echtdaten erlaubt werden.

## Vollständiger Funktionsvergleich 1.0 → 2.0

Die priorisierte, quellcodegestützte Tiefenanalyse ist in [LEGACY_FUNCTION_GAP_AUDIT_2026-11-22.md](LEGACY_FUNCTION_GAP_AUDIT_2026-11-22.md) dokumentiert: einzeln rückverfolgbare Lücken, 5-Bereiche-UX-Ziel, fachliche Paritätsfallen und End-to-End-Abnahmegates. NK-Pro 1.0 bleibt unangetastet.

## Fachtest 0.5 · Stufe 1 + 2 gemeinsam entwickeln (22.11.2026)

- [x] Synthetischer Objekt-/Wohnungsstamm und Mietverhältnisse als getrennte Abrechnungsfälle mit Ein-/Auszug, Privatanteil, Vorauszahlungen und Leerstandsprüfungen.
- [x] Referenzbasierte Umlage auf einzelne Mietverhältnisse; Kosten-Ausnahmen je Fall, eigene Verbräuche und keine stille Verteilung ungeklärter Beträge.
- [x] Kalt-/Warmwasser getrennt; Originalstände mit Nachkommastellen, Hausabgleich, Zählerwechsel und mehrere Messperioden, besondere Rundung 2025 nur bei ausdrücklich bestätigter Evidenz.
- [x] Sichtbare 0.5-UX innerhalb der fünf Hauptbereiche mit Objekt-Unteransichten und Detail-Drawern.
- [ ] Stufe 1+2 fachlich abschließen: alle K-IDs/Kostenarten, historische Miet-/Zählerzuordnungen, kontrollierter Jahreswechsel und Bestandstransfer, sämtliche 2025-Rundungs-/Techem-/Einzelkosten-Sonderfälle mit vollständiger Originalparität.
- [ ] Fachprüfungen, finale Briefe, Archiv, sicherer Echtdatenhost, Import/Backup/Restore und Betriebsfreigabe sind weiter offen.

## Gemeinsame Entwicklung Stufe 3 + Stufe 4 · Fachtest 0.6 (22.11.2026)

- [x] Einheitlicher synthetischer Erfassungs-/Prüfablauf mit den sieben Schritten „Mietverhältnisse → Vorauszahlungen → Gesamtkosten → Verbräuche → Prüfen → Ergebnis → Briefe“.
- [x] Vor-/Nachname, Briefanrede, einzelne Stammdatenfelder; monatliche/jährliche vereinbarte vs. tatsächlich erhaltene Vorauszahlungen und fallbezogene Salden.
- [x] K001–K035-Katalog, eigene Rechnungsdaten und Kostenarten, Aktivierung/Deaktivierung, Belegnotiz, sichere Löschung versehentlich angelegter unbenutzter Musterkosten.
- [x] Techem-Euro-Einzelwerte mit optionalen Einheiten je Mietverhältnis ausschließlich unter Verbräuche; KW/WW mit Live-Summen und datierten Zwischenablesungen für belegbare Leerstandsmengen.
- [x] 44 Originalqualitätsregeln inventarisiert, 25 unabhängige synthetische Teilchecks ausführbar; 19 ausdrücklich nicht ausgeführt; dynamische Fehlermeldungen, schreibgeschützte vorläufige Ergebnisse.
- [x] Fallweise Mieterbrief-Entwürfe mit konfigurierbaren Grundtexten und Einzeldarstellungen; keine Druck-/Abschlussfreigabe.
- [ ] **Noch nicht abgeschlossen:** vollständige 1.0-Rechen-/Katalog- und Techem-Sonderfallparität, 19 nicht portierte Regeln und volle Abnahme der Teilregeln, vollständiger Original-Briefgenerator samt A4-/Sammeldruckpreflight, Abschlussbedingung und fachlicher E2E-Freigabe.

Siehe [STAGES_3_4_INTEGRATED_2026-11-22.md](STAGES_3_4_INTEGRATED_2026-11-22.md). Stufen 3+4 sind **gemeinsam bearbeitet, nicht vollständig fertiggestellt**.

## Architekturkorrektur nach Nutzerprüfung vom 22.11.2026

- [ ] **P0 vor weiterem Stufe-3/4-Ausbau:** Objekt-/Wohnungs-/Mietverhältnis-Stammdaten als separate dauerhafte Quelle und automatische, versionierte Jahresfallableitung wiederherstellen. Die ältere App konnte dies bereits teilweise; die aktuelle 0.6-Demo hat fälschlich nur einen einzigen Jahresdatensatz mit direkt editierbaren Fällen.
- [ ] **P0:** Abrechnungsübersicht (laufende und archivierte Jahresabrechnungen) vor dem Öffnen des Jahresworkflows; „Mietverhältnisse“ aus den Abrechnungsschritten entfernen, Fallnamen und Zeiträume in „Vorauszahlungen“ nur anzeigen.
- [ ] **P1:** Zustellanschrift standardmäßig aus Objektadresse, abweichende Zustellanschrift optional, Anrede nicht ungeprüft aus Vornamen raten, individuelle Anrede als optional bezeichnen.
- [ ] **P2:** Gesamt-Übersichtsseite ausdrücklich Work in Progress; finale konzeptionelle UX-Kritik **erst am Ende**.

Quellcodevergleich, konkrete Regeln und Abnahmefälle: [FEEDBACK_2026-11-22_STAMMDATEN_JAHRESABRECHNUNGEN.md](FEEDBACK_2026-11-22_STAMMDATEN_JAHRESABRECHNUNGEN.md).

## Fachtest 0.7 · Objekt-Explorer und Jahresabrechnungen (22.11.2026)

- [x] Drei ausschließlich fiktive Objekte mit **7 / 3 / 2 Wohnungen**, jeweils eigenem dauerhaften Objekt-, Wohnungs-, Mietverhältnis- und Zählerstamm.
- [x] Sechs historische Musterabrechnungen **2023 und 2024 je Objekt** plus der vorhandene offene Entwurf **2025 für Objekt A**. **Historisch ist nicht „fachlich abgeschlossen“**: die Musterdaten sind nur schreibgeschützt.
- [x] Linker hierarchischer Objekt-Explorer; globale Jahresabrechnungsübersicht, Objektfilter, Wohnungs-Drilldown, eindeutige Breadcrumbs, mobile Menü-Navigation.
- [x] Jahresabrechnungen ziehen Vertragsfälle aus permanenten Stammdaten nach Ein-/Auszugsdatum; **ohne Auszug fortlaufende Mietverhältnisse**. Mieterwechsel- und Leerstand-Szenario B/2024 mit 14-tägigem Leerstand.
- [x] Änderungen an Stammdaten überschreiben **niemals** historische oder offene Jahressnapshots ungefragt. Offene Entwürfe verwenden eine geprüfte Vorschau und kontrollierten Rebase mit Sperren.
- [x] Formular für Objekt, Wohnung und Mietverhältnis mit expliziter Anrede und optional abweichender Postanschrift. Vorauszahlung bleibt ausschließlich im Jahresbereich; Mietverhältnisse aus Jahres-Tabs entfernt.
- [x] Isolierter Demo-Speicherschlüssel \`nkpro2_synthetic_portfolio_0_7_v1\`; vorhandene 0.6- und 1.0-Schlüssel werden **nicht verändert**. Bestehende 0.6-Demoänderungen sind **nicht** automatisch migriert.
- [x] Node-Tests und echte Chromium-Klick-/Layoutprüfungen auf Desktop und Mobilgerät, neun prüfbare Screenshots als Actions-Artefakt.
- [ ] Vollständige Parität zur alten NK-Pro-1.0-App, echte sichere Datenmigration, fachlich abgeschlossene Jahresarchive, 19 fehlende Originalregeln, Briefe/A4-/Druckfreigabe, Jahresanlage außerhalb der synthetischen 2023–25-Beispiele und Betriebsfreigabe weiterhin offen.

Ausführlicher Bericht: [STAGE_0_7_OBJECT_EXPLORER_2026-11-22.md](STAGE_0_7_OBJECT_EXPLORER_2026-11-22.md).
