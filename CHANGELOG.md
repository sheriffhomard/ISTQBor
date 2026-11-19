# Journal des modifications — ISTQB Academy

## [1.0.0] — V1.0 Pilote CTFL v4.0 & Socle multi-certifications

### Ajouts majeurs
- **Architecture & Base locale** :
  - Mise en place d'IndexedDB avec Dexie.js (`IstqbAcademyDB` v2) et séparation stricte des tables de contenu, progression utilisateur et paramètres.
  - Amorçage idempotent (`ensureSeeded`) préservant systématiquement la progression et les cartes personnalisées.
  - Scripts CLI `generate-catalog.ts`, `validate-content.ts`, `import-content.ts` et `check-translations.ts`.
- **Catalogue & Syllabi** :
  - 13 certifications ISTQB réparties sur les niveaux Foundation, Advanced, Expert et Specialist (14 versions incluant `active`, `replaced`, `retired`, `historical`).
  - Marquage explicite `unverified` (« À vérifier ») sur les paramètres d'examen des certifications secondaires non vérifiées.
  - Couverture complète de **CTFL v4.0** : 6 chapitres, 22 sections, 64 objectifs pédagogiques (`K1`–`K3`), 6 leçons bilingues avec diagrammes SVG, fiches de synthèse et cartes mentales.
  - Comparateur de versions `CTFL v3.1` vs `CTFL v4.0` et pack de démarrage `CTFL-AT`.
- **Apprentissage & Entraînement** :
  - Moteur FSRS réel adossé à `ts-fsrs` (`24` flashcards bilingues de base + création de cartes personnalisées + import/export JSON).
  - Moteur de QCM supportant 7 formats (`single_choice`, `multiple_choice`, `true_false`, `matching`, `scenario`, `calculation`, `analysis`) avec `44` questions originales CTFL v4.0.
  - Simulateur d'examen blanc CTFL v4.0 respectant la distribution `8/6/4/11/9/2` sur 40 questions, auto-sauvegarde et reprise de session.
  - Tableau de bord avec indice de préparation explicable, défi quotidien et diagnostic initial.
  - Planificateur hebdomadaire intégré aux révisions FSRS dues, glossaire bilingue (`34` termes), recherche globale (`Ctrl+K`).
- **PWA, Sécurité & Export** :
  - Configuration `VitePWA` + Workbox (pré-cache hors-ligne, manifeste, icônes générées).
  - Export/import JSON complet validé par Zod et nettoyé contre la pollution de prototype, plus assainissement DOMPurify et rapport imprimable PDF.
  - Documentation technique complète (`README.md`, `docs/*`).
