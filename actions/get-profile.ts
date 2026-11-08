import { defineAction } from "@agent-native/core/action";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { getDb, schema } from "../server/db/index.js";
import { parseJsonArray, requireUser } from "../server/lib/dossier.js";

export default defineAction({
  description:
    "Get the signed-in applicant's profile (first name, country, citizenship, education, field, work years, goals, timezone, program types). Returns profile: null when none is saved yet. Use it for eligibility checks and to show deadlines in the user's timezone.",
  schema: z.object({}),
  http: { method: "GET" },
  readOnly: true,
  run: async (_args, ctx) => {
    const { ownerEmail } = requireUser(ctx);
    const p = schema.profiles;
    const [row] = await getDb()
      .select()
      .from(p)
      .where(eq(p.ownerEmail, ownerEmail))
      .limit(1);
    if (!row) return { profile: null };
    return {
      profile: {
        id: row.id,
        firstName: row.firstName,
        country: row.country,
        citizenship: row.citizenship,
        educationLevel: row.educationLevel,
        field: row.field,
        workYears: row.workYears,
        goals: row.goals,
        timezone: row.timezone,
        programTypes: parseJsonArray<string>(row.programTypes),
        updatedAt: row.updatedAt,
      },
    };
  },
});
