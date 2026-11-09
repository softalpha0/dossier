# PRD — Dossier

> **Note:** this is the original plan, written before building (6 Nov 2026). Some "Should" features (Telegram companion, reminders, interview prep, references) were not built, and the demo persona changed from Amara to Alex. See the [README](./README.md) for what shipped.

> **Dossier helps people applying for scholarships, fellowships, grants and accelerators turn an official call into a strong, finished application — without missing a rule or sounding like a chatbot.**

---

## 1. Done statement

> **"A user can paste a program's official link, get its rules and questions as a checklist, write an answer from their own stories, and see the answer pass a voice check and a simulated committee review — then export a submission-ready packet."**

When this works end to end with real data, the MVP is done. Everything else is extra.

## 2. The problem (five-question test)

| Question | Answer |
|---|---|
| **Who exactly has it?** | People applying to competitive programs — scholarships, fellowships, research grants, accelerators, residencies, awards — usually several at once, usually alone, often first-generation applicants without a counsellor. |
| **How painful is it?** | High stakes: one missed document, a blown word limit or a generic essay ends the application. Each program takes many hours; deadlines and rules change. |
| **How do they cope today?** | Google Docs, spreadsheets, notes apps, WhatsApp, and ChatGPT — which writes generic text that committees recognise and doesn't know the program's rules or the applicant's real stories. |
| **Our angle** | The only tool that (1) reads the official call, (2) builds answers from **your own stories**, (3) checks they **sound like you**, and (4) has a **simulated selection committee** review them before a real one does. |
| **Can we build a convincing version by Monday?** | Yes — the must-haves (§4) are one journey; the rest is ordered by priority and can be cut. |

**The user and their moment (for the demo):** *It's 11 PM, two days before a fellowship deadline. Amara has three applications open, the same leadership story rewritten three times, one essay 120 words over the limit, and a nagging feeling it all sounds like ChatGPT.* (Illustrative persona — replace with a real quote from a tester, §10.)

## 3. Gap check

Public Agent-Native Hackathon entries: Scam Shield, ProposalPilot, HackHunt (finds hackathons + checklist), Lapse, SignalForge, a11y-fixer, Actor Forge, Research Notebook, ClearTable, EvalDesk, x402 desks, TraceMind, Traceback, Architect Refuse. **None help people write and assemble competitive applications.** The guide's rule applies: it's fine if essay tools exist elsewhere — Dossier must be **better for a specific group**: applicants juggling several programs who need their own voice to survive.

## 4. Features — MoSCoW

Build strictly in this order. **Start "Should" only when every "Must" works, is tested, deployed and saved.**

### Must have (the done statement)
| # | Feature |
|---|---|
| M1 | Profile (country, citizenship, education/field, work years, goals, timezone, program types) |
| M2 | **Add program from URL or pasted text** → program card: type, provider, eligibility, documents, questions with limits, references, deadline (local + original timezone), criteria, source link |
| M3 | Program board (Researching → Preparing → Ready → Submitted → Shortlisted → Result) + program detail |
| M4 | Eligibility check (✅ or ⚠️ blockers with reasons) + checklist from requirements |
| M5 | Story bank (situation, action, result, themes) + writing samples |
| M6 | **Story map** (stories × questions, fit scores, over-used and uncovered) + "Draft from this story" |
| M7 | Answer editor: outline → draft, live word/char count vs limit, agent edits as **suggestions** (accept/reject) |
| M8 | **Voice check** ("may sound generic" highlights + rewrites as suggestions + "Sounds like you" score) |
| M9 | **Committee panel** (3 reviewer personas from the program's criteria → score, best line, weakest line, fix, verdict) |
| M10 | Readiness check (✅/❌ with exact fixes) + export packet (Markdown / print-to-PDF) |
| M11 | Agent chat that knows the current screen (app-state + `view-screen`) and can do everything the UI can |
| M12 | Sample data ("Try with sample data": scholarship, fellowship, accelerator; 5 stories; 1 writing sample) |
| M13 | **Real-user test** with 2–3 people (process, not code — §10) |

### Should have
| # | Feature |
|---|---|
| S1 | **Rules & deadline watcher** — automation every 3 days; before/after diff banner |
| S2 | **Interview prep** — on *Shortlisted*: questions from the user's own answers + practice scoring |
| S3 | **Telegram companion** — "What's due this week?" + daily reminders |
| S4 | Daily reminders automation (7/3/1 days, overdue items) + calendar view |
| S5 | References tracker + drafted request email |
| S6 | **Adapt answer** to another program's question and limit |

### Could have
| # | Feature |
|---|---|
| C1 | Answer version history + restore |
| C2 | Live sync across tabs (`useDbSync`) |
| C3 | Delete-my-data in settings |

### Won't have (for now) → parking lot (§13)
Mentor share links · auto-submitting applications · emailing referees · mobile app · multi-language UI · payments.

**Cut order if behind:** C1–C3 → S5 → S4 calendar (keep reminders in chat) → S3 Telegram → S2 practice scoring (keep question list) → S1 watcher. **Never cut M1–M13.**

## 5. Main user journey (5 steps)

1. Paste a program link → see its rules, questions and deadline, plus any eligibility blocker.
2. Open the story map → pick the best story for question 1 → "Draft from this story".
3. Edit the draft; accept the coach's suggestions until it's within the limit.
4. Run **voice check** and **committee panel** → accept fixes → verdict improves.
5. Run readiness check → export the packet.

## 6. Screens (only what the journey needs)

| Screen | Purpose |
|---|---|
| Home / board | All programs by stage; "Add program"; "Try with sample data" |
| Add program dialog | URL or paste text; program type |
| Program detail | Summary, eligibility banner, checklist, questions (each opens the editor), references, deadline, source |
| Story bank + story map | Cards; grid of stories × questions |
| Answer editor | Editor, word count, suggestions, buttons: Voice check · Committee panel · Ask coach |
| Panel results | Three reviewer cards + verdict (side panel in the editor) |
| Readiness & export | Checklist + export |
| Profile | Profile fields + writing samples |
| Agent chat | Side panel on every screen |
| *(Should)* Interview tab · Changes banner · Settings (Telegram, reminders) |

## 7. Design brief (anti-"AI slop")

- **User:** an applicant on a laptop late at night (and on a phone for checking status). Phone-friendly layouts.
- **Feel:** calm, focused, trustworthy — like a good study desk.
- **Avoid:** purple/blue gradients, neon glow, frosted glass, emoji icons, "Build the future" headlines, rows of identical cards, anything game-like.
- **Style first:** one or two fonts, a few colours (one accent for the main action), one button style — then use them everywhere.
- **Main action obvious:** one big button per screen ("Add program", "Draft from this story", "Run committee review").
- **Clear labels:** "Check my voice", not "Analyze".
- **In-between screens:** loading, empty, error states for every screen; helpful error messages ("We couldn't read this page. Paste the text instead.").
- **Accessibility:** readable text size, strong contrast, large tap targets, labelled fields.
- **Design skill:** install one design skill (e.g. *frontend-design*) before building screens; ask for two directions and choose one. Review with screenshots.

## 8. Sponsor technology — Agent-Native

| Agent-Native feature | Used for |
|---|---|
| `defineAction` (one action → UI, agent, HTTP, MCP, CLI) | Every capability (§12) |
| `useActionQuery` / `useActionMutation` | Screens call the same actions as the agent |
| App-state (`navigation`) + `view-screen` | Agent knows the program, answer and selected text |
| `sendToAgentChat` | Buttons that hand a task to the agent with context |
| Skills (`SKILL.md`) + `AGENTS.md` + memory | Coaching workflows, golden rules, the user's voice profile |
| **Custom sub-agents** (`agents/*.md`) | The committee reviewers (user can @-mention them) |
| **Automations** (`jobs/*.md`, cron) | Rules watcher (S1), reminders (S4) |
| **Messaging — Telegram** | Companion + reminders (S3) |
| Better Auth + access checks | Private per-user data |

**Riskiest parts — build first:** (1) creating, running and **deploying** the Agent-Native app with an LLM key; (2) extracting a program reliably from a real URL; (3) the committee panel via custom sub-agents. If any of these fails early there's time to change approach.

## 9. Briefing note for Claude Code (`CLAUDE.md`)

Agent-Native already uses **`AGENTS.md` for the in-app agent**, so the coding-agent briefing goes in **`CLAUDE.md`** (Claude Code reads it first). See the separate `CLAUDE.md` file. Keep it to one page; add a rule whenever the AI repeats a mistake.

## 10. Real-user plan (M13)

- Today: message 3 people (e.g. a student, a professional/researcher, a founder) who are applying to something real.
- Monday 14:30: each adds their real program, drafts one answer, runs voice check + panel.
- Ask each: *"What would you have done without this?"* and *"Would you use it again?"* Get consent to quote them (first name or initials).
- Put one quote in the demo's opening and the README.

## 11. Success metrics

| Metric | Target |
|---|---|
| Real URL → complete program card (every field sourced or "Not stated") | 3 programs of different types, < 30 s each |
| Voice score after accepting rewrites | +15 points in demo |
| Panel verdict after fixes | Borderline → Likely shortlist in demo |
| Done statement works end to end, deployed | Yes, every time |
| Real testers | 2–3, with quotes |
| Every Must feature works from UI **and** chat | 100% |

## 12. Technical appendix (for the coding agent)

**Create the app**
```bash
corepack enable
npx --yes @agent-native/core@latest create dossier --standalone --template chat
cd dossier && pnpm install && pnpm dev   # → "Continue as local dev"
```
If `npx` fails with peer-dependency errors: `npx clear-npx-cache`. Read the generated `AGENTS.md` and the docs: Actions, Data & Sync, Context Awareness, Skills Guide, Agent Resources (custom agents), Automations, Messaging (Telegram), Access & Authorization, Deployment.

**Actions (`actions/`)** — `get-profile`, `update-profile`, `add-writing-sample`, `build-voice-profile`, `add-program`, `list-programs`, `get-program`, `update-program-status`, `check-eligibility`, `list-checklist`, `update-checklist-item`, `list-stories`, `add-story`, `update-story`, `map-stories`, `outline-answer`, `draft-answer`, `suggest-edit`, `resolve-suggestion`, `voice-check`, `build-review-panel`, `run-panel-review`, `readiness-check`, `export-packet`, `seed-demo` · Should: `recheck-program`, `send-reminders`, `list-deadlines`, `generate-interview-questions`, `score-interview-answer`, `list-referees`, `add-referee`, `draft-referee-request`, `adapt-answer` · Could: `list-answer-versions`, `restore-answer-version`, `delete-my-data`.

**In-app `AGENTS.md` golden rules**
```
You are Dossier's application coach.
1. Call view-screen before acting.
2. Make every change through an action.
3. Never invent achievements, grades, numbers or facts about the user. Ask.
4. Answers belong to the user: propose edits with suggest-edit, never overwrite.
5. Respect word/character limits and answer the exact question.
6. Extract program rules only from the official page or the user's text; mark gaps "Not stated"; keep the source URL.
7. Show deadlines in the user's timezone and the program's.
8. Never submit an application or email anyone.
9. Committee reviewers are simulated — say so.
10. Voice check says "may sound generic"; never claim certainty about AI authorship.
```

**Committee panel:** `build-review-panel` derives 3 personas (role, values, penalises, rubric) from the program's criteria; store them and expose as custom sub-agents `agents/<program>-<role>.md` (YAML frontmatter + instructions, `model: inherit`). `run-panel-review` → per reviewer `{score 1–5, best_line, weakest_line, fix}`; verdict: avg ≥ 4 *Likely shortlist*, 3–3.9 *Borderline*, < 3 *Unlikely*. Fixes become suggestions.

**Voice check:** profile from writing samples (sentence length, vocabulary, tone, phrases) saved to the DB and `memory/MEMORY.md`; flags stock phrases and sentences far from the profile; returns rewrites as suggestions and a 0–100 score.

**Automations:** `jobs/rules-watch.md` (`schedule: "0 8 */3 * *"`) → `recheck-program` for active programs (idempotent; diff vs saved snapshot → notification). `jobs/daily-reminders.md` (`schedule: "0 7 * * *"`) → `send-reminders`. Locally use **Settings › Automations › Run now**; schedules run on Netlify/Vercel (not AWS Lambda).

**Telegram:** BotFather `/newbot` → `TELEGRAM_BOT_TOKEN`, `TELEGRAM_WEBHOOK_SECRET` → after deploy, once: `POST /_agent-native/integrations/telegram/setup`.

**Data (Drizzle):** profiles · writing_samples · voice_profiles · programs (type, provider, url, eligibility_json, criteria_json, deadline_at, deadline_tz, status, snapshot_hash, snapshot_text, last_checked_at) · program_changes · requirements · questions (text, word_limit, char_limit) · stories · story_fits · answers (content, word_count, voice_score, panel_verdict) · answer_versions · suggestions (origin: coach/voice/panel, status) · reviewers · panel_reviews · referees · interview_questions · interview_attempts.

**Env:** `ANTHROPIC_API_KEY` or `OPENAI_API_KEY` · `DATABASE_URL` (Neon) · `TELEGRAM_BOT_TOKEN` · `TELEGRAM_WEBHOOK_SECRET`. Keep `.env` out of git; ship `.env.example`.

## 13. Parking lot (ideas for after the event / "what's next")

Mentor and counsellor shared views · referee portal · multi-language support · Chrome extension to capture calls from any site · community library of public program cards · voice-note story capture · organisation plans for schools and incubators.
