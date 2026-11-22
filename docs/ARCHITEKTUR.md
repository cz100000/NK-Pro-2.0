# Architektur und Grenzen der UX-Demo

## Isolation

Diese App ist ein separates öffentliches GitHub-Repository und eine eigenständige statische HTML/CSS/JS-Demo. Kein produktiver NK-Pro-Code, keine echten Mieterdaten, kein OAuth, keine Google-Drive-Verbindung.

## Zielarchitektur

Fünf UI-Hauptbereiche. Die neue produktive Anwendung soll Darstellung, Domain-/Berechnungslogik, Zustand/Persistenz, Prüfungen, Dokumentengenerator und Cloud-Synchronisation als getrennte Komponenten halten. Der heutige Rechenkern bleibt bis zur fachlichen Gleichheitsprüfung die maßgebliche Referenz.

## Sicherheitsgrenze

GitHub-Pages-Projekte mit URLs /NK-Pro/ und /NK-Pro-2.0/ teilen auf `https://cz100000.github.io` die **gleiche Browser-Origin**, insbesondere `localStorage` und `IndexedDB`. Die Demo verwendet ausschließlich den isolierten Key `nkpro2_design_demo_20261121_v1`; das genügt für den gefahrlosen reinen Musterbetrieb, ersetzt aber keine strenge Origin-Isolierung für spätere Echtdaten.

Architekturentscheidung 22.11.2026: bestehendes GitHub Pages und Google Cloud/Drive verwenden, ohne weiteren Anbieter. Der private, verschlüsselte Tresor wird auf dem bestehenden Pages-Pfad /NK-Pro-2.0/private/ bereitgestellt; während NK-Pro 1.0 parallel verfügbar ist, bleibt die gemeinsame Origin ein bewusst dokumentiertes Übergangsrisiko. Die 1.0-Pages-Veröffentlichung wird erst nach voller fachlicher Abnahme und letzten Backups deaktiviert; dadurch endet das aktive alte Frontend, nicht technisch die gemeinsame Origin. Die endgültige fachliche Freigabe und sichere Synchronisierung bleiben eigenständige Gates. Siehe docs/EXISTING_GITHUB_GOOGLE_HOSTING_2026-11-22.md.

## UX-Regeln

Eine Hauptaktion je View, progressive Offenlegung statt Karten-/Buttonflut, ein durchgängiger Objekt-/Jahreskontext, Detailbearbeitung im seitlichen Panel, Prüfentscheidungen mit Ursache, Betrag, Quellenstatus und Nachweis.

## Nicht umgesetzt

Echte Fachlogik, rechtsverbindliche Abrechnung, vollwertige 2025-Datenmigration, A4-Abnahme, mehrjährige Finance-/Steuerbuchhaltung und Google Drive. Die öffentliche Fachtest-Hauptseite verwendet nur vereinfachte Musterrechnungen. Ein zusätzlicher verschlüsselter privater Tresor unter /private/ kann echte Schema-5-Daten lesend importieren und mit Google Drive synchronisieren; dies bedeutet ausdrücklich keine Freigabe echter Abrechnungsfunktionen.

## Integrierter Browser-Fachtest (0.3)

`synthetic-billing.js` verbindet ausschließlich `fixture:true` für 2025 mit der im Testlabor gegen das Original verglichenen 6-Methoden-Portierung. Die Browser-UI verwendet weiter den separaten Demo-Speicherschlüssel; weder Datenimport noch echte Mieterinformationen sind zugelassen. Gegenüber `demo-ledger.js` werden nicht zugeordnete Anteile ausdrücklich offengelassen und als prüfpflichtiger Fehler ausgegeben. Die vollständige Beleg-, Mietwechsel- und Briefparität fehlt weiter.
