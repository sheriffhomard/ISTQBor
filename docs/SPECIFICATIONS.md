# Spécifications fonctionnelles — ISTQB Academy V1.0

## 1. Périmètre et objectifs

ISTQB Academy vise à offrir un environnement complet de préparation autonome et hors-ligne aux certifications ISTQB en français et en anglais, sans dépendance à un backend distant pour la version V1.0.

## 2. Exigences fonctionnelles

### F1 — Catalogue dynamique multi-certifications
- Couverture des 4 niveaux (*Foundation*, *Advanced*, *Expert*, *Specialist*) et des 3 domaines (*Core*, *Agile*, *Specialist*).
- Support explicite des statuts de cycle de vie : `active`, `replaced`, `retired`, `historical`.
- Affichage des métadonnées officielles vérifiées (`examConfig`, langues disponibles, prérequis, sources, date de dernière vérification).
- Indication explicite `À vérifier` (`verificationStatus: 'unverified'`) lorsque les paramètres officiels d'une version secondaire ne sont pas encore vérifiés.

### F2 — Gestion indépendante des versions de syllabi & comparateur
- Isolation stricte des données par `versionId` (ex. `ctfl-v4.0` vs `ctfl-v3.1`).
- Comparateur de versions permettant d'identifier les chapitres ajoutés, supprimés, fusionnés ou restructurés entre deux versions d'une même certification.
- Préservation intégrale de l'historique utilisateur lors d'un changement de certification ou de version active.

### F3 — Parcours d'apprentissage structuré
- Programme complet par chapitres, sections et objectifs pédagogiques (`LO`) dotés de leur niveau cognitif (`K1` à `K6`).
- Leçons originales bilingues intégrant : explication pédagogique, exemple concret, piège courant d'examen, fiche de synthèse, carte mentale hiérarchique et diagrammes interactifs SVG (`test_pyramid`, `testing_quadrants`, `boundary_value`, `v_model`).
- Marquage de complétion persisté dans IndexedDB (`lessonProgress`) et prise de notes personnelles par leçon.

### F4 — Flashcards & Répétition espacée (FSRS)
- Algorithme réel `ts-fsrs` gérant `stability`, `difficulty`, `elapsed_days`, `scheduled_days`, `reps`, `lapses`, `state` (`New`, `Learning`, `Review`, `Relearning`) et `due`.
- Historisation complète dans `reviewLogs`.
- Création de flashcards personnalisées (`isCustom: true`) sans altération par les mises à jour du catalogue.
- Import/Export de paquets JSON validés via `flashcardsPackSchema` (Zod).

### F5 — Moteur de QCM multi-formats
- 7 formats gérés : `single_choice`, `multiple_choice`, `true_false`, `matching`, `scenario`, `calculation`, `analysis`.
- Modes d'entraînement : Libre, Par chapitre, Par objectif pédagogique, Par niveau K, Erreurs à retravailler, Favoris, Chronométré.
- Correction immédiate et détaillée avec explication pédagogique bilingue et lien vers l'objectif associé.

### F6 — Simulateur d'examen blanc officiel
- Respect exact de la distribution officielle CTFL v4.0 (`8 / 6 / 4 / 11 / 9 / 2` sur 40 questions, 60 minutes, seuil 65 % soit 26/40).
- Auto-sauvegarde en continu de la tentative dans IndexedDB (`status: 'in_progress'`) permettant la reprise après rechargement ou coupure.
- Rapport post-examen : score brut, pourcentage, statut réussite/échec, détail par chapitre, détail par niveau K et revue complète question par question.

### F7 — Tableau de bord, Diagnostic & Défi quotidien
- Indice de préparation calculé de manière déterministe et explicable à partir des 4 piliers réels : complétion des leçons (20 %), rétention FSRS (25 %), précision aux quiz (25 %), moyenne aux examens blancs (30 %).
- Détection des chapitres faibles (`< 70 %` ou couverture insuffisante).
- Défi quotidien déterministe basé sur la date du jour.
- Diagnostic initial multi-chapitres avec recommandations d'étude ciblées.

### F8 — Planificateur de révisions
- Planification à partir d'une date cible et d'un volume d'heures hebdomadaires disponibles.
- Génération de tâches réparties dans `plannedActivities`, intégrant les révisions FSRS en attente.

### F9 — Glossaire bilingue & Recherche globale
- Glossaire bilingue FR/EN indexé avec synonymes, définitions, exemples, favoris et filtrage par certification.
- Modale de recherche globale accessible via `Ctrl+K` / `Cmd+K`.

### F10 — Sauvegarde, Export/Import & Hors-ligne PWA
- Export intégral au format JSON horodaté et import transactionnel validé par Zod.
- Rapport de progression imprimable / exportable en PDF via `@media print`.
- Service Worker Workbox assurant le fonctionnement complet sans connexion Internet.
