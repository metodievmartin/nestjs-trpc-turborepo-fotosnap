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

## Consequences

- **New infrastructure dependency:** Redis (required by BullMQ). Needed anyway for future caching.
- **Migration scope:** `StoriesService.getFeedStories()` moves to feed module. Existing story feed queries on the frontend re-point to new tRPC routes.
- **Schema changes:** New `feed_post_item` and `feed_story_item` tables. New `followerCount` column on user table.
- **Backfill needed:** Existing followers need their feed inboxes populated on first deploy (one-time job).