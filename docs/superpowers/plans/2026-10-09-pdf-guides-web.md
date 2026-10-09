# Fiches mémo PDF → pages web — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Importer des fiches mémo PDF à trame fixe, les corriger dans un éditeur avec aperçu, et les publier comme pages web publiques.

**Architecture:** Parseur pur (`unpdf` → lignes → `GuideContent`) appelé par une Server Action d'import ; fiches stockées dans Postgres (contenu JSON validé par zod + PDF original en `Bytes`). Un composant de présentation `GuideArticle` rend à la fois la page publique (RSC) et l'aperçu en direct de l'éditeur (client).

**Tech Stack:** Next 15.5 App Router, React 19, Tailwind v4, shadcn (CLI 4.x), Prisma 7 / Postgres, NextAuth v5, zod 3, unpdf, Vitest.

**Spec:** `docs/superpowers/specs/2026-10-09-pdf-guides-web-design.md`

## Global Constraints

- Interface en français ; `<html lang="fr">`.
- Conventions du `CLAUDE.md` utilisateur : fichiers composants en PascalCase préfixés par leur type (`CardGuide.tsx`), autres fichiers en kebab-case, arrow functions sauf composants exportés top-level, pas de `any`, `'use client'` uniquement pour l'interactivité.
- Composants UI : shadcn uniquement (`src/components/ui/*`), pas de nouvelle lib UI.
- Couleurs de section reprises du PDF : essentiel `#1e643c`, à prévoir `#b47814`, vigilance `#c83232`, à comprendre `#646464`. Couleur primaire = `#1e643c`.
- Police : Atkinson Hyperlegible (`next/font/google`) ; corps de la page publique ≥ 18 px.
- Import : `application/pdf`, ≤ 5 Mo.
- Tout accès admin vérifie `role === "ADMIN"` côté serveur (middleware + chaque Server Action + route PDF pour les brouillons).

## Review Focus

1. Puce trop longue repliée sur 2+ lignes dans le PDF → une seule puce, texte joint par un espace (test `linesToGuide` « wrapped bullet », Task 3).
2. Fichier non-PDF, > 5 Mo ou PDF corrompu → message d'erreur français sur `/admin/import`, aucune fiche créée (vérif navigateur Task 6).
3. Fiche en brouillon demandée par un visiteur sur `/fiches/[slug]` ou `/fiches/[slug]/pdf` → 404 (vérif navigateur Task 5).
4. Utilisateur connecté non-admin → `/admin` redirige vers `/login`, les actions refusent (test `isAdmin` Task 4 + vérif navigateur Task 8).
5. Enregistrement de l'éditeur avec un titre vide → refus avec toast d'erreur, rien n'est écrit (vérif navigateur Task 7).

---

### Task 1: Stack — React 19, Tailwind v4, shadcn, police

**Files:**
- Modify: `package.json`, `postcss.config.mjs`, `src/app/globals.css`, `src/app/layout.tsx`
- Delete: `tailwind.config.ts`
- Create: `components.json`, `src/lib/utils.ts`, `src/components/ui/*` (générés par la CLI)

**Interfaces:**
- Produces: `cn()` dans `@/lib/utils` ; composants `@/components/ui/{button,card,input,label,textarea,tabs,table,badge,alert,alert-dialog,sonner,toggle-group,separator}` ; variables CSS `--section-essentials`, `--section-prepare`, `--section-warning`, `--section-glossary` exposées en couleurs Tailwind (`text-section-essentials`, `bg-section-warning/10`, …).

- [ ] **Step 1:** `npm i react@^19 react-dom@^19 && npm i -D @types/react@^19 @types/react-dom@^19 tailwindcss@^4 @tailwindcss/postcss@^4`, retirer `autoprefixer`.
- [ ] **Step 2:** `postcss.config.mjs` → plugin unique `@tailwindcss/postcss` ; `globals.css` → `@import "tailwindcss";` ; supprimer `tailwind.config.ts`.
- [ ] **Step 3:** `npx shadcn@latest init` (base neutral) puis `npx shadcn@latest add` des 13 composants listés.
- [ ] **Step 4:** Dans `globals.css`, primaire = `#1e643c` (clair) et variante éclaircie en sombre ; ajouter les 4 tokens de section dans `:root` + `@theme inline`.
- [ ] **Step 5:** `layout.tsx` : `lang="fr"`, Atkinson Hyperlegible (poids 400/700, `variable: "--font-sans"`), `<Toaster />`, metadata « Fiches pratiques ».
- [ ] **Step 6:** `npm run typecheck && npm run build` → succès.
- [ ] **Step 7:** Commit `chore: React 19, Tailwind v4 et shadcn`.

### Task 2: Pages d'auth sur shadcn

**Files:**
- Modify: `src/components/auth/ui.tsx`, pages `src/app/{login,register,forgot-password,reset-password,account}/page.tsx` si nécessaire

**Interfaces:**
- Consumes: composants shadcn de Task 1. Les exports de `ui.tsx` (`AuthShell`, `Field`, `SubmitButton`, `Alert`, `FooterLinks`, `TextLink`) gardent leurs signatures ; seule leur implémentation passe sur `Card`, `Input`/`Label`, `Button`, `Alert`.

- [ ] **Step 1:** Réimplémenter les exports de `ui.tsx` avec shadcn ; traduire les libellés visibles des pages en français.
- [ ] **Step 2:** `npm run typecheck` → succès ; `/login` et `/register` s'affichent (dev server).
- [ ] **Step 3:** Commit `refactor: pages d'auth sur shadcn`.

### Task 3: Contenu, slug et parseur PDF

**Files:**
- Create: `vitest.config.ts`, `src/lib/guide-content.ts`, `src/lib/slugify.ts`, `src/lib/parse-guide-pdf.ts`
- Create (tests): `src/lib/slugify.test.ts`, `src/lib/parse-guide-pdf.test.ts`, fixture `src/lib/__fixtures__/tuto-peda-caf.pdf`
- Modify: `package.json` (script `"test": "vitest run"`, deps `unpdf`, devDep `vitest`)

**Interfaces:**
- Produces:
  - `guideContentSchema` (zod) et `type GuideContent = { title: string; subtitle: string; steps: string[]; checklist: string[]; warnings: string[]; glossary: { term: string; definition: string }[]; source: string }` — `title` non vide (`"Le titre est obligatoire"`), autres chaînes `trim()`.
  - `slugify(text: string): string` (export par défaut de `slugify.ts`).
  - `type PdfLine = { text: string; size: number; y: number }`
  - `linesToGuide(lines: PdfLine[]): GuideContent` — pure, lignes triées de haut en bas.
  - `parseGuidePdf(data: Uint8Array): Promise<GuideContent>`
  - `class`-free error : `GuideParseError` = `Error` avec `name = "GuideParseError"`, créée par `createGuideParseError(message: string)` ; `isGuideParseError(error: unknown): error is Error`.

- [ ] **Step 1: Tests slug** — `slugify("Se connecter à son compte CAF") === "se-connecter-a-son-compte-caf"` ; `slugify("  L’essentiel — été !  ") === "l-essentiel-ete"`.
- [ ] **Step 2: Tests parseur** — `parseGuidePdf(fixture)` renvoie exactement :
  - title `"Se connecter à son compte CAF"`, subtitle `"Fiche mémo — La Formation pour tous"`
  - steps (5) commençant par `"Aller sur le site de la CAF et cliquer sur Mon Compte."` et finissant par `"Ouvrir les rubriques pour voir ses paiements et ses démarches."`
  - checklist (3), warnings (3) — valeurs du spec/PDF, sans le préfixe `•`
  - glossary `[{ term: "Mon Compte", definition: "espace en ligne pour suivre son dossier CAF." }, { term: "numero de securite sociale", definition: "identifiant utilisé pour se connecter." }, { term: "mot de passe", definition: "code secret pour protéger l’accès au compte." }]`
  - source `"Vidéo par La Caf - Officiel"`

  Tests `linesToGuide` sur lignes synthétiques :
  - « wrapped bullet » : `• Première partie` puis `suite du texte` (même taille) → une puce `"Première partie suite du texte"`.
  - titre sur 2 lignes à la taille max → joint par un espace.
  - en-têtes `L’essentiel` (apostrophe typographique) et `A PREVOIR` reconnus.
  - glossaire sans ` = ` → `{ term: <puce>, definition: "" }`.
  - section absente → tableau vide, pas d'erreur.
  - aucune section reconnue → lève une erreur dont `isGuideParseError` est vrai, message `"Ce PDF ne suit pas la trame des fiches mémo."`.
  - `parseGuidePdf(new Uint8Array([1,2,3]))` → `GuideParseError` `"Impossible de lire ce PDF."`.
- [ ] **Step 3:** `npm test` → FAIL (modules absents).
- [ ] **Step 4:** Implémenter `guide-content.ts`, `slugify.ts` (NFD + suppression diacritiques, non-alphanumériques → `-`, trim des `-`), `parse-guide-pdf.ts` :
  - `extractLines` : `getDocumentProxy` → page 1 → `getTextContent()` ; taille = `Math.hypot(transform[0], transform[1])`, y = `transform[5]` ; regrouper les items dont `|Δy| ≤ 2`, joindre par ordre de x, trier y décroissant ; ignorer les lignes vides.
  - `linesToGuide` : taille max → titre ; ligne suivante → sous-titre ; `bodySize` = taille la plus fréquente des lignes de puces ; en-têtes normalisés (`normalize("NFD")`, sans diacritiques, `’`→`'`, minuscules) comparés à `l'essentiel | a prevoir | points de vigilance | a comprendre` ; après la dernière section, une ligne de taille < `bodySize` → source (lignes jointes par espace).
- [ ] **Step 5:** `npm test` → PASS.
- [ ] **Step 6:** Commit `feat: parseur des fiches mémo PDF`.

### Task 4: Modèle Prisma, accès admin et Server Actions

**Files:**
- Modify: `prisma/schema.prisma` (enum `GuideStatus`, model `Guide` — copie exacte du spec), `src/server/auth.config.ts`
- Create: `src/server/roles.ts` (ajout `isAdmin`), `src/server/require-admin.ts`, `src/server/guide-actions.ts`, `src/server/guides.ts`
- Test: `src/server/roles.test.ts`

**Interfaces:**
- Consumes: `parseGuidePdf`, `guideContentSchema`, `slugify` (Task 3).
- Produces:
  - `isAdmin(user?: { role?: Role } | null): boolean` dans `roles.ts`.
  - `requireAdmin(): Promise<void>` — `redirect("/login")` si non admin.
  - `guides.ts` : `getPublishedGuides(query?: string)`, `getPublishedGuideBySlug(slug: string)`, `getAllGuides()`, `getGuideById(id: string)`, `toGuideContent(json: unknown): GuideContent` (parse zod). Pas de champ `pdf` dans les listes (`select`).
  - `guide-actions.ts` (`"use server"`) :
    - `importGuideAction(prev: ImportState, formData: FormData): Promise<ImportState>` avec `type ImportState = { error?: string }` ; succès → `redirect("/admin/fiches/<id>")`.
    - `updateGuideAction(id: string, content: GuideContent): Promise<{ error?: string }>`
    - `setGuideStatusAction(id: string, status: "DRAFT" | "PUBLISHED"): Promise<void>`
    - `deleteGuideAction(id: string): Promise<void>`
    - Toutes appellent `requireAdmin()` puis `revalidatePath("/")`, `revalidatePath("/admin")` et la page de la fiche.

- [ ] **Step 1:** Test `isAdmin` : `true` pour `{ role: "ADMIN" }`, `false` pour `{ role: "USER" }`, `undefined`, `null`.
- [ ] **Step 2:** `npm test` → FAIL ; implémenter `isAdmin` ; `npm test` → PASS.
- [ ] **Step 3:** `auth.config.ts` : `/admin*` exige `isAdmin(auth?.user)` (sinon `false` → redirection login).
- [ ] **Step 4:** Schéma Prisma + `npx prisma migrate dev --name guides` → migration créée, client généré.
- [ ] **Step 5:** Implémenter `guides.ts` et `guide-actions.ts`. Import : rejeter si pas de fichier / type ≠ `application/pdf` (`"Choisis un fichier PDF."`) / taille > 5 Mo (`"Le PDF dépasse 5 Mo."`) ; `GuideParseError` → `{ error: message }`. Slug unique : `slugify(title)`, puis `-2`, `-3`… tant qu'il existe. `updateGuideAction` valide avec `guideContentSchema` (premier message zod en erreur) et met à jour `title` + `content`, slug inchangé. `setGuideStatusAction` positionne `publishedAt` à la publication.
- [ ] **Step 6:** `npm run typecheck` → succès.
- [ ] **Step 7:** Commit `feat: modèle Guide et actions admin`.

### Task 5: Rendu public

**Files:**
- Create: `src/components/guide/GuideArticle.tsx`, `src/components/guide/ButtonPrint.tsx` (client), `src/components/guide/CardGuide.tsx`, `src/app/fiches/[slug]/page.tsx`, `src/app/fiches/[slug]/pdf/route.ts`
- Modify: `src/app/page.tsx` (remplace l'accueil Stackr), `src/app/globals.css` (styles `@media print`)

**Interfaces:**
- Consumes: `GuideContent`, `getPublishedGuides`, `getPublishedGuideBySlug`, `isAdmin`, `auth`.
- Produces: `GuideArticle({ content }: { content: GuideContent })` — sans hooks ni `'use client'`, utilisable dans l'éditeur. Les actions (Imprimer, PDF) sont rendues par la page, pas par `GuideArticle`.

- [ ] **Step 1:** `GuideArticle` selon le spec (étapes numérotées, checklist en `<input type="checkbox">` natif, vigilance en `Alert`, glossaire en `<dl>`, source ; sections vides masquées ; couleurs `section-*`).
- [ ] **Step 2:** `/fiches/[slug]` : `notFound()` si absente ou brouillon ; `generateMetadata` (titre) ; barre d'actions `ButtonPrint` + lien « Télécharger le PDF » (classe `print:hidden`) ; lien retour vers `/`.
- [ ] **Step 3:** Route PDF : `GET` renvoie le PDF (`Content-Type: application/pdf`, `Content-Disposition: inline; filename="<pdfName>"`) si publiée, ou si brouillon et `isAdmin(session?.user)` ; sinon 404.
- [ ] **Step 4:** `/` : titre « Fiches pratiques », formulaire GET `q`, grille de `CardGuide` (titre, sous-titre, nombre d'étapes), état vide ; lien discret « Espace admin ».
- [ ] **Step 5:** Vérif navigateur (après Task 6 pour avoir une fiche) : brouillon → 404 sur page et PDF en navigation privée (Review Focus 3).
- [ ] **Step 6:** `npm run typecheck` ; commit `feat: pages publiques des fiches`.

### Task 6: Admin — liste et import

**Files:**
- Create: `src/app/admin/layout.tsx`, `src/app/admin/page.tsx`, `src/app/admin/import/page.tsx`, `src/components/admin/FormImportGuide.tsx` (client), `src/components/admin/MenuGuideActions.tsx` (client)

**Interfaces:**
- Consumes: `getAllGuides`, `importGuideAction`, `setGuideStatusAction`, `deleteGuideAction`, `requireAdmin`.

- [ ] **Step 1:** `admin/layout.tsx` appelle `requireAdmin()` ; en-tête avec liens « Fiches », « Importer », « Voir le site », déconnexion.
- [ ] **Step 2:** `/admin` : `Table` (titre → éditeur, `Badge` Brouillon/Publiée, date de mise à jour `fr-FR`), actions par ligne (voir, publier/dépublier, supprimer via `AlertDialog`) ; état vide avec bouton « Importer une fiche ».
- [ ] **Step 3:** `/admin/import` : `FormImportGuide` avec `useActionState(importGuideAction)`, zone de dépôt (input file `accept="application/pdf"` stylé + glisser-déposer), bouton en état pending, erreur en `Alert`.
- [ ] **Step 4:** Vérif navigateur : import de `tuto-peda-caf.pdf` → redirigé vers l'éditeur ; fichier `.txt` renommé `.pdf` et PDF > 5 Mo → message d'erreur, aucune fiche créée (Review Focus 2).
- [ ] **Step 5:** Commit `feat: liste et import des fiches`.

### Task 7: Éditeur avec aperçu en direct

**Files:**
- Create: `src/app/admin/fiches/[id]/page.tsx`, `src/components/admin/EditorGuide.tsx` (client), `src/components/admin/FieldList.tsx` (client)

**Interfaces:**
- Consumes: `getGuideById`, `toGuideContent`, `updateGuideAction`, `setGuideStatusAction`, `GuideArticle`.
- Produces: `EditorGuide({ guide }: { guide: { id: string; slug: string; status: "DRAFT" | "PUBLISHED"; content: GuideContent } })` ; `FieldList({ label, items, onChange }: { label: string; items: string[]; onChange: (items: string[]) => void })` — ajout, suppression, monter/descendre. Le glossaire est édité via `FieldList` au format `terme = définition` et reconverti à l'enregistrement.

- [ ] **Step 1:** Page serveur : `notFound()` si id inconnu ; passe la fiche à `EditorGuide`.
- [ ] **Step 2:** `EditorGuide` : grille 2 colonnes (`lg:`), gauche `Tabs` « Modifier » / « PDF original » (`<iframe src="/fiches/<slug>/pdf">`), droite aperçu `GuideArticle` dans un cadre dont la largeur suit le `ToggleGroup` mobile (375 px) / desktop ; sections vides signalées par un texte d'aide sous la liste.
- [ ] **Step 3:** Barre d'actions : Enregistrer (`useTransition` → `updateGuideAction`, toast succès/erreur), Publier/Dépublier, lien « Voir la page » si publiée.
- [ ] **Step 4:** Vérif navigateur : modification d'une étape visible instantanément dans l'aperçu ; titre vidé → toast « Le titre est obligatoire », rien enregistré (Review Focus 5) ; publication → page publique à jour.
- [ ] **Step 5:** Commit `feat: éditeur de fiche avec aperçu`.

### Task 8: README et vérification finale

**Files:**
- Modify: `README.md`

- [ ] **Step 1:** README en français : démarrage, promotion admin (commande SQL du spec), flux import → édition → publication, `npm test`.
- [ ] **Step 2:** `npm test && npm run typecheck && npm run lint && npm run build` → tout passe.
- [ ] **Step 3:** Parcours navigateur complet (mobile + desktop) ; compte `USER` → `/admin` redirige vers `/login` (Review Focus 4) ; aperçu d'impression sans boutons.
- [ ] **Step 4:** Commit `docs: README des fiches pratiques`.
