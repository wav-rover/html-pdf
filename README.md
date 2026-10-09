# Fiches pratiques

Transforme les fiches mémo PDF (« La Formation pour tous ») en pages web lisibles par les patients.

## Démarrer

```bash
npm install
npx prisma migrate dev   # crée les tables dans la base de DATABASE_URL
npm run dev
```

## Utilisation (démo, sans connexion)

1. `/admin/import` : dépose une fiche PDF, son contenu est extrait automatiquement.
2. `/admin/fiches/[id]` : corrige les champs, compare avec le PDF original, aperçu mobile/desktop en direct, puis **Publier**.
3. `/` liste les fiches publiées, `/fiches/[slug]` affiche la fiche (imprimable, PDF téléchargeable).

Les PDF doivent suivre la trame des fiches mémo : titre, sous-titre, sections « L'essentiel », « À prévoir », « Points de vigilance », « À comprendre » (`terme = définition`), source en pied de page.

## Scripts

| Script | Rôle |
| --- | --- |
| `npm run dev` | Serveur de dev |
| `npm test` | Tests du parseur PDF |
| `npm run typecheck` | Vérification TypeScript |
| `npm run build` | Build de production |
