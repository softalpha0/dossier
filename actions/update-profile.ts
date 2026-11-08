import { defineAction, fail } from "@agent-native/core/action";
import { buildDeepLink } from "@agent-native/core/server";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { getDb, schema } from "../server/db/index.js";
import { nowIso, PROGRAM_TYPES, requireUser } from "../server/lib/dossier.js";

const optionalText = (desc: string) =>
  z.string().max(500).nullable().optional().describe(desc);

export default defineAction({
  description:
    "Create or update the signed-in applicant's profile. Only fields you pass change; pass null to clear a field. Never invent values: only save what the user said. Collect first name only (no surname), never passport numbers, addresses or ID numbers.",
  schema: z.object({
    firstName: optionalText("First name only"),
    country: optionalText("Country of residence"),
    citizenship: optionalText("Citizenship(s), comma-separated"),
    educationLevel: optionalText(
      'Highest education, e.g. "BSc", "Master\'s (in progress)"',
    ),
    field: optionalText("Field of study or work"),
    workYears: z.coerce
      .number()
      .int()
      .min(0)
      .max(70)
      .nullable()
      .optional()
      .describe("Years of full-time work experience"),
    goals: z
      .string()
      .max(2000)
      .nullable()
      .optional()
      .describe("Short statement of goals, in the user's words"),
    timezone: z
      .string()
      .max(64)
      .nullable()
      .optional()
      .describe('IANA timezone, e.g. "Europe/London"'),
    programTypes: z
      .array(z.enum(PROGRAM_TYPES))
      .optional()
      .describe("Program types the user is applying to"),
  }),
  link: () => ({
    url: buildDeepLink({ view: "profile", to: "/profile" }),
    label: "Open profile",
  }),
  run: async (args, ctx) => {
    const { ownerEmail, orgId } = requireUser(ctx, "save your profile");
    if (args.timezone) {
      try {
        new Intl.DateTimeFormat("en", { timeZone: args.timezone });
      } catch {
        fail(`"${args.timezone}" is not a valid IANA timezone.`, {
          errorCode: "invalid_timezone",
        });
      }
    }
    const patch: Record<string, unknown> = { updatedAt: nowIso() };
    for (const key of [
      "firstName",
      "country",
      "citizenship",
      "educationLevel",
      "field",
      "workYears",
      "goals",
      "timezone",
    ] as const) {
      if (args[key] !== undefined) patch[key] = args[key];
    }
    if (args.programTypes !== undefined)
      patch.programTypes = JSON.stringify(args.programTypes);

    const p = schema.profiles;
    const db = getDb();
    const [existing] = await db
      .select({ id: p.id })
      .from(p)
      .where(eq(p.ownerEmail, ownerEmail))
      .limit(1);
    if (existing) {
      await db.update(p).set(patch).where(eq(p.id, existing.id));
      return { id: existing.id, saved: true };
    }
    const id = crypto.randomUUID();
    await db
      .insert(p)
      .values({ id, ownerEmail, orgId, ...patch } as typeof p.$inferInsert)
      .onConflictDoUpdate({ target: p.ownerEmail, set: patch });
    return { id, saved: true };
  },
});
