import { resourceDelete, resourceGetByPath } from "@agent-native/core/resources";
import { and, eq, inArray } from "drizzle-orm";

import { getDb, schema } from "../db/index.js";

/** Delete a program and everything hanging off it (checklist, questions, answers, suggestions, map scores, panel). */
export async function deleteProgramData(programId: string, ownerEmail: string) {
  const db = getDb();
  const r = schema.reviewers;
  const reviewers = await db
    .select({ agentPath: r.agentPath })
    .from(r)
    .where(and(eq(r.programId, programId), eq(r.ownerEmail, ownerEmail)));

  await db.transaction(async (tx) => {
    const a = schema.answers;
    const answerIds = (
      await tx.select({ id: a.id }).from(a).where(and(eq(a.programId, programId), eq(a.ownerEmail, ownerEmail)))
    ).map((x) => x.id);
    if (answerIds.length)
      await tx
        .delete(schema.suggestions)
        .where(and(inArray(schema.suggestions.answerId, answerIds), eq(schema.suggestions.ownerEmail, ownerEmail)));
    const byProgram = <T extends { programId: any; ownerEmail: any }>(t: T) =>
      and(eq(t.programId, programId), eq(t.ownerEmail, ownerEmail));
    await tx.delete(a).where(byProgram(a));
    await tx.delete(schema.storyFits).where(byProgram(schema.storyFits));
    await tx.delete(schema.programChanges).where(byProgram(schema.programChanges));
    await tx.delete(schema.panelReviews).where(byProgram(schema.panelReviews));
    await tx.delete(r).where(byProgram(r));
    await tx.delete(schema.questions).where(byProgram(schema.questions));
    await tx.delete(schema.requirements).where(byProgram(schema.requirements));
    await tx
      .delete(schema.programs)
      .where(and(eq(schema.programs.id, programId), eq(schema.programs.ownerEmail, ownerEmail)));
  });

  // Reviewer sub-agent profiles live in resources, outside the database transaction.
  for (const { agentPath } of reviewers) {
    if (!agentPath) continue;
    const res = await resourceGetByPath(ownerEmail, agentPath).catch(() => null);
    if (res) await resourceDelete(res.id).catch(() => undefined);
  }
}

/** Delete stories plus their story-map scores; answers drafted from them keep their text but lose the link. */
export async function deleteStoriesData(storyIds: string[], ownerEmail: string) {
  if (!storyIds.length) return [];
  const s = schema.stories;
  return getDb().transaction(async (tx) => {
    await tx
      .delete(schema.storyFits)
      .where(and(inArray(schema.storyFits.storyId, storyIds), eq(schema.storyFits.ownerEmail, ownerEmail)));
    await tx
      .update(schema.answers)
      .set({ storyId: null })
      .where(and(inArray(schema.answers.storyId, storyIds), eq(schema.answers.ownerEmail, ownerEmail)));
    return tx
      .delete(s)
      .where(and(inArray(s.id, storyIds), eq(s.ownerEmail, ownerEmail)))
      .returning({ id: s.id, title: s.title });
  });
}
