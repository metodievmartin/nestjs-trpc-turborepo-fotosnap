# Feed Service — Data Flow Reference

## Overview

The feed system uses a **hybrid fan-out architecture**. Content from normal users is pre-distributed to followers'
inboxes at write time (fan-out on write). Content from high-follower "celebrity" users is fetched live at read time (
fan-out on read). Both streams are merged and ranked before being served to the client.

The threshold between normal and celebrity is controlled by `CELEBRITY_THRESHOLD` (default: 10,000 followers), defined
in `feed.constants.ts`. It is checked against a denormalized `followerCount` column on the user table, which is
incremented/decremented on follow/unfollow.

---

## Write Path (Publishing)

When a post or story is created, the feed system distributes it to followers asynchronously.

```
  User creates a Post/Story
         |
         v
  +--------------------+      +--------------------+
  |  PostsService      |      |  StoriesService    |
  |  .create()         |      |  .create()         |
  |                    |      |                    |
  |  1. INSERT into DB |      |  1. INSERT into DB |
  |  2. emit event     |      |  2. emit event     |
  +--------+-----------+      +--------+-----------+
           |                           |
           |  EventEmitter2 (in-process, async)
           v                           v
  +------------------------------------------------+
  |            FeedPublisher                       |
  |                                                |
  |  Listens to:                                   |
  |    @OnEvent('post.created')                    |
  |    @OnEvent('story.created')                   |
  |    @OnEvent('user.unfollowed')                 |
  |                                                |
  |  Dispatches BullMQ jobs to Redis queue         |
  +----------------------+-------------------------+
                         |
                         |  Redis queue ('feed')
                         v
  +----------------------------------------------+
  |            FeedProcessor (BullMQ Worker)        |
  |                                                |
  |  Job: fan-out-post / fan-out-story             |
  |                                                |
  |  1. Look up author's followerCount             |
  |                                                |
  |  2. If followerCount >= CELEBRITY_THRESHOLD:   |
  |     SKIP — content will be pulled at read time |
  |                                                |
  |  3. Otherwise, fan out:                        |
  |     a. Query follower IDs in batches of 1,000  |
  |     b. Batch INSERT into inbox table           |
  |        (feed_post_item or feed_story_item)     |
  +----------------------------------------------+
```

### Why async?

The fan-out is decoupled from the API response via EventEmitter2 + BullMQ. The user's `create` request returns
immediately. The fan-out happens in a background worker process. This means:

- The API response is not blocked by potentially thousands of DB inserts
- Failed fan-out jobs are retried automatically by BullMQ
- Fan-out throughput can be scaled independently (more workers)

### Event flow detail

```
PostsService.create()
  -> EventEmitter2.emit('post.created', { postId, userId, createdAt })
    -> FeedPublisher.onPostCreated()
      -> feedQueue.add('fan-out-post', { postId, userId, createdAt })
        -> FeedProcessor.fanOutPost()  [runs in background worker]
```

---

## Read Path (Building)

When a user requests their feed, the system assembles it from two sources, merges them, and hydrates the result with
full post/story data.

```
  User opens feed (frontend)
         |
         v
  +--------------------+        +---------------------+
  |  Frontend          |  tRPC  |   FeedRouter        |
  |                    |------->|                     |
  |  feed.getPostFeed  |        |  getPostFeed query  |
  |  .useQuery({})     |        |  getStoryFeed query |
  +--------------------+        +---------+-----------+
                                          |
                                          v
                                +---------+----------+
                                |    FeedService     |
                                |    (orchestrator)  |
                                +---------+----------+
                                          |
                          +---------------+---------------+
                          v                               v
                 +-----------------+             +-----------------+
                 | PostFeedBuilder |             | StoryFeedBuilder|
                 +--------+--------+             +--------+--------+
                          |                               |
             +------------+------------+                  |
             v                         v            (same pattern)
    +----------------+      +-------------------+
    | INBOX SOURCE   |      | CELEBRITY SOURCE  |
    |                |      |                   |
    | SELECT from    |      | 1. Find followed  |
    | feed_post_item |      |    celebrities    |
    | WHERE userId   |      |    (followerCount |
    | = viewer       |      |    >= threshold)  |
    |                |      |                   |
    | Already fan-   |      | 2. Query their    |
    | out'd content  |      |    posts directly |
    | from normal    |      |    from the post  |
    | users          |      |    table          |
    +-------+--------+      +---------+---------+
            |                         |
            +-----------+-------------+
                        v
               +------------------+
               |      MERGE       |
               |                  |
               | RankingStrategy  |
               | interface        |
               |                  |
               | Current impl:   |
               | Chronological    |
               | (createdAt DESC) |
               |                  |
               | Future: swap in  |
               | engagement or    |
               | ML-based ranking |
               +--------+---------+
                        |
                        v
               +------------------+
               |     HYDRATE      |
               |                  |
               | Fetch full data  |
               | by post IDs:     |
               | - user info      |
               | - likes count    |
               | - comments count |
               | - isLiked flag   |
               +--------+---------+
                        |
                        v
               +------------------+
               | Response         |
               | {                |
               |  items: Post[],  |
               |  nextCursor,     |
               |  hasMore         |
               | }                |
               +------------------+
```

### Why two sources?

A normal user with 500 followers triggers 500 inbox inserts on post creation — manageable. A celebrity with 1M followers
would trigger 1M inserts — expensive and slow. By skipping the fan-out for celebrities and pulling their content live at
read time, we avoid write amplification while keeping reads fast for the common case (most users follow mostly
non-celebrities).

### Cursor pagination

- **Post feed**: Compound cursor `"createdAt|postId"` — same format as the existing `posts.findAll`. Handles timestamp
  ties via ID tiebreaker.
- **Story feed**: Numeric cursor `"maxStoryId"` — groups stories by user, paginates by the highest story ID per user
  group.

---

## Story Feed — Grouping

The story feed has extra complexity because stories are displayed grouped by user (a horizontal carousel of user
avatars, each containing multiple stories).

```
  StoryFeedBuilder.getStoryFeed(viewerId)
         |
         v
  1. INBOX QUERY (raw SQL)
     SELECT sourceUserId, MAX(storyId) as maxStoryId
     FROM feed_story_item
     WHERE userId = viewer AND expiresAt > NOW()
     GROUP BY sourceUserId
     ORDER BY maxStoryId DESC
     LIMIT N
         |
         v
  2. CELEBRITY QUERY (same pattern, from story table directly)
         |
         v
  3. MERGE + DEDUPLICATE by userId
     (celebrity user may appear in both sources — keep highest maxStoryId)
         |
         v
  4. FETCH ALL STORIES for the paged user IDs
     SELECT * FROM story WHERE userId IN (...) AND expiresAt > NOW()
     ORDER BY createdAt ASC (oldest first within each group)
         |
         v
  5. GROUP by userId, maintain pagination order
         |
         v
  Response: PaginatedStoryGroups
  { items: StoryGroup[], nextCursor, hasMore }
  where StoryGroup = { userId, username, avatar, stories: Story[] }
```

---

## Cleanup Flows

### Unfollow — Eager Cleanup

When a user unfollows someone, their feed items from that person are removed immediately. This is important because the
user made a conscious decision and expects the effect to be instant.

```
  UsersService.unfollow()
         |
         | 1. DELETE from follow table
         | 2. Decrement followerCount
         | 3. emit 'user.unfollowed'
         v
  FeedPublisher.onUserUnfollowed()
         |
         | BullMQ job: cleanup-unfollow
         v
  FeedProcessor.cleanupUnfollow()
         |
         | DELETE FROM feed_post_item
         |   WHERE userId = follower AND sourceUserId = unfollowed
         | DELETE FROM feed_story_item
         |   WHERE userId = follower AND sourceUserId = unfollowed
         v
  Feed items removed — next feed request won't show them
```

### Post/Story Delete — Lazy Cleanup

When a post is deleted, inbox items are NOT immediately cleaned up. Instead:

1. **At read time**: The PostFeedBuilder hydrates post IDs by joining against the post table. If the post no longer
   exists, it's simply filtered out (or the client sees "Post is no longer available" if requesting the full post
   separately).

2. **Periodic sweep**: A daily background job (`cleanup-orphaned-posts`, runs at 3 AM) deletes `feed_post_item` rows
   where the referenced post no longer exists.

This matches the pattern seen in production social apps — the feed item lingers briefly, but the content is gone.

### Expired Stories — Scheduled Cleanup

Stories expire after 24 hours. A repeatable BullMQ job runs every hour to delete expired `feed_story_item` rows:

```
DELETE FROM feed_story_item WHERE expiresAt < NOW()
```

The `expiresAt` column on `feed_story_item` is denormalized from the story table for efficient filtering without a join.

---

## Database Tables

### feed_post_item (inbox for posts)

| Column       | Type      | Description                        |
|--------------|-----------|------------------------------------|
| id           | serial PK | Auto-incrementing identifier       |
| userId       | text FK   | Whose feed inbox this belongs to   |
| postId       | int FK    | The post being referenced          |
| sourceUserId | text FK   | Who created the post               |
| createdAt    | timestamp | Original post creation time        |
| publishedAt  | timestamp | When the fan-out inserted this row |

**Indexes**: `(userId, createdAt, id)` for feed pagination, `(sourceUserId, userId)` for unfollow cleanup.

### feed_story_item (inbox for stories)

Same structure as above, plus:

| Column    | Type      | Description                              |
|-----------|-----------|------------------------------------------|
| storyId   | int FK    | The story being referenced               |
| expiresAt | timestamp | Denormalized from story, for fast filter |

**Indexes**: `(userId, expiresAt, createdAt, id)` for feed reads with expiry filter, `(sourceUserId, userId)` for
unfollow cleanup, `(expiresAt)` for expired item sweeps.

### Why separate tables?

Posts and stories have fundamentally different characteristics:

- **Lifecycle**: Posts are permanent, stories expire in 24h
- **Read pattern**: Posts are paginated chronologically, stories are grouped by user
- **Index needs**: Story queries need expiresAt filtering, post queries don't
- **Volume**: Expired story items are aggressively pruned, post items accumulate

Keeping them in separate tables means each is optimized for its access pattern.

---

## Module Structure

```
apps/backend/src/feed/
  feed.module.ts           NestJS module (imports DatabaseModule, BullMQ queue)
  feed.service.ts          Public API — delegates to builders
  feed.router.ts           tRPC endpoints (feed.getPostFeed, feed.getStoryFeed)
  feed.publisher.ts        Event listener — dispatches BullMQ jobs
  feed.processor.ts        BullMQ worker — fan-out, cleanup jobs
  feed.constants.ts        CELEBRITY_THRESHOLD, queue/job names
  feed-cleanup.service.ts  Schedules repeatable cleanup jobs on startup

  builders/
    post-feed-builder.ts   Assembles post feed (inbox + celebrity merge)
    story-feed-builder.ts  Assembles story feed (inbox + celebrity merge)

  ranking/
    ranking-strategy.interface.ts   Swappable ranking abstraction
    chronological.ranking.ts        Default: sort by createdAt DESC

  events/
    post-created.event.ts     Payload: { postId, userId, createdAt }
    story-created.event.ts    Payload: { storyId, userId, createdAt, expiresAt }
    user-unfollowed.event.ts  Payload: { followerId, unfollowedUserId }

  schemas/
    schema.ts              Drizzle tables: feed_post_item, feed_story_item
```

---

## Extension Points

### Adding "For You" / Discovery Feed

The current architecture only serves a "Following" feed. To add a discovery feed:

1. Create a new builder (e.g., `DiscoveryFeedBuilder`) that queries posts from non-followed users, ranked by engagement.
2. Add a new tRPC endpoint (`feed.getDiscoveryFeed`).
3. No changes to the publishing path — discovery doesn't use inbox tables.

### Swapping the Ranking Algorithm

The `RankingStrategy` interface (`rank(items: T[]): T[]`) is injected into builders via NestJS DI. To switch from
chronological to engagement-based:

1. Create a new class implementing `RankingStrategy` (e.g., `EngagementRanking`).
2. Change the provider in `feed.module.ts`:
   ```ts
   { provide: RANKING_STRATEGY, useClass: EngagementRanking }
   ```
3. The builder code doesn't change — it calls `this.ranking.rank(items)` regardless of implementation.

### Scaling the Fan-out

Current: single BullMQ worker in the NestJS process. To scale:

1. **More concurrency**: Configure `@Processor('feed', { concurrency: 5 })`.
2. **Separate worker process**: Extract the processor into a standalone NestJS app that only runs the BullMQ worker,
   deployed independently from the API server.
3. **Message broker**: Replace BullMQ with RabbitMQ or Kafka for higher throughput and multi-consumer patterns.
