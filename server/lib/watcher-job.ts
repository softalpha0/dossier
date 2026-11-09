import { buildJobContent, nextOccurrence, parseJobFrontmatter } from "@agent-native/core/jobs";

/** The per-user Agent-Native automation that runs the rules watcher. */
export const WATCHER_JOB_PATH = "jobs/dossier-rules-watcher.md";
/** Every 3 days at 06:00 UTC (07:00 Lagos). Vercel Hobby sweeps due jobs once a day. */
export const WATCHER_SCHEDULE = "0 6 */3 * *";

export const WATCHER_INSTRUCTIONS = `# Dossier rules watcher

Check the user's programs for changes to their official pages.

1. Call recheck-due-programs with max 10.
2. For every program it reports as changed, call list-program-changes for that program and write one or two plain lines on what changed (for example a new deadline, a new document, a changed word limit). Quote the page; never guess.
3. Do not edit any program, checklist or answer, and do not mark changes as reviewed. The user reviews them on the program page.
4. If nothing changed, reply "No rule changes found." and stop.`;

export function watcherJobContent(owner: string, orgId: string | null) {
  return buildJobContent(
    {
      schedule: WATCHER_SCHEDULE,
      timezone: "UTC",
      enabled: true,
      createdBy: owner,
      ...(orgId ? { orgId } : {}),
      runAs: "creator",
      nextRun: nextOccurrence(WATCHER_SCHEDULE, new Date(), "UTC").toISOString(),
    } as Parameters<typeof buildJobContent>[0],
    WATCHER_INSTRUCTIONS,
  );
}

export function describeWatcherJob(content: string | null | undefined) {
  if (!content) return { enabled: false, nextRun: null as string | null, lastRun: null as string | null, lastStatus: null as string | null };
  const meta = parseJobFrontmatter(content).meta as unknown as Record<string, unknown>;
  const str = (v: unknown) => (typeof v === "string" ? v : null);
  return {
    enabled: meta.enabled !== false,
    nextRun: str(meta.nextRun),
    lastRun: str(meta.lastRun),
    lastStatus: str(meta.lastStatus),
  };
}
