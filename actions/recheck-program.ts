import { defineAction, fail } from "@agent-native/core/action";
import { z } from "zod";

import { requireUser } from "../server/lib/dossier.js";
import { programForWatch, recheckProgram } from "../server/lib/watch.js";

export default defineAction({
  description:
    "Re-read one program's official page now and record what changed since the last saved copy (lines added/removed). The first check only saves a baseline. Never edits the program card — tell the user what changed and let them decide.",
  schema: z.object({ programId: z.string().describe("Program id") }),
  run: async ({ programId }, ctx) => {
    const { ownerEmail } = requireUser(ctx, "check a program for changes");
    const program = await programForWatch(programId, ownerEmail);
    if (!program) fail("Program not found.", { errorCode: "not_found", statusCode: 404 });
    return recheckProgram(program, ownerEmail);
  },
});
