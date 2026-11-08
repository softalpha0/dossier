import { defineAction } from "@agent-native/core/action";
import { and, asc, eq } from "drizzle-orm";
import { z } from "zod";

import { getDb, schema } from "../server/db/index.js";
import { requireProgram, requireUser } from "../server/lib/dossier.js";

export default defineAction({
  description:
    "Build the application packet for a program as Markdown: program details, deadline, checklist status and every answer with its word count. The user downloads or prints it; Dossier never submits anything.",
  schema: z.object({ programId: z.string().describe("Program id") }),
  http: { method: "GET" },
  readOnly: true,
  run: async ({ programId }, ctx) => {
    const { ownerEmail } = requireUser(ctx);
    const program = await requireProgram(programId, ownerEmail);
    const db = getDb();
    const questions = await db
      .select()
      .from(schema.questions)
      .where(and(eq(schema.questions.ownerEmail, ownerEmail), eq(schema.questions.programId, programId)))
      .orderBy(asc(schema.questions.sort))
      .limit(100);
    const answers = await db
      .select()
      .from(schema.answers)
      .where(and(eq(schema.answers.ownerEmail, ownerEmail), eq(schema.answers.programId, programId)))
      .limit(100);
    const reqs = await db
      .select()
      .from(schema.requirements)
      .where(and(eq(schema.requirements.ownerEmail, ownerEmail), eq(schema.requirements.programId, programId)))
      .orderBy(asc(schema.requirements.sort))
      .limit(100);
    const lines: string[] = [];
    lines.push(`# ${program.title}`, "");
    if (program.provider) lines.push(`**Provider:** ${program.provider}  `);
    lines.push(`**Type:** ${program.type}  `);
    lines.push(`**Deadline:** ${program.deadlineText ?? (program.deadlineAt ? new Date(program.deadlineAt).toUTCString() : "Not stated")}  `);
    if (program.sourceUrl) lines.push(`**Official page:** ${program.sourceUrl}  `);
    lines.push("", "## Checklist", "");
    if (reqs.length) for (const r of reqs) lines.push(`- [${r.done ? "x" : " "}] ${r.label}${r.details ? ` — ${r.details}` : ""}`);
    else lines.push("_No documents or references stated._");
    lines.push("", "## Answers", "");
    questions.forEach((q, i) => {
      const a = answers.find((x) => x.questionId === q.id);
      const limit = [q.wordLimit ? `${q.wordLimit} words` : null, q.charLimit ? `${q.charLimit} characters` : null].filter(Boolean).join(", ");
      lines.push(`### ${i + 1}. ${q.text}`, "");
      if (limit) lines.push(`_Limit: ${limit}. This answer: ${a?.wordCount ?? 0} words, ${a?.charCount ?? 0} characters._`, "");
      lines.push(a?.content.trim() ? a.content.trim() : "_Not answered yet._", "");
    });
    if (!questions.length) lines.push("_No application questions stated._", "");
    lines.push("---", "_Prepared with Dossier. Committee reviews in Dossier are simulated. Submit through the official channel yourself._");
    const fileName = `${program.title.replace(/[^\w\- ]+/g, "").trim().replace(/\s+/g, "-").slice(0, 60) || "application"}-packet.md`;
    return { fileName, markdown: lines.join("\n") };
  },
});
