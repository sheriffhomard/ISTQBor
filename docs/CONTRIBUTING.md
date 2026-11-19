# Guide de contribution — ISTQB Academy

Merci de contribuer à **ISTQB Academy** !

## 1. Installation de l'environnement

```bash
npm install
npm run dev
```

## 2. Standards de développement

- **TypeScript strict** : aucun `any` implicite, gestion explicite des accès indexés (`noUncheckedIndexedAccess`).
- **Séparation des responsabilités** :
  - Toute logique métier pure (FSRS, notation de quiz, calcul d'indice de préparation, sauvegarde) doit résider dans `src/services/`.
  - Les composants UI (`src/features/`, `src/components/`) ne contiennent ni requêtes complexes ni stockage métier dans `localStorage`.
- **Internationalisation** : chaque nouveau libellé utilisateur doit être ajouté simultanément dans `src/i18n/locales/fr.ts` et `src/i18n/locales/en.ts`.

## 3. Ajouter une certification ou une version de syllabus

1. Ajouter les métadonnées dans `src/data/catalog.ts` en précisant `officialUrl`, `sources`, `lastVerified` et `verificationStatus` (ne jamais inventer de paramètres d'examen non vérifiés).
2. Créer un fichier dédié dans `src/data/` pour les chapitres, sections, objectifs, leçons, flashcards et questions de la version cible (strictement isolés par `versionId`).
3. Renseigner le champ `provenance` (`source`, `license: 'CC BY-NC-SA 4.0'`, `author`, `lastVerifiedAt`, `status`).
4. Enregistrer le chargement dans `src/db/seed.ts` de manière idempotente.
5. Générer et valider les packs JSON :

```bash
npx tsx scripts/generate-catalog.ts
npm run validate:content
npx tsx scripts/import-content.ts content
```

## 4. Liste de contrôle avant Pull Request

- [ ] `npm run lint` (`tsc --noEmit`) passe avec 0 erreur.
- [ ] `npm test` passe à 100 %.
- [ ] `npm run validate:content` passe avec 0 erreur.
- [ ] `npm run check:translations` confirme 100 % de parité `fr` / `en`.
- [ ] `npm run build` compile le bundle et le Service Worker sans erreur.
