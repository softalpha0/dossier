import { defineAction } from "@agent-native/core/action";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { getDb, schema } from "../server/db/index.js";
import { nowIso, requireProgram, requireUser } from "../server/lib/dossier.js";

export default defineAction({
  description:
    "Save the result of checking the user's profile (get-profile) against a program's eligibility rules (get-program). One item per rule: ok (profile clearly meets it), blocker (profile clearly fails it — explain why), unknown (profile doesn't say — list what to ask in `missing`). Never assume facts the profile doesn't state. Overall: no_rules when the program states none; eligible only when every rule is ok; blockers when any rule is a blocker; otherwise needs_info.",
  schema: z.object({
    programId: z.string().describe("Program id"),
    items: z
      .array(
        z.object({
          rule: z.string().min(1).max(500).describe("The eligibility rule, as stated"),
          status: z.enum(["ok", "blocker", "unknown"]),
          reason: z.string().min(1).max(400).describe("One plain sentence citing the profile field or the gap"),
        }),
      )
      .max(40),
    missing: z
      .array(z.string().max(200))
      .max(10)
      .describe("Questions to ask the user to settle 'unknown' rules"),
  }),
  run: async (args, ctx) => {
    const { ownerEmail } = requireUser(ctx);
    await requireProgram(args.programId, ownerEmail);
    const overall = !args.items.length
      ? "no_rules"
      : args.items.some((i) => i.status === "blocker")
      ? "blockers"
      : args.items.every((i) => i.status === "ok")
        ? "eligible"
        : "needs_info";
    const result = { overall, items: args.items, missing: args.missing };
    const p = schema.programs;
    const checkedAt = nowIso();
    await getDb()
      .update(p)
      .set({ eligibilityResultJson: JSON.stringify(result), eligibilityCheckedAt: checkedAt })
      .where(and(eq(p.id, args.programId), eq(p.ownerEmail, ownerEmail)));
    return { programId: args.programId, overall, checkedAt, blockers: args.items.filter((i) => i.status === "blocker").length };
  },
});
