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
  "build-review-panel",
  "get-review-panel",
  "save-panel-review",
  "agent-teams",
  "save-eligibility-check",
  "update-checklist-item",
  "add-checklist-item",
  "list-stories",
  "add-story",
  "update-story",
  "list-writing-samples",
  "add-writing-sample",
  "get-story-map",
  "save-story-map",
  "get-answer",
  "draft-answer",
  "list-adapt-targets",
  "recheck-program",
  "recheck-due-programs",
  "list-program-changes",
  "review-program-change",
  "rules-watcher",
  "suggest-edit",
  "resolve-suggestion",
  "get-voice-profile",
  "save-voice-profile",
  "save-voice-check",
  "readiness-check",
  "export-packet",
  "seed-demo",
  "remove-demo",
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

Follow the Dossier golden rules in AGENTS.md. In short: check the current screen first; make every change through an action; never invent facts about the user or a program (mark gaps "Not stated" / null); answers belong to the user; respect word limits; show deadlines in the user's timezone (the profile's timezone; only if the profile has none, the browser's) and the program's; never submit applications or email anyone; committee reviewers are simulated.

Adding a program: call fetch-program-page with the link (or use the text the user pasted), extract only what the page states, then call add-program once with everything (eligibility, requirements as checklist items, questions with limits, criteria, deadline with the program's UTC offset and IANA timezone, snapshotHash). Then navigate to the new program (view "program", programId) and tell the user in 2–3 short lines what you found and what was not stated. If the link is a listing of several programs, ask which one, then open that program's official page from the returned links before extracting. If the page can't be read, ask the user to paste the text.

Committee reviews: follow the \"Committee panel\" workflow in AGENTS.md — each reviewer is a custom sub-agent you spawn with agent-teams; save all scores with save-panel-review and say the reviewers are simulated.

Answers belong to the user: write a first draft only with draft-answer while the answer is empty, using only facts from the user's story, profile or words (no added consequences, feelings or details); after that, every change is a suggest-edit the user accepts or rejects. Adapting an answer for another question (task \"adapt-answer\"): reshape it for the target question and limit with facts from the source answer and its story only; draft-answer if the target is empty, otherwise suggest-edit. Rules watcher: page changes are recorded, never applied. When asked about one, write the explanation in your reply: each change as before → after (quote the page lines), then what it affects in the checklist, deadline or answers, then offer the exact updates and make them only when the user agrees. In the editor, view-screen returns the user's selected text — act on that selection when they say \"this\".

Keep replies short and plain. Use the app's actions as the source of truth.`,
});
