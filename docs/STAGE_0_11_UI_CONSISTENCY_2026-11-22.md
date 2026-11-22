# NK-Pro 2.0 – Fachtest 0.11: einheitliches Objekt-UI

Datum: 22.11.2026 · Weiterhin **synthetischer Fachtest ohne Produktionsfreigabe**.

## Benutzeroberfläche
- Die Navigationshierarchie ist typografisch vereinheitlicht: Startseite = primäre Aktion, OBJEKTBEZOGEN/OBJEKTÜBERGREIFEND = hervorgehobene Bereichsüberschriften, Immobilien und Stamm-/Jahresordner = normalgewichtige untergeordnete Ebenen. Bei aktivem Eintrag erfolgt eine dezente Hervorhebung.
- Die Startseite nutzt dieselbe tabellarische Darstellungslogik wie die Stammdatenlisten: Objektname/ID, Adresse, Wohnungszahl, Anzahl Jahresabrechnungen sowie Öffnen und optionale Objektaktionen. Archivierte Immobilien sind weiterhin unter einer aufklappbaren Archivliste erreichbar. Keine Kachelansicht.
- Die Objektstammdaten-Ansicht zeigt nur die Daten des gewählten Objekts; Sprungaktionen zu Wohnungen, Mietverhältnissen und Jahresabrechnungen wurden entfernt.
- `editAction(action,id,subject)` ist die einheitliche Renderkomponente für das Bearbeiten aller permanenten Objektstammdaten, Wohnungen, Verträge und Zähler, mit konsistentem SVG-Stift, dezenter blauer Kontur, Text und ARIA-Beschriftung. Alle Objektseiten durchlaufen denselben Renderer, daher gilt sie auch für neue Immobilien.

## Sichere Zählerverwaltung
- In der pro Wohnung gruppierten Zählerliste gibt es pro Zähler nur den Bearbeiten-Button, keine destruktive Aktion.
- Der Dialog `master-meter` ergänzt **unter dem Formular**, klar getrennt, einen Verwaltungsbereich. Bei aktivem Zähler: `Zähler außer Betrieb setzen`. Bei einem unreferenzierten Platzhalter oder stillgelegten Zähler: `Zähler endgültig löschen`. Bei historisch referenzierten Zählern bleibt das Löschen gesperrt.
- Aktionen sind auf UI-Ebene nur erlaubt, wenn genau dieser Zähler im Editierdialog geöffnet ist. Danach ist eine separate browserseitige Bestätigung erforderlich. Der Domain-Layer `retireMeter`/`deleteUnusedMeter` prüft wie bisher die Daten- und Historienregeln und führt revisionsgesicherte Updates aus.
- Bei Abbruch bleibt alles unverändert; nach erfolgreicher Aktion wird der Dialog geschlossen und die Zählerliste aktualisiert. Jahresabrechnungsdaten werden nicht verändert.

## Regression und noch offene Punkte
Browser-Smoke-Tests prüfen dieselbe Edit-Komponente bei allen 7 Wohnungen und Mietverhältnissen und 35 Zählern des Musterobjekts A, eine neue Immobilie, Archivliste, fehlende Querverlinkungen und den Abbruch bzw. die Bestätigung gefährlicher Aktionen. Chromium-E2E prüft Desktop- und Mobilansichten, Listen und Bearbeitungsdialoge.

Weiter offen sind ursprüngliche NK-Pro-1.0-Funktionsparität, vollständige historische Migration, Google-Cloud-Adapter, Datenschutz-/Backupsystem, sichere getrennte Origin und produktive Jahresabrechnung. Keine echten Mieterinformationen in den öffentlichen Fachtest eingeben.
