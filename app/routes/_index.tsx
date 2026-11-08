import {
  IconBan,
  IconFileOff,
  IconId,
  IconPencilOff,
  IconScale,
  IconUsersGroup,
} from "@tabler/icons-react";
import type { ReactNode } from "react";
import { Link } from "react-router";

import { CommitteeChart } from "@/components/site/CommitteeChart";
import {
  ChatFragment,
  ProgramFragment,
  ReadinessFragment,
  StoryMapFragment,
  VoiceFragment,
} from "@/components/site/Fragments";
import { HeroEditorDemo } from "@/components/site/HeroEditorDemo";
import { Reveal } from "@/components/site/Reveal";
import { SectionHeading, SitePage, StartButton } from "@/components/site/SiteChrome";
import { cn } from "@/lib/utils";

const TITLE = "Dossier: applications in your own voice";
const DESCRIPTION =
  "Paste a scholarship, fellowship, grant or accelerator call. Dossier turns it into a checklist, helps you answer from your own stories, and lets a simulated committee read it first.";

export function meta() {
  return [
    { title: TITLE },
    { name: "description", content: DESCRIPTION },
    { property: "og:title", content: TITLE },
    { property: "og:description", content: DESCRIPTION },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { name: "twitter:title", content: TITLE },
    { name: "twitter:description", content: DESCRIPTION },
  ];
}

const PROBLEMS = [
  {
    title: "The rules hide in the fine print.",
    body: "One missed eligibility line, or a 250-word limit read as 300, ends an application before anyone reads it.",
  },
  {
    title: "The same story, rewritten from scratch.",
    body: "Every program asks about leadership a little differently. Most people start from a blank page every time.",
  },
  {
    title: "Everyone sounds the same.",
    body: "“Passionate about making a difference.” Committees read hundreds of answers that could belong to anyone.",
  },
];

const STEPS: { title: string; body: string; points: string[]; visual: ReactNode }[] = [
  {
    title: "Paste the official link",
    body: "Dossier reads the call and turns it into a program card: eligibility, documents, every question with its word limit, and the deadline in their time zone and yours.",
    points: ["Only what the page states. Gaps say “Not stated”", "Listing sites? It asks which program and finds the official page"],
    visual: <ProgramFragment />,
  },
  {
    title: "Bank your stories once, use them everywhere",
    body: "Write down what happened, what you did and what changed. Dossier scores every story against every question, so your strongest one goes where it counts.",
    points: ["Spots questions with no strong story yet", "Warns when one story is doing too much work"],
    visual: <StoryMapFragment />,
  },
  {
    title: "Make sure it sounds like you",
    body: "Add something you've written before. Dossier learns how you sound and flags sentences that may sound generic, with a rewrite built only from your own facts.",
    points: ["Every change is a suggestion you accept or reject", "It never claims to detect AI. It says “may sound generic”"],
    visual: <VoiceFragment />,
  },
  {
    title: "Meet the committee before the committee",
    body: "Three reviewers are modelled on the program's own selection criteria. Each scores your answer, quotes its best and weakest line, and suggests one fix.",
    points: ["Clearly simulated, never presented as real", "Fixes arrive as suggestions in your editor"],
    visual: <CommitteeChart />,
  },
  {
    title: "Know you're ready, then export",
    body: "One check covers everything: eligibility, documents, every word limit, every answer. Then download a single packet to keep, share with a mentor or copy into the official form.",
    points: ["Each problem comes with its fix", "Dossier never submits anything for you"],
    visual: <ReadinessFragment />,
  },
];

const NEVER = [
  { icon: IconBan, text: "Submit an application or email anyone on your behalf." },
  { icon: IconPencilOff, text: "Overwrite your words. Every edit waits for your yes." },
  { icon: IconFileOff, text: "Invent achievements, grades or numbers. If it needs a fact, it asks." },
  { icon: IconScale, text: "Claim to detect AI. A sentence “may sound generic”, nothing more." },
  { icon: IconUsersGroup, text: "Pretend the committee is real. Reviewers are simulated, and labelled so." },
  { icon: IconId, text: "Ask for your passport, address or ID numbers. A first name is enough." },
];

export default function Landing() {
  return (
    <SitePage>
      {/* Hero */}
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-20 pt-12 sm:px-6 lg:grid-cols-[1fr_1.05fr] lg:gap-14 lg:pb-28 lg:pt-20">
        <div>
          <p className="text-sm text-muted-foreground">For scholarships, fellowships, grants and accelerators</p>
          <h1 className="dossier-serif mt-4 text-balance text-[2.6rem] font-medium leading-[1.05] tracking-tight sm:text-6xl lg:text-[4.1rem]">
            From the official call to a finished application, <em className="text-primary">in your own voice.</em>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            Dossier reads the call, turns it into a checklist, helps you answer every question from your real experiences,
            and lets a simulated committee read it before the real one does.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <StartButton />
            <Link
              to="/how-it-works"
              className="inline-flex h-10 items-center justify-center rounded-md px-4 text-sm font-medium text-foreground underline-offset-4 hover:underline"
            >
              See how it works
            </Link>
          </div>
          <p className="mt-6 text-sm text-muted-foreground">Never submits for you · Never invents your achievements · Private to your account</p>
        </div>
        <HeroEditorDemo />
      </section>

      {/* Problem */}
      <section aria-labelledby="problem" className="border-t">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-28">
          <SectionHeading id="problem" title="Good candidates lose on things that have nothing to do with merit." />
          <ol className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
            {PROBLEMS.map((p, i) => (
              <Reveal as="li" key={p.title} delay={i * 90} className="border-t pt-5">
                <span className="dossier-serif text-sm text-muted-foreground tabular-nums">0{i + 1}</span>
                <h3 className="mt-2 text-lg font-medium">{p.title}</h3>
                <p className="mt-2 leading-relaxed text-muted-foreground">{p.body}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* Workflow */}
      <section aria-labelledby="workflow" className="border-t bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-28">
          <SectionHeading id="workflow" title="Five steps from call to packet.">
            Each step is something you can see and change. The coach helps, but nothing happens to your application without
            you.
          </SectionHeading>
          <ol className="mt-16 space-y-20 lg:space-y-28">
            {STEPS.map((s, i) => (
              <li key={s.title} className="grid items-center gap-8 lg:grid-cols-2 lg:gap-16">
                <Reveal className={cn(i % 2 === 1 && "lg:order-2")}>
                  <p className="text-sm font-medium text-primary tabular-nums">Step {i + 1}</p>
                  <h3 className="dossier-serif mt-2 text-2xl font-medium leading-tight sm:text-3xl">{s.title}</h3>
                  <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{s.body}</p>
                  <ul className="mt-5 space-y-2 text-sm">
                    {s.points.map((pt) => (
                      <li key={pt} className="flex gap-2.5">
                        <span aria-hidden="true" className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                        {pt}
                      </li>
                    ))}
                  </ul>
                </Reveal>
                <Reveal delay={120} className={cn("min-w-0", i % 2 === 1 && "lg:order-1")}>
                  {s.visual}
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Agent */}
      <section aria-labelledby="agent" className="border-t">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:py-28">
          <Reveal>
            <SectionHeading id="agent" title="Or just ask.">
              The coach knows which program and which answer you have open. Everything it does goes through the same buttons
              you use, so you can always see what changed.
            </SectionHeading>
            <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
              <li>“Check my eligibility for all my programs.”</li>
              <li>“Cut this down to the limit.”</li>
              <li>“Which of my answers is weakest right now, and why?”</li>
            </ul>
          </Reveal>
          <Reveal delay={120}>
            <ChatFragment />
          </Reveal>
        </div>
      </section>

      {/* Never */}
      <section aria-labelledby="never" className="border-t bg-[#1c2029] text-[#f7f5f0] dark:border-white/10 dark:bg-[#161616]">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-28">
          <h2 id="never" className="dossier-serif max-w-2xl text-3xl font-medium leading-tight tracking-tight sm:text-[2.6rem]">
            What Dossier will never do.
          </h2>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-white/70">
            An application is a claim about who you are. The tool helping you write it should be held to the same standard.
          </p>
          <ul className="mt-12 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
            {NEVER.map(({ icon: Icon, text }, i) => (
              <Reveal as="li" key={text} delay={i * 60} className="flex gap-3 border-t border-white/15 pt-5">
                <Icon className="mt-0.5 size-5 shrink-0 text-white/60" aria-hidden="true" />
                <span className="leading-relaxed">{text}</span>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section aria-labelledby="cta" className="border-t">
        <div className="mx-auto max-w-6xl px-4 py-20 text-center sm:px-6 lg:py-28">
          <h2 id="cta" className="dossier-serif mx-auto max-w-3xl text-balance text-4xl font-medium leading-tight tracking-tight sm:text-5xl">
            Your next deadline is closer than it looks.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground">
            Create an account and paste your first program link. Or load the sample data and try every step in two minutes.
          </p>
          <div className="mt-8 flex justify-center">
            <StartButton />
          </div>
        </div>
      </section>
    </SitePage>
  );
}
