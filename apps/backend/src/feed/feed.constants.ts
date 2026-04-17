export const CELEBRITY_THRESHOLD = 10_000;
export const FEED_QUEUE = 'feed';

// BullMQ job names
export const FAN_OUT_POST_JOB = 'fan-out-post';
export const FAN_OUT_STORY_JOB = 'fan-out-story';
export const BACKFILL_FOLLOW_JOB = 'backfill-follow';
export const CLEANUP_UNFOLLOW_JOB = 'cleanup-unfollow';
export const CLEANUP_EXPIRED_STORIES_JOB = 'cleanup-expired-stories';
export const CLEANUP_ORPHANED_POSTS_JOB = 'cleanup-orphaned-posts';
