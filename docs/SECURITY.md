# Sécurité et confidentialité — ISTQB Academy

## 1. Modèle de confidentialité (Local-First)

- **Aucune collecte distante** : l'ensemble des données utilisateur (progression, notes de leçons, historique FSRS, résultats d'examens blancs, plans d'étude) demeure strictement dans le navigateur de l'utilisateur via IndexedDB (`istqb_academy_db`).
- **Aucun tracker ni télémétrie cachée** : aucune requête analytique ou publicitaire n'est émise vers un service tiers.
- **Aucun secret côté client** : l'application V1.0 fonctionne intégralement sans clé API ni authentification externe.

## 2. Protection contre les vulnérabilités applicatives

### Assainissement HTML (XSS)
- Tous les fragments riches ou balises HTML potentiellement affichés passent par `sanitizeHtml()` (`src/services/securityService.ts`) adossé à **DOMPurify** avec liste blanche stricte de balises (`b`, `i`, `em`, `strong`, `code`, `pre`, `br`, `p`, `ul`, `ol`, `li`) et zéro attribut autorisé.
- Les contenus Markdown/texte des leçons et questions sont rendus via des composants React échappant nativement le texte.

### Protection des imports JSON (Pollution de prototype & Validation structurelle)
- Tout fichier JSON importé (sauvegarde complète ou pack de flashcards) est analysé via `safeParseJson()` :
  - Contrôle strict de taille maximale (`10 Mo` par défaut, rejet via `JSON_FILE_TOO_LARGE`).
  - Suppression récursive des clés dangereuses (`__proto__`, `constructor`, `prototype`) via `stripDangerousKeys()`.
  - Validation stricte via les schémas **Zod** (`fullBackupSchema`, `flashcardsPackSchema`).
- En cas d'échec de validation, aucune donnée existante dans IndexedDB n'est modifiée (import atomique dans une transaction `db.transaction('rw', ...)`).

## 3. Sécurité des scripts et dépendances

- Compilation TypeScript en mode strict (`strict: true`, `noImplicitAny: true`, `noUncheckedIndexedAccess: true`).
- Configuration CSP compatible PWA (pré-cache Workbox généré uniquement sur les ressources locales compilées).
