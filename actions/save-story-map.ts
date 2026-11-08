import { defineAction, fail } from "@agent-native/core/action";
import { buildDeepLink } from "@agent-native/core/server";
import { and, eq, inArray } from "drizzle-orm";
import { z } from "zod";

import { getDb, schema } from "../server/db/index.js";
import { requireProgram, requireUser } from "../server/lib/dossier.js";

export default defineAction({
  description:
    "Save the story map for a program: how well each of the user's stories (list-stories) answers each question (get-program), 0–100, with a one-line reason. Score only what the story text supports. Replaces previous scores for these question/story pairs.",
  schema: z.object({
    programId: z.string().describe("Program id"),
    fits: z
      .array(
        z.object({
          questionId: z.string(),
          storyId: z.string(),
          score: z.coerce.number().int().min(0).max(100).describe("0 = irrelevant, 50 = usable, 80+ = strong fit"),
          reason: z.string().min(1).max(240).describe("One short reason tied to the question"),
        }),
      )
      .min(1)
      .max(400),
  }),
  link: ({ args }) => ({
    url: buildDeepLink({
      view: "story-map",
      to: `/programs/${encodeURIComponent(args.programId)}/map`,
      params: { programId: args.programId },
    }),
    label: "Open story map",
  }),
  run: async (args, ctx) => {
    const { ownerEmail, orgId } = requireUser(ctx);
    await requireProgram(args.programId, ownerEmail);
    const db = getDb();
    const qIds = [...new Set(args.fits.map((f) => f.questionId))];
    const sIds = [...new Set(args.fits.map((f) => f.storyId))];
    const qs = await db
      .select({ id: schema.questions.id })
      .from(schema.questions)
      .where(
        and(
          eq(schema.questions.ownerEmail, ownerEmail),
          eq(schema.questions.programId, args.programId),
          inArray(schema.questions.id, qIds),
        ),
      );
    const ss = await db
      .select({ id: schema.stories.id })
      .from(schema.stories)
      .where(and(eq(schema.stories.ownerEmail, ownerEmail), inArray(schema.stories.id, sIds)));
    if (qs.length !== qIds.length) fail("Some questions aren't in this program.", { errorCode: "unknown_question" });
    if (ss.length !== sIds.length) fail("Some stories aren't in your story bank.", { errorCode: "unknown_story" });
    const f = schema.storyFits;
    await db.transaction(async (tx) => {
      await tx
        .delete(f)
        .where(and(eq(f.ownerEmail, ownerEmail), inArray(f.questionId, qIds), inArray(f.storyId, sIds)));
      await tx.insert(f).values(
        args.fits.map((x) => ({
          id: crypto.randomUUID(),
          programId: args.programId,
          questionId: x.questionId,
          storyId: x.storyId,
          score: x.score,
          reason: x.reason,
          ownerEmail,
          orgId,
        })),
      );
    });
    return { programId: args.programId, saved: args.fits.length, path: `/programs/${args.programId}/map` };
  },
});
