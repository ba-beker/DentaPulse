# DentaPulse

Monorepo for the dental practice platform: a Next.js app (`apps/web`) and an Express API (`apps/api`) on MongoDB Atlas. Both apps deploy to Vercel as separate projects. The API runs as one serverless function on Fluid compute. There is no Docker.

## Prerequisites

- Node.js 20 (`nvm use` reads `.nvmrc`)
- pnpm 10 (`corepack enable`, then `corepack prepare pnpm@10.17.1 --activate`). If `corepack enable` cannot write to `/usr/local/bin`, use `corepack enable --install-directory "$HOME/.local/bin"` and add that directory to `PATH`.
- A MongoDB Atlas cluster (replica set). Transactions do not work on a standalone server.

## Atlas

1. Create a cluster in **AWS eu-west-3 (Paris)**. That is the Atlas region closest to Algeria, and it matches the API's Vercel region `cdg1`. Atlas clusters are replica sets, which is what multi-document transactions need.
2. Create a database user with read and write on `dentapulse_dev`.
3. Copy the SRV connection string. If the password contains reserved characters, percent-encode them (`encodeURIComponent`).
4. Network Access:
   - Local: allow your current IP.
   - Vercel: allow the project's static egress IPs when you have them. On Hobby, without static IPs, a temporary `0.0.0.0/0` entry is what lets the function reach Atlas. Tighten this before production.
5. Keep the database name as `dentapulse_dev` for local work. In development the API refuses to connect unless `MONGODB_DB_NAME` ends with `_dev`. In test it must end with `_test`. That stops seeds and tests from writing to production.

If your cluster is not in Paris, change `regions` in `apps/api/vercel.json` to the Vercel region in the same place (for example `fra1` for AWS eu-central-1). Database latency dominates response time, so the function has to run next to Atlas rather than in the `iad1` default. `vercel.json` is strict JSON and cannot contain comments; the same note is in `apps/api/server.ts`.

## Five-minute local start

```bash
nvm use
corepack enable
pnpm install
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

Edit `apps/api/.env` and set `MONGODB_URI`. Leave `MONGODB_DB_NAME=dentapulse_dev`. The web `.env` only needs `API_URL=http://localhost:4000` for the rewrite; the other keys are listed so both examples stay in sync.

```bash
pnpm db:ping
pnpm dev
```

`db:ping` prints the MongoDB server version and the replica set name, then commits a transaction on the scratch collection `_dentapulse_ping`.

`pnpm dev` starts the API on port 4000 and Next.js on port 3000. Open http://localhost:3000. The page requests `/api/health`. Next.js rewrites that to `${API_URL}/health`, so the browser stays on one origin. The page shows the replica set name from the `hello` command.

Real `.env` files are gitignored. Only `.env.example` is committed.

## Scripts

| Script                 | What it does                                                                                     |
| ---------------------- | ------------------------------------------------------------------------------------------------ |
| `pnpm dev`             | API and web together                                                                             |
| `pnpm build`           | Production build of the web app. The API has no build step; Vercel bundles `server.ts`.          |
| `pnpm lint`            | ESLint and Prettier                                                                              |
| `pnpm typecheck`       | `tsc --noEmit` in every package                                                                  |
| `pnpm test`            | Vitest (database-name guard and `/health`)                                                       |
| `pnpm seed`            | Idempotent demo data when `DEMO_DATA_ONLY=false` and `SEED_USER_PASSWORD` are set (dev DB only). |
| `pnpm openapi:export`  | Writes `docs/api/dentapulse.openapi.json` and a Postman/Bruno collection.                        |
| `pnpm db:ping`         | Server version, replica set name, and a transaction                                              |
| `pnpm db:sync-indexes` | `mongoose.syncIndexes()` for registered models                                                   |

Husky runs lint-staged (ESLint + Prettier) and `pnpm typecheck` on commit.

## Vercel (two projects)

Connect the same Git repository twice.

### API

- Root Directory: `apps/api`
- Framework Preset: Express (zero-config; entry file is `server.ts`)
- Build Command: empty. Do not add a compile step.
- Install: pnpm from the repository root, and include source files outside the root directory so `packages/shared` is available.
- Fluid compute stays on (the Express preset uses it by default).
- `apps/api/vercel.json` sets the function region to `cdg1` and `maxDuration` to 30 seconds on `server.ts`.
- Environment variables from `apps/api/.env.example`: `MONGODB_URI`, `MONGODB_DB_NAME`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `CORS_ORIGINS` (the web origin), `CRON_SECRET`, `DEFAULT_COUNTRY`, `DEFAULT_LOCALE`, `DEFAULT_TIMEZONE`, `DEFAULT_CURRENCY`, `DEMO_DATA_ONLY`. Use a production database name. Vercel sets `NODE_ENV=production`, so the `_dev` / `_test` guard does not apply there.

`src/app.ts` only exports `createApp()`. `server.ts` default-exports that app and does not listen. `src/dev.ts` is local-only and listens on port 4000.

### Web

- Root Directory: `apps/web`
- Framework Preset: Next.js
- Include source files outside the root directory (`packages/shared`).
- Set `API_URL` to the API project's origin, with no path and no trailing slash, for example `https://dentapulse-api.vercel.app`. The rewrite in `next.config.ts` sends `/api/:path*` to `${API_URL}/:path*`. `API_URL` is server-side; it is not a `NEXT_PUBLIC_` variable.
- Copy the remaining keys from `apps/web/.env.example` if you want the same defaults available to the web process.

## Layout

```
apps/web          Next.js (App Router)
apps/api          Express on Vercel
  server.ts       Vercel entry (default export, no listen)
  src/app.ts      createApp()
  src/dev.ts      local listen on port 4000
packages/shared   Zod contracts shared by both apps
```

The Mongo helper caches the connection promise on `globalThis`, uses `maxPoolSize` 5, `serverSelectionTimeoutMS` 5000, `retryWrites` and `w: "majority"`. It connects on first use, not at import, and it does not disconnect after a request.
