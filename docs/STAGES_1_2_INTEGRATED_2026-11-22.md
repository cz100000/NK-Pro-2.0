# NK-Pro 2.0 · Integrierte Entwicklung Stufe 1 + 2
**22. November 2026 · Funktionsmuster 0.5 · ausschließlich synthetische Musterdaten**

## Warum beide Stufen zusammengeführt wurden
Abrechnungsfälle verknüpfen Mietzeiträume und Personen mit Wohnungsstammdaten, Zählerabschnitten und Kostenarten. Getrennte unabhängige Implementierungen würden Widersprüche erzeugen. Die Fachmodule sind deshalb gemeinsam verbunden, während die bereits freigegebene schlanke UX mit fünf Hauptbereichen erhalten bleibt.

## In der Browserdemo tatsächlich umgesetzt
- **Objekt/Verwaltung:** synthetischer Objektstamm mit stabiler ID, Wohnungen mit Flächen, Lagen, Aktivstatus; Bearbeitungsbereich für Objektstamm.
- **Mietverhältnisse:** mehrere datierte Mietverhältnisse je Wohnung, Personen, Nutzungsart Mieter/Privatanteil/Eigennutzung, eigene Vorauszahlungen, überschneidungsfreie Zeitleiste und Leerstandstage. Privat-/Eigennutzung schließt Abrechnungsteilnehmer nicht aus.
- **Abrechnungsfälle:** sechs bereits mit Original V99.4.86 verglichene Umlageverfahren nun an die 2025-Abrechnungsfälle gebunden; nach Mietzeitraum und Personen zugeordnet; fallbezogene Ergebnisse und Vorauszahlungen, explizite Restdifferenzen.
- **Kosten:** je Kostenart eigene Verbrauchsbasis und Menge/Einheit/Fallwerte; automatische oder manuelle Preisbildung, Ausschluss einzelner Teilnehmer (mit unterscheidbarer Restbehandlung), Vermieteranteil und beliebiger Notiztext.
- **Wasser:** getrennte KW-/WW-Ablesungen, erhaltene Rohwerte inklusive Dezimalstellen, Hauszähler und Rechnung; zwei Kontrollabgleiche; Zählerwechsel über einen datierten Dialog mit getrennten physischen Messabschnitten; 2025-Rundung nur mit ausdrücklichem Evidenzmerkmal; Vorjahresübernahme **nur als Prüfvorschau**.
- **Fehlersperren:** Überlappungen, fehlende Verbrauchsaufteilung beim Mieterwechsel, unzugeordneter Verbrauch bei Leerstand und fehlende Eingaben werden nicht als vollständig abgerechnet. Der Stand ist ausschließlich synthetisch.

## Grenzen: Stufe 1 und 2 sind noch NICHT fachlich vollständig erledigt
1. Original-Objektstandard einschließlich voller Mieterhistorie und automatischem Stammdatenabgleich; periodengenaue Zuordnung physischer Zähler zu beliebigen Teilzeiträumen.
2. Verbindliche Vorjahresübernahme einschließlich Datenhistorie und Zählerwechsel-/Überlaufbehandlung, echte 2025-Beweisunterlagen, vollständige Rundungs-/Eichsachverhalte und Golden-Master-Cent-Parität aller relevanten Sonderfälle.
3. Vollständiger K001–K040-Kostenkatalog und sämtliche Originalkosten-/Verteilungssonderfälle; Techem-Einzelwerte, CO₂-Vermieterrest, manuelle Beträge und abweichende Kostenverteilungen.
4. Getrennte echte Mietkosten-/Einnahmensicht, Vorauszahlungsmatrix, 44 Prüfregeln und dynamische Differenzprüfung, Dokumentengenerator, Abschluss, Archiv, Analysen.
5. Separate Hosting-Origin und transaktionaler Import/Backup/Restore zwingend vor personenbezogenen Daten. Kein produktiver NK-Pro-2.0-Betrieb.

## Nächste fachliche Abnahme
- Testfälle der 1.0-Originalengine für Mieterwechsel, KW/WW-Sonderfälle, Kosten und Leerstand ausführen und vollständige Abrechnungsergebnisse je Person und Kostenart vergleichen.
- Kosten- und Zählerbestand auf prüfbare historische IDs und Zeitabschnitte erweitern, Techem-Einzelabrechnung integrieren.
- Erst danach Datensicherheit, Abschluss-/Briefprüfung, Archiv und kontrollierte parallele Abnahme vorbereiten.

**Schutz:** NK-Pro 1.0 bleibt im produktiven Repository unverändert. Die öffentliche 0.5-Demo darf keine echten Personen, Adressen oder Originalbackups enthalten.
