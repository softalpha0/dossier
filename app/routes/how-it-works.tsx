import { IconChevronDown } from "@tabler/icons-react";
import { Link } from "react-router";

import { Reveal } from "@/components/site/Reveal";
import { SectionHeading, SitePage, StartButton } from "@/components/site/SiteChrome";

const TITLE = "How Dossier works";
const DESCRIPTION =
  "Step by step: from pasting a program's official link to a finished, checked application packet. What you do, what Dossier does, and what it never does.";

export function meta() {
  return [
    { title: `${TITLE} · Dossier` },
    { name: "description", content: DESCRIPTION },
    { property: "og:title", content: TITLE },
    { property: "og:description", content: DESCRIPTION },
  ];
}

const STEPS = [
  {
    id: "profile",
    title: "Tell it a little about you",
    you: "Add your first name, country, citizenship, education, field and the kinds of programs you want.",
    dossier: "Uses your profile to check eligibility and to show every deadline in your time zone.",
    never: "Asks for your passport, home address or ID numbers.",
  },
  {
    id: "program",
    title: "Add a program from its link",
    you: "Paste the official page, or paste the text if the page needs a login or is a PDF.",
    dossier:
      "Pulls out eligibility rules, required documents, references, tests and fees, every question with its word or character limit, the selection criteria and the deadline.",
    never: "Guesses. Anything the page doesn't state is marked “Not stated”, and the source link is kept.",
  },
  {
    id: "eligibility",
    title: "Check eligibility and work the checklist",
    you: "Ask for an eligibility check, then tick off documents as you get them.",
    dossier: "Compares each rule with your profile: met, blocker, or unknown, with one plain reason and the question that would settle it.",
    never: "Assumes something your profile doesn't say.",
  },
  {
    id: "stories",
    title: "Build a story bank",
    you: "Describe a few experiences: the situation, what you did and what happened. Add a piece of writing you're proud of.",
    dossier: "Asks one question at a time, keeps your wording, maps each story to each question and learns how you write.",
    never: "Adds details, numbers or outcomes you didn't give it.",
  },
  {
    id: "write",
    title: "Write and improve each answer",
    you: "Draft from your best story, or write it yourself. Highlight a sentence and ask for help with it.",
    dossier:
      "Counts words live, flags sentences that may sound generic, and runs three simulated reviewers modelled on the program's criteria. Every change arrives as a suggestion.",
    never: "Overwrites your text, or claims to know whether something was written by AI.",
  },
  {
    id: "ready",
    title: "Check readiness and export",
    you: "Open the readiness check before you submit.",
    dossier: "Lists every must-fix item (limits, missing answers, unticked documents) with a link to fix it, then exports one packet you can download or print.",
    never: "Submits the application or contacts the program for you.",
  },
];

const FAQ = [
  {
    q: "Does Dossier write my essays for me?",
    a: "It can draft a first version from a story you told it, but only while the answer is empty, and only from facts you gave it. After that every change is a suggestion you accept or reject. The goal is your answer, said better, not a new one.",
  },
  {
    q: "Is the committee review real?",
    a: "No. The three reviewers are simulated from the program's published selection criteria. They're useful for spotting weak lines and missing evidence, but they can't predict a real decision, and Dossier labels them as simulated everywhere.",
  },
  {
    q: "Can it tell if my writing sounds like AI?",
    a: "No tool can tell that reliably, so Dossier doesn't try. It compares your answer with writing you've added and with a list of stock phrases, and says a sentence “may sound generic”. The rewrite it suggests uses only facts already in your answer or story.",
  },
  {
    q: "What kinds of programs work?",
    a: "Scholarships, fellowships, grants, accelerators and similar calls with written questions. If the official page is a PDF or behind a login, paste the text instead. If you paste a listing site with many programs, it asks which one you mean and looks for the official page.",
  },
  {
    q: "Who can see my applications?",
    a: "Only you. Every program, story and answer is private to your account. See the privacy page for what is stored and where.",
  },
  {
    q: "Can I try it without adding my own program?",
    a: "Yes. After you sign up, choose “Try with sample data” on the board. It loads three fictional programs, five stories and a first draft that needs work. Remove it with one click when you're done.",
  },
];

export default function HowItWorks() {
  return (
    <SitePage>
      <section className="mx-auto max-w-6xl px-4 pb-16 pt-14 sm:px-6 lg:pb-20 lg:pt-20">
        <h1 className="dossier-serif max-w-3xl text-[2.6rem] font-medium leading-[1.05] tracking-tight sm:text-6xl">
          How Dossier works
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          Six steps, in the order most people use them. For each one: what you do, what Dossier does, and the line it won't
          cross.
        </p>
      </section>

      <section aria-label="Steps" className="border-t">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[14rem_1fr] lg:gap-16 lg:py-20">
          <nav aria-label="Steps" className="hidden lg:block">
            <ol className="sticky top-24 space-y-1 text-sm">
              {STEPS.map((s, i) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="flex gap-3 rounded-md px-2 py-1.5 text-muted-foreground hover:bg-muted hover:text-foreground">
                    <span className="tabular-nums">{i + 1}</span>
                    {s.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
          <ol className="space-y-14">
            {STEPS.map((s, i) => (
              <Reveal as="li" key={s.id}>
                <article id={s.id} className="scroll-mt-24">
                  <p className="text-sm font-medium text-primary tabular-nums">Step {i + 1}</p>
                  <h2 className="dossier-serif mt-1 text-2xl font-medium sm:text-3xl">{s.title}</h2>
                  <dl className="mt-6 grid gap-6 border-t pt-6 sm:grid-cols-3">
                    <div>
                      <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">You</dt>
                      <dd className="mt-2 leading-relaxed">{s.you}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Dossier</dt>
                      <dd className="mt-2 leading-relaxed">{s.dossier}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Never</dt>
                      <dd className="mt-2 leading-relaxed text-muted-foreground">{s.never}</dd>
                    </div>
                  </dl>
                </article>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section id="never" aria-labelledby="never-title" className="scroll-mt-16 border-t bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
          <SectionHeading id="never-title" title="The rules the coach follows">
            These are written into the in-app agent's instructions, not just this page.
          </SectionHeading>
          <ol className="mt-10 grid gap-x-10 gap-y-4 text-[15px] leading-relaxed md:grid-cols-2">
            {[
              "Read the screen before acting.",
              "Make every change through the same actions the buttons use.",
              "Never invent achievements, grades, numbers or facts about you. Ask.",
              "Your answers belong to you: propose edits, never overwrite.",
              "Respect word and character limits, and answer the exact question.",
              "Take program rules only from the official page or your text; mark gaps “Not stated”.",
              "Show deadlines in your time zone and the program's.",
              "Never submit an application or email anyone.",
              "Say clearly that committee reviewers are simulated.",
              "Say a sentence “may sound generic”; never claim certainty about AI authorship.",
            ].map((rule, i) => (
              <li key={rule} className="flex gap-4 border-t py-3">
                <span className="dossier-serif w-6 shrink-0 text-muted-foreground tabular-nums">{i + 1}</span>
                {rule}
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section aria-labelledby="faq" className="border-t">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_1.6fr] lg:gap-16 lg:py-20">
          <SectionHeading id="faq" title="Questions people ask" />
          <div className="divide-y border-y">
            {FAQ.map((f) => (
              <details key={f.q} className="group py-1">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-left font-medium [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <IconChevronDown className="size-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" aria-hidden="true" />
                </summary>
                <p className="pb-5 pr-8 leading-relaxed text-muted-foreground">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="cta" className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-4 py-16 sm:px-6 md:flex-row md:items-center lg:py-20">
          <div>
            <h2 id="cta" className="dossier-serif text-3xl font-medium tracking-tight sm:text-4xl">
              Start with one program.
            </h2>
            <p className="mt-2 text-muted-foreground">
              Paste a link you're already looking at. <Link to="/privacy" className="underline underline-offset-4">How your data is handled</Link>.
            </p>
          </div>
          <StartButton />
        </div>
      </section>
    </SitePage>
  );
}
