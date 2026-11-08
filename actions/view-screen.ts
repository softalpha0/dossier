import { defineAction } from "@agent-native/core/action";
import { readAppState, readAppStateForCurrentTab } from "@agent-native/core/application-state";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { getDb, schema } from "../server/db/index.js";
import { limitStatus } from "../server/lib/dossier.js";

export default defineAction({
  description:
    "Read the current screen: navigation (view, programId, questionId), the visible program (title, stage, deadline) and question (text, limits, current word count), and in the answer editor the user's selected text (`selection`). Call it before acting on 'this'.",
  schema: z.object({}),
  http: false,
  readOnly: true,
  run: async (_args, ctx) => {
    const navigation = (await readAppState("navigation")) as
      | { view?: string; programId?: string; questionId?: string }
      | null;

    const screen: Record<string, unknown> = {};
    if (navigation) screen.navigation = navigation;
    const selection = await readAppStateForCurrentTab("selection");
    if (selection) screen.selection = selection;

    const owner = ctx?.userEmail;
    if (owner && navigation?.programId) {
      const p = schema.programs;
      const [program] = await getDb()
        .select({ id: p.id, title: p.title, type: p.type, status: p.status, deadlineAt: p.deadlineAt, deadlineTz: p.deadlineTz })
        .from(p)
        .where(and(eq(p.id, navigation.programId), eq(p.ownerEmail, owner)))
        .limit(1);
      if (program) screen.program = program;
    }
    if (owner && navigation?.questionId) {
      const q = schema.questions;
      const [question] = await getDb()
        .select({ id: q.id, text: q.text, wordLimit: q.wordLimit, charLimit: q.charLimit })
        .from(q)
        .where(and(eq(q.id, navigation.questionId), eq(q.ownerEmail, owner)))
        .limit(1);
      if (question) {
        const a = schema.answers;
        const [answer] = await getDb()
          .select({ wordCount: a.wordCount, charCount: a.charCount, voiceScore: a.voiceScore, panelVerdict: a.panelVerdict })
          .from(a)
          .where(and(eq(a.questionId, question.id), eq(a.ownerEmail, owner)))
          .limit(1);
        screen.question = question;
        screen.answer = answer
          ? { ...answer, ...limitStatus(answer.wordCount, answer.charCount, question.wordLimit, question.charLimit) }
          : null;
      }
    }

    if (Object.keys(screen).length === 0) {
      return "No application state found. Is the app running?";
    }
    return screen;
  },
});
