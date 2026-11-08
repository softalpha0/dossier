# PRD — Dossier

> **Dossier helps people applying for scholarships, fellowships, grants and accelerators turn an official call into a strong, finished application — without missing a rule or sounding like a chatbot.**

| | |
|---|---|
| **Hackathon** | Builder.io **Agent-Native Hackathon** — tracker ID HK-012 |
| **Required tech** | **Agent-Native framework** (`@agent-native/core`) · demo recorded with **Clips** |
| **Prizes** | $5,000 / $2,500 / $1,500 / $750 / $250 · recognition: Best Productivity App, Best Use of Agent-Native |
| **Deadline** | **Mon Nov 9, 11:59 PM PT = Tue Nov 10, 8:59 AM Lagos** (confirm the timezone again before submitting) |
| **Our submit target** | **Mon Nov 9, 9:00 PM Lagos** — ~12 hours early, as the Hackathon 101 guide recommends |
| **Team** | Solo — softalpha0, building with Claude Code |
| **Version** | v3.0 — 2026-11-08, restructured with the *Hackathon 101* method (done statement, MoSCoW, journey, backwards plan, submission package, demo script) |

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
| **Can we build a convincing version by Monday?** | Yes — the must-haves (§5) are one journey; the rest is ordered by priority and can be cut. |

**The user and their moment (for the demo):** *It's 11 PM, two days before a fellowship deadline. Amara has three applications open, the same leadership story rewritten three times, one essay 120 words over the limit, and a nagging feeling it all sounds like ChatGPT.* (Illustrative persona — replace with a real quote from a tester, §12.)

## 3. Gap check

Public Agent-Native Hackathon entries: Scam Shield, ProposalPilot, HackHunt (finds hackathons + checklist), Lapse, SignalForge, a11y-fixer, Actor Forge, Research Notebook, ClearTable, EvalDesk, x402 desks, TraceMind, Traceback, Architect Refuse. **None help people write and assemble competitive applications.** The guide's rule applies: it's fine if essay tools exist elsewhere — Dossier must be **better for a specific group**: applicants juggling several programs who need their own voice to survive.

## 4. Judging map

| Criterion | Weight | Dossier's evidence |
|---|---|---|
| Usefulness & execution | 40% | One complete journey with real programs and real testers; works every time in the demo |
| Creativity & design | 20% | Committee panel + "sounds like you" — not another essay chatbot; calm, focused design (§8) |
| Innovation | 20% | Agent reads the rules, maps stories to questions, simulates the committee, watches for rule changes |
| Cleverness & use of Agent-Native | 20% | Same actions drive UI, chat, custom sub-agents (reviewers), automations (watcher, reminders) and Telegram; agent reads app-state to know the exact answer being edited |

## 5. Features — MoSCoW

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
| M13 | **Real-user test** with 2–3 people (process, not code — §12) |

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

### Won't have (for now) → parking lot (§15)
Mentor share links · auto-submitting applications · emailing referees · mobile app · multi-language UI · payments.

**Cut order if behind:** C1–C3 → S5 → S4 calendar (keep reminders in chat) → S3 Telegram → S2 practice scoring (keep question list) → S1 watcher. **Never cut M1–M13.**

## 6. Main user journey (5 steps)

1. Paste a program link → see its rules, questions and deadline, plus any eligibility blocker.
2. Open the story map → pick the best story for question 1 → "Draft from this story".
3. Edit the draft; accept the coach's suggestions until it's within the limit.
4. Run **voice check** and **committee panel** → accept fixes → verdict improves.
5. Run readiness check → export the packet.

## 7. Screens (only what the journey needs)

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

## 8. Design brief (anti-"AI slop")

- **User:** an applicant on a laptop late at night (and on a phone for checking status). Phone-friendly layouts.
- **Feel:** calm, focused, trustworthy — like a good study desk.
- **Avoid:** purple/blue gradients, neon glow, frosted glass, emoji icons, "Build the future" headlines, rows of identical cards, anything game-like.
- **Style first:** one or two fonts, a few colours (one accent for the main action), one button style — then use them everywhere.
- **Main action obvious:** one big button per screen ("Add program", "Draft from this story", "Run committee review").
- **Clear labels:** "Check my voice", not "Analyze".
- **In-between screens:** loading, empty, error states for every screen; helpful error messages ("We couldn't read this page. Paste the text instead.").
- **Accessibility:** readable text size, strong contrast, large tap targets, labelled fields.
- **Design skill:** install one design skill (e.g. *frontend-design*) before building screens; ask for two directions and choose one. Review with screenshots.

## 9. Sponsor technology — Agent-Native

| Agent-Native feature | Used for |
|---|---|
| `defineAction` (one action → UI, agent, HTTP, MCP, CLI) | Every capability (§16) |
| `useActionQuery` / `useActionMutation` | Screens call the same actions as the agent |
| App-state (`navigation`) + `view-screen` | Agent knows the program, answer and selected text |
| `sendToAgentChat` | Buttons that hand a task to the agent with context |
| Skills (`SKILL.md`) + `AGENTS.md` + memory | Coaching workflows, golden rules, the user's voice profile |
| **Custom sub-agents** (`agents/*.md`) | The committee reviewers (user can @-mention them) |
| **Automations** (`jobs/*.md`, cron) | Rules watcher (S1), reminders (S4) |
| **Messaging — Telegram** | Companion + reminders (S3) |
| Better Auth + access checks | Private per-user data |

**Riskiest parts — build first:** (1) creating, running and **deploying** the Agent-Native app with an LLM key; (2) extracting a program reliably from a real URL; (3) the committee panel via custom sub-agents. If any of these fails early there's time to change approach.

## 10. Briefing note for Claude Code (`CLAUDE.md`)

Agent-Native already uses **`AGENTS.md` for the in-app agent**, so the coding-agent briefing goes in **`CLAUDE.md`** (Claude Code reads it first). See the separate `CLAUDE.md` file. Keep it to one page; add a rule whenever the AI repeats a mistake.

## 11. Plan backwards from the deadline (Lagos time)

| Reserved block | When |
|---|---|
| Buffer for things breaking | Mon 21:00 → Tue 08:59 |
| **Submit + check every link from another device** | **Mon 20:00–21:00** |
| Record + caption the Clips demo | Mon 18:00–20:00 |
| Description + README + screenshots | Mon 16:30–18:00 |
| Testing with real users + fixes | Mon 14:30–16:30 |
| **Feature freeze** | **Mon 14:00** |
| **Build time left** | **Sun 09:00 → Mon 14:00** |

| Build block | Work |
|---|---|
| Sun 09:00–11:00 | Setup: create app, LLM key, AGENTS.md/CLAUDE.md, GitHub; **deploy a hello version** (Netlify/Vercel + Neon) |
| Sun 11:00–13:00 | M1, M2 (riskiest: URL extraction), M3 |
| Sun 13:00–15:00 | Design pass (style + main screens) · M4 |
| Sun 15:00–18:00 | M5, M6, M7 |
| Sun 18:00–21:00 | M8, **M9 (sub-agents)** |
| Sun 21:00–22:00 | M10, M11, M12 · redeploy · save point · **sleep** |
| Mon 08:00–10:00 | S1, S4 automations · S2 |
| Mon 10:00–12:00 | S3 Telegram · S5 · S6 |
| Mon 12:00–14:00 | Could-haves only if all above works; loading/empty/error states; demo data |

Loop for every feature (guide Ch 8/10): **ask for one feature → open the app and try it → try to break it → check on phone width → save point → next.** Stuck for 30 minutes? Fresh chat, simpler way, ask in Builder.io office hours/Discord, or cut it.

## 12. Real-user plan (M13)

- Today: message 3 people (e.g. a student, a professional/researcher, a founder) who are applying to something real.
- Monday 14:30: each adds their real program, drafts one answer, runs voice check + panel.
- Ask each: *"What would you have done without this?"* and *"Would you use it again?"* Get consent to quote them (first name or initials).
- Put one quote in the demo's opening and the README.

## 13. Success metrics

| Metric | Target |
|---|---|
| Real URL → complete program card (every field sourced or "Not stated") | 3 programs of different types, < 30 s each |
| Voice score after accepting rewrites | +15 points in demo |
| Panel verdict after fixes | Borderline → Likely shortlist in demo |
| Done statement works end to end, deployed | Yes, every time |
| Real testers | 2–3, with quotes |
| Every Must feature works from UI **and** chat | 100% |

## 14. Submission package (builder.io/hackathon/submit)

**Required:** working Agent-Native app · public **Clips** demo · public demo link · project details (disclose the chat template and libraries; describe what was built during the event).
**Also:** public GitHub repo (MIT) with README (§README), 3–5 screenshots with realistic data (main board, story map, panel review, readiness, phone view).

**Description (draft — update with real details):**
- **Tagline:** Dossier helps applicants turn a scholarship, fellowship or grant call into a finished application — in their own voice, reviewed by a simulated committee.
- **The problem:** Applicants juggle several programs, each with its own rules, limits and deadlines. They rewrite the same stories, miss requirements, and end up with generic AI text that committees reject. *[add a tester's quote]*
- **What it does:** Paste a program's link and Dossier turns its rules and questions into a checklist. A story map shows which of your experiences answers each question. You draft with a coach, check that it sounds like you, and get scored by three simulated reviewers built from the program's own criteria. A readiness check and packet export finish the job; a watcher and Telegram reminders keep you on time.
- **How we built it:** Agent-Native actions shared by the UI, chat, Telegram and automations · app-state so the agent knows the exact answer you're editing · custom sub-agents as committee reviewers · scheduled automations for the rules watcher · Drizzle + Neon · deployed on [Netlify/Vercel].
- **Challenges:** *[one real problem you hit, e.g. extracting requirements from messy official pages, and how you solved it]*
- **What's next:** from the parking lot (§15).

**Final checks (from another device, private window):** live app opens · Clips video public · repo public · no API keys in the repo · all fields filled · Agent-Native named · deadline timezone re-checked.

## 15. Demo script (target 2:50, ~130 words/min, captions on)

| Part | Time | On screen | Say |
|---|---|---|---|
| Problem | 0:00–0:25 | Messy docs, word count over limit | "It's 11 PM, two days before a fellowship deadline. Amara has three applications, the same story rewritten three times, and an essay 120 words over…" |
| Solution | 0:25–0:40 | Dossier board | "Dossier turns any program call into a finished application — in your own voice." |
| Demo | 0:40–2:10 | Paste link → card + blocker → story map → draft → voice check (62→84) → committee panel (Borderline → Likely shortlist) → readiness → export | Narrate one journey; pause after the verdict changes |
| How it works | 2:10–2:35 | Chat + Telegram + watcher banner | "Built with Agent-Native: one set of actions drives the screens, the chat, Telegram and scheduled checks; the reviewers are sub-agents built from the program's own criteria." |
| What's next | 2:35–2:50 | Tester quote | Two parking-lot items; close on Amara submitting on time |

**Judge questions to prepare:** How is this different from ChatGPT? · Did you talk to real users? · Hardest technical problem? · What was built during the event? · How would it keep running / make money? · What's next?

## 16. Technical appendix (for the coding agent)

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

## 17. Parking lot (ideas for after the event / "what's next")

Mentor and counsellor shared views · referee portal · multi-language support · Chrome extension to capture calls from any site · community library of public program cards · voice-note story capture · organisation plans for schools and incubators.

## 18. Self-score before submitting

Score Dossier out of 10 on each criterion with one sentence of evidence; then ask a friend to score it from the submission page alone. Fix the biggest gap between the two scores first.
