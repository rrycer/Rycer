# Rycer

A personal, modular app platform — one Next.js app that grows a new feature
("module") whenever a new idea shows up. First module: a workout tracker
(the "Strong" replacement).

## Stack

- **Next.js** (App Router, TypeScript) — web app + API routes, installable
  as a PWA on mobile, and a proper desktop web experience.
- **Postgres** via **Prisma** — schema/migrations in `prisma/`.
- **Tailwind CSS** for styling.

The API routes under `src/app/api/**` are the backend and don't assume a
particular frontend, so a future native app (e.g. Expo) could call the same
API without any backend changes.

## Local development

This repo runs against a local Postgres instance by default. To get set up:

```bash
npm install

# Point DATABASE_URL (in .env) at your Postgres instance, then:
npm run db:migrate   # applies prisma/migrations
npm run db:seed      # creates the initial user + a default exercise library

npm run dev           # http://localhost:3000
```

`npm run db:studio` opens Prisma Studio (a GUI for browsing/editing the DB)
against whatever `DATABASE_URL` you're pointed at.

## Going live: Supabase + Vercel

The app is single-user with no auth yet, so "deploying" just means pointing
it at a real, always-on Postgres database instead of your laptop:

1. Create a free project at [supabase.com](https://supabase.com).
2. In the Supabase dashboard, grab the **connection string** (Project
   Settings → Database → Connection string → URI, using the *pooled*
   connection for serverless/Vercel).
3. Set `DATABASE_URL` to that string — locally in `.env`, and in Vercel's
   project environment variables when you deploy there.
4. Run `npm run db:migrate` once against that URL to create the schema, then
   `npm run db:seed` to create your user row.
5. Deploy the repo to [Vercel](https://vercel.com/new) (import the GitHub
   repo, it auto-detects Next.js) with `DATABASE_URL` set in its env vars.

From then on, `git push` → Vercel redeploys, and your data lives in
Supabase — reachable from any device, no separate "sync" step needed.

## Module structure

Each feature (e.g. `workouts`) owns its own Prisma models (see the comment
banners in `prisma/schema.prisma`) and its own routes under
`src/app/api/<feature>`. Rows are scoped by `userId` so the schema is ready
for real auth later even though today there's a single seeded user
(`src/lib/current-user.ts`). Retiring a feature just means removing its nav
entry — the code and data can stay dormant.
