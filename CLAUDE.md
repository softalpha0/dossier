# Project: Dossier

Problem: People applying to scholarships, fellowships, grants and accelerators miss rules, rewrite the same stories, and submit generic AI-sounding answers.
User: Applicants juggling several programs, mostly on a laptop late at night, checking status on a phone.
Done statement: A user can paste a program's official link, get its rules and questions as a checklist, write an answer from their own stories, see it pass a voice check and a simulated committee review, then export a submission-ready packet.
Must-have features (in order): M1 profile · M2 add program from URL/text · M3 board + detail · M4 eligibility + checklist · M5 story bank + writing samples · M6 story map · M7 answer editor with suggestions · M8 voice check · M9 committee panel (custom sub-agents) · M10 readiness + export · M11 agent chat with app-state · M12 sample data.
Should/Could: see PRD.md §5 — only after every Must works, is deployed and saved.
Tools: Agent-Native framework (@agent-native/core, chat template, standalone), React, Drizzle, PGlite locally / Neon in production, Vercel, Anthropic key. Read the Agent-Native docs before building each feature.
Design: calm, focused, trustworthy. Phone-friendly. One accent colour, one or two fonts, one button style. Avoid purple/blue gradients, neon glow, frosted glass, emoji icons, vague headlines, rows of identical cards. Every screen has loading, empty and error states.

Rules:
- Full spec is in PRD.md. Read it before planning.
- AGENTS.md belongs to the in-app agent (Agent-Native). Don't overwrite its framework content; Dossier's golden rules from PRD.md §16 live in its "Dossier" section.
- Every feature = action in actions/ + UI using the action hooks + skill/AGENTS.md update + app-state. A UI-only feature is not done.
- I'm not a developer. Explain things in plain language.
- Plan first; wait for my approval before writing code.
- Build one feature at a time, then tell me how to test it and how to try to break it.
- Build the riskiest parts first: setup + deploy, URL extraction, committee sub-agents.
- Never put passwords or API keys in the code. Use .env and keep .env.example updated.
- Explain errors in plain language before fixing them.
- Create a save point (commit) after each feature that works.
- Feature freeze: Mon Nov 9, 14:00 Lagos. After that: bugs, polish, demo data, README only.
- Whenever you learn something important about the project, add it here.

## Framework guide (for the coding agent)

The template's framework guide is in AGENTS.md — read it too:

@AGENTS.md

## Things we've learned

- **Framework docs are local.** `pnpm action docs-search --list`, `--slug <slug>`, `--query "<topic>"`; source: `pnpm action source-search`. Skills in `.agents/skills/`.
- **Live app: https://dossier-pied.vercel.app** (Vercel project `dossier`, Neon db `doisser-db`, region US East). This session may reach that host for testing.
- **Deploy = Vercel building from GitHub.** The owner pushes to GitHub; Vercel builds with `vercel.json` (`NITRO_PRESET=vercel pnpm build`, then `pnpm migrate:production` on production). Claude never pushes. Hand over work as a zip of the folder (no `.git`, `node_modules`, `data/`, `.env`).
- **Vercel Hobby runs cron once a day** — `vercel.json` sets `AGENT_NATIVE_VERCEL_CRON_SCHEDULE` to `0 6 * * *` (07:00 Lagos). Vercel needs `CRON_SECRET`.
- **Production env vars (set in Vercel, never in code):** `ANTHROPIC_API_KEY`, `DATABASE_URL` (Neon pooled), `DATABASE_URL_UNPOOLED` (Neon direct), `BETTER_AUTH_SECRET`, `CRON_SECRET`.
- **The deployment's `ANTHROPIC_API_KEY` is shared by every signed-in user** and billed to the owner — keep a spend limit on that key.
- **In the cloud dev container:** IPv6 isn't available; start the dev server with `pnpm exec agent-native dev --host 127.0.0.1 --port 8080`. `.env` has `AUTH_DISABLED=true` for local dev only.
