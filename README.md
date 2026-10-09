# pdf-to-html

Generated with [Stackr](https://github.com/Tristan-stack/stackr) — a runnable full-stack Next.js starter.

## Stack

- **Architecture:** Monolith
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Auth:** NextAuth (Auth.js)
- **Styling:** Tailwind CSS

### Interfaces

- Auth portal (login / register / reset)

## Getting started

```bash
# 1. Start a local PostgreSQL (requires Docker)
docker compose up -d

# 2. Install dependencies
npm install

# 3. Create the database schema
npx prisma migrate dev --name init

# Run the app
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

- Register a new account at `/register`, then sign in at `/login`.
- `/account` is a protected route.

## Environment

Copy `.env.example` to `.env` and adjust as needed. A working `.env` with a
generated `AUTH_SECRET` was already created for you.

## Scripts

| Script | Description |
| ------ | ----------- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:studio` | Open Prisma Studio |
| `npm run typecheck` | Type-check without emitting |
