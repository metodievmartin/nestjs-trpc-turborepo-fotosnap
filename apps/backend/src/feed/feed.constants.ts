export const CELEBRITY_THRESHOLD = 10_000;

// BullMQ queue names — one per workload lane so each can be tuned independently
// (concurrency, rate limiter, retries). See docs/plans/2026-04-21-split-feed-workers.md.
export const FEED_FANOUT_QUEUE = 'feed-fanout';
export const FEED_BACKFILL_QUEUE = 'feed-backfill';
export const FEED_CLEANUP_QUEUE = 'feed-cleanup';

// BullMQ job names
export const FAN_OUT_POST_JOB = 'fan-out-post';
export const FAN_OUT_STORY_JOB = 'fan-out-story';
export const BACKFILL_FOLLOW_JOB = 'backfill-follow';
export const CLEANUP_UNFOLLOW_JOB = 'cleanup-unfollow';
export const CLEANUP_EXPIRED_STORIES_JOB = 'cleanup-expired-stories';
export const CLEANUP_ORPHANED_POSTS_JOB = 'cleanup-orphaned-posts';
