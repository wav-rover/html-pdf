# Fiches mémo PDF → pages web — Design

Date : 2026-10-09 · Statut : validé en conversation, en attente de relecture

## Objectif

Un centre médical dispose de fiches mémo PDF (« La Formation pour tous ») qui expliquent des démarches simples (ex. se connecter à son compte CAF). Toutes suivent la même trame. L'outil permet au personnel d'importer une fiche PDF, d'en vérifier/corriger l'extraction dans un aperçu, puis de la publier sous forme de page web lisible par les patients, sans compte.

**Critères de succès**

- Le PDF de test `tuto-peda-caf.pdf` est extrait sans perte (titre, sous-titre, 4 sections, source).
- Un admin peut importer → corriger → publier en moins d'une minute.
- La page publique est lisible sur mobile, imprimable, et propose le PDF original.

## Trame du PDF (constatée sur le fichier de test, généré par jsPDF)

| Élément | Repère visuel | Exemple |
| --- | --- | --- |
| Titre | police la plus grande (18 pt, gras) | Se connecter à son compte CAF |
| Sous-titre | 12 pt, gris, ligne suivant le titre | Fiche mémo — La Formation pour tous |
| `L'essentiel` | titre de section 13 pt vert, puces `•` | étapes de la démarche |
| `À prévoir` | titre 13 pt orange, puces | ce qu'il faut avoir sous la main |
| `Points de vigilance` | titre 13 pt rouge, puces | précautions |
| `À comprendre` | titre 13 pt gris, puces `terme = définition` | glossaire |
| Source | 9 pt gris, en bas après un trait | Vidéo par La Caf - Officiel |

## Décisions

- **Flux** : un membre du personnel connecté avec le rôle `ADMIN` importe et publie ; les patients lisent les fiches publiées sans compte.
- **Aperçu** : PDF original et page web côte à côte, champs extraits modifiables avant publication.
- **Extraction** : parseur déterministe fondé sur la trame fixe (pas de LLM).
- **Stack** : Next 15 App Router, Prisma 7 / Postgres, NextAuth (existants). Passage à **Tailwind v4 + React 19** pour utiliser la CLI shadcn actuelle. Les pages d'auth existantes sont converties aux composants shadcn.

## Modèle de données

```prisma
enum GuideStatus {
  DRAFT
  PUBLISHED
}

model Guide {
  id          String      @id @default(cuid())
  slug        String      @unique
  title       String
  status      GuideStatus @default(DRAFT)
  content     Json
  pdf         Bytes
  pdfName     String
  publishedAt DateTime?
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
}
```

`title` est dupliqué hors de `content` pour le tri et la recherche. `content` est validé par un schéma zod unique (`guideContentSchema`) partagé par le parseur, le formulaire et le rendu :

```ts
type GuideContent = {
  title: string;
  subtitle: string;
  steps: string[];      // L'essentiel
  checklist: string[];  // À prévoir
  warnings: string[];   // Points de vigilance
  glossary: { term: string; definition: string }[]; // À comprendre
  source: string;
};
```

Le slug est dérivé du titre (minuscules, sans accents, tirets) ; en cas de collision, un suffixe numérique est ajouté. Il ne change pas quand on modifie le titre d'une fiche existante.

## Parseur

`src/lib/parse-guide-pdf.ts` — `parseGuidePdf(data: Uint8Array): Promise<GuideContent>`, sans accès base ni réseau.

1. `unpdf` (pdf.js) fournit les fragments de texte de la page 1 avec position et taille de police.
2. Les fragments sont regroupés en lignes (même ordonnée, tolérance ~2 pt) puis triés de haut en bas.
3. Titre = ligne(s) consécutive(s) à la taille de police maximale. Sous-titre = ligne suivante.
4. Une ligne dont le texte normalisé (minuscules, sans accents, apostrophes unifiées) correspond à l'un des 4 titres connus ouvre la section correspondante.
5. Dans une section : une ligne commençant par `•` ouvre une nouvelle puce (préfixe retiré) ; une ligne sans `•` prolonge la puce précédente (texte replié par jsPDF).
6. Glossaire : chaque puce est coupée sur le premier ` = ` ; sans `=`, le terme est la puce entière et la définition est vide.
7. Source = ligne(s) de police plus petite que le corps du texte situées après la dernière section.

**Erreurs** : PDF illisible, titre introuvable, ou aucune des 4 sections trouvée → erreur `GuideParseError` avec un message en français affiché à l'admin. Une section absente seule n'est pas bloquante : elle est vide et signalée dans l'éditeur.

## Routes

**Public**

| Route | Rôle |
| --- | --- |
| `/` | Liste des fiches publiées (cartes), recherche `?q=` sur le titre |
| `/fiches/[slug]` | Fiche publiée ; 404 si brouillon ou inexistante |
| `/fiches/[slug]/pdf` | Route handler renvoyant le PDF original (publiée uniquement, ou admin) |

**Admin** — protégé par le middleware (`/admin/*` exige `role === "ADMIN"`, sinon redirection vers `/login`) et revérifié dans chaque Server Action.

| Route | Rôle |
| --- | --- |
| `/admin` | Tableau des fiches : titre, statut (Badge), mise à jour, actions (modifier, voir, publier/dépublier, supprimer avec AlertDialog) |
| `/admin/import` | Zone de dépôt d'un PDF (≤ 5 Mo, `application/pdf`). Action : parse → crée un brouillon → redirige vers l'éditeur. Erreur de parsing affichée sur place |
| `/admin/fiches/[id]` | Éditeur (voir ci-dessous) |

**Server Actions** (`src/server/guide-actions.ts`) : `importGuideAction`, `updateGuideAction`, `setGuideStatusAction`, `deleteGuideAction`. Chacune vérifie le rôle admin et valide ses entrées avec zod.

## Éditeur

Composant client (formulaire interactif), seule partie lourde côté client.

- Colonne gauche : `Tabs` **Modifier** (champs titre/sous-titre/source + listes éditables : ajouter, supprimer, réordonner par boutons haut/bas) et **PDF original** (`<iframe>` vers le PDF).
- Colonne droite : **aperçu en direct** rendu par `GuideArticle` à partir de l'état du formulaire, avec bascule `ToggleGroup` mobile (375 px) / desktop.
- Barre d'actions : Enregistrer, Publier/Dépublier, lien vers la page publique si publiée. Retour par `sonner` (toast).
- Sur mobile, les deux colonnes s'empilent.

## Rendu public — `GuideArticle`

Composant de présentation pur (utilisable en RSC et dans l'aperçu client).

- En-tête : titre, sous-titre.
- **L'essentiel** : étapes numérotées en grand (liste ordonnée), accent vert.
- **À prévoir** : checklist en `<input type="checkbox">` natif, sans JS, accent orange.
- **Points de vigilance** : `Alert` accent rouge.
- **À comprendre** : liste de définitions (`<dl>`), accent gris.
- Pied : source, bouton Imprimer (petit composant client), lien « Télécharger le PDF ».
- Styles d'impression : masque la navigation et les boutons.
- Police : Atkinson Hyperlegible via `next/font/google`, corps de texte ≥ 18 px sur la page publique.
- Les sections vides ne sont pas affichées.

## Composants shadcn

Button, Card, Input, Label, Textarea, Tabs, Table, Badge, Alert, AlertDialog, Sonner, ToggleGroup, Separator.

## Création d'un admin

Pas d'interface dédiée. Le README documente la promotion d'un compte existant :

```bash
docker compose exec db psql -U postgres -d app -c "UPDATE \"User\" SET role='ADMIN' WHERE email='moi@exemple.fr';"
```

## Tests

- **Unitaires (Vitest)** sur `parseGuidePdf` avec `tuto-peda-caf.pdf` en fixture : valeurs exactes de chaque champ, puis cas d'erreur (PDF sans trame). Écrits avant l'implémentation.
- **Unitaires** sur la génération de slug.
- **Vérification manuelle dans le navigateur** : import du PDF de test, correction d'un champ, publication, consultation publique (mobile et desktop), impression, téléchargement PDF, accès refusé à `/admin` pour un non-admin.
- `npm run typecheck`, `npm run lint`, `npm run build` passent.

## Hors périmètre

Intégration de la vidéo source, historique des versions, recherche plein texte, PDF multi-pages, import en lot, interface de gestion des rôles.
