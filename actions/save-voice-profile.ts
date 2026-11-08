import { defineAction, fail } from "@agent-native/core/action";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { getDb, schema } from "../server/db/index.js";
import { averageSentenceWords, nowIso, requireUser } from "../server/lib/dossier.js";

export default defineAction({
  description:
    "Save the user's voice profile after reading their writing samples (list-writing-samples with includeContent). Describe how they actually write — sentence rhythm, vocabulary, tone, habits — with evidence from the samples. Never judge quality; this is a fingerprint, not a critique.",
  schema: z.object({
    summary: z.string().min(10).max(800).describe("2–3 sentences: how this person sounds"),
    traits: z.array(z.string().min(2).max(160)).min(2).max(10).describe('e.g. "short, direct sentences", "concrete local detail"'),
    phrases: z.array(z.string().min(1).max(80)).max(15).describe("Words or turns of phrase they actually use"),
    avoid: z.array(z.string().min(1).max(80)).max(15).describe("Styles they never use (e.g. corporate buzzwords)"),
  }),
  run: async (args, ctx) => {
    const { ownerEmail, orgId } = requireUser(ctx);
    const db = getDb();
    const samples = await db
      .select({ content: schema.writingSamples.content })
      .from(schema.writingSamples)
      .where(eq(schema.writingSamples.ownerEmail, ownerEmail))
      .limit(50);
    if (!samples.length)
      fail("Add at least one writing sample (Profile → Writing samples) before building a voice profile.", {
        errorCode: "no_samples",
      });
    const v = schema.voiceProfiles;
    const row = {
      summary: args.summary,
      traitsJson: JSON.stringify(args.traits),
      phrasesJson: JSON.stringify(args.phrases),
      avoidJson: JSON.stringify(args.avoid),
      avgSentenceWords: averageSentenceWords(samples.map((s) => s.content).join("\n\n")),
      sampleCount: samples.length,
      updatedAt: nowIso(),
    };
    const [existing] = await db.select({ id: v.id }).from(v).where(eq(v.ownerEmail, ownerEmail)).limit(1);
    if (existing) await db.update(v).set(row).where(eq(v.id, existing.id));
    else await db.insert(v).values({ id: crypto.randomUUID(), ownerEmail, orgId, ...row });
    return { saved: true, sampleCount: samples.length, avgSentenceWords: row.avgSentenceWords };
  },
});
