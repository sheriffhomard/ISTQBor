# Guide de rédaction pédagogique — ISTQB Academy

## 1. Principes éditoriaux et juridiques

1. **Originalité stricte** : chaque leçon, question de QCM, scénario, flashcard et définition de glossaire est rédigée de manière originale pour ISTQB Academy.
2. **Respect de la propriété intellectuelle** : aucune reproduction verbatim de sujets d'examen officiel protégés ou de manuels commerciaux n'est tolérée. Les contenus s'appuient exclusivement sur la structure publique des objectifs d'apprentissage (LO) publiés par l'ISTQB.
3. **Neutralité factuelle des paramètres d'examen** : les durées, nombres de questions, seuils de réussite et distributions par chapitre doivent être sourcés. Si un paramètre n'a pas été vérifié pour une certification secondaire, sa fiche doit porter `verificationStatus: 'unverified'` et s'afficher avec la mention explicite « À vérifier ».
4. **Traçabilité (Provenance)** : chaque item embarque un bloc `provenance` précisant `source`, `license` (`CC BY-NC-SA 4.0`), `author`, `lastVerifiedAt` et `status` (`draft`, `under_review`, `validated`, `published`, `deprecated`).

## 2. Qualité pédagogique (Taxonomie de Bloom / Niveaux K)

- **K1 (Se souvenir)** : définitions exactes, flashcards, questions vrai/faux ou choix unique ciblé.
- **K2 (Comprendre)** : comparaisons, exemples contextualisés, appariements de concepts et distinctions subtiles.
- **K3 (Appliquer)** : calculs pratiques (analyse des valeurs limites, partitions d'équivalence, tables de décision, transitions d'état, couverture d'instructions/branches) et scénarios réalistes.
- **K4 (Analyser)** : analyse d'anomalies, choix de stratégie de test ou évaluation critique d'une situation projet.

## 3. Règles bilingues FR / EN

- Toute nouvelle entité pédagogique doit fournir à la fois `fr` et `en` sans chaîne vide (`localizedTextSchema`).
- Les termes normalisés du glossaire ISTQB doivent être employés de manière cohérente entre les deux langues (ex. *Boundary Value Analysis* / *Analyse des valeurs limites*).
- Toute modification des dictionnaires UI doit passer `npm run check:translations` sans clé manquante ni orpheline.

## 4. Pipeline de validation

Avant toute contribution de contenu :
1. Exécuter `npm run validate:content` (validation Zod + intégrité référentielle `chapterId` / `objectiveId` / `versionId`).
2. Exécuter `npx tsx scripts/generate-catalog.ts` puis `npx tsx scripts/import-content.ts content`.
