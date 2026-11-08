import { defineAction, fail } from "@agent-native/core/action";
import { buildDeepLink } from "@agent-native/core/server";
import { z } from "zod";

import { getDb, schema } from "../server/db/index.js";
import {
  nowIso,
  PROGRAM_TYPES,
  REQUIREMENT_KINDS,
  requireUser,
} from "../server/lib/dossier.js";

const NOT_STATED = "Use null when the page does not state it — never guess.";

export default defineAction({
  description:
    "Save a program (scholarship, fellowship, grant, accelerator…) as a card with its eligibility rules, required documents/references as checklist items, application questions with word/character limits, selection criteria and deadline. Call fetch-program-page first (or use text the user pasted) and only include facts stated there. Returns the new program id; then navigate to /programs/<id>.",
  schema: z.object({
    title: z.string().min(1).max(300).describe("Official program name"),
    type: z.enum(PROGRAM_TYPES).describe("Program type"),
    provider: z
      .string()
      .max(300)
      .nullable()
      .describe(`Organisation running it. ${NOT_STATED}`),
    sourceUrl: z
      .string()
      .url()
      .nullable()
      .describe("Official page URL; null when the user pasted text only"),
    summary: z
      .string()
      .max(1500)
      .nullable()
      .describe("2–3 plain sentences: what it offers and who it is for"),
    eligibility: z
      .array(
        z.object({
          rule: z.string().min(1).max(500).describe("One rule, as stated"),
          category: z
            .enum([
              "citizenship",
              "residence",
              "age",
              "education",
              "experience",
              "field",
              "language",
              "other",
            ])
            .describe("What the rule is about"),
        }),
      )
      .max(40)
      .describe("Eligibility rules stated on the page; [] if none stated"),
    requirements: z
      .array(
        z.object({
          kind: z.enum(REQUIREMENT_KINDS),
          label: z
            .string()
            .min(1)
            .max(300)
            .describe('Short task, e.g. "CV (max 2 pages)"'),
          details: z.string().max(1000).nullable().describe("Extra detail or null"),
        }),
      )
      .max(60)
      .describe("Documents, references, forms, tests, fees to prepare"),
    questions: z
      .array(
        z.object({
          text: z.string().min(1).max(2000).describe("The exact question"),
          wordLimit: z.coerce
            .number()
            .int()
            .positive()
            .nullable()
            .describe(`Word limit. ${NOT_STATED}`),
          charLimit: z.coerce
            .number()
            .int()
            .positive()
            .nullable()
            .describe(`Character limit. ${NOT_STATED}`),
          notes: z.string().max(500).nullable().describe("Guidance shown with it"),
        }),
      )
      .max(40)
      .describe("Essay / application questions, in order"),
    criteria: z
      .array(
        z.object({
          criterion: z.string().min(1).max(300),
          detail: z.string().max(800).nullable(),
        }),
      )
      .max(20)
      .describe("Selection criteria the committee uses; [] if none stated"),
    deadlineAt: z
      .string()
      .datetime({ offset: true })
      .nullable()
      .describe(
        `Deadline as ISO 8601 with the program's UTC offset, e.g. 2027-01-15T23:59:00+00:00. If only a date is given, use 23:59 in the program's timezone. ${NOT_STATED}`,
      ),
    deadlineTimezone: z
      .string()
      .max(64)
      .nullable()
      .describe(`Program's IANA timezone, e.g. "Europe/London". ${NOT_STATED}`),
    deadlineText: z
      .string()
      .max(300)
      .nullable()
      .describe("The deadline exactly as written on the page"),
    snapshotHash: z
      .string()
      .max(128)
      .nullable()
      .optional()
      .describe("hash from fetch-program-page, for change watching"),
  }),
  link: ({ result }) => ({
    url: buildDeepLink({
      view: "program",
      to: `/programs/${encodeURIComponent(result.id)}`,
      params: { programId: result.id },
    }),
    label: `Open ${result.title}`,
  }),
  run: async (args, ctx) => {
    const { ownerEmail, orgId } = requireUser(ctx, "add programs");
    if (args.deadlineTimezone) {
      try {
        new Intl.DateTimeFormat("en", { timeZone: args.deadlineTimezone });
      } catch {
        fail(`"${args.deadlineTimezone}" is not a valid IANA timezone.`, {
          errorCode: "invalid_timezone",
        });
      }
    }
    const id = crypto.randomUUID();
    const now = nowIso();
    const deadlineAt = args.deadlineAt
      ? new Date(Date.parse(args.deadlineAt)).toISOString()
      : null;
    await getDb().transaction(async (tx) => {
      await tx.insert(schema.programs).values({
        id,
        title: args.title,
        type: args.type,
        provider: args.provider,
        sourceUrl: args.sourceUrl,
        summary: args.summary,
        eligibilityJson: JSON.stringify(args.eligibility),
        criteriaJson: JSON.stringify(args.criteria),
        deadlineAt,
        deadlineTz: args.deadlineTimezone,
        deadlineText: args.deadlineText,
        status: "researching",
        snapshotHash: args.snapshotHash ?? null,
        lastCheckedAt: args.sourceUrl ? now : null,
        ownerEmail,
        orgId,
        createdAt: now,
        updatedAt: now,
      });
      if (args.requirements.length)
        await tx.insert(schema.requirements).values(
          args.requirements.map((r, i) => ({
            id: crypto.randomUUID(),
            programId: id,
            kind: r.kind,
            label: r.label,
            details: r.details,
            sort: i,
            ownerEmail,
            orgId,
          })),
        );
      if (args.questions.length)
        await tx.insert(schema.questions).values(
          args.questions.map((q, i) => ({
            id: crypto.randomUUID(),
            programId: id,
            sort: i,
            text: q.text,
            wordLimit: q.wordLimit,
            charLimit: q.charLimit,
            notes: q.notes,
            ownerEmail,
            orgId,
          })),
        );
    });
    return {
      id,
      title: args.title,
      requirements: args.requirements.length,
      questions: args.questions.length,
      path: `/programs/${id}`,
    };
  },
});
