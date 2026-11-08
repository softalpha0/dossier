import { defineAction } from "@agent-native/core/action";
import { buildDeepLink } from "@agent-native/core/server";
import { and, asc, eq } from "drizzle-orm";
import { z } from "zod";

import { getDb, schema } from "../server/db/index.js";
import {
  parseJsonArray,
  requireProgram,
  requireUser,
} from "../server/lib/dossier.js";

type EligibilityResult = {
  overall: "eligible" | "blockers" | "needs_info" | "no_rules";
  items: { rule: string; status: "ok" | "blocker" | "unknown"; reason: string }[];
  missing: string[];
};

function parseEligibility(value: string | null): EligibilityResult | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as EligibilityResult;
  } catch {
    return null;
  }
}

export default defineAction({
  description:
    "Get one program with its eligibility rules, checklist items (requirements), questions with limits, selection criteria, deadline and source URL.",
  schema: z.object({ id: z.string().describe("Program id from list-programs") }),
  http: { method: "GET" },
  readOnly: true,
  link: ({ args }) => ({
    url: buildDeepLink({
      view: "program",
      to: `/programs/${encodeURIComponent(args.id)}`,
      params: { programId: args.id },
    }),
    label: "Open program",
  }),
  run: async ({ id }, ctx) => {
    const { ownerEmail } = requireUser(ctx);
    const program = await requireProgram(id, ownerEmail);
    const db = getDb();
    const r = schema.requirements;
    const q = schema.questions;
    const requirements = await db
      .select({
        id: r.id,
        kind: r.kind,
        label: r.label,
        details: r.details,
        done: r.done,
        sort: r.sort,
      })
      .from(r)
      .where(and(eq(r.programId, id), eq(r.ownerEmail, ownerEmail)))
      .orderBy(asc(r.sort))
      .limit(100);
    const questions = await db
      .select({
        id: q.id,
        text: q.text,
        wordLimit: q.wordLimit,
        charLimit: q.charLimit,
        notes: q.notes,
        sort: q.sort,
      })
      .from(q)
      .where(and(eq(q.programId, id), eq(q.ownerEmail, ownerEmail)))
      .orderBy(asc(q.sort))
      .limit(100);
    return {
      program: {
        id: program.id,
        title: program.title,
        type: program.type,
        provider: program.provider,
        sourceUrl: program.sourceUrl,
        summary: program.summary,
        status: program.status,
        deadlineAt: program.deadlineAt,
        deadlineTz: program.deadlineTz,
        deadlineText: program.deadlineText,
        lastCheckedAt: program.lastCheckedAt,
        createdAt: program.createdAt,
        eligibility: parseJsonArray<{ rule: string; category: string }>(
          program.eligibilityJson,
        ),
        eligibilityCheckedAt: program.eligibilityCheckedAt,
        eligibilityResult: parseEligibility(program.eligibilityResultJson),
        criteria: parseJsonArray<{ criterion: string; detail: string | null }>(
          program.criteriaJson,
        ),
      },
      requirements,
      questions,
    };
  },
});
