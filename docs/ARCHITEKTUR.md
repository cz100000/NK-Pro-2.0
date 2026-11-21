# Architektur und Grenzen der UX-Demo

## Isolation

Diese App ist ein separates öffentliches GitHub-Repository und eine eigenständige statische HTML/CSS/JS-Demo. Kein produktiver NK-Pro-Code, keine echten Mieterdaten, kein OAuth, keine Google-Drive-Verbindung.

## Zielarchitektur

Fünf UI-Hauptbereiche. Die neue produktive Anwendung soll Darstellung, Domain-/Berechnungslogik, Zustand/Persistenz, Prüfungen, Dokumentengenerator und Cloud-Synchronisation als getrennte Komponenten halten. Der heutige Rechenkern bleibt bis zur fachlichen Gleichheitsprüfung die maßgebliche Referenz.

## Sicherheitsgrenze

GitHub-Pages-Projekte mit URLs /NK-Pro/ und /NK-Pro-2.0/ teilen auf `https://cz100000.github.io` die **gleiche Browser-Origin**, insbesondere `localStorage` und `IndexedDB`. Die Demo verwendet ausschließlich den isolierten Key `nkpro2_design_demo_20261121_v1`; das genügt für den gefahrlosen reinen Musterbetrieb, ersetzt aber keine strenge Origin-Isolierung für spätere Echtdaten.

Für produktive Echtdaten: eigener Hosting-Origin, versionierte Migration, Export/Restore-Gate, sichere Sync-Konfliktprüfung.

## UX-Regeln

Eine Hauptaktion je View, progressive Offenlegung statt Karten-/Buttonflut, ein durchgängiger Objekt-/Jahreskontext, Detailbearbeitung im seitlichen Panel, Prüfentscheidungen mit Ursache, Betrag, Quellenstatus und Nachweis.

## Nicht umgesetzt

Echte Fachlogik, rechtsverbindliche Abrechnung, vollwertige 2025-Datenmigration, A4-Abnahme, mehrjährige Finance-/Steuerbuchhaltung und Google Drive. Die Demo verwendet nur vereinfachte Musterrechnungen.
