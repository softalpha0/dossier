import { defineAction, fail } from "@agent-native/core/action";
import { resourceDelete, resourceGetByPath, resourcePut } from "@agent-native/core/resources";
import { buildDeepLink } from "@agent-native/core/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { getDb, schema } from "../server/db/index.js";
import { requireProgram, requireUser, slugify } from "../server/lib/dossier.js";

function profileMarkdown(input: {
  name: string;
  role: string;
  programTitle: string;
  values: string;
  penalises: string;
  rubric: { criterion: string; lookFor: string }[];
}) {
  const desc = `Simulated ${input.role} reviewing applications to ${input.programTitle}. Scores one answer 1–5 against the program's own criteria.`;
  const rubric = input.rubric.map((r) => `- **${r.criterion}** — ${r.lookFor}`).join("\n");
  return `---
name: ${input.name.replace(/[\r\n:]/g, " ")}
description: >-
  ${desc.replace(/\s+/g, " ")}
model: inherit
tools: inherit
delegate-default: false
---

# Role

You are ${input.name}, a **simulated** ${input.role} on the selection committee for **${input.programTitle}**. You are not a real committee member; never claim to predict the real outcome.

## What you value
${input.values}

## What you penalise
${input.penalises}

## Rubric
${rubric}

## How to review

You receive one application answer (and the question it answers). Read it once as a busy reviewer would.

1. **Read only.** Never call actions that create, change or delete anything. Do not edit the answer.
2. Judge only the text you were given against the rubric. Never invent facts about the applicant.
3. Quote lines exactly as written in the answer.
4. Reply with **only** this JSON, nothing else:

\`\`\`json
{"score": 1-5, "best_line": "exact quote", "weakest_line": "exact quote", "fix": "one concrete change, max 40 words"}
\`\`\`

Score guide: 5 = would argue for this applicant · 4 = strong, minor gaps · 3 = competent but forgettable · 2 = weak or generic · 1 = off-question or missing essentials.
`;
}

export default defineAction({
  description:
    "Create (or replace) a program's simulated selection committee: exactly 3 reviewer personas derived from the program's stated criteria (get-program first). Each becomes a custom sub-agent profile (agents/<slug>.md) the user can @-mention and you can spawn with agent-teams to score an answer. Reviewers are simulated — say so.",
  schema: z.object({
    programId: z.string().describe("Program id"),
    reviewers: z
      .array(
        z.object({
          name: z
            .string()
            .min(2)
            .max(60)
            .describe('Short persona name, e.g. "Dr. Okafor (Academic)"'),
          role: z.string().min(2).max(80).describe('e.g. "academic reviewer", "alumni reviewer", "program officer"'),
          values: z.string().min(5).max(800).describe("What this reviewer rewards, tied to the program's criteria"),
          penalises: z.string().min(5).max(800).describe("What this reviewer marks down"),
          rubric: z
            .array(
              z.object({
                criterion: z.string().min(2).max(200).describe("A criterion stated by the program"),
                lookFor: z.string().min(2).max(400).describe("What evidence earns credit"),
              }),
            )
            .min(1)
            .max(6),
        }),
      )
      .length(3)
      .describe("Exactly three distinct reviewers"),
  }),
  link: ({ args }) => ({
    url: buildDeepLink({
      view: "program",
      to: `/programs/${encodeURIComponent(args.programId)}#committee`,
      params: { programId: args.programId },
    }),
    label: "Open committee panel",
  }),
  run: async (args, ctx) => {
    const { ownerEmail, orgId } = requireUser(ctx, "build a review panel");
    const program = await requireProgram(args.programId, ownerEmail);
    const names = new Set(args.reviewers.map((r) => r.name.toLowerCase()));
    if (names.size !== 3)
      fail("The three reviewers need different names.", { errorCode: "duplicate_reviewer" });

    const db = getDb();
    const r = schema.reviewers;
    const old = await db
      .select({ agentPath: r.agentPath })
      .from(r)
      .where(and(eq(r.programId, program.id), eq(r.ownerEmail, ownerEmail)));
    const base = slugify(program.title, 28);
    const rows = args.reviewers.map((rev, i) => {
      const slug = `${base}-${slugify(rev.role, 20)}-${i + 1}`;
      return {
        id: crypto.randomUUID(),
        programId: program.id,
        slug,
        name: rev.name,
        role: rev.role,
        values: rev.values,
        penalises: rev.penalises,
        rubricJson: JSON.stringify(rev.rubric),
        agentPath: `agents/${slug}.md`,
        sort: i,
        ownerEmail,
        orgId,
      };
    });

    // Remove the previous panel's profiles, then write the new ones.
    for (const o of old) {
      const res = await resourceGetByPath(ownerEmail, o.agentPath);
      if (res) await resourceDelete(res.id);
    }
    for (const [i, row] of rows.entries()) {
      const rev = args.reviewers[i]!;
      await resourcePut(
        ownerEmail,
        row.agentPath,
        profileMarkdown({
          name: rev.name,
          role: rev.role,
          programTitle: program.title,
          values: rev.values,
          penalises: rev.penalises,
          rubric: rev.rubric,
        }),
        "text/markdown",
      );
    }
    await db.transaction(async (tx) => {
      await tx.delete(r).where(and(eq(r.programId, program.id), eq(r.ownerEmail, ownerEmail)));
      await tx.insert(r).values(rows);
    });
    return {
      programId: program.id,
      reviewers: rows.map((row) => ({
        id: row.id,
        name: row.name,
        role: row.role,
        agentPath: row.agentPath,
        mention: `@${row.name}`,
      })),
      note: "Simulated reviewers. Spawn each with agent-teams (agent = its agentPath) to score an answer, then call save-panel-review.",
    };
  },
});
