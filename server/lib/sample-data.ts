// Fictional sample data for "Try with sample data". Every title ends in
// "(sample)" so it is never mistaken for a real program or the user's own work.

export const SAMPLE_SUFFIX = "(sample)";

/** Titles used by earlier versions of the sample data, still removed by remove-demo. */
export const LEGACY_SAMPLE_TITLES = {
  programs: [`Kanu Ventures Seed Program ${"(sample)"}`],
  stories: [`Clinic test drive ${"(sample)"}`, `Health leaflets in Yoruba ${"(sample)"}`],
};

/** The marker that identifies the sample profile (in its goals field). */
export const SAMPLE_PROFILE_MARKER = "(sample profile)";

type SampleProgram = {
  title: string;
  type: string;
  provider: string;
  summary: string;
  daysAhead: number;
  utcOffset: string; // offset of the program's timezone around the deadline
  timezone: string;
  tzLabel: string;
  eligibility: { rule: string; category: string }[];
  criteria: { criterion: string; detail: string | null }[];
  requirements: { kind: string; label: string; details: string | null }[];
  questions: { text: string; wordLimit: number | null; charLimit: number | null; notes: string | null }[];
};

export const SAMPLE_PROGRAMS: SampleProgram[] = [
  {
    title: `Harbor Leaders Scholarship ${SAMPLE_SUFFIX}`,
    type: "scholarship",
    provider: "Harbor Foundation (fictional)",
    summary:
      "A fully funded one-year master's in the UK for early-career professionals from anywhere in the world who will lead change in their home communities. Covers tuition, flights and a living stipend.",
    daysAhead: 12,
    utcOffset: "+00:00",
    timezone: "Europe/London",
    tzLabel: "GMT",
    eligibility: [
      { rule: "Open to all nationalities", category: "citizenship" },
      { rule: "Bachelor's degree with at least upper second-class honours (2:1) or equivalent", category: "education" },
      { rule: "At least two years of full-time work experience", category: "experience" },
      { rule: "Meet the university's English language requirement", category: "language" },
    ],
    criteria: [
      { criterion: "Leadership", detail: "Evidence of leading people or change, not just holding a title" },
      { criterion: "Academic merit", detail: "A strong degree and a clear academic plan" },
      { criterion: "Commitment to return", detail: "A credible plan to use the degree at home within two years" },
      { criterion: "Clarity of writing", detail: "Specific, honest, within the word limit" },
    ],
    requirements: [
      { kind: "document", label: "CV (max 2 pages)", details: null },
      { kind: "document", label: "Degree transcript", details: "Certified copy" },
      { kind: "reference", label: "Two references", details: "One academic, one professional" },
      { kind: "test", label: "English test result", details: "IELTS 6.5 overall or equivalent" },
      { kind: "form", label: "Online application form", details: null },
    ],
    questions: [
      { text: "Describe a time you led change in your community. What did you do, and what happened?", wordLimit: 250, charLimit: null, notes: null },
      { text: "Why this master's course, and how will you use it when you return home?", wordLimit: 300, charLimit: null, notes: null },
      { text: "What is your proudest professional achievement so far?", wordLimit: 200, charLimit: null, notes: null },
    ],
  },
  {
    title: `Open Futures Fellowship ${SAMPLE_SUFFIX}`,
    type: "fellowship",
    provider: "Open Futures Institute (fictional)",
    summary:
      "A 12-month, part-time fellowship for technologists building public-interest tools. Fellows receive a stipend, mentoring and a cohort of 20 peers.",
    daysAhead: 30,
    utcOffset: "-05:00",
    timezone: "America/New_York",
    tzLabel: "ET",
    eligibility: [
      { rule: "Two to eight years of work in technology, design, data or policy", category: "experience" },
      { rule: "Working on a public-interest project that is already underway", category: "other" },
      { rule: "Open to all nationalities", category: "citizenship" },
    ],
    criteria: [
      { criterion: "Public value", detail: "Who benefits, and how you know" },
      { criterion: "Momentum", detail: "Evidence the project is already moving" },
      { criterion: "Fit with the cohort", detail: "What you would give to and take from peers" },
    ],
    requirements: [
      { kind: "document", label: "Short project description (1 page)", details: null },
      { kind: "reference", label: "One reference from a collaborator", details: null },
      { kind: "interview", label: "Video interview if shortlisted", details: "30 minutes" },
    ],
    questions: [
      { text: "Describe the project you would work on during the fellowship.", wordLimit: 400, charLimit: null, notes: null },
      { text: "Why now? What would this fellowship change for the project?", wordLimit: 250, charLimit: null, notes: null },
    ],
  },
  {
    title: `Northbridge Ventures Seed Program ${SAMPLE_SUFFIX}`,
    type: "accelerator",
    provider: "Northbridge Ventures (fictional)",
    summary:
      "A 12-week remote accelerator for early-stage startups anywhere in the world, with a small investment, mentors and a demo day in Singapore.",
    daysAhead: 45,
    utcOffset: "+08:00",
    timezone: "Asia/Singapore",
    tzLabel: "SGT",
    eligibility: [
      { rule: "Startup incorporated in any country", category: "residence" },
      { rule: "A product live with real users", category: "other" },
      { rule: "At least one founder working on it full time", category: "experience" },
    ],
    criteria: [
      { criterion: "Problem and market", detail: null },
      { criterion: "Traction", detail: "Users, revenue or growth you can show" },
      { criterion: "Team", detail: "Why you are the people to solve this" },
    ],
    requirements: [
      { kind: "document", label: "Pitch deck (max 12 slides)", details: null },
      { kind: "form", label: "Founder details form", details: null },
    ],
    questions: [
      { text: "What problem are you solving, and for whom?", wordLimit: null, charLimit: 800, notes: null },
      { text: "What traction do you have so far?", wordLimit: null, charLimit: 800, notes: null },
      { text: "Why is your team the right one to build this?", wordLimit: null, charLimit: 800, notes: null },
    ],
  },
];

export const SAMPLE_STORIES = [
  {
    title: `Clinic test kits ${SAMPLE_SUFFIX}`,
    situation: "In the winter of 2023 our neighbourhood clinic ran out of rapid flu test kits, and people were being sent home untested.",
    action: "I organised 40 volunteers from my sports club and old school, set up a WhatsApp donation drive, and drove to a regional supplier twice to collect donated kits. My spreadsheet showed that most pledges arrived within an hour of my evening updates, so I posted one every night at 8.",
    result: "The clinic restocked within two weeks and tested about 300 people before the peak of the season. Two years on, the head nurse runs the reorder list I set up and the clinic has not run out of test kits since.",
    themes: ["leadership", "community", "health"],
  },
  {
    title: `Saturday data club for girls ${SAMPLE_SUFFIX}`,
    situation: "Girls at my old secondary school had no computer lessons; the lab was locked most of the year.",
    action: "I persuaded the principal to open the lab on Saturdays and taught a free spreadsheet and data class with two friends.",
    result: "Twenty-two girls finished the first term; four now help teach the next group.",
    themes: ["education", "leadership", "gender"],
  },
  {
    title: `My first startup failed ${SAMPLE_SUFFIX}`,
    situation: "After university I started a pharmacy delivery service with a friend.",
    action: "We ran it for eight months but never found a way to make deliveries pay for themselves. I wrote down what went wrong and closed it properly, paying every supplier.",
    result: "It taught me to test the economics before building, which is how I now approach every project at work.",
    themes: ["failure", "resilience", "entrepreneurship"],
  },
  {
    title: `Health leaflets in three languages ${SAMPLE_SUFFIX}`,
    situation: "Older patients at the hospital where I work couldn't read the English-only medication leaflets.",
    action: "I translated the ten most common leaflets into the three languages most patients' families speak at home, with two nurses, and tested them with those families.",
    result: "The hospital now prints every leaflet in all four languages.",
    themes: ["community", "health", "communication"],
  },
  {
    title: `Night shifts while studying ${SAMPLE_SUFFIX}`,
    situation: "In my final year my father lost his job.",
    action: "I worked night shifts at a call centre four nights a week to pay my fees while finishing my degree.",
    result: "I graduated with a 2:1 and paid my last term's fees myself.",
    themes: ["resilience", "family"],
  },
];

export const SAMPLE_WRITING = {
  title: `Blog post: what my mother's pharmacy taught me ${SAMPLE_SUFFIX}`,
  content: `My mother ran a small pharmacy on a busy road near the train station. I spent most of my school holidays behind the counter, counting tablets into small paper envelopes and writing the dose on the front in big letters.

She had one rule: listen before you sell. A woman would come in asking for the strongest painkiller we had, and my mother would ask where it hurt, for how long, and what she had already taken. Half the time the answer was not a painkiller at all. Sometimes it was a referral to the clinic down the road, which meant we sold nothing.

I used to think this was bad business. I understand it better now. People came back because she had listened the first time. They brought their children, then their neighbours.

At work I try to do the same. When a patient's family stops me in the corridor, I do not start with the leaflet. I ask what they are worried about. It takes longer. It saves time later.

I am not good at speeches. I am better at noticing the small thing that is going wrong and fixing it before it becomes a big thing. My mother would say that is most of the job.`,
};

/** First answer to the scholarship's question 1: 371 words (limit 250) with stock phrases — the demo's starting point. */
export const SAMPLE_ANSWER = `I am passionate about making a difference in my community, and I have always been driven by a desire to help others. In today's fast-paced world, healthcare is more important than ever, and I believe that strong leadership is a testament to what one person can achieve when they step out of their comfort zone.

In the winter of 2023, our neighbourhood clinic ran out of rapid flu test kits. People were coming to the clinic with fevers and being sent home without being tested, which was dangerous because flu can become serious very quickly, especially for older people and young children. The nurses were frustrated and the patients were worried, and nobody seemed to know when the new kits would finally arrive.

I decided that I could not just watch this happen. I organised 40 volunteers from my sports club and my old school. We set up a WhatsApp group and started a donation drive, asking everyone we knew to contribute whatever they could. I made a very simple spreadsheet to track the money and the pledges, and I shared updates every evening so people could see that their money was being used well. When a regional supplier donated kits, I drove there twice to collect them myself because the delivery would have taken too long.

Within two weeks the clinic was restocked. Around 300 people were tested before the peak of the season. The head nurse told me that several children were treated early because of the tests. I also set up a reorder list with the clinic so that they would know when stocks were running low and could ask for help before running out again.

This experience taught me that leadership is not about having a title. It is about seeing a problem and taking responsibility for solving it, even when it is not officially your job. It also taught me the value of communication, organisation and teamwork. I learned that people are willing to help when you give them a clear plan and keep them informed.

At the end of the day, this is the kind of leader I want to become, and this prestigious scholarship would be a unique opportunity to develop these skills further.`;

export function deadlineFor(daysAhead: number, utcOffset: string): string {
  const d = new Date(Date.now() + daysAhead * 86_400_000);
  const ymd = d.toISOString().slice(0, 10);
  return new Date(`${ymd}T23:59:00${utcOffset}`).toISOString();
}

export function deadlineTextFor(daysAhead: number, tzLabel: string): string {
  const d = new Date(Date.now() + daysAhead * 86_400_000);
  const day = d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
  return `${day}, 23:59 ${tzLabel}`;
}

/** One example rules-watcher finding, on the fellowship, so the "page changed" banner can be shown. */
export const SAMPLE_CHANGE = {
  programTitle: `Open Futures Fellowship ${SAMPLE_SUFFIX}`,
  sourceUrl: "https://openfutures.example/fellowship",
  added: [
    "Short project description (max 2 pages), plus a 2-minute video introducing the project.",
    "Shortlisted applicants will be interviewed in person in New York.",
  ],
  removed: ["Short project description (1 page)", "Video interview if shortlisted (30 minutes)"],
};
