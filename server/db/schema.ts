import { sql } from "drizzle-orm";
import { boolean, integer, pgTable, text } from "drizzle-orm/pg-core";

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
