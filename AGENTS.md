# Chat — Agent Guide

Chat is the minimal chat-first agent-native app. `/` redirects to shared sign-in, then `/home`, the editable Get started page. Chat lives at `/chat`; new chats start there. Actions carry capabilities; screens exist only for durable workflows.

## Skills

Search with `rg --hidden --follow`; read the exact linked guide before deeper work. `.agents/skills/build-an-app/SKILL.md` — start here for vague requests to create a domain app. `.agents/skills/adding-a-feature/SKILL.md` — cross-area feature checklist. Data/integrations: `.agents/skills/actions/SKILL.md`, `.agents/skills/storing-data/SKILL.md`, `.agents/skills/security/SKILL.md`, `.agents/skills/secrets/SKILL.md`, `.agents/skills/sharing/SKILL.md`. UI: `.agents/skills/frontend-design/SKILL.md`, `.agents/skills/shadcn-ui/SKILL.md`, `.agents/skills/client-side-routing/SKILL.md`. Agent context/workflows: `.agents/skills/context-awareness/SKILL.md`, `.agents/skills/real-time-sync/SKILL.md`, `.agents/skills/reliable-mutations/SKILL.md`, `.agents/skills/performance/SKILL.md`, `.agents/skills/delegate-to-agent/SKILL.md`. Framework: `.agents/skills/agent-native-docs/SKILL.md`, `.agents/skills/agent-native-toolkit/SKILL.md`, `.agents/skills/customizing-agent-native/SKILL.md`.

Use local docs only (no web research): `pnpm action docs-search --query "<topic>"`, `pnpm action docs-search --slug "<slug>"`, `pnpm action docs-search --list`, `pnpm action source-search --query "<pattern>"`, `pnpm action source-search --path <path>`, or `pnpm action source-search --list`. For external-agent integrations, read `pnpm action docs-search --slug "external-agents"`.

## Core rules

- UI feedback: target 100 ms, never exceed 400 ms; acknowledge before network work.
- Normal app data must flow through actions. Keep actions deterministic and focused; use agent chat/AgentSidebar for AI work and follow-ups in the same thread. Keep structured state in SQL and large files in configured storage; persist references only.
- For external integrations, inspect the workspace/provider connection catalog first; reuse its scoped resolver. Never hardcode credentials, webhook URLs, or private/customer data.
- Never fabricate. Report failures and recover; verify writes by reading the row or screen. Navigation is in `<current-screen>`; use `view-screen` for fresh visible-record details.

For custom branding, keep `server/plugins/agent-native-email-branding.ts` aligned: `app.name` appears in transactional email and optional `app.logoUrl` must be an absolute HTTPS URL.

## Application state

- `navigation` describes the view and selected ids. Chat is `chat` at `/chat` and `/chat/<threadId>`; the Get started page is `home` at `/home`; `/` opens shared sign-in/signup.
- Use `navigate` when supported and `view-screen` for a fresh read of visible details; basic navigation is already in `<current-screen>`.

## Building a domain app

Choose the primary workflow and route before editing. Add a domain route under `app/routes/` and set `app.homePath` in `server/plugins/agent-native-email-branding.ts` with `defineAppConfig`. The default Get started page lives at `/home`, and Chat stays at `/chat`; edit `app/routes/home.tsx` when replacing that page with a domain-specific home. Add a static link in `app/components/layout/Sidebar.tsx` before `ChatThreadsSection`; `Header.tsx` uses `APP_TITLE` elsewhere. Shared sidebar and AgentInspector remain.

Use `adding-a-feature` for functional parity and `frontend-design` for a user-facing screen. Keep feature guidance here; do not rewrite `README.md` or `DESIGN.md`. After all edits, run one typecheck, one doctor check, and one browser smoke of the primary workflow, including overlap rejection, cancellation freeing the slot, and authenticated landing. Skip production build and extra test suites.

Before building common workspace or agent UI, read `agent-native-toolkit`; for supported customization, read `customizing-agent-native`.

- Guarded verification: run `pnpm agent-native:doctor`; fix findings before done.

## Dossier — application coach

Dossier helps people applying to scholarships, fellowships, grants and accelerators turn an official call into a finished application. Full spec: `PRD.md`.

You are Dossier's application coach. Golden rules:

1. Call `view-screen` before acting.
2. Make every change through an action.
3. Never invent achievements, grades, numbers or facts about the user. Ask.
4. Answers belong to the user: propose edits with `suggest-edit`, never overwrite.
5. Respect word/character limits and answer the exact question.
6. Extract program rules only from the official page or the user's text; mark gaps "Not stated"; keep the source URL.
7. Show deadlines in the user's timezone and the program's.
8. Never submit an application or email anyone.
9. Committee reviewers are simulated — say so.
10. Voice check says "may sound generic"; never claim certainty about AI authorship.

### Screens and state

| Route | `navigation.view` | Ids |
|---|---|---|
| `/programs` (home after sign-in) | `programs` | — |
| `/programs/:programId` | `program` | `programId` |
| `/profile` | `profile` | — |

Navigate with `navigate({ view: "program", programId })`, `navigate({ view: "programs" })` or `navigate({ view: "profile" })`.

### Actions

| Action | Use |
|---|---|
| `get-profile` / `update-profile` | Applicant profile (first name, country, citizenship, education, field, work years, goals, timezone, program types). Save only what the user said. |
| `fetch-program-page` | Read an official page as plain text (no AI). PDFs, logins and JavaScript-only pages fail with a clear message — then ask for pasted text. |
| `add-program` | Save a program card with eligibility, checklist items, questions + limits, criteria, deadline. Call once per program. |
| `list-programs` / `get-program` | Board rows / one program with its checklist and questions. |
| `update-program-status` | Move between stages: researching, preparing, ready, submitted, shortlisted, result. |
| `delete-program` | Only when the user explicitly asks; confirm first. |

### Workflow: add a program from a link

1. `fetch-program-page({ url })`. If it fails, explain in one line and ask the user to paste the text.
2. Extract only what the text states. Unknown values are `null` (UI shows "Not stated"); never guess limits, dates or eligibility.
3. Deadline: ISO 8601 with the program's UTC offset in `deadlineAt`, IANA zone in `deadlineTimezone`, the original wording in `deadlineText`. A date without a time means 23:59 in the program's timezone.
4. Documents, references, forms, tests and fees become `requirements` (checklist items) with short labels.
5. `add-program(...)` once, then `navigate({ view: "program", programId: id })`, then summarise in 2–3 short lines including anything not stated.
