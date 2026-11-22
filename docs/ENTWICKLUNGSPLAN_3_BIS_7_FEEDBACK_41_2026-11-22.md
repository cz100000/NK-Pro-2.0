# NK-Pro 2.0 – verbindliche Planungsgrundlage für die nächsten Entwicklungsaufträge
**Konsolidierte Stufen 3–7 | 41 Feedbackpunkte aus Fachtest 0.5 | 22.11.2026**

## Geltung und Status
Dieser Plan ersetzt für **künftige Arbeit an Stufen 3–7** die entsprechenden Abschnitte der früheren Planungsdokumente, soweit diese bei Inhalt, Reihenfolge oder UX abweichen. Die alten Dokumente (einschließlich Quellcode-Audit und Stufe-1+2-Bericht) bleiben als historische Quellen erhalten. Die 41 Punkte sind **hier fest in die künftige Umsetzung eingeplant, nicht als Programmänderungen umgesetzt**. Kein Auftrag zur produktiven Umstellung ist erteilt.

**Stand der Basis:** Fachtest 0.5 enthält gemeinsame synthetische Implementierungen für Stufe 1 und 2, diese sind aber noch nicht fachlich vollständig abgenommen. Verbleibende Defizite aus 1/2 fließen zwingend in Stufe 3 ein. NK-Pro 1.0 V99.4.86 (Git-SHA a089e1fe660dd5502799560efe2bc4b65a09f278) ist unveränderte Fachreferenz und bestehender Betriebsstand. NK-Pro 2.0 darf auf öffentlichem github.io keine echten Personen-, Rechnungs- oder Archivdaten verwenden; vor Echtdatenübernahme separate Browser-Origin und abgesicherte Datenhaltung.

**Ziel:** funktionale Originalparität **plus** das gesammelte Feedback; fünf schlanke Hauptbereiche bleiben, progressive Offenlegung, keine neue Hauptnavigation. Jedes Datum/Feld hat eine eindeutige fachliche Eigentümerschaft. Angaben werden entlang des Prozesses übernommen und nur am Ursprungsort bearbeitet, außer dokumentiertem Reopen-/Korrekturverfahren. Vorläufige Ergebnisse und finale freigegebene Ergebnisse müssen klar unterscheidbar sein.

## Zielprozess (ab Stufe 3 als UX; vollständig in Stufe 4)
**Mietverhältnisse → Vorauszahlungen → Gesamtkosten → Verbräuche → Prüfen → Ergebnis → Briefe → gesonderte Aktion „Abrechnung abschließen“.**

- Mietverhältnisse: wer, welche Wohnung, Zeit, Rolle, Personen (alle Rollen regulär abrechnen; private Nutzung erst in steuerlichen Analysen separat).
- Vorauszahlungen: Soll-/vereinbarte und **tatsächlich geleistete** Beträge, Monats-/Jahreseingabe; Identität/Zeitraum nur aus Mietverhältnis, hier keine Zweitpflege.
- Gesamtkosten: Rechnungen, Belegdatum/-nummer/-aussteller, Gesamtbetrag, Kostenzuordnung und nicht umlagefähige **belegte** Positionen; **keine Einzelverbräuche je Wohnung/Mieter**.
- Verbräuche: physische KW-/WW-Zähler, Historie, Leerstand, weitere gemessene Einheiten und externe Techem-Einzelwerte **je Abrechnungsfall**; Techem-Einzelkosten und optional Verbrauchseinheiten.
- Prüfen: Vorab-Rechenstand + alle fachlichen und dynamischen Qualitätsprüfungen, Differenzbegründungen.
- Ergebnis: nach Prüfung **lesende** Darstellung pro Mietverhältnis/Wohnung mit Drilldowns; erneute Eingaben nur am zugehörigen Ursprungsort. Bei Änderungen Prüfstatus entwerten.
- Briefe: ursprünglichen NK-Pro-1.0-Funktionsumfang und A4-/Sammeldruck reproduzieren; Briefe sind für den fachlichen Abschluss vollständig, korrekt und versandbereit, **Versand selbst nicht erforderlich**.
- Abschluss: erst nach vollständig geprüfter Abrechnung und allen druckfertigen Briefen; danach schreibgeschützter Snapshot.

## Entwicklungsstufe 3 – Datenverantwortung, umfassende Erfassung, vollständiger Fachrechenkern
**3A: Grundstruktur & Jahresdatenvertrag.** Bereits jetzt Jahres-ID, Statusmodell und getrennte Jahressnapshots vorsehen (volle Jahres-UX in Stufe 5). Navigation auf neue Reihenfolge umstellen. UI-/Fachmodell gegen doppelte veränderbare Stammdaten prüfen. Verbliebene Stufe-1/2-Lücken bei Mieter-/Zähleridentität, Historie und Abrechnungsfällen schließen.

**3B: Mietverhältnisse & Vorauszahlungen.** Getrennte Vornamen/Nachnamen; explizite Briefanrede (Herr/Frau/neutral/individuell, kein Pflicht-Geschlechtsfeld); Daten zu Rolle/Einzug/Auszug/Personen nur in Mietverhältnissen ändern. Vorauszahlungen um Monats-/Jahresmodus, automatische Zeitraumlogik, Soll vs. tatsächlich geleistete Zahlung, Korrekturen ergänzen; nur Betrag hier pflegbar.

**3C: Gesamtkosten.** Original-Kostenkatalog/stabile IDs und Betriebskostenverordnung als fachliche Grundlage prüfen, Standard-Kostenarten auswählen, eigene anlegen; deaktivieren/ausblenden, vollständiges Löschen nur ungenutzter Einträge. Rechnungsdatum, gegebenenfalls abweichendes Belegdatum, Rechnungsnummer/-aussteller, Belegbezug, Betrag und Notiz. Gekennzeichnete Eigentümerkosten aus Originalbelegen getrennt von automatisch errechnetem Leerstandsanteil, sonstigem Owner-Rest und **ungeklärten Differenzen**. Nicht für alle Kosten einen frei einzugebenden „Davon Vermieteranteil“ verlangen. Bei Zuordnung Namen **plus Wohnung**, alle berechtigten Teilnehmer standardmäßig eingeschlossen, bewusste Ausschlüsse. Keine Einzelverbräuche in diesem Bereich.

**3D: Verbräuche, Leerstand, Techem.** Wasser KW/WW mit Zählernummern, Original-/Rundungswerten, datierten Rohablesungen und separater Verbrauchssumme **live im Drawer**, Zählerwechsel, historische Kontextwerte soweit sicher verfügbar. Leerstands*zeitraum* aus Zeitabschnitten automatisch; Leerstands*menge* ausschließlich aus geeigneten belegten Ablesungen, bei Datenlücke Prüfhinweis/zulässiger dokumentierter Sonderfall; keine erfundene Null oder als Standard frei befüllte Pauschale. Weitere Verbrauchsarten je Wohneinheit/Mietverhältnis. Unter Verbräuche eigener Teilbereich „Heizung & Warmwasser · Techem“: externe **Euro-Einzelkosten** plus optionale Verbrauchseinheiten; externe Kosten nicht künstlich erneut über €/Einheit berechnen. Techem-Gesamtrechnungen unter Gesamtkosten, Einzelwerte unter Verbräuche. Vermieterpositionen wie 2025 Techem-K006 **3,88 €** als belegten, ausschließlich vermieterseitigen Posten halten – weder Mieter, Privatanteil noch Leerstand.

**3E: Rechenkern.** Vollständige Umlage einschließlich Mieterwechsel, Leerstand, Privatanteil, Individualwerten, Vorauszahlungen, Original-Rundungs-/Cent-Regeln und Kostendifferenzen gegen eingefrorenen Originalkern testen; dokumentierte Golden-Master-Fälle für 2025. Kosten-/Zähler-/Fallwerte nur einmal halten, abgeleitete Werte nur berechnen. „Entwurf“ nicht fälschlich als „Abgeschlossen“ ausweisen.

**Gate Stufe 3:** Eine vollständig mit **synthetischen** Daten bestückte Abrechnung kann bis zum vorläufigen Saldo je Abrechnungsfall durchgerechnet werden; fehlende Zuordnungen und Rundungs-/Kostenreste bleiben sichtbar statt ungeprüft als Vermieteranteil zu landen.

## Entwicklungsstufe 4 – Prüfen → lesendes Ergebnis → vollständige Briefe
- Alle 44 Regeln des Originalinventars plus dynamische Prüfungen, Fachentscheidungen, Fingerprint-Entwertung bei Änderungen und direkt verlinkte Ursprungsfelder umsetzen. Kritische Mängel blockieren; ungetestete Regeln gelten nie als bestanden.
- „Umlage“ zu **„Ergebnis“** umbenennen. Im Ergebnis nur lesender geprüfter Stand; vor vollständiger Prüfung allenfalls ausdrücklich „vorläufiger Rechenstand“ in der Prüfansicht.
- Der bisherige Brief ist *Very Early Demo*: vollständiger Originalvergleich und Portierung von Textkonfiguration, Absender/Anrede/Empfänger, Adressen, Fristen, Bankdaten, Techem-Hinweisen, Individual-Korrekturen, Anhängen, DIN A4, Seitenprüfung, Sammeldruck. Keine fiktive Druckfreigabe.
- Technische Berechnung läuft vor der Prüfung; danach lesender Ergebnisbereich. **Abschluss erst nach vollständigem Briefpreflight**, nicht bereits mit bestandener Rechenprüfung.

**Gate Stufe 4:** Vollständiger synthetischer **End-to-End-Durchlauf 2025**: Daten → Rechnung → alle Prüfungen → lesendes Ergebnis → Briefe/Sammeldruck → Abschlussfähigkeit; Gegenvergleich zur 1.0-Fachreferenz.

## Entwicklungsstufe 5 – Jahre, Zustände, Archiv und sichere Datenmigration
- Sichtbarer **Jahreswahlschalter und Status** jederzeit: „in Bearbeitung“, „abgeschlossen“, „archiviert“. Jahr 2023/2024/2025 usw. voneinander getrennt.
- **„Zur Ansicht öffnen“** vs. **„Zur Bearbeitung wiederöffnen“** technisch und visuell getrennt; abgeschlossene/archivierte Datensätze standardmäßig schreibgeschützt. Reopen nur kontrolliert mit Korrektur-/Versionierungshistorie und erneuter Prüfung.
- Unveränderbare Original-Abschlusssnapshots, neuer Jahresentwurf, überprüfte Vorjahresübernahme, differenzierter Archivbericht und Rollback. Tooltip für ungearchivierten Zustand „Abrechnung ins Archiv verschieben.“, für erneut geöffneten archivierten Stand „Archiv aktualisieren.“
- Sichere transaktionale JSON-Schema-Migration mit Importvorschau, Datenprüfbericht und Rücksicherung; **separate Browser-Origin zwingend vor dem ersten echten Backup/Personendatensatz**.
- Historische Ablesungen für den Wasser-Drawer verfügbar machen; vollständige vergleichende Visualisierung folgt in Stufe 6.

**Gate Stufe 5:** Mehrjähriger Wechsel, Ansicht/Schreibschutz/Reopen, Archiv/Fingerprint, Testimport, Restore und Cent-Vergleich funktionieren zuverlässig, ohne NK-Pro 1.0 zu verändern.

## Entwicklungsstufe 6 – historische und betriebswirtschaftliche Auswertungen
- Wasser-Drawer erhält kurze **Vorjahrestabelle** mit Stand/Verbrauch und sofort sichtbarer Vergleichsabweichung; Daten kommen aus demselben Jahres-/Zählerarchiv, kein eigener Speicher. Vollständige historische Zeitreihen und Auffälligkeitsgrafiken hier.
- Drei getrennte Analyse-Unterbereiche: **Nebenkosten** (Kosten, Mengen, Preise, Umlage, Jahre, Leerstand), **Finanzen/Cashflow** (tatsächliche Ein-/Auszahlungen, Betriebsergebnis, Salden), **Steuern** (Vermietung, Privatanteil, Leerstand, belegbare Kostenüberleitung, nicht klassifizierte Werte kenntlich).
- Original-Funktionen mit differenzierten Mehrjahresvergleichs-/Exportmöglichkeiten vervollständigen; neue Vorauszahlungsprognose und interne Vermieterberichte integrieren.
- Fehlende echte Zahlungsdaten dürfen **nicht** durch reine Sollwerte als Ist-Cashflow ersetzt werden.

**Gate Stufe 6:** Historische Analysen sind mit Ursprung/Detailwerten abstimmbar, Steuerwerte nachvollziehbar und Datenlücken sichtbar.

## Entwicklungsstufe 7 – betriebliche Stabilität und Endabnahme
- Offline/PWA, getrennte sichere Datenhaltung, Sicherung/Restore, Cloud/Google-Drive-Synchronisierung mit Konfliktbehandlung und Versionsschutz, Integritätsdiagnosen und technische Fehlerfälle.
- End-to-End-Regressionsprüfung sämtlicher 41 Feedbackpunkte **sowie** der 68 Punkte des Legacy-Audits; Browser, Druck/A4, Mobilansicht, Jahreswechsel, Datenmigration, Unveränderbarkeit von Archiven, zeitliche Zähler-/Mieterfälle.
- **Single-Source-of-Truth-Gate:** Jede Information besitzt nur eine schreibende Ursprungsmaske; nachgelagerte Ansichten sind lesend, Änderungen entwerten abhängige Prüfungen/Briefe; abgeschlossene Jahre ausschließlich nach kontrolliertem Reopen.
- Freigabe nur nach fachlicher, technischer und Datenschutz-/Backup-Abnahme. Stufe 7 darf keine noch fehlenden Kernfachfunktionen als „Betriebsfehler“ wegklassifizieren.

## Rückverfolgbarkeit: alle 41 Punkte mit primärer Entwicklungsstufe
| Nr. | Kurzanforderung | Primär | Abhängigkeit / Anmerkung |
|---:|---|---:|---|
| 01 | Jahresauswahl 2023/24/25 usw. | 5 | Statusmodell bereits 3A |
| 02 | Öffnen/Schließen/Abschluss/Archiv eindeutig | 5 | Abschluss-Gate aus 4 |
| 03 | Vor- und Nachname trennen | 3B | Briefdaten 4 |
| 04 | Briefanrede explizit | 3B | Briefgenerator 4 |
| 05 | Monat/Jahr für Vorauszahlungen | 3B | Zeitanteile, tatsächliche Zahlung |
| 06 | Weitere Verbrauchsarten bei Mieterwechsel | 3D | Techem/Energieträger |
| 07 | Original-Kostenartenkatalog / gesetzliche Systematik | 3C | Originalparität |
| 08 | Eigene Kostenart anlegen | 3C | Stabile ID |
| 09 | Beleg-/Rechnungsdatum | 3C | Belegverweis |
| 10 | Kostenart löschen/deaktivieren/ausblenden | 3C | Archivschutz |
| 11 | Vermieteranteil fachlich trennen | 3C/3E | Belegt vs. berechnet vs. ungeklärt |
| 12 | Mieter + Wohnung in Zuordnungen | 3C | Durchgängig alle Tabellen |
| 13 | Standardzuordnung berechtigter Teilnehmer | 3C | Bewusste Ausschlüsse |
| 14 | Techem extern statt normaler Mengenverteilung | 3D | Externe Einzelabrechnung |
| 15 | Externe Kosten €/Fall + optionale Einheiten | 3D | Einheit nicht Pflicht |
| 16 | Techem-Preis/Vermieteranteil fachlich prüfen | 3D | Keine künstliche €-Verteilung |
| 17 | Gesamtkosten vs. Einzelerfassung trennen | 3A/3D | Ein Ursprungsort |
| 18 | Techem-Teilbereich bei Verbräuchen | 3D | UX progressiv |
| 19 | Historische Vorjahreszähler im Drawer | 5 | Vergleich 6 |
| 20 | Kleine Zeitreihe/Plausibilitätsvergleich | 6 | Datenbasis 5 |
| 21 | Verbrauchssumme sofort im Wasser-Drawer | 3D | Beide Zähler |
| 22 | Leerstand automatisch aus Mietzeitraum | 3D | Stammdaten 3B |
| 23 | Leerstandsmenge aus belegten Ablesungen | 3D | Fehlwerte blockieren |
| 24 | Leerstand separat im Report | 3D | Zeitreihe 6 |
| 25 | Vorauszahlungen nach Mietverhältnissen | 3A | UX-Reihenfolge |
| 26 | Monat/Jahr in Vorauszahlungen | 3B | Präzisiert 05 |
| 27 | Mietverhältnisfelder dort nur lesend | 3A | Keine Doppelpflege |
| 28 | Vorauszahlungen nur als Zahlungsbearbeitung | 3B | Dauerstamm unverändert |
| 29 | Tatsächlich geleistete Beträge vs. Soll | 3B | Cashflow 6 |
| 30 | Nur eine verantwortliche Eingabestelle | 3A | System-Gate 7 |
| 31 | Alle Masken auf falsche Schreibrechte prüfen | 3A | Regression 7 |
| 32 | Gesamtkosten nur Rechnung/Beleg | 3C | Verbräuche 3D |
| 33 | Einzelmengen nur unter Verbräuche | 3D | Auch Techem |
| 34 | Heiz-/Techem-Bereich bei Verbräuchen | 3D | Externe Einzelwerte |
| 35 | Umlage → „Ergebnis“ | 4 | Navigation ab 3A vorbereitet |
| 36 | Ergebnis nur lesen | 4 | Prüfung vor Ergebnis |
| 37 | Prüfen vor Ergebnis | 4 | Vorläufige Berechnung vorhanden |
| 38 | Briefgenerator vollständig mit 1.0 vergleichen | 4 | Alle Empfänger |
| 39 | Vollständige Briefeinstellungen | 4 | Progressive UX |
| 40 | Originalgerechte Briefgestaltung | 4 | A4-/Sammeldruck |
| 41 | Aktuelle Briefe als unfertige Demo kennzeichnen | 4 | Keine fiktive Freigabe |

**Wichtige fachliche Entscheidungen im Plan:** (a) Eine automatische Leerstands*menge* ist ohne Messwerte nicht bestimmbar; Zeitlücke allein liefert nur Leerstands*tage*. (b) Monatliche Vorauszahlungen im Soll dürfen Ist-Zahlungen nicht ersetzen. (c) Techem-Einzelkosten werden als externe Eurobeträge erfasst, nicht ohne Nachweis aus Einheiten neu berechnet. (d) Der private Abrechnungsfall ist niemals wegen der Rolle von der Umlage ausgenommen. (e) Die öffentliche Demo bleibt auch nach diesen Planungsänderungen unverändert; dieser Commit betrifft nur Dokumentation.

**Ausführungsregel für Folgeaufträge:** Bei Aufforderungen wie „Stufe 3 umsetzen“, „arbeite am Stufenplan weiter“ oder „nächster Entwicklungsschritt“ **diesen aktualisierten Plan als maßgebliche Vorgabe** heranziehen, mit sichtbaren Abnahmekriterien und expliziter Liste noch offener Teilaufgaben. Neue Nutzerentscheidungen haben Vorrang und werden nach Freigabe versioniert eingepflegt.
