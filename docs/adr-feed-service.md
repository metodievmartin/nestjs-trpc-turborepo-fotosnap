# ADR: Feed Service Architecture

**Status:** Accepted
**Date:** 2026-04-15

## Context

The app currently serves posts via a simple `PostsService.findAll()` that returns all posts globally in reverse chronological order. Stories have their own feed query in `StoriesService`. As the app grows, we need a dedicated feed system that:

- Builds personalized "Following" timelines efficiently
- Handles high-follower (celebrity) accounts without write amplification
- Decouples feed assembly from post/story CRUD
- Supports future ranking algorithms beyond chronological

## Decisions

### 1. Dedicated Feed Module

A new `FeedModule` owns all feed-related logic. `PostsService` and `StoriesService` remain simple CRUD. The existing `StoriesService.getFeedStories()` migrates into the feed module.

### 2. Hybrid Fan-out Model

- **Normal users** (below follower threshold): Fan-out on write. When they create a post/story, a reference is pushed into every follower's feed inbox.
- **Celebrity users** (above threshold): Fan-out on read. No inbox writes on creation. At read time, the feed builder live-queries their posts and merges with the inbox.

This avoids write amplification for high-follower accounts while keeping reads fast for the majority of users.

### 3. Celebrity Detection via Denormalized Follower Count

A `followerCount` field on the user table, incremented/decremented on follow/unfollow. The feed publisher checks `followerCount >= CELEBRITY_THRESHOLD` (config constant) at fan-out time. No boolean flag — changing the threshold requires no data migration.

### 4. Separate Inbox Tables for Posts and Stories

Two tables instead of one mixed table:

- `feed_post_item` — post references in user inboxes
- `feed_story_item` — story references in user inboxes (with denormalized `expiresAt`)

**Rationale:** Posts and stories have different lifecycles (permanent vs 24h expiry), different read patterns (paginated scroll vs grouped-by-user), and different indexing needs. A single mixed table would require discriminator filters on every query and complicate TTL cleanup.

### 5. BullMQ for Async Fan-out

Fan-out jobs run via BullMQ (Redis-backed). Post/story creation emits events; the feed publisher dispatches background jobs. This keeps API responses fast and provides retries, concurrency control, and job visibility.

### 6. Cleanup Strategy — Hybrid Eager/Lazy

- **Unfollows: Eager.** A BullMQ job removes all feed items from the unfollowed user immediately. Users expect instant effect after unfollowing.
- **Post/Story deletes: Lazy.** Feed items are filtered out at read time (join against source table). A periodic background sweep removes orphaned rows. This matches the "Post is no longer available" pattern seen in production social apps.

### 7. Chronological Ranking with Swappable Strategy

Default ranking is reverse chronological. A `RankingStrategy` interface allows swapping in engagement-based or ML-driven ranking later without changing the data flow or feed building pipeline.

### 8. Posts.findAll() Becomes Profile-Only

The existing `posts.findAll()` loses its "all posts globally" behavior and serves only user-specific queries (profile pages). The global timeline is replaced entirely by the feed module. The "browse all posts" concept will eventually become the "Explore" / "For You" feed.

### 9. Split BullMQ Queues by Workload (2026-04-21)

The single `'feed'` queue was split into three workload-specific queues — `feed-fanout`, `feed-backfill`, `feed-cleanup` — each with its own processor class (`FeedFanoutProcessor`, `FeedBackfillProcessor`, `FeedCleanupProcessor`) and independently tunable concurrency/limiter settings.

**Rationale:** BullMQ does not support per-job-name concurrency on a single queue. Under the unified queue, a slow cleanup job could head-of-line-block a user-visible fan-out. Splitting isolates workloads and lets each lane be scaled independently via env vars (`FEED_FANOUT_CONCURRENCY`, `FEED_FANOUT_LIMITER_MAX`, `FEED_BACKFILL_CONCURRENCY`, `FEED_CLEANUP_CONCURRENCY`).

**Rejected alternatives:**

- _Six queues_ (one per job type) — too granular; fan-out for posts and fan-out for stories have identical scaling characteristics and share a limiter.
- _Two queues_ (event-driven vs cron) — conflates backfill with fan-out, which have very different latency sensitivity.
- _One queue with more workers_ — doesn't isolate lanes; a cleanup burst still starves fan-out.

**Idempotency:** Producers pass deterministic `jobId`s derived from the entity IDs (`fanout-post_${postId}`, `backfill-follow_${followerId}_${followingId}`, etc. — `_` is used instead of `:` because BullMQ reserves `:` for its Redis key separator and rejects custom job IDs containing it). BullMQ silently drops duplicates at enqueue, eliminating the need for custom dedup locking.

**Retries:** Event-driven lanes (fan-out, backfill) retry 3× with exponential backoff. Cleanup does not retry — its cron re-fires, so retries would just double-run DELETEs on transient failures.

**Runtime model:** A second entry point (`main-worker.ts`) uses `NestFactory.createApplicationContext` to run the workers headless. Processes select their workload via the `WORKER_ROLES` env var (`all`, `none`, or any comma-separated subset of `fanout,backfill,cleanup`). The default `npm run dev` UX is unchanged — one Nest process runs API + all workers. Dedicated scripts exist for API-only (`dev:api`) and worker-only (`dev:worker`, `dev:worker:fanout`, etc.) development.

**Cleanup scheduling stays on the API process.** `FeedCleanupService` (the cron scheduler, not the consumer) runs unconditionally in any process that imports `FeedModule`. Today that's always the API — keeping the schedule tied to the long-lived API process avoids gaps when worker replicas are scaled down or restarted.

**Migration note:** The old `'feed'` queue in Redis has no consumers after this change. On first deploy, drain it manually (`redis-cli DEL bull:feed:*`) or accept it as empty dead data; the new queues are named differently so there's no risk of message loss.

## Consequences

- **New infrastructure dependency:** Redis (required by BullMQ). Needed anyway for future caching.
- **Migration scope:** `StoriesService.getFeedStories()` moves to feed module. Existing story feed queries on the frontend re-point to new tRPC routes.
- **Schema changes:** New `feed_post_item` and `feed_story_item` tables. New `followerCount` column on user table.
- **Backfill needed:** Existing followers need their feed inboxes populated on first deploy (one-time job).
