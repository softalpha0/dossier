import { and, asc, eq, isNotNull, isNull, lt, or } from "drizzle-orm";

import { getDb, schema } from "../db/index.js";
import { nowIso } from "./dossier.js";
import { fetchPage, PageFetchError } from "./page-fetch.js";
import { SAMPLE_SUFFIX } from "./sample-data.js";

/** Programs are re-checked when their last check is older than this. */
export const RECHECK_AFTER_MS = 3 * 24 * 60 * 60 * 1000;
const MAX_LINES = 30;
const MAX_LINE_CHARS = 300;

/** Lines worth comparing: trimmed, single-spaced, long enough to mean something. */
function meaningfulLines(text: string): string[] {
  return text
    .split(/\n+/)
    .map((l) => l.replace(/\s+/g, " ").trim())
    .filter((l) => l.length >= 12 && /[a-z]/i.test(l));
}

/** Volatile bits that change on every load and say nothing about the rules. */
function stable(line: string): string {
  return line
    .toLowerCase()
    .replace(/\b\d{1,2}:\d{2}(:\d{2})?\b/g, "#time")
    .replace(/\b(updated|last updated|posted|viewed|views?)\b.*$/g, "")
    .trim();
}

export function lineDiff(oldText: string, newText: string) {
  const oldLines = meaningfulLines(oldText);
  const newLines = meaningfulLines(newText);
  const oldSet = new Set(oldLines.map(stable));
  const newSet = new Set(newLines.map(stable));
  const clip = (l: string) => (l.length > MAX_LINE_CHARS ? `${l.slice(0, MAX_LINE_CHARS)}…` : l);
  const added = [...new Set(newLines.filter((l) => !oldSet.has(stable(l))))].slice(0, MAX_LINES).map(clip);
  const removed = [...new Set(oldLines.filter((l) => !newSet.has(stable(l))))].slice(0, MAX_LINES).map(clip);
  return { added, removed };
}

type ProgramRow = {
  id: string;
  title: string;
  sourceUrl: string | null;
  snapshotText: string | null;
  snapshotHash: string | null;
  orgId: string | null;
};

export type RecheckResult =
  | { programId: string; title: string; status: "changed"; changeId: string; added: number; removed: number }
  | { programId: string; title: string; status: "unchanged" | "baseline" }
  | { programId: string; title: string; status: "no_source" | "sample" }
  | { programId: string; title: string; status: "error"; message: string };

/**
 * Re-read one program's official page and record what changed since the last snapshot.
 * The first successful read only stores a baseline: without an earlier copy there is
 * nothing honest to compare against.
 */
export async function recheckProgram(program: ProgramRow, ownerEmail: string): Promise<RecheckResult> {
  const base = { programId: program.id, title: program.title };
  if (!program.sourceUrl) return { ...base, status: "no_source" };
  // Sample programs point at fictional .example pages: nothing to fetch.
  if (program.title.trim().endsWith(SAMPLE_SUFFIX)) return { ...base, status: "sample" };
  const p = schema.programs;
  const db = getDb();
  const now = nowIso();
  let page: Awaited<ReturnType<typeof fetchPage>>;
  try {
    page = await fetchPage(program.sourceUrl);
  } catch (err) {
    // Still record the attempt so a broken page isn't re-fetched on every board load.
    await db.update(p).set({ lastCheckedAt: now }).where(and(eq(p.id, program.id), eq(p.ownerEmail, ownerEmail)));
    return { ...base, status: "error", message: err instanceof PageFetchError ? err.message : "Couldn't read the page." };
  }

  const snapshot = { snapshotText: page.text, snapshotHash: page.hash, lastCheckedAt: now };
  if (!program.snapshotText) {
    await db.update(p).set(snapshot).where(and(eq(p.id, program.id), eq(p.ownerEmail, ownerEmail)));
    return { ...base, status: "baseline" };
  }
  if (program.snapshotHash === page.hash) {
    await db.update(p).set({ lastCheckedAt: now }).where(and(eq(p.id, program.id), eq(p.ownerEmail, ownerEmail)));
    return { ...base, status: "unchanged" };
  }
  const { added, removed } = lineDiff(program.snapshotText, page.text);
  if (!added.length && !removed.length) {
    // Only volatile bits (times, view counters) moved: keep the new copy, report nothing.
    await db.update(p).set(snapshot).where(and(eq(p.id, program.id), eq(p.ownerEmail, ownerEmail)));
    return { ...base, status: "unchanged" };
  }
  const changeId = crypto.randomUUID();
  await db.transaction(async (tx) => {
    await tx.insert(schema.programChanges).values({
      id: changeId,
      programId: program.id,
      sourceUrl: program.sourceUrl,
      oldHash: program.snapshotHash,
      newHash: page.hash,
      addedJson: JSON.stringify(added),
      removedJson: JSON.stringify(removed),
      status: "new",
      ownerEmail,
      orgId: program.orgId,
      detectedAt: now,
    });
    await tx.update(p).set(snapshot).where(and(eq(p.id, program.id), eq(p.ownerEmail, ownerEmail)));
  });
  return { ...base, status: "changed", changeId, added: added.length, removed: removed.length };
}

const programColumns = () => {
  const p = schema.programs;
  return {
    id: p.id,
    title: p.title,
    sourceUrl: p.sourceUrl,
    snapshotText: p.snapshotText,
    snapshotHash: p.snapshotHash,
    orgId: p.orgId,
  };
};

/** The user's programs with an official link whose last check is older than RECHECK_AFTER_MS (oldest first). */
export async function dueProgramsFor(ownerEmail: string, limit: number) {
  const p = schema.programs;
  const cutoff = new Date(Date.now() - RECHECK_AFTER_MS).toISOString();
  return getDb()
    .select(programColumns())
    .from(p)
    .where(
      and(
        eq(p.ownerEmail, ownerEmail),
        isNotNull(p.sourceUrl),
        or(isNull(p.lastCheckedAt), lt(p.lastCheckedAt, cutoff)),
      ),
    )
    .orderBy(asc(p.lastCheckedAt))
    .limit(limit);
}

export async function programForWatch(programId: string, ownerEmail: string) {
  const p = schema.programs;
  const [row] = await getDb()
    .select(programColumns())
    .from(p)
    .where(and(eq(p.id, programId), eq(p.ownerEmail, ownerEmail)))
    .limit(1);
  return row ?? null;
}
