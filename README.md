# ISTQB Academy

**Plateforme complète, bilingue (FR / EN) et hors-ligne (PWA) de préparation aux certifications ISTQB.**

---

## Présentation générale

**ISTQB Academy** est une Progressive Web Application (PWA) conçue selon une architecture locale-first (`React + TypeScript + Vite + Tailwind CSS + IndexedDB / Dexie.js + ts-fsrs`). Toutes les données pédagogiques, progressions, historiques d'examens blancs et révisions espacées sont stockés localement dans IndexedDB sans serveur distant obligatoire.

### Fonctionnalités principales

- **Catalogue multi-certifications évolutif** : couvre les niveaux *Foundation*, *Advanced*, *Expert* et *Specialist* (Core, Agile, Specialist), incluant les statuts *Active*, *Replaced*, *Retired* et *Historical* (13 certifications, 14 versions de syllabi).
- **Programme & Leçons CTFL v4.0 complets** : 6 chapitres, 22 sections, 45 objectifs pédagogiques (`FL-1.1.1` à `FL-6.2.1`) avec niveaux cognitifs (`K1`–`K3`), fiches de synthèse, diagrammes SVG interactifs, cartes mentales, exemples concrets et comparateur de versions (`v3.1` vs `v4.0`).
- **Répétition espacée FSRS réelle (`ts-fsrs`)** : planification mathématique des cartes mémoire (Nouvelle, Apprentissage, Révision, Réapprentissage), 4 notations (`Again`, `Hard`, `Good`, `Easy`), création de cartes personnalisées et import/export JSON validé par Zod.
- **Moteur de QCM multi-formats** : 7 formats supportés (`single_choice`, `multiple_choice`, `true_false`, `matching`, `scenario`, `calculation`, `analysis`), modes Libre, Chapitre, Objectif, Niveau K, Erreurs à retravailler, Favoris et Chrono.
- **Simulateur d'examen blanc officiel** : tirage conforme à la répartition officielle CTFL v4.0 (`8/6/4/11/9/2` sur 40 questions), chronomètre, marquage de questions, barre de navigation, sauvegarde automatique dans IndexedDB et reprise après interruption.
- **Tableau de bord & Analytique** : indice de préparation transparent et explicable calculé uniquement sur vos données réelles (couverture des leçons, rétention FSRS, moyenne aux quiz, examens blancs), défi quotidien et diagnostic initial.
- **Planificateur de révisions** : calcul de charge hebdomadaire selon date d'examen cible et intégration directe des cartes FSRS dues.
- **Glossaire bilingue & Recherche globale (`Ctrl+K`)** : recherche instantanée à travers le glossaire, les objectifs, les leçons, les flashcards et les questions.
- **Sauvegarde, Export & Impression** : export/import complet JSON avec validation Zod et transaction IndexedDB, rapport imprimable / PDF (`@media print`).
- **Hors-ligne complet (PWA)** : Service Worker Workbox, pré-cache des ressources, installation sur ordinateur, tablette et smartphone.

---

## Démarrage rapide

### Prérequis

- Node.js `>= 20` (vérifié avec Node `v22`)
- npm `>= 10`

### Installation & lancement

```bash
npm install
npm run dev
```

L'application est servie sur `http://localhost:3000`.

### Scripts disponibles

| Commande | Description |
| :--- | :--- |
| `npm run dev` | Démarre le serveur de développement Vite sur le port `3000` |
| `npm run build` | Compile le build de production et génère le Service Worker PWA dans `dist/` |
| `npm run preview` | Prévisualise le build de production |
| `npm run lint` | Vérifie le typage strict TypeScript (`tsc --noEmit`) |
| `npm test` | Exécute la suite de tests unitaires et d'intégration (`vitest run`) |
| `npm run validate:content` | Valide les schémas Zod, l'intégrité référentielle et les distributions d'examens |
| `npm run check:translations` | Vérifie la parité stricte des clés de traduction `fr` / `en` |
| `npx tsx scripts/generate-catalog.ts` | Génère les packs JSON découplés dans `content/` |
| `npx tsx scripts/import-content.ts content` | Valide et contrôle les packs JSON présents dans `content/` |

---

## Licence & Provenance des contenus

- **Code applicatif** : Apache-2.0.
- **Contenus pédagogiques rédigés** : contenus originaux rédigés en français et en anglais pour ISTQB Academy sous licence `CC BY-NC-SA 4.0`, alignés sur la structure publique des objectifs d'apprentissage ISTQB sans reproduction illicite d'examens officiels protégés.
- **Paramètres d'examen non vérifiés** : pour les certifications secondaires dont la structure officielle complète n'a pas été vérifiée hors ligne, les paramètres sont explicitement marqués « À vérifier / Unverified » dans l'interface et les métadonnées.

---

## Documentation technique

- [Audit initial](docs/INITIAL_AUDIT.md)
- [Spécifications fonctionnelles](docs/SPECIFICATIONS.md)
- [Architecture technique](docs/ARCHITECTURE.md)
- [Modèle de données IndexedDB](docs/DATA_MODEL.md)
- [Guide de rédaction pédagogique](docs/CONTENT_GUIDELINES.md)
- [Sécurité & confidentialité](docs/SECURITY.md)
- [Stratégie & résultats de tests](docs/TESTING.md)
- [Feuille de route](docs/ROADMAP.md)
- [Guide de contribution](docs/CONTRIBUTING.md)
- [Journal des modifications](CHANGELOG.md)
