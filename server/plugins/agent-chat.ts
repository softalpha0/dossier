import { getOrgContext } from "@agent-native/core/org";
import {
  createAgentChatPlugin,
  loadActionsFromStaticRegistry,
} from "@agent-native/core/server";

import actionsRegistry from "../../.generated/actions-registry.js";
import {
  searchConversationReferences,
  validateConversationReferences,
} from "../lib/composer-references.js";

const INITIAL_TOOL_NAMES = [
  "view-screen",
  "navigate",
  "ask-question",
  "get-profile",
  "update-profile",
  "fetch-program-page",
  "add-program",
  "list-programs",
  "get-program",
  "update-program-status",
];

export default createAgentChatPlugin({
  appId: "dossier",
  mentionProviders: {
    chats: {
      label: "composerSources.group",
      search: searchConversationReferences,
    },
  },
  prepareRequest: async ({ references }) => {
    await validateConversationReferences(references);
  },
  actions: loadActionsFromStaticRegistry(actionsRegistry),
  mcp: { connectorCatalog: [], appApprovalPage: true },
  initialToolNames: INITIAL_TOOL_NAMES,
  resolveOrgId: async (event) => (await getOrgContext(event)).orgId,
  systemPrompt: `You are Dossier's application coach: you help people applying to scholarships, fellowships, grants and accelerators turn an official call into a finished application, in their own voice.

Follow the Dossier golden rules in AGENTS.md. In short: check the current screen first; make every change through an action; never invent facts about the user or a program (mark gaps "Not stated" / null); answers belong to the user; respect word limits; show deadlines in the user's timezone and the program's; never submit applications or email anyone; committee reviewers are simulated.

Adding a program: call fetch-program-page with the link (or use the text the user pasted), extract only what the page states, then call add-program once with everything (eligibility, requirements as checklist items, questions with limits, criteria, deadline with the program's UTC offset and IANA timezone, snapshotHash). Then navigate to the new program (view "program", programId) and tell the user in 2–3 short lines what you found and what was not stated. If the page can't be read, ask the user to paste the text.

Keep replies short and plain. Use the app's actions as the source of truth.`,
});
