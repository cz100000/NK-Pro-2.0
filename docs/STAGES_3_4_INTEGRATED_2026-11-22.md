# NK-Pro 2.0 · Gemeinsame Entwicklung Stufe 3 + Stufe 4
**Stand 22. November 2026 · öffentlicher Fachtest 0.6 · ausschließlich synthetische Daten**

## Einordnung und strenge Freigabegrenze
**Stufe 3 und Stufe 4 werden als ein integrierter Entwicklungsstrang realisiert. Das erste funktionsverbundene 0.6-Paket ist implementiert, aber beide Stufen sind fachlich noch nicht vollständig abgenommen.** Die Nutzung mit Echtdaten, ein verbindlicher Abschluss sowie der echte Druck freigegebener Mieterbriefe bleiben gesperrt. Die fünf Hauptbereiche und die schlanke UX bleiben erhalten.

Verbindliche Zielplanung: [41 Nutzerpunkte / Stufen 3–7](ENTWICKLUNGSPLAN_3_BIS_7_FEEDBACK_41_2026-11-22.md); vollständiges [Legacy-Funktionsinventar](LEGACY_FUNCTION_GAP_AUDIT_2026-11-22.md). NK-Pro 1.0 V99.4.86 bei `a089e1fe660dd5502799560efe2bc4b65a09f278` wurde nicht verändert.

## Bereits implementiert und über die öffentliche Musteroberfläche aufrufbar
| Modul | Aktuell in 0.6 tatsächlich möglich | Noch nicht fachlich abgenommen |
| --- | --- | --- |
| Prozess | Mietverhältnisse → Vorauszahlungen → Gesamtkosten → Verbräuche → Prüfen → Ergebnis → Briefe | Vollständige Jahreszustandsmaschine erst ab 3A/5 |
| Mietverhältnisse | Fiktive Fälle mit Vor-/Nachname, gewählter Briefanrede, separater Anschrift, Mietzeitraum, Rolle/Personen | Vollständige 1.0-Daten-/Mehrjahreshistorie und echte Briefe |
| Vorauszahlungen | Eingabe monatlich/jährlich vereinbarter Vorauszahlung und tatsächlich erhaltener Beträge; anteilige Sollberechnung über Monatsgrenzen, getrennte Ist-Salden | Original-Prepayment-Matrix, Zahlungs-/Korrekturhistorie und vollständige Zahlungsbelege |
| Gesamtkosten | Original-K001–K035-Katalog, auswählbare/eigene Kostenarten, Rechnungs-/Belegdatum, Aussteller, Nummer, Verweis und Notizen, Aktivieren/Deaktivieren, sichere Löschung nur bei neuer unverwendeter Musterkostenart | Vollständige Katalog-/Umlage-/Ausschlussparität; belegte Vermieteranteile vs. automatische Leerstands- und Restkosten umfassend prüfen |
| Kosten- und Verbrauchsort | Gesamtbeleg unter Gesamtkosten; separate Einzelmengen und externe EUR-Beträge unter Verbräuche; Mietername zusammen mit Wohnung sichtbar | Vollständige fachliche Perioden-/Zählerzuordnung |
| Wasser | KW-/WW-Messperioden, Dezimalrohwerte, Zählerwechsel, Haus-/Rechnungsabgleich, Preise je m³ und Live-Summe im Drawer; datierte Zwischenablesungen für Leerstände statt frei editierbarer Pauschalmengen | Nachweise/Schätzung bei fehlenden Werten, dokumentierter Vorjahresübertrag, alle Überlauf-/Sonderfälle und bestätigte reale 2025-Rundung |
| Techem | Externe Einzelabrechnung mit Eurobeträgen je Fall, optional Einheiten und Notiz; Summenabgleich mit Gesamtrechnung, ausdrücklich belegte Vermieterposition getrennt | Alle Original-Techem-/CO₂-/Mieterwechsel-/Leerstands-Sonderfälle |
| Kosten-/Fallrechner | 6 Referenz-Umlageverfahren, fallbezogene Mietzeiten, Verbrauch, Vorauszahlungen und Ergebnisse; dokumentierte Reste nicht still umverteilen; Privatanteil regulär abrechnen | Centgenauer vollständiger Original-Rechenkern und Gesamtparität |
| Prüfen | Vollständiges 44-Originalregel-Inventar sichtbar; **25** voneinander abgegrenzte synthetische Teilprüfungen mit Fehler-/Hinweis-/Entscheidungsstatus; **19 Regeln weiterhin „nicht ausgeführt“**, dynamische Berechnungs-/Brieffehler | Vollständige originale 44-Regel- und dynamische Prüfparität, Entscheidungshistorie, Fingerprint-Entwertung, echte Abschlussfreigabe |
| Ergebnis | Read-only Salden je Abrechnungsfall, klar **vorläufig** | Freigegebenes Ergebnis erst nach vollständig geprüfter Abschlussbereitschaft |
| Briefe | Einzelbrief je fiktivem Abrechnungsfall und zusammenhängende Musteransicht; Kostenanteile, Vorauszahlungen und Salden aus einem Rechenmodell; editierbare Grundtexte, Absender, Betreff, Zahlungsziel, Bank, Anrede, Signatur/Anlage; Nicht-versenden-Wasserzeichen | Vollständige **NK-Pro-1.0-Briefeinstellungen** und Text-/Zusatzblätter, alle individuellen Original-Briefpositionen, belastbarer DIN-A4-PDF-Preflight, tatsächliche Versandfertigkeit |
| Abschluss | **Explizit gesperrt**; keine Scheinfertigmeldung und keine archivierten Musterstände | Formaler Abschluss-/Archiv-Snapshot und produktive Laufzeit |

## Getestete Integrationsfälle
- Fallbezogener End-to-End-Workflow mit getrennten Teilnehmer-IDs von Vorauszahlungen über Techem-Einzel-Eurobeträge bis zu den Briefsalden.
- Eigentümerposition wird aus dem externen Kostenbetrag **ausdrücklich herausgenommen**, nicht auf Mieter oder Privatnutzung umgelegt.
- Fehlende externe Fälle, falsche Summen oder fehlende KW/WW-Zwischenablesungen bleiben Fehler und werden nicht still als null gesetzt.
- Aktive/gesperrte Qualitätsregeln erscheinen separat; keine echte Abschluss- oder Druckfreigabe im synthetischen Muster.
- Alle Browser-, Domänen- und Golden-Master-Teiltests laufen in GitHub Actions; der öffentliche Status wird direkt aus dem erfolgreichen Testlauf generiert.

## Noch offener vollständiger Stufe-3-Abnahmeblock
1. Datierte, tatsächlich historische Miet-/Wohnungs-/Zähleridentitäten mit Quelle und Nachweis; verbindlicher Jahres- und Statusvertrag.
2. Eindeutige Vorjahresübernahme statt reiner Preview, zusätzliche Zählerwechsel/Überläufe und dokumentierte Verbrauchsschätzung nur nach freigegebener Fachregel.
3. Gesamter Original-K001–K040-Funktionsumfang einschließlich Sonderkosten, externer Warmwasser-/Heizkosten und aller manuellen Einzelwertarten; rechtliche Umlagefähigkeit **nicht automatisch** aus dem Katalognamen ableiten.
4. Techem-/CO₂-/Heizkosten vollständig gegen reale, bestätigte Originalbelege mit nachvollziehbarem Vermieterrest testen.
5. Alle Sonderfälle samt Cent-Rundung, Leerstand und Vorauszahlungskorrekturen gegen NK-Pro V99.4.86; vollständig verbundener geprüfter Referenzdatensatz.
6. Single-Source-of-Truth und Änderungshistorie als fachliche Transaktionen, nicht nur dieselben Felder nicht doppelt anzeigen.

## Noch offener vollständiger Stufe-4-Abnahmeblock
1. **19 Originalregeln** vollständig und verifizierbar portieren; bei den 25 vorhandenen *synthetischen* Teilchecks die Restparität zur Originalregel für alle Datenlagen beweisen.
2. Fachliche Entscheidungen, dokumentierte Korrekturen und automatische Ungültigkeit zuvor bestandener Prüfungen nach Quelldatenänderung.
3. Vollständige Original-Mieterbriefe: individuelle Briefprofile, Annahmen, Einleitung, Zahlungs-/Guthabentexte, Techem-Anlagen, Korrekturen, Vorauszahlungszusatzblatt, Gruß, Bank, Anschrift und alle prüffähigen Kostenzeilen.
4. DIN A4 inklusive realistischer langer Texte, Seitenüberläufe, Sammeldruck und PDF-Abnahme; weder die vorhandene Musteransicht noch der Browser-Druck-Button genügen als Versandfreigabe.
5. Echte Abschlussbedingung erst nach **allen** fachlichen Prüfungen und versandbereiten Mieterbriefen; tatsächlicher Versand ist dafür nicht erforderlich.
6. Synthetischer vollständiger Jahresdurchlauf mit Originalvergleich für **alle** Abrechnungsfälle; keine unerklärten Kosten-/Eigentümer-/Leerstandsreste.

## Nicht Gegenstand von Stufe 3/4 und weiterhin verbindlich in Stufe 5–7
Mehrjähriger Wechsel „in Bearbeitung / abgeschlossen / archiviert“, kontrollierte Wiederöffnung, sichere echte Bestandsmigration, unveränderbare Archive, Analysen und Steuerüberleitung, Backup/Restore, Offline und Google Drive. Die technische Voraussetzung für Jahreskontexte muss bei weiterer Stufe-3-Arbeit berücksichtigt werden. **Separate Browser-Origin vor echten personenbezogenen Daten ist zwingend.**

## Release-Gate
| Gate | 0.6 |
| --- | --- |
| Nutzer kann den neuen schlanken Prozess mit Musterdaten durchlaufen | **Ja** |
| Kosten / Verbrauch / Techem / Vorauszahlung rechnen im gemeinsamen Mustermodell | **Teilweise, sechs Referenzmethoden und ausdrücklich externer EUR-Pfad** |
| Alle Original-Fachregeln erfüllt | **Nein – 19 nicht ausgeführt, 25 nur synthetische Teilchecks** |
| Vollständiger 1.0-Briefgenerator und A4-Versandfreigabe | **Nein** |
| Produktivabschluss und Archivierung möglich | **Nein** |
| Echte 2025-Daten sicher übernehmen | **Nein** |
| Betriebsfreigabe Stufe 3 + 4 | **Nein** |

### Verbindliche nächste Umsetzungspriorität
**Nicht Stufe 5 beginnen, bevor Stufe 3 und 4 die obigen Gates bestanden haben.** Priorität: Original-Cent-/Techem-/Vorauszahlungsparität, fehlende 19 Qualitätsregeln, vollständiger Dokumentendruck und Abschlussgate. Erst danach die Echtdaten-/Archiv-/Jahresmigration vorbereiten.

**Wichtiger Hinweis zu bereits bearbeiteten Demodaten:** Der isolierte Demodatensatz wird strukturerhaltend auf 0.6 aufgerüstet. Die neu hinzugekommenen Beispiel-Techem-Einzelbeträge werden bei bestehenden eigenen Änderungen **nicht erfunden**; fehlende Werte müssen als Testdaten ergänzt werden. „Demo zurücksetzen“ setzt die synthetischen Eingaben zurück und verwirft zuvor gemachte Demoänderungen.
