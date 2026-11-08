import { defineAction } from "@agent-native/core/action";
import { buildDeepLink } from "@agent-native/core/server";
import { and, asc, eq } from "drizzle-orm";
import { z } from "zod";

import { getDb, schema } from "../server/db/index.js";
import { limitStatus, parseJsonArray, requireProgram, requireUser } from "../server/lib/dossier.js";

type Check = { id: string; ok: boolean; label: string; fix: string | null; path: string | null; blocking: boolean };

export default defineAction({
  description:
    "Rule-based readiness check for a program (no AI): eligibility checked without blockers, every checklist item done, every question answered within its limits, no pending suggestions, voice check and committee review run, deadline not passed. Each item has an exact fix and a link. Report the failing items first.",
  schema: z.object({ programId: z.string().describe("Program id") }),
  http: { method: "GET" },
  readOnly: true,
  link: ({ args }) => ({
    url: buildDeepLink({
      view: "readiness",
      to: `/programs/${encodeURIComponent(args.programId)}/ready`,
      params: { programId: args.programId },
    }),
    label: "Open readiness check",
  }),
  run: async ({ programId }, ctx) => {
    const { ownerEmail } = requireUser(ctx);
    const program = await requireProgram(programId, ownerEmail);
    const db = getDb();
    const base = `/programs/${programId}`;
    const reqs = await db
      .select({ label: schema.requirements.label, done: schema.requirements.done })
      .from(schema.requirements)
      .where(and(eq(schema.requirements.ownerEmail, ownerEmail), eq(schema.requirements.programId, programId)))
      .limit(100);
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
    const pending = await db
      .select({ answerId: schema.suggestions.answerId })
      .from(schema.suggestions)
      .where(and(eq(schema.suggestions.ownerEmail, ownerEmail), eq(schema.suggestions.status, "pending")))
      .limit(500);

    const checks: Check[] = [];
    const elig = program.eligibilityResultJson
      ? (JSON.parse(program.eligibilityResultJson) as { overall: string; missing: string[] })
      : null;
    const rules = parseJsonArray(program.eligibilityJson);
    checks.push(
      !rules.length
        ? { id: "eligibility", ok: true, label: "No eligibility rules stated", fix: null, path: null, blocking: false }
        : !elig
          ? { id: "eligibility", ok: false, label: "Eligibility not checked yet", fix: "Run “Check my eligibility” on the program page.", path: base, blocking: false }
          : elig.overall === "blockers"
            ? { id: "eligibility", ok: false, label: "Eligibility has possible blockers", fix: "Review the ⚠️ rules on the program page before applying.", path: base, blocking: true }
            : elig.overall === "needs_info"
              ? { id: "eligibility", ok: false, label: "Eligibility needs confirming", fix: elig.missing[0] ?? "Answer the open eligibility questions.", path: base, blocking: false }
              : { id: "eligibility", ok: true, label: "Eligibility: you look eligible", fix: null, path: null, blocking: false },
    );
    const open = reqs.filter((r) => !r.done);
    checks.push(
      open.length
        ? {
            id: "checklist",
            ok: false,
            label: `${open.length} checklist item${open.length === 1 ? "" : "s"} not done`,
            fix: `Next: ${open[0]!.label}${open.length > 1 ? ` (+${open.length - 1} more)` : ""}`,
            path: base,
            blocking: true,
          }
        : { id: "checklist", ok: true, label: reqs.length ? "Checklist complete" : "No checklist items", fix: null, path: null, blocking: false },
    );
    questions.forEach((q, i) => {
      const a = answers.find((x) => x.questionId === q.id);
      const path = `${base}/questions/${q.id}`;
      const name = `Question ${i + 1}`;
      if (!a || !a.content.trim()) {
        checks.push({ id: `q-${q.id}`, ok: false, label: `${name} has no answer`, fix: "Write or draft this answer.", path, blocking: true });
        return;
      }
      const lim = limitStatus(a.wordCount, a.charCount, q.wordLimit, q.charLimit);
      if (!lim.withinLimit)
        checks.push({
          id: `q-${q.id}-limit`,
          ok: false,
          label: `${name} is over the limit`,
          fix: lim.overWords ? `Cut ${lim.overWords} word${lim.overWords === 1 ? "" : "s"} (${a.wordCount}/${q.wordLimit}).` : `Cut ${lim.overChars} characters (${a.charCount}/${q.charLimit}).`,
          path,
          blocking: true,
        });
      else checks.push({ id: `q-${q.id}-limit`, ok: true, label: `${name} answered within limits`, fix: null, path, blocking: false });
      const p = pending.filter((s) => s.answerId === a.id).length;
      if (p) checks.push({ id: `q-${q.id}-sugg`, ok: false, label: `${name}: ${p} suggestion${p === 1 ? "" : "s"} to accept or reject`, fix: "Decide on each suggestion in the editor.", path, blocking: false });
      if (a.voiceScore == null)
        checks.push({ id: `q-${q.id}-voice`, ok: false, label: `${name}: voice not checked`, fix: "Run “Check my voice”.", path, blocking: false });
      else if (a.voiceScore < 70)
        checks.push({ id: `q-${q.id}-voice`, ok: false, label: `${name}: sounds like you ${a.voiceScore}/100`, fix: "Accept voice rewrites or reword the flagged sentences.", path, blocking: false });
      if (!a.panelVerdict)
        checks.push({ id: `q-${q.id}-panel`, ok: false, label: `${name}: no committee review yet`, fix: "Run the committee review.", path, blocking: false });
      else if (a.panelVerdict !== "Likely shortlist")
        checks.push({ id: `q-${q.id}-panel`, ok: false, label: `${name}: committee verdict ${a.panelVerdict} (simulated)`, fix: "Apply the reviewers' fixes and review again.", path, blocking: false });
    });
    if (!questions.length)
      checks.push({ id: "questions", ok: true, label: "No application questions stated", fix: null, path: null, blocking: false });
    const deadlinePassed = program.deadlineAt ? Date.parse(program.deadlineAt) < Date.now() : false;
    checks.push(
      deadlinePassed
        ? { id: "deadline", ok: false, label: "The deadline has passed", fix: "Check the official page for a new round.", path: program.sourceUrl, blocking: true }
        : { id: "deadline", ok: true, label: program.deadlineAt ? "Deadline still open" : "Deadline not stated — confirm it on the official page", fix: null, path: null, blocking: false },
    );
    const failing = checks.filter((c) => !c.ok);
    return {
      program: { id: program.id, title: program.title, status: program.status, deadlineAt: program.deadlineAt, deadlineTz: program.deadlineTz },
      ready: !failing.some((c) => c.blocking),
      polished: failing.length === 0,
      checks: [...failing, ...checks.filter((c) => c.ok)],
    };
  },
});
