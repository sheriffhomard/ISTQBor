# Stratégie et vérification des tests — ISTQB Academy

## 1. Pyramide de tests

| Niveau | Outils | Périmètre couvert |
| :--- | :--- | :--- |
| **Typage statique** | `tsc --noEmit` (TypeScript strict) | Contrat de types, sûreté des accès indexés, imports |
| **Intégrité des contenus & i18n** | `tsx scripts/validate-content.ts`, `tsx scripts/check-translations.ts`, `tsx scripts/import-content.ts` | Validation Zod des certifications/questions/flashcards, distributions d'examens, parité 100 % FR/EN |
| **Tests unitaires** | `Vitest` | Moteur FSRS (`ts-fsrs`), moteur QCM multi-formats, générateur d'examens blancs, calcul de l'indice de préparation, planificateur |
| **Tests d'intégration** | `Vitest + React Testing Library + fake-indexeddb + jsdom` | Amorçage idempotent IndexedDB, export/import JSON transactionnel avec protection anti-pollution de prototype, navigation UI et changement de langue FR/EN |
| **Tests E2E (Roadmap V1.2)** | `Playwright` | Parcours navigateur réel complet et installation PWA (non exécutés dans cet environnement conteneurisé) |

## 2. Suites de tests implémentées

- `tests/unit/fsrs.test.ts` : création d'état initial, planification `Again` / `Good` / `Easy`, incrémentation des compteurs et persistance des logs dans IndexedDB.
- `tests/unit/quiz_exam.test.ts` : évaluation exacte de QCM choix unique, choix multiple et appariement, génération d'examen blanc CTFL v4.0 respectant la distribution `8/6/4/11/9/2` et calcul du verdict de réussite.
- `tests/unit/readiness_planner.test.ts` : calcul transparent de l'indice de préparation sur base vide et alimentée, détection des chapitres faibles, génération des activités du planificateur.
- `tests/integration/indexeddb_backup.test.ts` : préservation des progrès utilisateur lors d'un ré-amorçage (`ensureSeeded`), cycle complet export/import JSON et rejet des fichiers corrompus ou surdimensionnés.
- `tests/integration/app_ui.test.tsx` : montage complet de l'application, affichage du tableau de bord, bascule de langue FR/EN et navigation entre les modules.

## 3. Commandes d'exécution

```bash
npm run lint
npm test
npm run validate:content
npm run check:translations
npm run build
```
