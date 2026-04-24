# FotoSnap — Web

The Next.js 16 (App Router) frontend for FotoSnap, served on **port 3003**. It
talks to the NestJS backend over a fully typed tRPC client and renders the feed,
profiles, posts, stories, and auth flows.

## Stack

- **Next.js 16** App Router · **React 19** · TypeScript
- **Tailwind CSS 4** (PostCSS plugin, CSS variables for theming) · **shadcn/ui**
  (new-york style, RSC-enabled) · **lucide-react** icons · **next-themes**
- **TanStack Query** + **tRPC client** (`@trpc/react-query`) for data fetching
- **Better Auth** React client — requests proxied to the backend via Next.js
  rewrites (`/api/auth/*`)
- **react-hook-form** + **Zod** for forms (schemas shared via `@repo/contracts`)

## Structure

```
app/          App Router routes (route groups, layouts, pages)
features/     Domain slices — each owns its components/ and hooks/
  auth/       Login & signup forms, logout
  feed/       Home feed (posts + stories, infinite scroll)
  posts/      Post card/detail, create dialog, likes, captions, options
  comments/   Comment list & form
  stories/    Story carousel, viewer, upload
  profile/    Profile page (header, tabs, post grid/modal), profile editing
  users/      Suggested users, follow lists, follow action
components/   Shared, cross-feature UI
  ui/         shadcn/ui primitives (add via `npx shadcn@latest add <name>`)
  common/     Reusable building blocks (avatars, upload areas, empty states)
  layout/     App shell, sidebar, mobile nav, page container
  providers/  theme + tRPC providers
hooks/        Generic cross-feature hooks (infinite-scroll, media-query, …)
lib/          auth (Better Auth client + schemas), trpc client, media, navigation, utils
middleware.ts Redirects unauthenticated users to /login
```

## Conventions

- **Feature slices**: domain code lives under `features/<slice>/{components,hooks}`.
  A hook used by a single domain belongs to that slice; a hook used across
  domains stays in the top-level `hooks/`. Shared UI lives in `components/`.
- **Imports**: always use the `@/*` alias (maps to `apps/web/*`) — no relative
  `../` hops between folders. Order imports in three groups (core/third-party →
  `@repo/*` → `@/*`), sorted by length within each group.
- **Data fetching** (see [CLAUDE.md](./CLAUDE.md) for depth): queries live at the
  list/container level; detail views hydrate from the parent's cache via
  `initialData`. Mutations are encapsulated in hooks that own their optimistic
  cache updates and targeted invalidation.

## Getting started

Run from the **repo root** (Turbo wires up the shared packages):

```bash
npm install
npm run db:up                 # Postgres + Redis (backend deps)
npm run dev -- --filter=web   # web only, or `npm run dev` for everything
```

The app expects the backend on port 4000. The web `.env` sets `API_URL` for the
auth/upload rewrites in `next.config.js`.

## Type checking

```bash
npm run check-types --workspace=web   # next typegen && tsc --noEmit
```
