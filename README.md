# NK-Pro 2.0 – Designprototyp (nicht produktiv)

Dies ist die **eigenständige Neugestaltung** von NK-Pro. Das ursprüngliche Projekt [cz100000/NK-Pro](https://github.com/cz100000/NK-Pro) bleibt unverändert. Alle Inhalte dieser Demo sind **synthetische Musterdaten**; der aktuelle Stand ist **kein für Nebenkostenabrechnungen zugelassenes Produkt**.

## Demo

Interaktive, veröffentlichte Design-Demo: **https://cz100000.github.io/NK-Pro-2.0/**

Die Anwendung ist ein interaktiver Entwurf für eine minimalistische Benutzerführung. Sie enthält die fünf Hauptbereiche **Übersicht, Abrechnungen, Objekt, Analysen, Dokumente & Archiv** sowie den zusammenhängenden Musterworkflow Kosten → Verbräuche → Vorauszahlungen → Ergebnisse → Prüfen → Briefe.

## Wichtige Hinweise

- Die Demo ist **nicht** mit dem echten NK-Pro-Rechenkern verbunden. Angezeigte Umlageergebnisse sind ausdrücklich vereinfachte Beispiele.
- Es gibt **keinen Import von NK-Pro-1.0-Daten**, keine echte Google-Drive-Synchronisation, keinen rechtlich belastbaren Abschluss und keine produktive Druck-/Brief-Freigabe.
- Speichern erfolgt ausschließlich unter dem separaten Browser-Key `nkpro2_design_demo_20261121_v1`. Die Anwendung liest oder schreibt keine NK-Pro-1.0-Schlüssel.
- **Keine echten personenbezogenen Daten eingeben.** Das Projekt ist öffentlich und vorerst nur ein UX-Prototyp.
- Beide GitHub-Pages-Projekte liegen unter derselben Web-Origin `cz100000.github.io`. Ein separater Pfad ist **keine vollständige Browser-Speicherisolation**. Für produktiven Einsatz wird eine eigene Domain/Hosting-Origin geprüft.

## Dateien

- `index.html` – minimalistische Navigations- und Anwendungsstruktur
- `styles.css` – responsive Designsystem-Styles
- `app.js` – reine Demo-Interaktionen mit synthetischen Daten
- `.github/workflows/pages.yml` – Deployment als GitHub-Pages-Site
- `docs/` – Architektur, Funktionsumfang, Roadmap und Teststatus

## Entwicklung

Die aktuelle Entwicklungsstrategie ist **UX zuerst, Fachparität vor Produktivfreigabe**. Die bisherige Abrechnungslogik wird zunächst anhand eines Golden Masters mit allen Sonderfällen überprüft, bevor echte Berechnungen in NK-Pro 2.0 freigegeben werden.

**Projektstatus und Plan:** https://chatgpt.com/space/page_7bbf6b4cfefc8191bd962a700b8caa61

## Demo-Version 0.2: prüfbare Muster-Umlage

- Reiner Demo-Rechenkern in `demo-ledger.js` (keine Produktivabrechnung und kein Datenimport).
- Jeder synthetische Bruttokostenbetrag kann einen ausdrücklich **nicht umgelegten Vermieteranteil** enthalten.
- Cent-genaue Verteilung synthetischer Fläche/Verbrauch mittels deterministischem Restcent-Verfahren; alle Summen prüfbar.
- Neue Berechnungsnachweise je Mustereinheit; Eingabe- und Umlagefehler blockieren die simulierte Freigabe.
- Wasserdifferenzentscheidungen werden bei jeder einzelnen Zähleränderung ungültig, auch wenn die Zählersumme unverändert bleibt.
- Bereits bestätigte Musterbriefe gelten nach jeder Betrags-/Stammdatenänderung als erneut prüfpflichtig.
- Automatisierte Node-Tests: `npm test`. Der GitHub-Pages-Workflow wird erst nach erfolgreichen Tests deployen.

**Wichtig:** Diese Verbesserungen dienen der technisch geprüften Demo-Verarbeitung. Der ursprüngliche NK-Pro-Rechenkern ist weiterhin **nicht migriert** und muss vor Echtdaten-Nutzung centgenau verglichen werden.

## Entwicklungsstand · Fachmigration (experimentell)

Die Oberfläche ist als eigenständiger UX-Prototyp veröffentlicht. Die tatsächliche Abrechnungslogik wird derzeit **getrennt von der Demo** aufgebaut und gegen die bestehende V99.4.86-Version verglichen.

- **Sechs Umlageverfahren** sind in [`experimental/settlement-cost.js`](experimental/settlement-cost.js) als isolierte Referenzportierung implementiert und in synthetischen Fällen direkt gegen den gepinnten Original-Rechenkern getestet: Wohnfläche, Personentage, Miettage, Verbrauch, alle Wohneinheiten und aktive Wohneinheiten.
- **60 automatisierte Tests** bestanden im zuletzt abgeschlossenen GitHub-Actions-Lauf. Darunter sind Originalvergleich, Leerstand, Teiljahre, Privatnutzung, Mieterwechsel und Summenprüfung.
- **17 bestehende Menüpunkte und 4 interne Seiten** sowie **44 Qualitätsregeln** sind in einer [maschinell geprüften Ist–Soll-Matrix](docs/MIGRATION_COVERAGE.md) vollständig einem Zielbereich zugeordnet. Die Regeln sind ausdrücklich noch nicht portiert.
- Technische Übersicht: [Legacy-Paritätsbericht](docs/EXPERIMENTAL_LEGACY_PARITY.md) und [Original-Kontrakt](docs/LEGACY_PARITY_CONTRACT.md).

**Noch nicht umgesetzt:** vollständige Originalberechnung einschließlich externer Techem-Fälle, vollständige Qualitätssicherung, sichere Datenmigration, professionelle Briefe/PDF, Archiv und Drive-Synchronisation. Die Design-Demo darf nicht für echte Nebenkostenabrechnungen genutzt werden. Die produktive NK-Pro-1.0-Anwendung bleibt unangetastet.

## Experimenteller Legacy-JSON-Inspektor (noch keine Datenübernahme)

Für die spätere sichere Migration gibt es ein [separates, ausschließlich lesendes Prüfmodul](docs/LEGACY_BACKUP_PREVIEW.md). Es unterscheidet rohe NK-Pro-JSON-Exporte von mit Prüfsummen geschützten Sicherungen, kontrolliert die Original-Prüfsummen und liefert nur anonymisierte Strukturangaben. Es ist nicht in die öffentliche Website eingebunden, lädt keine Daten hoch und bietet **keinen Import oder Restore**. Die bestehenden NK-Pro-Dateien werden davon nicht berührt.

## Wasser 2025, Techem und Prüfentscheidungen – experimentelle Fachmodule

**60 automatisierte Tests bestanden** (Stand: 21.11.2026). Drei neue, ausdrücklich **nicht produktive** Bausteine wurden implementiert und über synthetische Referenzfälle getestet:

- [Wasser-2025-Referenzlogik](docs/WATER_2025_PARITY.md): bestätigte K002-Rundungsregel, getrennte KW-/WW-Werte, Haus-/Wohnungsdifferenz sowie Entwurf einer kontrollierten Vorjahresübernahme. Originalfunktionen aus V99.4.86 werden im Node-Test direkt ausgeführt und verglichen.
- [Techem / externe Einzelabrechnung](docs/EXTERNAL_TECHEM_PARITY.md): konkrete Abrechnungsfälle für Mietwechsel, Privatanteil, Leerstand sowie ein getrennt dokumentierter, ausschließlich vermieterseitiger 3,88-€-Posten. Auch hier werden Originalverhalten und neue Implementierung mit synthetischen Fällen abgeglichen.
- [Gemeinsamer Prüfadapter](docs/WATER_EXTERNAL_REVIEW.md): Prototyp für kritische Mängel, bewusst bestätigte Abweichungen und automatische Neubewertung bei Quelländerungen. Eine echte Freigabe bleibt bewusst technisch gesperrt.

**Noch nicht umgesetzt:** Echte Techem-Belegdaten und CO₂-Kosten, vollständiger 2025-Datenimport, alle 44 Qualitätsregeln, vollständige Abrechnungsbriefe, produktive Archivierung und Cloud-Synchronisation. Die öffentliche Demo lädt diese drei experimentellen Komponenten bewusst nicht. Nur die ursprüngliche NK-Pro-1.0-App kann vorerst reale Nebenkosten abrechnen.
