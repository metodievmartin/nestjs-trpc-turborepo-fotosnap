/**
 * Worker role gating for the feed module.
 *
 * A single backend codebase hosts three BullMQ consumer classes. Each process
 * that loads `FeedModule` decides which of them to instantiate based on the
 * `WORKER_ROLES` environment variable:
 *
 *   - unset or `all` → all three workers active (single-process UX)
 *   - `none`         → no workers (API-only process)
 *   - `fanout,backfill,cleanup` → explicit subset (any comma-separated combination)
 *
 * The cleanup **cron scheduler** (`FeedCleanupService.onModuleInit`) is not
 * gated here — it's a producer that runs wherever `FeedModule` is imported.
 * Today that's always the API; keeping the schedule tied to the long-lived API
 * process avoids gaps when worker replicas are restarted or scaled to zero.
 */

export type WorkerRole = 'fanout' | 'backfill' | 'cleanup';

const ALL_ROLES: readonly WorkerRole[] = ['fanout', 'backfill', 'cleanup'];

function parseRoles(raw: string | undefined): ReadonlySet<WorkerRole> {
  if (raw === undefined || raw.trim() === '' || raw.trim() === 'all') {
    return new Set(ALL_ROLES);
  }
  if (raw.trim() === 'none') {
    return new Set();
  }

  const tokens = raw
    .split(',')
    .map((t) => t.trim())
    .filter((t) => t.length > 0);

  const result = new Set<WorkerRole>();
  for (const t of tokens) {
    if ((ALL_ROLES as readonly string[]).includes(t)) {
      result.add(t as WorkerRole);
    }
  }
  return result;
}

export function getEnabledWorkerRoles(
  env: NodeJS.ProcessEnv = process.env,
): ReadonlySet<WorkerRole> {
  return parseRoles(env.WORKER_ROLES);
}

export function isWorkerRoleEnabled(
  role: WorkerRole,
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  return getEnabledWorkerRoles(env).has(role);
}
