import { sql } from "drizzle-orm";
import { boolean, integer, pgTable, real, text } from "drizzle-orm/pg-core";

// Dossier data is private to each user: every row carries owner_email and
// org_id, and every action filters on the signed-in user's email.
// Timestamps are ISO text (Date#toISOString) so string order = time order.

export const profiles = pgTable("profiles", {
  id: text("id").primaryKey(),
  firstName: text("first_name"),
  country: text("country"),
  citizenship: text("citizenship"),
  educationLevel: text("education_level"),
  field: text("field"),
  workYears: integer("work_years"),
  goals: text("goals"),
  timezone: text("timezone"),
  programTypes: text("program_types"), // JSON array of program types
  ownerEmail: text("owner_email").notNull(),
  orgId: text("org_id"),
  createdAt: text("created_at").notNull().default(sql`now()`),
  updatedAt: text("updated_at").notNull().default(sql`now()`),
});

export const programs = pgTable("programs", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  type: text("type").notNull(),
  provider: text("provider"),
  sourceUrl: text("source_url"),
  summary: text("summary"),
  eligibilityJson: text("eligibility_json"), // JSON [{rule, category}]
  criteriaJson: text("criteria_json"), // JSON [{criterion, detail}]
  deadlineAt: text("deadline_at"), // UTC ISO, null when not stated
  deadlineTz: text("deadline_tz"), // IANA zone of the program, or null
  deadlineText: text("deadline_text"), // deadline as written on the page
  status: text("status").notNull().default("researching"),
  snapshotText: text("snapshot_text"),
  eligibilityResultJson: text("eligibility_result_json"), // JSON {overall, items[], missing[]}
  eligibilityCheckedAt: text("eligibility_checked_at"),
  snapshotHash: text("snapshot_hash"),
  lastCheckedAt: text("last_checked_at"),
  ownerEmail: text("owner_email").notNull(),
  orgId: text("org_id"),
  createdAt: text("created_at").notNull().default(sql`now()`),
  updatedAt: text("updated_at").notNull().default(sql`now()`),
});

export const requirements = pgTable("requirements", {
  id: text("id").primaryKey(),
  programId: text("program_id").notNull(),
  kind: text("kind").notNull(),
  label: text("label").notNull(),
  details: text("details"),
  done: boolean("done").notNull().default(false),
  sort: integer("sort").notNull().default(0),
  ownerEmail: text("owner_email").notNull(),
  orgId: text("org_id"),
  createdAt: text("created_at").notNull().default(sql`now()`),
});

export const questions = pgTable("questions", {
  id: text("id").primaryKey(),
  programId: text("program_id").notNull(),
  sort: integer("sort").notNull().default(0),
  text: text("text").notNull(),
  wordLimit: integer("word_limit"),
  charLimit: integer("char_limit"),
  notes: text("notes"),
  ownerEmail: text("owner_email").notNull(),
  orgId: text("org_id"),
  createdAt: text("created_at").notNull().default(sql`now()`),
});

export const reviewers = pgTable("reviewers", {
  id: text("id").primaryKey(),
  programId: text("program_id").notNull(),
  slug: text("slug").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull(),
  values: text("values"),
  penalises: text("penalises"),
  rubricJson: text("rubric_json"), // JSON [{criterion, lookFor}]
  agentPath: text("agent_path").notNull(), // agents/<slug>.md resource
  sort: integer("sort").notNull().default(0),
  ownerEmail: text("owner_email").notNull(),
  orgId: text("org_id"),
  createdAt: text("created_at").notNull().default(sql`now()`),
});

export const panelReviews = pgTable("panel_reviews", {
  id: text("id").primaryKey(),
  runId: text("run_id").notNull(),
  programId: text("program_id").notNull(),
  questionId: text("question_id"),
  answerId: text("answer_id"),
  answerText: text("answer_text").notNull(),
  reviewerId: text("reviewer_id").notNull(),
  score: integer("score").notNull(),
  bestLine: text("best_line"),
  weakestLine: text("weakest_line"),
  fix: text("fix"),
  ownerEmail: text("owner_email").notNull(),
  orgId: text("org_id"),
  createdAt: text("created_at").notNull().default(sql`now()`),
});

export const stories = pgTable("stories", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  situation: text("situation"),
  action: text("action"),
  result: text("result"),
  themes: text("themes"), // JSON array of short theme tags
  ownerEmail: text("owner_email").notNull(),
  orgId: text("org_id"),
  createdAt: text("created_at").notNull().default(sql`now()`),
  updatedAt: text("updated_at").notNull().default(sql`now()`),
});

export const writingSamples = pgTable("writing_samples", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  wordCount: integer("word_count").notNull().default(0),
  ownerEmail: text("owner_email").notNull(),
  orgId: text("org_id"),
  createdAt: text("created_at").notNull().default(sql`now()`),
});

export const storyFits = pgTable("story_fits", {
  id: text("id").primaryKey(),
  programId: text("program_id").notNull(),
  questionId: text("question_id").notNull(),
  storyId: text("story_id").notNull(),
  score: integer("score").notNull(), // 0–100
  reason: text("reason"),
  ownerEmail: text("owner_email").notNull(),
  orgId: text("org_id"),
  createdAt: text("created_at").notNull().default(sql`now()`),
});

export const answers = pgTable("answers", {
  id: text("id").primaryKey(),
  programId: text("program_id").notNull(),
  questionId: text("question_id").notNull(),
  storyId: text("story_id"),
  content: text("content").notNull().default(""),
  wordCount: integer("word_count").notNull().default(0),
  charCount: integer("char_count").notNull().default(0),
  voiceScore: integer("voice_score"),
  voiceFlagsJson: text("voice_flags_json"), // JSON [{sentence, reason}]
  voiceCheckedAt: text("voice_checked_at"),
  panelVerdict: text("panel_verdict"),
  panelAverage: real("panel_average"),
  ownerEmail: text("owner_email").notNull(),
  orgId: text("org_id"),
  createdAt: text("created_at").notNull().default(sql`now()`),
  updatedAt: text("updated_at").notNull().default(sql`now()`),
});

export const suggestions = pgTable("suggestions", {
  id: text("id").primaryKey(),
  answerId: text("answer_id").notNull(),
  findText: text("find_text").notNull(),
  replaceText: text("replace_text").notNull(),
  reason: text("reason"),
  origin: text("origin").notNull(), // coach | voice | panel
  status: text("status").notNull().default("pending"), // pending | accepted | rejected | stale
  ownerEmail: text("owner_email").notNull(),
  orgId: text("org_id"),
  createdAt: text("created_at").notNull().default(sql`now()`),
  resolvedAt: text("resolved_at"),
});

export const voiceProfiles = pgTable("voice_profiles", {
  id: text("id").primaryKey(),
  summary: text("summary"),
  traitsJson: text("traits_json"),
  phrasesJson: text("phrases_json"),
  avoidJson: text("avoid_json"),
  avgSentenceWords: real("avg_sentence_words"),
  sampleCount: integer("sample_count").notNull().default(0),
  ownerEmail: text("owner_email").notNull(),
  orgId: text("org_id"),
  updatedAt: text("updated_at").notNull().default(sql`now()`),
});

// S1 rules watcher: what changed on a program's official page since the last check.
export const programChanges = pgTable("program_changes", {
  id: text("id").primaryKey(),
  programId: text("program_id").notNull(),
  sourceUrl: text("source_url"),
  oldHash: text("old_hash"),
  newHash: text("new_hash"),
  addedJson: text("added_json").notNull().default("[]"), // JSON string[] of lines that appeared
  removedJson: text("removed_json").notNull().default("[]"), // JSON string[] of lines that disappeared
  status: text("status").notNull().default("new"), // new | reviewed
  ownerEmail: text("owner_email").notNull(),
  orgId: text("org_id"),
  detectedAt: text("detected_at").notNull().default(sql`now()`),
  reviewedAt: text("reviewed_at"),
});
