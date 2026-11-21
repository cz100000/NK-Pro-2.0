# NK-Pro 2.0 – Designprototyp (nicht produktiv)

Dies ist die **eigenständige Neugestaltung** von NK-Pro. Das ursprüngliche Projekt [cz100000/NK-Pro](https://github.com/cz100000/NK-Pro) bleibt unverändert. Alle Inhalte dieser Demo sind **synthetische Musterdaten**; der aktuelle Stand ist **kein für Nebenkostenabrechnungen zugelassenes Produkt**.

## Demo

Nach der ersten erfolgreichen Pages-Veröffentlichung: **https://cz100000.github.io/NK-Pro-2.0/**

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
