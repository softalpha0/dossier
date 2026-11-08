import { defineAction } from "@agent-native/core/action";
import { buildDeepLink } from "@agent-native/core/server";
import { and, eq, inArray } from "drizzle-orm";
import { z } from "zod";

import { getDb, schema } from "../server/db/index.js";
import { countChars, countWords, nowIso, requireUser } from "../server/lib/dossier.js";
import {
  deadlineFor,
  deadlineTextFor,
  SAMPLE_ANSWER,
  SAMPLE_PROFILE_MARKER,
  SAMPLE_PROGRAMS,
  SAMPLE_STORIES,
  SAMPLE_WRITING,
} from "../server/lib/sample-data.js";

export default defineAction({
  description:
    'Load clearly fictional sample data so the user can try Dossier: three programs (scholarship, fellowship, accelerator), five stories, one writing sample and one over-long draft answer. Every title ends in "(sample)". Only when the user asks to try sample/demo data. Safe to call twice — nothing is duplicated. Fills the profile only if the user has none.',
  schema: z.object({}),
  link: ({ result }) => ({
    url: buildDeepLink({ view: "programs", to: result.path }),
    label: "Open the board",
  }),
  run: async (_args, ctx) => {
    const { ownerEmail, orgId } = requireUser(ctx, "load sample data");
    const db = getDb();
    const now = nowIso();
    const p = schema.programs;
    const s = schema.stories;

    const existingPrograms = new Set(
      (
        await db
          .select({ title: p.title })
          .from(p)
          .where(and(eq(p.ownerEmail, ownerEmail), inArray(p.title, SAMPLE_PROGRAMS.map((x) => x.title))))
      ).map((x) => x.title),
    );
    const existingStories = new Set(
      (
        await db
          .select({ title: s.title })
          .from(s)
          .where(and(eq(s.ownerEmail, ownerEmail), inArray(s.title, SAMPLE_STORIES.map((x) => x.title))))
      ).map((x) => x.title),
    );
    const [existingSample] = await db
      .select({ id: schema.writingSamples.id })
      .from(schema.writingSamples)
      .where(and(eq(schema.writingSamples.ownerEmail, ownerEmail), eq(schema.writingSamples.title, SAMPLE_WRITING.title)))
      .limit(1);
    const [existingProfile] = await db
      .select({ id: schema.profiles.id })
      .from(schema.profiles)
      .where(eq(schema.profiles.ownerEmail, ownerEmail))
      .limit(1);

    const added = { programs: 0, stories: 0, writingSamples: 0, answers: 0, profile: false };

    await db.transaction(async (tx) => {
      for (const [index, prog] of SAMPLE_PROGRAMS.entries()) {
        if (existingPrograms.has(prog.title)) continue;
        const programId = crypto.randomUUID();
        await tx.insert(p).values({
          id: programId,
          title: prog.title,
          type: prog.type,
          provider: prog.provider,
          sourceUrl: null,
          summary: prog.summary,
          eligibilityJson: JSON.stringify(prog.eligibility),
          criteriaJson: JSON.stringify(prog.criteria),
          deadlineAt: deadlineFor(prog.daysAhead, prog.utcOffset),
          deadlineTz: prog.timezone,
          deadlineText: deadlineTextFor(prog.daysAhead, prog.tzLabel),
          status: index === 0 ? "preparing" : "researching",
          snapshotHash: null,
          lastCheckedAt: null,
          ownerEmail,
          orgId,
          createdAt: now,
          updatedAt: now,
        });
        await tx.insert(schema.requirements).values(
          prog.requirements.map((r, i) => ({
            id: crypto.randomUUID(),
            programId,
            kind: r.kind,
            label: r.label,
            details: r.details,
            done: index === 0 && i === 0, // CV already ticked on the scholarship
            sort: i,
            ownerEmail,
            orgId,
          })),
        );
        const questionIds = prog.questions.map(() => crypto.randomUUID());
        await tx.insert(schema.questions).values(
          prog.questions.map((q, i) => ({
            id: questionIds[i]!,
            programId,
            sort: i,
            text: q.text,
            wordLimit: q.wordLimit,
            charLimit: q.charLimit,
            notes: q.notes,
            ownerEmail,
            orgId,
          })),
        );
        if (index === 0) {
          // The demo's starting point: a first draft that is too long and full of stock phrases.
          await tx.insert(schema.answers).values({
            id: crypto.randomUUID(),
            programId,
            questionId: questionIds[0]!,
            storyId: null,
            content: SAMPLE_ANSWER,
            wordCount: countWords(SAMPLE_ANSWER),
            charCount: countChars(SAMPLE_ANSWER),
            ownerEmail,
            orgId,
            createdAt: now,
            updatedAt: now,
          });
          added.answers++;
        }
        added.programs++;
      }

      const newStories = SAMPLE_STORIES.filter((x) => !existingStories.has(x.title));
      if (newStories.length) {
        await tx.insert(s).values(
          newStories.map((story) => ({
            id: crypto.randomUUID(),
            title: story.title,
            situation: story.situation,
            action: story.action,
            result: story.result,
            themes: JSON.stringify(story.themes),
            ownerEmail,
            orgId,
            createdAt: now,
            updatedAt: now,
          })),
        );
        added.stories = newStories.length;
      }

      if (!existingSample) {
        await tx.insert(schema.writingSamples).values({
          id: crypto.randomUUID(),
          title: SAMPLE_WRITING.title,
          content: SAMPLE_WRITING.content,
          wordCount: countWords(SAMPLE_WRITING.content),
          createdAt: now,
          ownerEmail,
          orgId,
        });
        added.writingSamples = 1;
      }

      if (!existingProfile) {
        await tx.insert(schema.profiles).values({
          id: crypto.randomUUID(),
          firstName: "Alex",
          country: "Canada",
          citizenship: "Canadian",
          educationLevel: "BSc Microbiology (GPA 3.6/4.0, equivalent to a UK 2:1)",
          field: "Public health",
          workYears: 3,
          goals: `A master's in public health, then run community health programmes back home. ${SAMPLE_PROFILE_MARKER}`,
          timezone: "America/Toronto",
          programTypes: JSON.stringify(["scholarship", "fellowship", "accelerator"]),
          ownerEmail,
          orgId,
          createdAt: now,
          updatedAt: now,
        });
        added.profile = true;
      }
    });

    const nothingNew = !added.programs && !added.stories && !added.writingSamples && !added.profile;
    return {
      added,
      alreadyLoaded: nothingNew,
      note: "All sample data is fictional and marked (sample). Remove it with remove-demo.",
      path: "/programs",
    };
  },
});
