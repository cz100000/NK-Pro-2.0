# Wasser 2025 · experimenteller Fachadapter (nicht produktiv)

Quellvertrag: [V99.4.86 `billing-calculation.js`](https://github.com/cz100000/NK-Pro/blob/a089e1fe660dd5502799560efe2bc4b65a09f278/js/billing-calculation.js), Git-Blob `59947f89249457a505deb5eb8c674350b01b9f30`.

Das neue Modul [`experimental/water-2025.js`](../experimental/water-2025.js) reproduziert für den **explizit bestätigten K002/2025-Sonderfall** die alte Rundung: Ablese-Anfangs- und Endstand jeweils auf ganze m³ runden und danach Verbrauch als Differenz ermitteln. Diese Sonderregel wird **nur** bei Abrechnungsjahr 2025 und bestätigter Evidenz `houseConsumption:275`, `readingDate:2025-12-30` verwendet.

Fachliche Invarianten:
- Auch private Nutzungsverhältnisse werden als normale Teilnehmer bei der Wasserberechnung berücksichtigt.
- Fehlende oder rückläufige Messwerte werden nicht still durch Vorjahres-, andere Zähler- oder Hausdifferenzwerte ersetzt. Status wird zur Prüfung ausgewiesen.
- Der Hausverbrauch (275 m³ im bestätigten Referenzfall) wird gegen die aufsummierten Wohnungs-Kalt-/Warmwasserzähler gestellt; **Differenzen werden nicht automatisch umgelegt**.
- Vorjahresübernahme erzeugt ausschließlich eine **Vorschau/Entwurf** und schreibt nie die Eingangsdaten. Zähleridentität wird geprüft, vorhandene Anfänge bleiben unberührt; unklare Zuordnungen und nicht-ganzzahlige Vorjahresendstände müssen geklärt werden.

**CI-Parität:** Das Modul wird mit synthetischen Kalt-/Warmwasserständen direkt gegen `NKProBillingCalculation.waterConsumption` und `meterTotalForCostAndTenant` aus dem gepinnten Originalcode verglichen. Tests umfassen private Belegung, fehlende Messwerte, negative Differenzen, Rundung und kontrollierte Vorjahresübernahme.

**Nicht enthalten:** echte Objektdaten, Messperiodensynchronisierung, Zählerwechsel/Überläufe, vollständige 14-Wohnungszähler-Identität, Druck/Briefe, abrechnungsfähiger Wasserpreis und Vollintegration. Dieses Modul ist **nicht im öffentlichen UI geladen** und darf nicht für reale Abrechnungen benutzt werden.
