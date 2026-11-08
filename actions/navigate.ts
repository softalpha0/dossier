import { defineAction } from "@agent-native/core/action";
import { writeAppStateForCurrentTab } from "@agent-native/core/application-state";
import { z } from "zod";

export default defineAction({
  description:
    "Navigate the UI to a specific view or path. Writes a navigate command to application state which the UI reads and auto-deletes.",
  schema: z.object({
    view: z.string().optional().describe("View name to navigate to"),
    path: z.string().optional().describe("URL path to navigate to"),
    threadId: z.string().optional().describe("Chat thread ID to open"),
    programId: z
      .string()
      .optional()
      .describe('Program id, with view "program", "story-map", "readiness" or "answer"'),
    questionId: z.string().optional().describe('Question id, with view "answer" (the answer editor)'),
  }),
  http: false,
  run: async (args) => {
    if (!args.view && !args.path) {
      throw new Error("At least --view or --path is required.");
    }
    const nav: Record<string, string> = {};
    if (args.view) nav.view = args.view;
    if (args.path) nav.path = args.path;
    if (args.threadId) nav.threadId = args.threadId;
    if (args.programId) {
      nav.programId = args.programId;
      const p = `/programs/${encodeURIComponent(args.programId)}`;
      if (args.questionId) nav.questionId = args.questionId;
      if (!args.path)
        nav.path =
          args.view === "answer" && args.questionId
            ? `${p}/questions/${encodeURIComponent(args.questionId)}`
            : args.view === "story-map"
              ? `${p}/map`
              : args.view === "readiness"
                ? `${p}/ready`
                : p;
    }
    nav._writeId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    await writeAppStateForCurrentTab("navigate", nav);
    return `Navigating to ${args.view || args.path}`;
  },
});
