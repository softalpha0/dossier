# Visual Design Contract

Dossier is a calm study desk for applicants: one application at a time, the
official rules always in view, and the applicant's own words at the centre.
The agent helps from the side panel; it never takes over the page.

## Product mode

- Mode: `operate`
- Audience and cadence: applicants juggling several programs, mostly on a
  laptop late at night, checking status on a phone.
- Primary workflow: add a program from its official link → check eligibility
  and the checklist → map stories to questions → write and improve each answer
  → check readiness and export the packet.

## Visual direction

- Direction name: Quiet study desk
- Palette: warm off-white paper (`--background: 40 33% 98%`), near-black ink,
  and **one** accent, a deep green (`--primary: 162 47% 24%`; dark mode
  `162 38% 55%`). Amber is reserved for "needs attention" (over the limit, a
  page changed, may sound generic) and red for must-fix items only. Charts use
  `--dossier-chart` (`#1f8a68` / `#47a586`), checked for contrast and
  colour-blind safety.
- Type: Newsreader (serif, `.dossier-serif`) for page titles, questions and the
  answer text people write; Inter for everything else. Numbers that change
  (word counts, scores) use tabular figures.
- Composition: one main action per screen ("Add program", "Run committee
  review", "Map my stories"); content in a single readable column on phones;
  the agent in the shared side panel. Boards group by stage; editors put the
  text first and feedback beside it.
- Shape language: hairline borders, 8–12px corners, soft cards only where
  something is a unit (a program, a suggestion), one button style with an
  outline and a ghost variant.
- Anti-references: purple/blue gradients, neon glow, frosted glass, emoji
  icons, rows of identical cards, vague headlines, anything game-like.

## Guardrails

- Every screen has loading, empty and error states, and works at 390px wide.
- The user's text is never changed without their yes: agent edits appear as
  suggestions with Accept and Reject.
- Honesty is part of the design: "Not stated" for gaps, "Simulated" on the
  committee, "may sound generic" (never "AI detected"), and sample data always
  labelled "(sample)".
- Preserve the scaffold's semantic tokens and shared component seams; colours
  come from tokens in `app/global.css`, not raw values in components.
- The public site (`/`, `/how-it-works`, `/privacy`) uses the same palette and
  type as the app, so the product looks like its own landing page.
