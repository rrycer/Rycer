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

## Auth

The whole app sits behind one shared passcode (no per-user accounts yet —
see `src/proxy.ts`, `src/lib/session.ts`). Every request needs `APP_PASSCODE`
and `SESSION_SECRET` set:

```bash
# Generate real values for production — never reuse the .env.example ones:
openssl rand -hex 16   # -> APP_PASSCODE (use a long random string, not a PIN)
openssl rand -hex 32   # -> SESSION_SECRET
```

## Going live: Supabase + Vercel

1. **Database — Supabase.** Create a free project at
   [supabase.com](https://supabase.com). Grab the **connection string**
   (Project Settings → Database → Connection string → URI, using the
   *pooled* connection for serverless/Vercel).
2. **Apply the schema.** Set `DATABASE_URL` to that string locally (in
   `.env`) and run:
   ```bash
   npm run db:migrate:deploy   # applies prisma/migrations, no dev prompts
   npm run db:seed             # creates your user + default exercises/routines
   ```
3. **Deploy — Vercel.** Import the GitHub repo at
   [vercel.com/new](https://vercel.com/new) (it auto-detects Next.js). In the
   project's environment variables, set:
   - `DATABASE_URL` — the same Supabase pooled connection string
   - `APP_PASSCODE` — a long random value (see above), not the dev one
   - `SESSION_SECRET` — a long random value (see above), not the dev one
   - `SEED_USER_EMAIL` — only needed if you re-run the seed script against
     prod and want a different email than the default

   `postinstall` runs `prisma generate` automatically on every install, so
   no extra build configuration is needed.
4. **Open it on your phone.** Visit the Vercel URL, enter the passcode, and
   optionally "Add to Home Screen" — the app has a manifest and installs
   like a native app (PWA).

From then on, `git push` → Vercel redeploys, and your data lives in
Supabase — reachable from any device, no separate "sync" step needed.

Every page under `src/app/(app)/**` is forced dynamic (`export const
dynamic = "force-dynamic"` in its layout) since it reads live per-user data —
don't remove that without understanding it'll start serving stale,
build-time-frozen data instead.

## Module structure

Each feature (e.g. `workouts`) owns its own Prisma models (see the comment
banners in `prisma/schema.prisma`) and its own routes under
`src/app/api/<feature>`. Rows are scoped by `userId` so the schema is ready
for real auth later even though today there's a single seeded user
(`src/lib/current-user.ts`). Retiring a feature just means removing its nav
entry — the code and data can stay dormant.
