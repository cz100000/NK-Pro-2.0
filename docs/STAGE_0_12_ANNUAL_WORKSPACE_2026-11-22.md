# NK-Pro 2.0 – Fachtest 0.12: Jahresabrechnungen

Stand 22.11.2026. Ausschließlich öffentliche **synthetische** Beispieldaten. **Briefe bleiben unverändert.**

## Navigation
„Jahresabrechnungen“ ist ein auswählbarer Elternknoten. Der Klick synchronisiert die aktuell ausgewählte Immobilie und zeigt rechts deren Jahresliste; die Jahresknoten selbst bleiben sichtbar, der redundante „Alle Jahre“-Knoten wurde entfernt. Zurück aus einem Jahr geht in dieselbe Jahresliste. Die Darstellung gilt für jede bestehende und künftige Immobilie durch einen gemeinsamen Renderer.

Jahresliste: aktiv bearbeitbare Entwürfe haben `editAction`, historische eingefrorene Stände `viewAction`. Der Bearbeiten-/Ansehen-Stil wird in Stammdaten, Vorauszahlungen, Kosten, Wasser, Techem und weiteren Verbräuchen wiederverwendet. Statusanzeigen stehen, soweit zuverlässig bestimmbar, unmittelbar neben der Aktion.

## Vorauszahlungen
- `workflow.agreementPreview` berechnet Woche/Monat/Jahr aus einer ausdrücklichen Monats- oder Jahresvereinbarung, plus den Sollbetrag für den tatsächlichen Mietzeitraum. Monatswerte nutzen die anteiligen Tage jedes Kalendermonats; **neu eingegebene** Jahreswerte werden gemäß Tageszahl des Kalenderjahres (Schaltjahre inklusive) umgerechnet.
- Altbestände haben ohne `annualBasis:fullYear` weiterhin die überlieferte Interpretation „vereinbarter Jahresbetrag für den Fall“; keine implizite Umdeutung historischer Summen.
- `workflow.actualPreview` verwendet **ausschließlich erfasste Zahlungseingänge**. Die Erfassung erlaubt einen bestätigten Ist-Gesamtbetrag oder ausdrücklich gebuchte gleiche Monatszahlungen mit Anzahl. Die tatsächliche Summe wird aus den erfassten Zahlungen berechnet, nicht aus dem vertraglichen Soll abgeleitet.
- Rechnerische Ist-Durchschnittswerte pro Woche/Monat/Jahr beziehen sich auf den Mietzeitraum und sind ausdrücklich als Durchschnitt gekennzeichnet, **nicht** als nachgewiesene einzelne Zahlungseingänge.
- Bestehende `paidActual`-Daten bleiben kompatibel. Reale Buchungsjournale, Zahlungseingangsabgleich und teilweise Zahlungen sind noch nicht portiert.

## Gesamtkosten und Verbrauch
- Kostenliste reduziert auf katalogisierte Kostenart, Umlageschlüssel, Rechnungsbetrag, Einheitspreis, Status und einheitliche Bearbeitungsaktion. Gleichmäßige Zeilenhöhe und scrollbare Mobile-Tabelle.
- Kostenkatalog-Semantik: `K002=Wasserversorgung`, `K003=Entwässerung`, `K006=Heiz- und Warmwasserkosten`, `K009=Müllbeseitigung`. Der bisherige fiktive Wasser- und Abwasser-Kombibetrag bleibt bis zum späteren fachlichen Split unter dem vorhandenen Legacy-K002-Mapping, ausdrücklich mit Hinweis; keine stille Aufteilung, kein Doppelansatz. Bereits vorhandene Positionen dürfen nicht erneut als separate katalogisierte Kostenart angelegt werden.
- Cost-Editor: eigene Rechnungsverbrauchsmenge und Live-Berechnung des Einheitspreises bei Verbrauchsschlüssel. Für die Wasserposition bleibt der Rechnungsverbrauch über `data.houseWater` als bestehende Legacy-Schnittstelle angebunden; Wohnungs-/Hauszählerwerte werden davon separat abgeglichen.
- Zuordnung zu Mietverhältnissen: `data-case-include` ist standardmäßig bei sämtlichen Fällen aktiviert. Nicht angekreuzte Fälle werden als `excludedTenantIds[]` gespeichert. Bestehende manuelle Ausschlüsse bleiben durch den Edit-Dialog sichtbar und werden nicht überschrieben.
- Statuswechsel und Löschen von Kostenarten nur aus dem passenden geöffneten Kosteneditor, nach expliziter Bestätigung. Die Domänensperren für historisierte oder externe Werte bleiben bestehen.
- KW/WW-Verbrauchstabellen haben eigene sanfte Farbspalten (blau/orange). Gesamtverbrauch ist optisch stärker. Techem-Status ist nur dann vollständig, wenn ein plausibler Einzel-Eurobetrag vorhanden ist. Weitere Verbräuche zeigen eine erklärende Leerseite für andere Verbrauchseinheiten.
- `Nicht erfasst / Unvollständig / Vollständig` wird in fachlich bewertbaren Tabellen direkt vor der Bearbeiten-Aktion angezeigt. Diese Statuslogik ersetzt ausdrücklich nicht die echten 44 Originalprüfungen.

## Ergebnis und Prüfstatus
Die Ergebnisansicht verwendet die **berechneten** `ledger().tenants[].entries[]`, nicht neu geschätzte Kosten. Je Abrechnungsfall stehen aktive Einzelkostenarten, Umlagekosten, tatsächlich erfasste Vorauszahlungen und Saldo nebeneinander. Eine Summenzeile vergleicht die Verteilung mit den gesamten Kosten. Vorauszahlungen sind aktuell nicht nach Kostenart verbucht; das UI behauptet keine solche Verknüpfung. Keine Aktionsspalte, keine Briefverlinkung.

Der Entwurf und das vorläufige Ergebnis bleiben trotz Prüffehlern bearbeit-/sichtbar. **Finalisierung, produktiver Versand und echte Archivierung bleiben gesperrt**, bis die ausstehenden Originalprüfungen und Brieffreigaben umgesetzt sind.

## Verbindliche Grenzen
Die bereits vorhandenen Demo- und Legacy-Tabellenschlüssel bleiben gleich; nur additive Felder für neu editierten Monats-/Jahres- und Istmodus. Ein Cloudadapter, revisionssichere Synchronisierung, produktive Migration, Belegdatenbank und vollständige NK-Pro-1.0-Parität fehlen weiterhin. NK-Pro 1.0 wird nicht verändert.
