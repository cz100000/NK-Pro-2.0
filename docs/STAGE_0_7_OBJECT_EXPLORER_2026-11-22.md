# NK-Pro 2.0 · Fachtest 0.7 – korrigierte Immobilien- und Jahresarchitektur
**Stand 22.11.2026 · nur synthetischer Fachtest – keine produktive Abrechnung**

## Ergebnis
Die Architekturfehler von Fachtest 0.6 wurden in einen eigenen Objekt- und Jahresdatensatzvertrag überführt. Eine moderne zweistufige Navigation verbindet **Objekt → Wohnung/Mietverhältnisse/Zähler → Jahresabrechnung**. Die Oberfläche behält fünf Hauptbereiche. Der Jahresarbeitsplatz beginnt mit Vorauszahlungen, nicht mit einem zweiten Mieter-Stammdateneditor.

## Datensatz
| Objekt | Dauerhafte Wohnungen | Dauerhafte Verträge | 2023 | 2024 | 2025 |
| --- | ---: | ---: | --- | --- | --- |
| Musterobjekt A | 7 | 7 | Historischer Musterstand | Historischer Musterstand | Offener synthetischer Entwurf aus Fachtest 0.6 |
| Musterobjekt B | 3 | 4 | 3 Abrechnungsfälle | 4 Fälle mit Mieterwechsel / 14 Tagen Leerstand | Nicht angelegt |
| Musterobjekt C | 2 | 2 | 2 Fälle | 2 Fälle | Nicht angelegt |
| **Gesamt** | **12** | **13** | **3 Jahresstände** | **3 Jahresstände** | **1 offener Jahresstand** |

Alle Angaben einschließlich Adressen, Namen, Zähler und Kosten sind **erfundene Testdaten**. Die historischen Jahre enthalten eigenständige Fiktivbelege, Wasser-KW-/WW-Ablesungen, Vorauszahlungen und externe Euro-Einzelkosten. Das Beispiel B/2024 enthält zeitanteilige Mietverhältnisse, belegte Zwischenablesungen und einen echten Rechenfall über 14 Leerstandstage.

## Master- und Jahresmodell
- **Objektstamm**: stabile Objektkennung, Anschrift, Einheiten und Flächen, technischer Zählerstamm, Mietverhältnisse mit `leaseStart` und optionalem `leaseEnd`, Briefanrede, Postanschrift-Override.
- **Jahresfall**: aus relevanten Verträgen per Kalenderintervall abgeleitet, effektiver `start`/`end`, stabile Vertrags-ID, Kopie der Briefanschrift. Jahresdaten führen ihre eigenen Belege, Zahlungen, Zählerablesungen, Techem-Einzelwerte, Prüf-/Brief- und Statusinformationen.
- **Vertragsstamm ist die einzige Eingabestelle** für Namen, Wohnungszuordnung, Rolle und Einzug/Auszug; in Vorauszahlungen/Verbräuchen wird nur der zutreffende Jahresfall angezeigt und die jeweiligen Zahlungen/Einzelmengen bearbeitet.
- **Historische Jahresstände readonly**: Sie werden nur zur Ansicht geöffnet. Öffnung ist keine Wiedereröffnung; es erfolgt keine automatische Veränderung.
- **Stammdatenabgleich**: Jede Änderung erhöht die Stammdaten-Revision. Abweichende offene Jahresstände werden gewarnt; ein expliziter Abgleich aktualisiert stabile Fall-IDs und entwertet bisherige Prüfungen. Bei entfallenden Fällen mit Zahlungen/externen Kosten ist die automatische Übernahme gesperrt.
- **Datenisolation**: neuer LocalStorage-Key `nkpro2_synthetic_portfolio_0_7_v1`. Alter Fachtest 0.6 bleibt **im ursprünglichen Key** erhalten, wird aus Sicherheitsgründen nicht automatisch interpretiert oder überschrieben. Keine echten Daten eintragen.

## UX: Sachbearbeiterperspektive
- **Links**: Objekte A/B/C, nur aktuelles Objekt aufgeklappt, sekundäre Links zu Objekt, Wohnungen, Mietverhältnisse, Zähler und Jahresständen.
- **Rechts**: große Arbeitsfläche mit Breadcrumb aus Objekt und ggf. Jahr, erst eine Liste aller Abrechnungen, nach Auswahl den Workflow. Wohnungstabelle erlaubt eigenen Drilldown mit Vertragsverlauf, Zählern und Jahreslinks.
- **Erklärbare Bearbeitung**: Alle anderen Jahre als ausdrücklich schreibgeschützte Musterstände gekennzeichnet, editierbare Aktionen deaktiviert und bei direkter Action nochmals abgesichert.
- **Responsive**: auf kleinen Bildschirmen wird der Explorer zum ausklappbaren Menü; Tabellen in eigenen Scrollcontainern und keine horizontale Seitenverschiebung.

## Qualitätsnachweise
- Automatisierte Domänentests zu 7/3/2, jahresspezifischer Rechnung für 2023/24 inkl. Schaltjahr, Mieterwechsel/Leerstand mit echten Zwischenablesungen, Private Role, Abgleich, Archivschutz und Objektisolation.
- Browser-Simulations-Klicktests zu navigierbaren Objekten, Jahren, Wohnungen, Speichern/Abgleich, Standwechsel und schreibgeschützten historischen Jahren.
- **Echte Headless-Chromium-CDP-Browsertests**: Browser ruft `index.html` über echten lokalen HTTP-Server auf, klickt Baum/Objekte/Wohnungsdetail/Jahresreiter und eine Vorauszahlungsmaske. Er prüft sichtbare Kontexttitel, die 6-stufige Abrechnung, deaktivierte Aktionen in historischen Jahren, fehlendes Seitenoverflow auf Desktop/Mobilgerät und ausklappbaren Mobil-Explorer. **Neun PNG-Screenshots** werden als `nkpro07-visual-acceptance` im GitHub Actions Testlauf gespeichert. Diese Tests sichern grundlegende Bedienbarkeit und Geometrie, **nicht** vollständige visuelle Designabnahme jeder Ansicht.

## Offen und bewusst nicht als „fertig“ behauptet
Die neue Struktur behebt die grundlegende falsche Verknüpfung von Mieter- und Jahresdaten. **Die Fachparität der Alt-App bleibt weitgehend offen.** Insbesondere Kostenkatalog, rechtliche Sonderfälle, vollständige Zählerhistorie und Überläufe, externe Techem-/CO₂-Logik, korrekte finale Mieterbriefe einschließlich DIN-A4-Layout und Sammeldruck, 19 Originalregeln, abschließendes Archiv-/Reopen-Verfahren, sichere Echtdaten-Umgebung und Migration sind nicht fertig. Deshalb ist eine echte Nebenkostenabrechnung mit 0.7 **nicht freigegeben**.

**Vor weiteren größeren Fachfeatures:** Jetzt gemeinsam mit dem Nutzer die Funktionen aus 1.0 gegen diese korrigierte 0.7-Oberfläche Seite für Seite prüfen und eine vollständige Defizitliste priorisieren. Das Feedback „alte App funktional, neue App klarer, aber fachlich unvollständig“ ist verbindliche Richtschnur.
