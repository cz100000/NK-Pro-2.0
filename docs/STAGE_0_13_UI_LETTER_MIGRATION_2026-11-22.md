# Fachtest 0.13 – UI-Verträge und Originalbriefmigration
Datum: 22.11.2026. Nur synthetische Testdaten.

## Appweite Änderungen
Die Zählerliste besitzt ausschließlich pro Wohnungsgruppe einen rechtsbündigen blauen Button zum Hinzufügen. Statusspalten sind physisch von Aktionsspalten getrennt, mithilfe der gemeinsamen Renderfunktionen actionCell und statusHeading. Betroffen sind Kosten, Vorauszahlungen, Kalt-/Warmwasser, Techem, weitere Verbräuche und Mietverhältnis-Wasserfälle. Die Kostenliste hat eine Desktop-Maximalbreite von circa 950 px, die Ergebnismatrix von circa 1070 px; Mobilgeräte scrollen innerhalb des Tabellenbereichs. Katalogisierte Kostenarten werden nach K-Code benannt, ohne alte kombinierte Rechnungswerte willkürlich umzubuchen. Vorauszahlungsspalten sind semantisch erläutert. Der redundante Hauptseitenbutton für den Hauszähler ist entfernt; die Bearbeitung bleibt unter Wasser-KW/WW.

## Originalquellen aus NK-Pro 1.0
Beide Dateien wurden aus cz100000/NK-Pro gelesen und unverändert in einen isolierten IIFE-Namensraum eingeschlossen. Die A4-Geometrie und Dokumentformatierung selbst bleibt exakt die originale.
- Original js/document-renderer.js – gepinnt unter tests/reference/document-renderer-v99.4.86.js – Git blob d658a20217c920d8bf64b169f462ce47b3df927b.
- Original js/landlord-documents.js – gepinnt unter tests/reference/landlord-documents-v99.4.86.js – Git blob c95d7ba7f1b8b34fdb87c0de1f343678bbdbc303.
- Neue Adapter: legacy-letter-engine.js und legacy-landlord-documents.js. Das Dokumenten-CSS behält A4 = 210 × 297 mm und die AP13-Neun-Spalten-Tabelle. Tests prüfen SHA und Originaltextidentität.

Die Briefdaten kommen aus dem synthetischen Jahres-Ledger. Fehlende Anschriften und fachliche Abweichungen werden als Fehler angezeigt. M000/Privatrolle wird wie jeder andere Mieterfall gerendert; die steuerliche Unterscheidung ist davon getrennt. Ausgabe und Druck enthalten einen Mustervermerk.

## Neue Brief-UX
Links wählbare Empfänger, mittig echte skalierte A4-Dokumentseiten und Controls für Zoom, Seitenbreite, ganze Seite, Schwarzweiß, Textkopie, Druck/PDF, Sammeldruck und interne Vermieterunterlagen; rechts aufklappbare Briefkopf-/Zahlungs-/Anrede-/Text- und optionale Vorauszahlungsanpassungseinstellungen. Die Einstellungen gehören zum jeweils ausgewählten Jahr, historische Abrechnungsstände bleiben schreibgeschützt. Auf schmalen Displays werden die Module gestapelt.

## Bewusste Grenzen und Folgearbeiten
Es gibt in Version 2.0 nur die Summe tatsächlich erfasster Vorauszahlungen pro Abrechnungsfall, nicht die ursprüngliche kostenartbezogene Vorauszahlungsstruktur. Der Adapter weist deshalb eine separate, transparente Gesamtsummen-Zeile aus, statt Teilbeträge zu erfinden. Die automatische Kostenprognose für künftige Vorauszahlungsanpassungen ist deaktiviert; manuell nachgewiesene Werte sind im optionalen A4-Zusatzblatt möglich. Bestimmte spezielle Korrekturen sind noch nicht fachlich migriert.

Die Quelltextidentität des Originalrenderers ist automatisch geprüft, aber ein formaler **PDF-Pixelvergleich zu verbindlichen NK-Pro-1.0-Referenz-PDFs wurde noch nicht durchgeführt**. Es besteht keine vollständige Rechen-/Betriebsparität, kein produktiver Cloud- oder Backupbetrieb und keine Erlaubnis, echte Abrechnungen oder Briefe zu erzeugen oder zu versenden. NK-Pro 1.0 bleibt unverändert.

## Regression
Neue Tests: stage013-legacy-document.test.cjs, stage013-source-parity.test.cjs sowie browser-smoke und Chromium-visuelle Regression inklusive Briefnavigation, A4-Layout, Dialogen, Statusspalten und mobil.
