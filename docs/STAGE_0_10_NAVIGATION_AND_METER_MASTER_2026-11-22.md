# NK-Pro 2.0 – Fachtest 0.10: Navigation und Zählerstamm

**Datum:** 22.11.2026. **Umgebung:** öffentliche, ausschließlich synthetische Testdemo; keine Echtdaten.

## UI-Änderungen
Die Startseite steht als eigenständiger Navigationspunkt über einer Trennlinie. Die Objektgruppe heißt `OBJEKTBEZOGEN`, die globale Gruppe `OBJEKTÜBERGREIFEND`; Typografie, Einrückung und Linien sind vereinheitlicht. CSS-Regel `.tree-subitem > span` aus 0.7/0.9 verschob vorher unbeabsichtigt jedes erste Icon durch `margin-left:auto`. Diese Ausnahme wurde ausdrücklich für `.tree-icon` aufgehoben und ausschließlich `.tree-meta` rechtsbündig gehalten. Jahresunterpunkte verwenden dieselben Icons/Innenabstände. Das gilt für alle Objekte, da derselbe Baumrenderer verwendet wird.

Die Wohnungsliste ist die einzige Wohnungsstammdaten-Ansicht. Sie zeigt Wohnungsname, feste ID, Lage und Fläche sowie eine Bearbeiten-Aktion je Zeile. Es gibt keine separate Wohnungsdetailseite und keinen Sprung zu Zähler- oder Jahresansichten. Die Objektübersicht bleibt als separater Einstieg erhalten.

Die Zählerverwaltung gruppiert Zähler pro Wohnung mit aufklappbaren Tabellen, jeweils ohne Seitenwechsel. Einträge zeigen Typ, Zähler-ID, Nummer, Raum/Heizkörper, Status und eine lokale Bearbeiten-Aktion. Die Objekt-Stammdaten werden ausschließlich hier geändert. Die objektbezogene Zählerzählung zeigt sämtliche physisch angelegten oder als Platzhalter geführten Datensätze.

## Dauerhaftes Datenmodell
`object.meterRegistry: Meter[]` ist die **einzige schreibbare Quelle** für physische Zähler. Ein Meter hat die stabile `id`, `unitId`, `type`, `number`, `room`, `radiator`, `status`, `installedOn`, `removedOn` und `note`. Typen: `cold`, `hot`, `electricity`, `heat`. Status: `active`, `placeholder`, `retired`. Stammdatenänderungen erhöhen die bestehende Objekt-`revision` und Cloudvorbereitungs-`sync.version`, nicht die Version eingefrorener Jahresabrechnungen.

Vorherige 0.7/0.9-Portfolios werden im bestehenden LocalStorage-Key `nkpro2_synthetic_portfolio_0_7_v1` bei `upgradePortfolio` um eine deterministisch benannte Zählerregistrierung ergänzt, **ohne historische Jahresdatensätze umzuschreiben**. Je Wohnung werden bestehende KW-/WW-Zähler als Stammdatensätze aufgenommen, dazu **ein Strom-Platzhalter und zwei Techem-Platzhalter** (beispielhaft Wohnzimmer/Schlafzimmer, nicht als echte Bestandsaussage). Die Registrierung wird nach der ersten Anlage nicht erneut generiert. Für neu angelegte Wohnungen gilt dieselbe Vorlage.

`unit.meters.cold/hot` bleibt aus Kompatibilitätsgründen als *abgeleitete Legacy-Projektion* erhalten; Formulare dürfen es nicht direkt verändern. Die physische Zähleridentität wird in `meterRegistry` gepflegt. Jahresdatensätze halten historische, geprüfte Zählerstände und ihre damalige physische Zuordnung unverändert. Jahresbasierte Zählernummern sind in der Erfassungsmaske schreibgeschützt; ein dokumentierter Zählerwechsel darf nur auf einen zuvor im Stammdatenbereich erfassten, aktiven neuen Zähler verweisen. Diese Regel gilt auch auf Speicherebene der UI. Die vollständige zeitliche und physische Migration der 1.0-Bestände ist weiterhin offen.

## Sicherheitsregeln und Cloudvorbereitung
- IDs für neue Zähler dauerhaft stabil, durch die registrierte Wohnung referenziert; keine Verschiebung zwischen Wohnungen oder Zählertypen durch Umbenennung.
- Keine doppelten aktiven KW- oder WW-Zähler pro Wohnung; keine mehrfach vergebene aktive Zählernummer im Objekt. Für Techem muss ein Raum angegeben werden.
- Historisch in Jahresdaten benutzte Wasserzähler dürfen nicht endgültig gelöscht und ihre Zählernummern nicht nachträglich umgeschrieben werden. Bei Wechsel: bisherigen Zähler außer Betrieb setzen, neuen Datensatz anlegen, dann jährliche Messperioden dokumentieren. Nicht verwendete Zähler können endgültig entfernt werden.
- Zähler liegen im versionierten Objektstamm des providerneutralen `syncSnapshot`; der bestehende `planSync(base,local,remote)` erkennt konkurrierende Änderungen auf diesem Objektstamm als Konflikt statt last-write-wins. Eine feinere Cloud-Record-Aufteilung kann später ergänzt werden.
- Keine Google-Cloud-Verbindung, keine OAuth-Anmeldung, keine synchronisierte Speicherung und keine sichere Echtdaten-Origin. Für die produktive Nutzung fehlen Backup-/Restore, echte Migration und Prüffreigabe.

## Tests
Regressionen kontrollieren 7/3/2 Wohnungen, idempotente Bestandsergänzung, Zähler-CRUD, Historien-Sperre, Jahr-Neuanlage nach Zählerwechsel, Master-/Jahres-Datentrennung, logische Navigationszuordnung sowie Chromium-Klickfolgen und Mobilansicht. Bei Abweichungen ist die Fachtest-Version nicht freizugeben.

**NK-Pro 1.0 bleibt unverändert. Die Stufen 3–7 bleiben offen.**
