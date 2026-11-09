import { defineAction, fail } from "@agent-native/core/action";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { getDb, schema } from "../server/db/index.js";
import { countChars, countWords, nowIso, requireUser } from "../server/lib/dossier.js";

export default defineAction({
  description:
    "Accept or reject a pending suggestion. Accepting applies it to the answer. Only do this when the user explicitly decides; normally the user clicks Accept/Reject in the editor.",
  schema: z.object({
    id: z.string().describe("Suggestion id"),
    decision: z.enum(["accept", "reject"]),
  }),
  run: async ({ id, decision }, ctx) => {
    const { ownerEmail } = requireUser(ctx);
    const db = getDb();
    const s = schema.suggestions;
    const [sug] = await db.select().from(s).where(and(eq(s.id, id), eq(s.ownerEmail, ownerEmail))).limit(1);
    if (!sug) fail("Suggestion not found.", { errorCode: "not_found", statusCode: 404 });
    if (sug.status !== "pending") fail(`This suggestion was already ${sug.status}.`, { errorCode: "not_pending", statusCode: 409 });
    if (decision === "reject") {
      await db.update(s).set({ status: "rejected", resolvedAt: nowIso() }).where(eq(s.id, id));
      return { id, status: "rejected" };
    }
    return db.transaction(async (tx) => {
      const a = schema.answers;
      const [answer] = await tx
        .select()
        .from(a)
        .where(and(eq(a.id, sug.answerId), eq(a.ownerEmail, ownerEmail)))
        .for("update");
      if (!answer) fail("Answer not found.", { errorCode: "not_found", statusCode: 404 });
      if (!answer.content.includes(sug.findText)) {
        await tx.update(s).set({ status: "stale", resolvedAt: nowIso() }).where(eq(s.id, id));
        fail("The text this suggestion changes has been edited since. It can't be applied.", {
          errorCode: "stale",
          statusCode: 409,
        });
      }
      // Tidy what a removal leaves behind: doubled spaces, a space before punctuation,
      // runs of blank lines and blank lines at the start or end.
      const content = answer.content
        .replace(sug.findText, sug.replaceText)
        .replace(/[ \t]{2,}/g, " ")
        .replace(/ +([.,;:!?])/g, "$1")
        .replace(/[ \t]+\n/g, "\n")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
      const wordCount = countWords(content);
      const charCount = countChars(content);
      await tx.update(a).set({ content, wordCount, charCount, updatedAt: nowIso() }).where(eq(a.id, answer.id));
      await tx.update(s).set({ status: "accepted", resolvedAt: nowIso() }).where(eq(s.id, id));
      return { id, status: "accepted", answerId: answer.id, wordCount, charCount, content };
    });
  },
});
