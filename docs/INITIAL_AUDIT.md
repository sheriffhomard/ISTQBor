# Audit Initial du Dépôt — ISTQB Academy

Date : 2026-11-19  
Version cible : V1.0  
Statut : Phase 1 (Audit initial terminé)

---

## 1. État actuel du dépôt

Le dépôt est une application squelette générée sous Vite + React + TypeScript + Tailwind CSS v4 :

- **Fichiers racine** : `.env.example`, `.gitignore`, `index.html`, `metadata.json`, `package.json`, `tsconfig.json`, `vite.config.ts`.
- **Code source (`src/`)** :
  - `src/main.tsx` : Point d'entrée React 19 (`createRoot`).
  - `src/App.tsx` : Composant vide (`<div></div>`).
  - `src/index.css` : Contient uniquement `@import "tailwindcss";`.
- **Dépendances installées** :
  - Runtime : `react` (^19.0.1), `react-dom` (^19.0.1), `vite` (^8.3.0), `@vitejs/plugin-react` (^6.1.1), `@tailwindcss/vite` (^4.3.3), `lucide-react` (^0.546.0), `motion` (^12.23.24), `@google/genai` (^2.4.0), `express` (^4.21.2), `dotenv` (^17.2.3).
  - Dev : `typescript` (^7.0.2), `@types/react`, `@types/react-dom`, `@types/node`, `@types/express`, `tsx`, `esbuild`, `tailwindcss`, `autoprefixer`.

---

## 2. Points conformes

1. **Socle Frontend moderne** : React 19, TypeScript, Vite 8 et Tailwind CSS v4 sont déjà configurés et prêts à l'emploi.
2. **Qualité de configuration Vite** : Le fichier `vite.config.ts` gère correctement les alias (`@`) et les contraintes environnementales (`DISABLE_HMR`).
3. **Gestion de la configuration TypeScript** : `tsconfig.json` utilise `ES2022`, `moduleResolution: "bundler"` et `jsx: "react-jsx"`.
4. **Absence de dettes techniques héritées** : Aucun code obsolète, aucune donnée fictive ni stockage `localStorage` polluant à nettoyer.

---

## 3. Points non conformes

1. **TypeScript strict désactivé** : `tsconfig.json` ne comporte pas `"strict": true`, `"noImplicitAny": true`, ni `"noUncheckedIndexedAccess": true`.
2. **Métadonnées et HTML par défaut** : `metadata.json` est vide et `index.html` contient des libellés génériques ("My Google AI Studio App").
3. **Absence de `@custom-variant dark` dans `src/index.css`** : Indispensable avec Tailwind CSS v4 pour le basculement contrôlé clair/sombre.
4. **Absence de politique CSP et de sanitisation HTML** : Aucune couche de sécurité n'est en place.
5. **Absence de configuration PWA** : Pas de manifeste Web App, pas de Service Worker, pas d'icônes PNG/SVG dans `public/`.

---

## 4. Fonctionnalités absentes (par rapport au cahier des charges)

Toutes les briques fonctionnelles et techniques sont à concevoir et implémenter :
- **Stockage IndexedDB (Dexie.js)** : Schéma complet (catalogue, contenus, progression, historique, paramètres, sauvegardes), migrations, transactions et import/export JSON validé par Zod.
- **Internationalisation (i18next / react-i18next)** : Interface 100 % bilingue FR/EN, sélecteur de langue, conservation de la progression.
- **Catalogue dynamique & Versions de syllabi** : Certifications Foundation, Advanced, Expert, Specialist, Core, Agile (actives, retirées, historiques) avec comparateur de versions et suivi d'objectifs pédagogiques.
- **Moteur pédagogique (CTFL v4.0 pilote + extensions)** : Cours originaux structurés (explications, définitions, exemples, tableaux, schémas, résumés, exercices, suivi de lecture).
- **Moteur Flashcards & FSRS (`ts-fsrs`)** : Répétition espacée, modes de révision multiples, cartes personnelles, import/export JSON.
- **Moteur QCM & Exercices pratiques** : 7 types de questions, modes libre/chronométré/adaptatif/erreurs/favoris, explications immédiates.
- **Simulateur d'Examens Blancs** : Chronomètre, marquage, sauvegarde automatique, reprise après interruption, correction différée, rapports détaillés par chapitre/objectif/niveau K.
- **Tableau de bord & Indice de préparation** : Graphiques Recharts, série quotidienne, temps de révision, indice transparent calculé sur données réelles.
- **Planificateur de révisions** : Planning personnalisé intégrant les échéances FSRS et replanification des retards.
- **Glossaire bilingue & Recherche globale** : Recherche instantanée FR/EN, termes liés, fiches de synthèse, cartes mentales, défi quotidien, diagnostic initial, comparateur de certifications, export PDF/JSON.
- **Tests & Scripts** : Vitest, React Testing Library, `fake-indexeddb`, scripts de validation de contenu et vérification des traductions.
- **Documentation** : `README.md`, `CHANGELOG.md`, et l'ensemble des fichiers `docs/`.

---

## 5. Problèmes techniques et Risques identifiés

| Risque / Problème | Impact | Stratégie de mitigation |
| :--- | :--- | :--- |
| **Compatibilité Vite 8 / `vite-plugin-pwa` / `recharts` avec React 19** | Erreurs de peer-dependencies ou de build | Vérifier les versions compatibles avant installation et tester le build Vite dès la phase Socle. |
| **TypeScript strict (`^7.0.2`)** | Erreurs de typage strict sur bibliothèques tierces | Configurer `"strict": true` dans `tsconfig.json` et typer explicitement tous les modèles et adaptateurs. |
| **Propriété intellectuelle ISTQB** | Risque juridique si reproduction de syllabi/examens officiels | Rédiger des cours, flashcards et questions 100 % originaux ; indiquer explicitement les métadonnées de provenance et marquer les données officielles à vérifier lorsque non fournies. |
| **Cohérence des données hors ligne** | Perte de progression lors de mises à jour ou imports corrompus | Séparer les tables catalogue/contenu des tables progression/historique dans Dexie ; utiliser des transactions atomiques validées par Zod. |
| **Performance et taille du bundle** | Temps de chargement initial élevé en PWA | Lazy loading des vues fonctionnelles et découpage des contenus pédagogiques par certification/version. |

---

## 6. Plan de correction et Ordre de priorité (Roadmap)

1. **V0.1 — Architecture & Socle** : Configuration TypeScript strict, installation des dépendances vérifiées, structure modulaire (`src/app`, `src/db`, `src/i18n`, `src/features`, `src/services`, `src/types`), schéma Dexie + migrations, configuration PWA + icônes, Design System bleu nuit/bleu clair (clair/sombre), navigation, documentation socle et tests unitaires/IndexedDB initiaux.
2. **V0.2 — Catalogue & Certifications** : Catalogue dynamique multi-niveaux (Core, Agile, Specialist, Advanced, Expert), statuts (actif, retiré, remplacé), comparateur de certifications et vue détaillée des versions.
3. **V0.3 — Syllabi, Chapitres & Cours (CTFL v4.0 pilote)** : Moteur de syllabus hiérarchique, comparateur de versions (ex. CTFL v3.1 vs v4.0), cours originaux complets CTFL v4.0, suivi de lecture, fiches de synthèse et cartes mentales interactives.
4. **V0.4 — Flashcards & FSRS** : Intégration `ts-fsrs`, modes d'étude (aléatoire, erreurs, difficile, chapitre, objectif, favoris), création de cartes personnelles, import/export JSON validé.
5. **V0.5 — QCM & Exercices** : Moteur multi-types (choix unique/multiple, vrai/faux, association, mise en situation, calcul, analyse), modes d'entraînement et explications pédagogiques.
6. **V0.6 — Examens blancs** : Simulateur chronométré avec marquage, persistance automatique en IndexedDB, reprise après interruption et rapport détaillé.
7. **V0.7 — Tableau de bord & Statistiques** : Graphiques Recharts, indice de préparation explicable, série de révisions, identification des lacunes et diagnostic initial.
8. **V0.8 — Glossaire, Recherche & Planificateur** : Glossaire bilingue interactif, recherche globale cross-modules, planificateur intégrant les échéances FSRS.
9. **V0.9 — Fonctions avancées, Sauvegardes & Outils contenus** : Export/Import complet transactionnel, export PDF/imprimable, défi quotidien, outils d'administration et validation de contenus, scripts CLI de validation.
10. **V1.0 — Stabilisation, Audit final, Tests complets & Production** : Tests unitaires, d'intégration et E2E/accessibilité, vérification `tsc --noEmit` et `npm run build`, finalisation de toute la documentation.
