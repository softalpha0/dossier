import type { ReactNode } from "react";

import { SitePage, StartButton } from "@/components/site/SiteChrome";
import { CONTACT_EMAIL } from "@/lib/marketing";

const TITLE = "Privacy & safety";
const DESCRIPTION =
  "What Dossier stores, what it never asks for, where your data lives, and how to delete it. In plain language.";

export function meta() {
  return [
    { title: `${TITLE} · Dossier` },
    { name: "description", content: DESCRIPTION },
    { property: "og:title", content: `${TITLE} · Dossier` },
    { property: "og:description", content: DESCRIPTION },
  ];
}

const SECTIONS: { id: string; title: string; body: ReactNode }[] = [
  {
    id: "stores",
    title: "What Dossier stores",
    body: (
      <ul>
        <li>
          <strong>Your account:</strong> your email address and what's needed to sign you in.
        </li>
        <li>
          <strong>Your profile:</strong> first name, country, citizenship, education, field, years of work, goals, time zone
          and the kinds of programs you want. Only what you choose to fill in.
        </li>
        <li>
          <strong>Your work:</strong> the programs you add (with a copy of the official page's text, so changes can be
          spotted), checklists, questions, stories, writing samples, answers, suggestions, voice checks and committee
          reviews.
        </li>
        <li>
          <strong>Your chats</strong> with the coach, so a conversation can continue where you left it.
        </li>
      </ul>
    ),
  },
  {
    id: "never",
    title: "What it never asks for",
    body: (
      <>
        <p>
          Dossier never asks for your passport number, home address, national ID number or payment details. A first name is
          enough. Please don't paste them into stories, answers or chat either.
        </p>
        <p>There are no advertising trackers or third-party analytics, and your data is not sold.</p>
      </>
    ),
  },
  {
    id: "who",
    title: "Who can see it",
    body: (
      <>
        <p>
          Only you. Every program, story and answer is tied to your account, and every request checks it. Nothing is
          shared with other users, programs or reviewers.
        </p>
        <p>
          Like any web service, the people who run Dossier have technical access to its database. That access is used only
          to keep the service working.
        </p>
      </>
    ),
  },
  {
    id: "where",
    title: "Where it lives",
    body: (
      <ul>
        <li>
          <strong>The app</strong> runs on Vercel.
        </li>
        <li>
          <strong>The database</strong> is a Postgres database hosted by Neon, in the United States (East).
        </li>
        <li>
          <strong>AI features</strong> (reading a program page, drafting, the voice check and the simulated committee) send
          the text they need, such as the page, your answer and the relevant stories, to Anthropic's Claude API to produce
          a result. Anthropic states that it does not train its models on API data by default.
        </li>
        <li>
          <strong>Program links</strong> you paste are fetched by Dossier's server, the same way a browser would load them.
        </li>
      </ul>
    ),
  },
  {
    id: "delete",
    title: "Deleting your data",
    body: (
      <>
        <p>
          You can delete any program, story or writing sample at any time from the app. Deleting a program also deletes its
          answers, suggestions, story-map scores and review panel.
        </p>
        <p>Sample data is fictional and can be removed with one click from your board.</p>
        <p>
          To delete your whole account and everything in it, email{" "}
          <a href={`mailto:${CONTACT_EMAIL}?subject=Delete%20my%20Dossier%20account`} className="font-medium text-primary underline underline-offset-4">
            {CONTACT_EMAIL}
          </a>{" "}
          from the address you signed up with.
        </p>
      </>
    ),
  },
  {
    id: "honest",
    title: "Being honest about the AI",
    body: (
      <ul>
        <li>The committee reviewers are simulated. Their scores can't predict a real decision.</li>
        <li>The voice check says a sentence “may sound generic”. It does not and cannot detect AI writing.</li>
        <li>Dossier never invents achievements, grades or numbers about you, and never submits anything on your behalf.</li>
      </ul>
    ),
  },
];

export default function Privacy() {
  return (
    <SitePage>
      <section className="mx-auto max-w-6xl px-4 pb-12 pt-14 sm:px-6 lg:pt-20">
        <h1 className="dossier-serif max-w-3xl text-[2.6rem] font-medium leading-[1.05] tracking-tight sm:text-6xl">
          Privacy &amp; safety
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          Applications hold personal stories. Here is exactly what Dossier keeps, where, and why, without the legal fog.
        </p>
        <p className="mt-3 text-sm text-muted-foreground">Last updated 8 November 2026</p>
      </section>

      <section aria-label="The short version" className="border-t bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <ul className="grid gap-6 md:grid-cols-3">
            {[
              ["Private by default", "Everything you add is visible only to your account."],
              ["Minimal by design", "A first name is enough. No passport, address or ID numbers."],
              ["Yours to delete", "Delete any program or story at any time, along with everything attached to it."],
            ].map(([t, b]) => (
              <li key={t} className="border-t border-foreground/15 pt-4">
                <p className="font-medium">{t}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{b}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-t">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[14rem_1fr] lg:gap-16 lg:py-20">
          <nav aria-label="On this page" className="hidden lg:block">
            <ol className="sticky top-24 space-y-1 text-sm">
              {SECTIONS.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="block rounded-md px-2 py-1.5 text-muted-foreground hover:bg-muted hover:text-foreground">
                    {s.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
          <div className="max-w-2xl space-y-12">
            {SECTIONS.map((s) => (
              <article key={s.id} id={s.id} className="scroll-mt-24">
                <h2 className="dossier-serif text-2xl font-medium sm:text-3xl">{s.title}</h2>
                <div className="mt-4 space-y-3 leading-relaxed text-foreground/85 [&_li]:relative [&_li]:pl-5 [&_li]:before:absolute [&_li]:before:left-0 [&_li]:before:top-[0.7em] [&_li]:before:size-1.5 [&_li]:before:rounded-full [&_li]:before:bg-primary [&_li]:before:content-[''] [&_strong]:font-medium [&_strong]:text-foreground [&_ul]:space-y-3">
                  {s.body}
                </div>
              </article>
            ))}
            <p className="border-t pt-6 text-sm text-muted-foreground">
              Dossier is an early-stage project built for the Builder.io Agent-Native Hackathon. This page describes how the
              app is built today. If that changes, this page changes first. Questions:{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="underline underline-offset-4">
                {CONTACT_EMAIL}
              </a>
              .
            </p>
          </div>
        </div>
      </section>

      <section className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-4 py-14 sm:px-6 md:flex-row md:items-center">
          <p className="dossier-serif text-2xl font-medium sm:text-3xl">Ready to start your first application?</p>
          <StartButton />
        </div>
      </section>
    </SitePage>
  );
}
