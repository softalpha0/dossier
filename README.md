# Dossier

**Dossier helps applicants turn a scholarship, fellowship, grant or accelerator call into a finished application — in their own voice, reviewed by a simulated selection committee.**

![Dossier main flow](./docs/screenshots/main-flow.gif)
_Add a GIF or screenshot of the main flow._

- **Live app:** _add link_ (use **Try with sample data** — no sign-up needed)
- **Demo (Clips):** _add link_

Built with **[Agent-Native](https://www.agent-native.com/docs/)** for the **Builder.io Agent-Native Hackathon**.

---

## The problem

Applicants juggle several programs at once, each with its own eligibility rules, documents, word limits and deadlines. They rewrite the same stories again and again, miss requirements, and end up with generic AI-written answers that committees recognise and reject.

> _"Add a quote from a real tester here."_

## The solution

Paste a program's official link. Dossier turns its rules and questions into a checklist, shows which of **your** stories best answers each question, helps you draft, checks that the answer **sounds like you**, and has **three simulated reviewers** — built from the program's own criteria — score it before the real committee does. A readiness check and a packet export get you to submit.

## Features

_Mark honestly what works in the submitted version._

| Feature | What it does | Status |
|---|---|---|
| Add program from link | Rules, documents, questions, limits, deadline, source | ⬜ |
| Eligibility & checklist | Blockers explained; every requirement as a task | ⬜ |
| Story bank & story map | Your experiences × every question, with fit scores | ⬜ |
| Answer editor | Draft from a story, live word count, suggestions you accept or reject | ⬜ |
| Sounds like you | Flags sentences that may sound generic; rewrites in your voice | ⬜ |
| Committee panel | Three simulated reviewers, scores, best/weakest line, verdict | ⬜ |
| Readiness & export | ✅/❌ with fixes; one-file application packet | ⬜ |
| Agent chat | Knows which program and answer you're on; can do everything the UI can | ⬜ |
| Rules watcher | Re-checks official pages every 3 days; shows what changed | ⬜ |
| Interview prep | Questions from your own application once shortlisted | ⬜ |
| Telegram companion | "What's due this week?" + reminders | ⬜ |
| References | Track referees; drafted request emails | ⬜ |

## How it uses Agent-Native

| Agent-Native feature | In Dossier |
|---|---|
| `defineAction` | Every capability is one action, shared by the UI, chat, Telegram and automations |
| Action hooks | Screens call the same actions as the agent |
| App-state + `view-screen` | The agent knows the exact answer and sentence you're editing |
| Custom sub-agents | The committee reviewers — you can @-mention them |
| Automations | Rules watcher (every 3 days) and daily reminders |
| Messaging (Telegram) | Companion chat and reminders |
| Skills, AGENTS.md, memory | Coaching workflows, golden rules, your voice profile |

## Tech stack

Agent-Native (`@agent-native/core`, chat template) · React · Drizzle ORM · PGlite (local) / Neon Postgres (production) · Anthropic or OpenAI · Vercel · Clips for the demo

## Run it locally

Requires Node.js 22.22+ and pnpm.

```bash
git clone https://github.com/softalpha0/dossier.git
cd dossier
corepack enable
pnpm install
cp .env.example .env
pnpm dev
```

Open the local URL → **Continue as local dev** → **Try with sample data**.

`.env.example`:

```bash
ANTHROPIC_API_KEY=          # or OPENAI_API_KEY
DATABASE_URL=               # Neon, for production
TELEGRAM_BOT_TOKEN=         # optional, from @BotFather
TELEGRAM_WEBHOOK_SECRET=    # optional, any random string
```

Telegram (optional): after deploying, run once `POST https://<your-app>/_agent-native/integrations/telegram/setup`, then message your bot.

## Principles

- Your words stay yours — agent edits are suggestions until you accept them.
- No invented facts — missing details are asked for or marked "Not stated".
- Dossier never submits applications or emails anyone.
- The committee is simulated; the voice check says "may sound generic", never "AI detected".

## Team

[softalpha0](https://github.com/softalpha0) — solo builder


## What's next

Mentor and counsellor views · referee portal · multi-language support · browser extension to capture calls from any site.

## License

[MIT](./LICENSE)
