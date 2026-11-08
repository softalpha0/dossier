// TEMPORARY diagnostic (remove after the follow-up-message bug is fixed).
// Runs, step by step, the checks the framework performs before accepting a
// follow-up chat message, for one of the signed-in user's own threads, and
// reports which step fails. Read-only.
import { defineAction, fail } from "@agent-native/core/action";
import { getDbExec } from "@agent-native/core/db";
import { z } from "zod";

type Step = { step: string; ok: boolean; detail: unknown };

export default defineAction({
  description: "Temporary developer diagnostic for chat follow-up errors. Not for the agent.",
  schema: z.object({ threadId: z.string().min(1).max(200) }),
  http: { method: "GET" },
  readOnly: true,
  agentTool: false,
  run: async ({ threadId }, ctx) => {
    const owner = ctx?.userEmail;
    if (!owner) fail("Sign in first.", { statusCode: 401 });
    const exec = getDbExec();
    const steps: Step[] = [];
    const run = async (step: string, sql: string, args: unknown[]) => {
      try {
        const { rows } = await exec.execute({ sql, args: args as never[] });
        const describe = (rows as Record<string, unknown>[]).slice(0, 5).map((r) =>
          Object.fromEntries(
            Object.entries(r).map(([k, v]) => [k, { type: Array.isArray(v) ? "array" : typeof v, value: typeof v === "string" ? v.slice(0, 200) : v }]),
          ),
        );
        steps.push({ step, ok: true, detail: describe });
        return rows as Record<string, unknown>[];
      } catch (error) {
        steps.push({ step, ok: false, detail: error instanceof Error ? `${error.name}: ${error.message}`.slice(0, 600) : String(error) });
        return null;
      }
    };

    const owned = await run("thread owned by you", "SELECT id FROM chat_threads WHERE id = ? AND owner_email = ?", [threadId, owner]);
    if (!owned?.length) return { owner, steps, note: "Thread not found for this account." };

    await run("private runs table exists", "SELECT to_regclass('agent_thread_private_runs') AS t", []);
    await run("runs in thread", "SELECT id, status, thread_projection_pending, thread_projection_error_code FROM agent_runs WHERE thread_id = ?", [threadId]);
    await run(
      "event rows that are not valid JSON",
      "SELECT count(*) AS n FROM agent_runs r JOIN agent_run_events e ON e.run_id = r.id WHERE r.thread_id = ? AND NOT pg_input_is_valid(e.event_data, 'jsonb')",
      [threadId],
    );
    await run(
      "A: has_private_history",
      `SELECT EXISTS (SELECT 1 FROM agent_thread_private_runs p WHERE p.thread_id = ? UNION ALL SELECT 1 FROM agent_runs r JOIN agent_run_events e ON e.run_id = r.id WHERE r.thread_id = ? AND e.event_data::jsonb @> '{"omitFromPersistedHistory":true}'::jsonb) AS has_private_history`,
      [threadId, threadId],
    );
    await run(
      "B: private_run_ids",
      `SELECT ARRAY(SELECT p.run_id FROM agent_thread_private_runs p WHERE p.thread_id = ? UNION SELECT r.id FROM agent_runs r JOIN agent_run_events e ON e.run_id = r.id WHERE r.thread_id = ? AND e.event_data::jsonb @> '{"omitFromPersistedHistory":true}'::jsonb) AS private_run_ids`,
      [threadId, threadId],
    );
    await run(
      "C: projection_pending",
      "SELECT EXISTS (SELECT 1 FROM agent_runs r WHERE r.thread_id = ? AND (r.thread_projection_pending IS TRUE OR r.thread_projection_error_code IS NOT NULL)) AS projection_pending",
      [threadId],
    );
    return { owner, steps };
  },
});
