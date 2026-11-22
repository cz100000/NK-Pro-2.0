# NK-Pro 2.0 – Wiederherstellung der verbindlichen 0.13-Architektur
**Stand: 22. November 2026 · strukturelle Korrektur · kein Produktivbetrieb 2025**

## Benutzerentscheidung: ein echtes Objekt statt Muster A, B und C bleiben Dummys

Der vorhandene, bereits abgestimmte und durch den grünen Referenz-Screenshot belegte **0.13-Navigationsbaum** ist verbindlicher Standard. Er darf sich bei einem Wechsel zwischen synthetischen und echten Daten in seiner Struktur, seinen Klassen, Icons, Aufklappzuständen und Bedienlogik **nicht unterscheiden**.

Die gewünschte Anwendungszusammensetzung:

| Position | Anzeige | Datenquelle | Verhalten |
|---|---|---|---|
| Objekt A | Echtes Objekt ARB5 (Name/Adresse nur aus privatem Import) | Schema-5-Migration aus NK-Pro 1.0 | Stammdaten und überlieferte Historie lesend, 2025 neu und leer |
| Objekt B | Musterobjekt B | bestehender v0.13-Testdatensatz | unverändert funktionaler Fachtest |
| Objekt C | Musterobjekt C | bestehender v0.13-Testdatensatz | unverändert funktionaler Fachtest |

Es sind **drei Objekte sichtbar**, davon **ein echtes und zwei Muster**. Es werden keine neuen fiktiven Objekte generiert. Dummys B/C bleiben nach Migration vollständig erhalten und können unverändert für Funktions- und Klicktests benutzt werden.

## Tatsächliche Ursachenanalyse der fehlerhaften vorherigen Implementierung

Vorher stand am Anfang von `app.js` ein vorzeitiger Rücksprung `if(window.NKPRO2_INTEGRATED_APP?.bootstrap()) return;`. Bei geladenen Echtdaten wurde damit die gesamte alte v0.13-Anwendung einschließlich `renderTree`, Navigation, Icons und Fachseiten übersprungen. `integrated-app.js` hatte stattdessen einen eigenen Zweitrenderer mit den abweichenden CSS-Klassen `.nk-live-tree*` eingeführt. Diese erzeugten eine flache, kontrastarme, teilweise kaum sichtbare Seitenleiste ohne Jahres- und Stammdatenbaum. Vorherige Tests kontrollierten nur, ob sich der **falsche** neue Renderer bedienen ließ, nicht, ob das ursprüngliche Design unversehrt blieb.

## Durchgeführte strukturelle Reparatur

1. **Ein Renderer:** `navigation-tree.js` ist eine reine, extrahierte Version des tatsächlichen ursprünglichen 0.13-Icon-/Navigationsrenderers. Seine HTML-/CSS-Klassen bleiben `.tree-property-button`, `.tree-children`, `.tree-group-toggle`, `.tree-section-children`, `.tree-subitem`, `.tree-year`. Sowohl der reale Datenbestand als auch B/C verwenden exakt diesen Code.
2. **Ein Anwendungscontroller:** `app.js` bleibt allein für Routing, aktive Auswahl, Object- und Annual-Pages sowie die Navigation zuständig. Der frühe Rücksprung und der komplette alternative Echtdatenrenderer wurden entfernt. `integrated-app.js` besitzt nur die Google-Drive-/Verschlüsselungsfunktionen unter Systemstatus, publiziert nach Entsperrung ein Datenereignis und erzeugt selbst weder Navigation noch Fachseiten.
3. **Reiner Datenadapter:** `portfolio-view-model.js` transformiert die privat entschlüsselten `nkpro2-integrated-live-v1`-Fachinformationen **nur für die Anzeige** in das ursprüngliche v0.13-Objekt-/Jahresformat. `compose()` ersetzt in der v0.13-Ansicht **nur** `SYN-A` durch das echte Objekt. `SYN-B` und `SYN-C` werden unverändert aus dem bereits gespeicherten Testportfolio übernommen. Die Migration verändert keine Originaldateien und erzeugt keinen neuen unabhängigen UI-Modus.
4. **Historische Archive:** 5 vorhandene schreibgeschützte Original-Snapshots sind erhalten. Der Navigationsbaum zeigt nur einen Eintrag **2023**, in dessen Jahresansicht beide getrennten 2023-Archivfassungen wiederzufinden sind. Der historische gemischte Zeitraum 2021/2022 bleibt eine eigenständige überlieferte Periode. Aus Teilständen werden keine neuen Vollabrechnungen erfunden.
5. **2025 ausschließlich neu:** Das echte 2025 zeigt einen leeren neuen Jahresstand; Kosten, Vorauszahlungen, Messwerte, Techem-Beträge und frühere 2025er Ergebnisse wurden ausdrücklich **nicht** migriert. Der echte Jahresstand ist bis zum Abschluss der Fachlogik schreibgeschützt und wird niemals an die synthetische 0.13-Berechnung übergeben.
6. **Sicherheit:** Der bereits existierende lokale verschlüsselte 2.0-Bestand unter dem unveränderten Schlüssel `nkpro2_live_cloud_encrypted_v1` wird durch Entsperren gelesen; erneutes Importieren ist nicht erforderlich. Google-Drive-Sync, Konfliktprüfungen und historischer Quellimport sind weiterhin Bestandteil des Dialogs **Systemstatus**. Kein echter Privatdatensatz, Passwort oder Token wird in GitHub/Pages eingebettet. NK-Pro 1.0 bleibt vollständig unverändert.
7. **CSS:** Die zweite, gestalterisch falsche `.nk-live-tree*`- und `.nk-live-page*`-CSS-Welt wurde vollständig entfernt. `styles.css?v=0.13` wird als einzige Stylingquelle für den Objektbaum und die Fachseiten unverändert weitergenutzt. `integrated-ui.css` enthält nur noch die Styles für den Systemstatus-Cloud-Dialog.

## Verbindliche Prüftore / technische Nichtverhandelbarkeit

- **Keine zweite Navigation:** Ein statischer Test darf in `integrated-app.js` keinerlei DOM-Ersatz von `#portfolioTree`, `#appMain`, zusätzliche `nk-live-tree`-Klassen oder die alte `bootstrap()) return`-Kurzschlusslogik finden.
- **Stammdaten:** Ein Objekt ARB5, sieben Wohnungen, fünf Mietverhältnisse (M000 ab 01.01.2010 als regulärer Teilnehmer), 16 Zähleridentitäten; vorhandene Hauszähler sind nicht zu erfundenen Wohnungen zuzuordnen.
- **Altjahre:** Exakt fünf übernommene, unveränderliche Archive; für 2023 zwei getrennte Originalstände innerhalb nur eines Navigationseintrags; echtes 2025 ohne übernommene Abrechnungswerte.
- **B/C:** Identischer Modellinhalt vor/nach Projektion, bestehende Bearbeitungs-/Berechnungsabläufe, Ausgangs-Jahresstände und mobile Navigation weiterhin benutzbar.
- **Originaler grüner Baum:** Identische SVG-Icons, Tabellen/Layoutklassen, Einrückungen, `aria-expanded`-Attribute, Kapitel `Stammdaten` und `Jahresabrechnungen`, Jahres-Buttons und Kontext-/Breadcrumb-Logik; kein pseudo-deaktivierter, kontrastarmer zweiter Baum.
- **Browserabnahme:** echte Chromium-Desktop-/Mobile-Klickfolgen, fünf Archivstands-IDs, 2025 ohne Altbeträge, B/C-Navigation, Offline-Restore und simulierte verschlüsselte Google-Drive-Synchronisierung.
- **Kein Blind-Deployment:** Vor Abschluss der Regressionsprüfungen und Sichtprüfung des grünen Baums kein Merge des Entwicklungszweigs in `main`.

## Bewusste fachliche Grenzen

Die neue Echtobjekt-Anzeige nutzt bereits originale 0.13-Objekt-/Jahres-/Stammdatenkomponenten. Die vollständige fachliche Bearbeitung und Rechnungsfreigabe mit Echtdaten ist **noch nicht produktiv**. Statt unbestätigte neue Ergebnisse zu berechnen, ist die echte Abrechnung 2025 bis zur geprüften Vervollständigung schreibgeschützt. Das schützt die Echtdaten, ohne die Funktionen der Musterobjekte B und C zu beschneiden.

**Dokumentierte Abnahme:** Die vollständige Original-Schema-5-Quelldatei wurde ausschließlich in der privaten Ausführungsumgebung mit dem neuen Adapter ohne Datenveröffentlichung geprüft: 1 Quellobjekt, 7 Wohnungen, 5 Mietverhältnisse, 16 Zähler, 2 nicht wohnungsbezogene Hauszähler, 5 Archive, 2 Archivfassungen für 2023, neue leere 2025. In allen öffentlichen Tests werden ausschließlich frei erfundene Namen, Adressen und Rechnungswerte verwendet.
