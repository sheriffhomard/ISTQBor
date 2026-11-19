# Architecture technique — ISTQB Academy

## 1. Principes architecturaux

L'application suit une architecture modulaire en couches strictement séparées :

1. **Couche Modèles & Validation (`src/types/`, `src/lib/`)** : contrats TypeScript stricts (`domain.ts`), schémas de validation Zod (`schemas.ts`) et utilitaires de localisation (`localize.ts`).
2. **Couche Données & Persistance (`src/db/`, `src/data/`, `content/`)** : base locale IndexedDB gérée via Dexie.js (`IstqbAcademyDB`), séparation nette entre tables de contenu pédagogique et tables de progression utilisateur, initialisation idempotente (`ensureSeeded`).
3. **Couche Services métier (`src/services/`)** : logique pure et testable indépendante des composants React :
   - `fsrsService.ts` : intégration `ts-fsrs` (calcul d'intervalles, notations `Again/Hard/Good/Easy`, prévisualisation des prochaines échéances).
   - `quizEngine.ts` : sélection filtrée de questions, mélange contrôlé, évaluation multi-formats et génération d'indices de remédiation.
   - `examEngine.ts` : tirage stratifié selon `chapterQuestionDistribution`, persistance en cours de session, correction et ventilation par chapitre et niveau K.
   - `readinessService.ts` : calcul pondéré de l'indice de préparation et identification des lacunes.
   - `plannerService.ts` : génération de plans d'étude hebdomadaires et suivi de complétion.
   - `backupService.ts` : sérialisation JSON complète, nettoyage des clés dangereuses et restauration transactionnelle Dexie.
   - `searchService.ts` : recherche unifiée multi-entités (glossaire, leçons, objectifs, flashcards, questions).
   - `securityService.ts` : assainissement HTML via DOMPurify et protection contre la pollution de prototype (`__proto__`, `constructor`, `prototype`).
4. **Couche Hooks & Interface (`src/hooks/`, `src/components/`, `src/features/`)** : vues React découplées par domaine fonctionnel (`dashboard`, `certifications`, `syllabus`, `flashcards`, `quizzes`, `exams`, `planner`, `glossary`, `progress`, `settings`).
5. **Couche PWA & Internationalisation (`src/i18n/`, `vite.config.ts`, `public/`)** : gestion bilingue `fr` / `en` via `i18next`, manifeste Web App et stratégie Workbox générée par `vite-plugin-pwa`.

## 2. Arborescence du projet

```text
├── content/                 # Packs JSON découplés générés et validés par CLI
├── docs/                    # Documentation technique complète
├── public/                  # Icônes PWA (SVG, PNG 192/512, maskable, Apple Touch)
├── scripts/                 # Scripts CLI de validation, génération, traduction et import
├── src/
│   ├── components/          # Composants transverses (Recherche, Diagrammes SVG, PWA)
│   ├── data/                # Données pédagogiques de référence (FR / EN)
│   ├── db/                  # Schéma Dexie v1/v2 et amorçage idempotent
│   ├── features/            # Vues applicatives spécialisées par module
│   ├── hooks/               # Hooks React (PWA install, réseau, préférences)
│   ├── i18n/                # Configuration i18next et dictionnaires FR / EN
│   ├── lib/                 # Schémas Zod et helpers de localisation
│   ├── services/            # Logique métier pure et transactions IndexedDB
│   └── types/               # Modèles de domaine TypeScript stricts
└── tests/                   # Tests unitaires et d'intégration (Vitest + RTL + fake-indexeddb)
```

## 3. Choix techniques et justifications

- **IndexedDB via Dexie.js** : permet de stocker des milliers de questions, logs de révision FSRS et tentatives d'examens sans les limites de taille ni la nature synchrone de `localStorage`.
- **`ts-fsrs`** : implémentation TypeScript de référence de l'algorithme FSRS, évitant les heuristiques approximatives de type SM-2 simplifié.
- **Zod** : protège toutes les frontières d'entrée/sortie (import de paquets JSON, restauration de sauvegardes, scripts CLI).
- **Vite PWA + Workbox** : assure la disponibilité hors-ligne immédiate de l'enveloppe applicative et des ressources statiques tout en conservant les données utilisateur dans IndexedDB.
