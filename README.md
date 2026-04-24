# FotoSnap

An Instagram-style social app — posts, likes, comments, stories, follows, a
real newsfeed with fan-out workers, and end-to-end type safety from the database
all the way to the React components.

NestJS on the backend, Next.js on the frontend, tRPC gluing them together,
Drizzle on top of Postgres, and BullMQ over Redis running the feed pipeline.

---

## Tech stack

**Frontend (`apps/web`)** — Next.js 16 (App Router) · React 19 · TypeScript ·
Tailwind CSS 4 · shadcn/ui · TanStack Query · tRPC client · Better Auth (React
client) · react-hook-form + Zod · lucide-react · next-themes

**Backend (`apps/backend`)** — NestJS 11 · TypeScript · tRPC (via
`nestjs-trpc`) · Drizzle ORM + drizzle-kit · Better Auth (Drizzle adapter) ·
BullMQ · Bull Board · Multer · EventEmitter2 · Zod

**Infrastructure & data** — PostgreSQL 17 · Redis 7 · Docker Compose (dev
infra)

**Monorepo & tooling** — Turborepo · npm workspaces · ESLint 9 (flat config) ·
Prettier · shared `@repo/*` packages for contracts, tRPC type, ESLint, and
TypeScript configs

---

## Repository structure

- **`apps/web`** — Next.js frontend on **port 3003**.
- **`apps/backend`** — NestJS API + workers on **port 4000**.
- **`packages/contracts`** — Zod schemas shared by backend and web
  (`@repo/contracts`).
- **`packages/trpc`** — the tRPC `AppRouter` type, auto-generated from the
  backend (`@repo/trpc`).
- **`packages/eslint-config`** + **`packages/typescript-config`** — shared
  configs.
- **`infra/dev/docker-compose.yml`** — Postgres 17 and Redis 7 for local dev.

---

## Quick start

You'll need **Node ≥ 18**, **npm 11.x**, and **Docker** (for Postgres + Redis).

```bash
# 1. Install deps
npm install

# 2. Start Postgres + Redis in the background
npm run db:up

# 3. Create env files (copy the example, tweak if you like)
cp apps/backend/.env.example apps/backend/.env

# 4. Run migrations + seed some demo data
npm run db:migrate --workspace=backend
npm run db:seed

# 5. Boot everything (API, workers, and web in one go)
turbo run dev
# or: npm run dev
```

Open **http://localhost:3003** and log in with any seeded user
(password: `password123`).

> `turbo run dev` from the repo root starts both apps in parallel. If you have
> `turbo` installed globally you can run it directly; otherwise `npm run dev`
> does the same thing via the root script.

> Heads-up: there isn't a single `docker compose up` that runs the entire stack
> today — only Postgres and Redis live in Docker. The Next.js and NestJS
> processes run on the host via `npm run dev`. Keeps hot-reload snappy.

---

## Detailed setup

### Prerequisites

| Tool     | Version       |
| -------- | ------------- |
| Node.js  | ≥ 18          |
| npm      | 11.10.0 (pinned via `packageManager`) |
| Docker   | any recent    |

### 1. Install

```bash
npm install
```

This installs everything for every workspace.

### 2. Infra (Postgres + Redis)

```bash
npm run db:up      # start containers
npm run db:logs    # tail logs
npm run db:down    # stop
npm run db:reset   # stop + wipe volumes (fresh DB)
```

Postgres is exposed at `localhost:5432` (user/pass `postgres`/`postgres`, db
`fotosnap`). Redis at `localhost:6379`.

### 3. Environment

**Backend** — copy the example:

```bash
cp apps/backend/.env.example apps/backend/.env
```

Keys you'll care about:

- `DATABASE_URL` — Postgres connection string
- `BETTER_AUTH_SECRET` — session signing secret (change it for anything real)
- `REDIS_URL` — BullMQ connection
- `UI_URL` — frontend origin (CORS / auth redirects)
- `ADMIN_USER_IDS` — comma-separated IDs that skip the DB admin role check
- Optional worker tuning: `WORKER_ROLES`, `FEED_FANOUT_CONCURRENCY`,
  `FEED_FANOUT_LIMITER_MAX`, `FEED_FANOUT_LIMITER_DURATION_MS`,
  `FEED_BACKFILL_CONCURRENCY`, `FEED_CLEANUP_CONCURRENCY`

**Web** — `apps/web/.env` is already checked in for local dev. It points the
Next.js proxy at `http://localhost:4000`.

### 4. Database

Migrations live in `apps/backend/drizzle/` and are managed by drizzle-kit:

```bash
# apply migrations
npm run db:migrate --workspace=backend

# generate a new migration after editing a schema.ts
npm run db:generate --workspace=backend -- --name my_change
```

Seed demo data (users, avatars, follows, posts, likes, comments, stories, and a
prebuilt feed):

```bash
npm run db:seed            # everything
npm run db:seed:stories    # just stories
```

All seed users share the password `password123`.

### 5. Run

```bash
turbo run dev                    # everything (API + workers + web)
# same thing via the root script:
npm run dev
npm run dev -- --filter=web      # frontend only
npm run dev -- --filter=backend  # backend only
```

Split the backend into separate API and worker processes if you want to mimic
production topology:

```bash
npm run dev:api        # HTTP API, no workers (WORKER_ROLES=none)
npm run dev:worker     # workers only, no HTTP
# Or one lane at a time:
npm run dev:worker:fanout
npm run dev:worker:backfill
npm run dev:worker:cleanup
```

### 6. Useful scripts

```bash
npm run build          # build all apps + packages
npm run lint           # eslint (zero warnings allowed)
npm run check-types    # tsc --noEmit everywhere
npm run format         # prettier
npm run trpc:generate  # regenerate the tRPC AppRouter type
npm run trpc:watch     # same, in watch mode
```

---

## Endpoints

Everything served by the backend is prefixed with `/api`. In local dev the
Next.js app transparently proxies `/api/*` to `http://localhost:4000`.

### tRPC

- **`POST /api/trpc/<router>.<procedure>`** — all typed procedures.
  Five routers, all behind `AuthTrpcMiddleware`:
  - `posts` — create, findById, findAll, toggleLike
  - `comments` — CRUD on post comments
  - `stories` — create, getOwnStories
  - `feed` — `getPostFeed`, `getStoryFeed` (hybrid fan-out reads)
  - `users` — profiles, follow/unfollow, follower/following lists, suggested
    users

The generated `AppRouter` type lives in `packages/trpc/src/server/server.ts`
and drives full client autocomplete on the web.

### Better Auth (REST)

- **`POST /api/auth/sign-up/email`** — email/password sign-up
- **`POST /api/auth/sign-in/email`** — sign-in (sets session cookie)
- **`POST /api/auth/sign-out`** — invalidates the session
- **`GET /api/auth/get-session`** — returns the current session + user
- Plus the rest of the Better Auth handler surface under `/api/auth/*`

### Uploads (REST)

- **`POST /api/upload/image`** — multipart field `image`, max 5 MB,
  jpeg/jpg/png/gif/webp only. Written to `./uploads/images/<uuid>.<ext>`.
- **`GET /uploads/images/<filename>`** — static file serving for uploaded
  images.

### Admin — Bull Board

- **`http://localhost:4000/api/admin/queues`** — Bull Board dashboard for the
  three feed queues (`feed-fanout`, `feed-backfill`, `feed-cleanup`). Inspect
  active/waiting/failed jobs, retry, drain, peek at payloads.

  Access is gated by `AdminAuthMiddleware`: you need either the `admin` role
  on your Better Auth user, or your user id listed in the `ADMIN_USER_IDS`
  env var.

---

## Architecture at a glance

```
 ┌────────────────────┐      tRPC + Better Auth      ┌──────────────────────┐
 │   apps/web         │ ───────────────────────────> │   apps/backend       │
 │   Next.js 16       │     (/api/* proxied via      │   NestJS 11          │
 │   :3003            │      Next.js rewrites)       │   :4000              │
 └────────────────────┘                              └──────────┬───────────┘
                                                                │
                                                                │ Drizzle
                                                                ▼
                                                       ┌─────────────────┐
                                                       │  Postgres 17    │
                                                       └─────────────────┘
                                                                ▲
                                        EventEmitter2 ──> BullMQ │
                                                                │
                                                       ┌─────────────────┐
                                                       │   Redis 7       │
                                                       │ (queue backing) │
                                                       └─────────────────┘
```

- Web talks to the backend only over **tRPC** (+ Better Auth for sessions). The
  Next.js app proxies `/api/*` to `http://localhost:4000`.
- The backend writes to Postgres via Drizzle, fires **domain events**, and a
  single `FeedPublisher` turns those into **BullMQ jobs**.
- Workers live in the same codebase; a `WORKER_ROLES` env var decides whether a
  process runs the HTTP API, the workers, or both.

---

## The interesting bits

### One monorepo, two shared packages worth knowing about

- **`@repo/contracts`** is just Zod schemas — exported as raw `.ts` source, no
  build step. Both backend and web import the same `postSchema`,
  `cursorPaginationSchema`, etc.
- **`@repo/trpc`** is an **auto-generated** `AppRouter` type. The root script
  `npm run trpc:generate` walks the Nest module graph starting at
  `apps/backend/src/app.module.ts`, finds every `*.router.ts` decorated with
  `@Router()` / `@Query()` / `@Mutation()`, and writes
  `packages/trpc/src/server/server.ts`. The web app imports only the type —
  there's no runtime code crossing the boundary.

Result: change a router in the backend, run `trpc:watch`, and the frontend's
autocomplete updates instantly. Rename a field in a Zod schema and TypeScript
flags every component that depended on it.

### The newsfeed is a hybrid fan-out

Traditional "fan-out on write" (push every new post to every follower's inbox)
is fast to read but painful for users with huge followings. "Fan-out on read"
(query live every time) scales writes but hammers the DB for every scroll.
FotoSnap does both:

- **Normal authors** (followers < 10,000): when they post, a `fan-out-post` job
  copies the post into each follower's `feed_post_item` row.
- **Celebrities** (followers ≥ 10,000): their posts are **pulled live** from the
  `post` table at feed-read time and merged with the inbox results.

The `PostFeedBuilder` queries both sources, merges them, runs them through a
`RankingStrategy` (currently chronological — newest first), then hydrates the
winners. Stories work the same way with their own inbox table.

All feed state lives in **Postgres** (`feed_post_item`, `feed_story_item`).
Redis is only used as BullMQ's backing store — no sorted sets, no custom caches.

Pagination uses **compound keyset cursors** (`"<ISO timestamp>|<id>"`)
everywhere — no `OFFSET`, and `hasMore` is computed by fetching `limit + 1`
rows.

### Three queues, one set of workers

The feed pipeline is split into **three BullMQ queues** with different
behaviors:

| Queue           | What it does                                     | Retries | Concurrency |
| --------------- | ------------------------------------------------ | ------- | ----------- |
| `feed-fanout`   | Fan out a new post/story to followers' inboxes   | 3, exponential backoff | 5 (default) |
| `feed-backfill` | On follow: pull historical posts/stories in      | 3, exponential backoff | 2 (default) |
| `feed-cleanup`  | On unfollow: delete. Hourly: expire old stories. Daily: reap orphans. | 1 (crons re-fire) | 1 (default) |

A few design choices worth flagging:

- **Idempotent enqueues** — every job gets a deterministic `jobId` like
  `fanout-post_${postId}`. If the same event fires twice, BullMQ silently drops
  the duplicate.
- **Rate-limited fan-out** — the fanout queue caps writes at
  `FEED_FANOUT_LIMITER_MAX` per `FEED_FANOUT_LIMITER_DURATION_MS` so one viral
  post can't saturate the database.
- **Config-driven topology** — the `WORKER_ROLES` env var (`all` | `none` | a
  comma-separated subset) decides which processors each process attaches. Run
  everything in one Node process in dev, split into dedicated worker pods in
  prod, no code change required.
- **Bull Board** — the queue dashboard is mounted at
  `http://localhost:4000/api/admin/queues` (admin-gated via the Better Auth
  admin role or `ADMIN_USER_IDS`).

### Cookie-based auth, no JWTs

Sessions are handled by **Better Auth** with email/password. A session token is
stored in an httpOnly cookie, and the `session` table in Postgres is the source
of truth — logging out server-side invalidates the session immediately, which
token-based JWT flows can't do without extra machinery.

REST controllers are gated by a global Nest `AuthGuard`; tRPC procedures are
gated by a per-router `AuthTrpcMiddleware`. Both call `auth.api.getSession()`
under the hood — one source of truth. The Next.js middleware checks for the
session cookie's presence to short-circuit protected routes; actual validity is
re-checked on every backend call.

### Infinite scroll everywhere, one hook

A single `useInfiniteScroll` hook drives the feed, the horizontal stories strip,
the profile post grid, the comments panel on post-detail (both mobile and
desktop variants), and the follower/following lists. It wraps an
`IntersectionObserver` and accepts an optional `root` ref so the same hook works
for page scroll, a sideways-scrolling div, or a scoped scroll container.

---

## Project layout

```
.
├── apps/
│   ├── backend/         NestJS API + workers
│   │   ├── src/
│   │   │   ├── feed/    Queues, processors, builders, ranking
│   │   │   ├── auth/    Better Auth wiring + users module
│   │   │   ├── posts/   Posts + likes
│   │   │   ├── comments/
│   │   │   ├── stories/
│   │   │   ├── upload/  Multer → local ./uploads
│   │   │   └── admin/   Bull Board dashboard
│   │   └── drizzle/     Generated SQL migrations
│   └── web/             Next.js frontend
│       ├── app/         App Router routes
│       ├── features/    Domain slices (auth, feed, posts, comments,
│       │                stories, profile, users) — components + hooks
│       ├── components/  Shared: ui, common, layout, providers
│       ├── hooks/       Generic cross-feature hooks
│       └── lib/         auth, trpc, media, navigation, utils
├── packages/
│   ├── contracts/       Zod schemas (source-exported)
│   ├── trpc/            Auto-generated AppRouter type
│   ├── eslint-config/
│   └── typescript-config/
├── infra/
│   └── dev/docker-compose.yml   Postgres + Redis
└── docs/                ADRs, data-flow notes, plans
```

---

## Docs worth reading

If you want more depth on the feed design:

- `docs/adr-feed-service.md` — why hybrid fan-out, why three queues, why
  deterministic jobIds
- `docs/feed-data-flow.md` — write-path, read-path, cleanup flows
- `docs/research/` — investigations and snapshots
- `docs/plans/` — feature plans in progress

---

## Troubleshooting

- **`ECONNREFUSED localhost:5432` / `6379`** — `npm run db:up` and make sure
  Docker is running.
- **Login works, then everything 401s** — you probably skipped
  `BETTER_AUTH_SECRET` in `apps/backend/.env`, or it changed between restarts.
- **Web doesn't see backend changes** — the frontend imports tRPC as a type.
  Run `npm run trpc:generate` (or `trpc:watch` in dev) after backend router
  changes.
- **Feed looks stale** — check Bull Board at
  `http://localhost:4000/api/admin/queues` to see if fan-out jobs are stuck.