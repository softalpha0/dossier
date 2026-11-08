import { defineAction } from "@agent-native/core/action";
import { readAppState, readAppStateForCurrentTab } from "@agent-native/core/application-state";
import { z } from "zod";

export default defineAction({
  description:
    "Read the current screen: navigation (view, programId, questionId) and, in the answer editor, the user's selected text (`selection`). Basic navigation is already included in <current-screen>; use this action only when you need a fresh read.",
  schema: z.object({}),
  http: false,
  readOnly: true,
  run: async () => {
    const navigation = await readAppState("navigation");

    const screen: Record<string, unknown> = {};
    if (navigation) screen.navigation = navigation;
    const selection = await readAppStateForCurrentTab("selection");
    if (selection) screen.selection = selection;

    if (Object.keys(screen).length === 0) {
      return "No application state found. Is the app running?";
    }
    return screen;
  },
});
