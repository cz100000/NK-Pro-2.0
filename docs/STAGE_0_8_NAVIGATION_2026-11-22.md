# NK-Pro 2.0 – Fachtest 0.8: Vereinfachte linke Navigation

**Datum:** 22.11.2026 · **Umfang:** Navigation und Lesbarkeit, keine Produktivfreigabe.

## Anlass
Fachtest 0.7 stellte fünf Hauptpunkte über einem zusätzlichen Objektbaum dar. Diese Doppelung führte zu uneindeutiger Zuständigkeit von Objekt- und Jahresdaten. Nutzerfeedback vom 22.11.2026 verlangt einen einzigen objektzentrierten Navigationspfad.

## Umsetzung
1. **Startseite:** Übergreifender Einstieg mit allen verwalteten Immobilien.
2. **Immobilienbaum:** Pro Objekt die Gruppen **Stammdaten** (Objektdaten, Wohnungen, Mietverhältnisse, Zähler) und **Jahresabrechnungen** (Alle Jahre und vorhandene Jahre). Nur ein Objektzweig zugleich geöffnet.
3. **Abrechnungs-Workflow:** Sechs Schritte Vorauszahlungen, Gesamtkosten, Verbräuche, Prüfen, Ergebnis, Briefe bleiben rechts als Tabs. Keine Duplikate im linken Baum.
4. **Objektübergreifend:** Eigene Einstiege **Analysen** und **Dokumente & Archiv** am unteren Ende der Sidebar. Keine Hervorhebung eines Objekts in diesen Bereichen.
5. **Lesbarkeit:** Sidebar 268 Pixel auf Desktop, 250 Pixel an kleineren Desktop-Breakpoints und 280 Pixel im mobilen Menü; Schriften und Zeilenhöhen vergrößert.
6. **Kontext:** Breadcrumbs unterscheiden Objekt und Jahr von globalen Bereichen.
7. **Datenerhalt:** Unveränderter LocalStorage-Key `nkpro2_synthetic_portfolio_0_7_v1`, keine Migration und keine Veränderung der Altanwendung.

## Grenzen
Die globale Analyse aggregiert noch nicht alle Immobilien/Jahre. Dokumente & Archiv hat noch keinen vollständigen objektübergreifenden Index. Das Portfolio enthält ausschließlich fiktive Testdaten; Fachstufen 3–7 und Produktivfreigabe bleiben offen.

## Qualitätssicherung
Bestehende Browser-Smoke- und Chromium-Klicktests sind auf die neue Navigation angepasst. Ein zusätzlicher Smoke-Test kontrolliert eindeutige Haupteinstiege, Baumaufklappung, Jahresnavigation, aktive Auswahl und globalen Kontext. Automatisierte Tests sind keine visuelle Nutzerabnahme.
