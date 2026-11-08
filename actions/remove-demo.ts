import { defineAction } from "@agent-native/core/action";
import { and, eq, inArray, like } from "drizzle-orm";
import { z } from "zod";

import { getDb, schema } from "../server/db/index.js";
import { deleteProgramData, deleteStoriesData } from "../server/lib/cleanup.js";
import { requireUser } from "../server/lib/dossier.js";
import {
  LEGACY_SAMPLE_TITLES,
  SAMPLE_PROFILE_MARKER,
  SAMPLE_PROGRAMS,
  SAMPLE_STORIES,
  SAMPLE_WRITING,
} from "../server/lib/sample-data.js";

export default defineAction({
  description:
    "Remove the fictional sample data loaded by seed-demo (the three \"(sample)\" programs with their answers and panels, the five sample stories and the sample writing). The user's own data is never touched. The sample profile is removed only while it still has its \"(sample profile)\" marker in goals.",
  schema: z.object({}),
  run: async (_args, ctx) => {
    const { ownerEmail } = requireUser(ctx, "remove sample data");
    const db = getDb();
    const p = schema.programs;
    const programs = await db
      .select({ id: p.id })
      .from(p)
      .where(and(eq(p.ownerEmail, ownerEmail), inArray(p.title, [...SAMPLE_PROGRAMS.map((x) => x.title), ...LEGACY_SAMPLE_TITLES.programs])));
    for (const { id } of programs) await deleteProgramData(id, ownerEmail);

    const s = schema.stories;
    const storyIds = (
      await db
        .select({ id: s.id })
        .from(s)
        .where(and(eq(s.ownerEmail, ownerEmail), inArray(s.title, [...SAMPLE_STORIES.map((x) => x.title), ...LEGACY_SAMPLE_TITLES.stories])))
    ).map((x) => x.id);
    const stories = await deleteStoriesData(storyIds, ownerEmail);

    const w = schema.writingSamples;
    const samples = await db
      .delete(w)
      .where(and(eq(w.ownerEmail, ownerEmail), eq(w.title, SAMPLE_WRITING.title)))
      .returning({ id: w.id });

    // The sample profile goes too, but only while it still carries the sample marker:
    // once the user edits their goals it is theirs.
    const pr = schema.profiles;
    const profiles = await db
      .delete(pr)
      .where(and(eq(pr.ownerEmail, ownerEmail), like(pr.goals, `%${SAMPLE_PROFILE_MARKER}%`)))
      .returning({ id: pr.id });

    return {
      removed: {
        programs: programs.length,
        stories: stories.length,
        writingSamples: samples.length,
        sampleProfile: profiles.length > 0,
      },
    };
  },
});
