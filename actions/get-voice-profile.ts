import { defineAction } from "@agent-native/core/action";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";

import { getDb, schema } from "../server/db/index.js";
import { averageSentenceWords, parseJsonArray, requireUser } from "../server/lib/dossier.js";

export default defineAction({
  description:
    "The user's voice profile (how they write, learned from their own writing samples) plus measured stats from the samples. `stale` is true when samples changed since the profile was built — rebuild it with save-voice-profile after reading list-writing-samples(includeContent).",
  schema: z.object({}),
  http: { method: "GET" },
  readOnly: true,
  run: async (_args, ctx) => {
    const { ownerEmail } = requireUser(ctx);
    const db = getDb();
    const samples = await db
      .select({ content: schema.writingSamples.content, wordCount: schema.writingSamples.wordCount })
      .from(schema.writingSamples)
      .where(eq(schema.writingSamples.ownerEmail, ownerEmail))
      .orderBy(desc(schema.writingSamples.createdAt))
      .limit(50);
    const [profile] = await db
      .select()
      .from(schema.voiceProfiles)
      .where(eq(schema.voiceProfiles.ownerEmail, ownerEmail))
      .limit(1);
    const all = samples.map((s) => s.content).join("\n\n");
    return {
      measured: {
        sampleCount: samples.length,
        totalWords: samples.reduce((n, s) => n + s.wordCount, 0),
        avgSentenceWords: averageSentenceWords(all),
      },
      profile: profile
        ? {
            summary: profile.summary,
            traits: parseJsonArray<string>(profile.traitsJson),
            phrases: parseJsonArray<string>(profile.phrasesJson),
            avoid: parseJsonArray<string>(profile.avoidJson),
            avgSentenceWords: profile.avgSentenceWords,
            sampleCount: profile.sampleCount,
            updatedAt: profile.updatedAt,
          }
        : null,
      stale: !profile || profile.sampleCount !== samples.length,
    };
  },
});
