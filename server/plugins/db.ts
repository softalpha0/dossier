import { runMigrations } from "@agent-native/core/db";

// Additive only: never edit an entry once it has run; append a new version.
export default runMigrations(
  [
    {
      version: 1,
      name: "profiles-programs-requirements-questions",
      sql: `CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY,
  first_name TEXT,
  country TEXT,
  citizenship TEXT,
  education_level TEXT,
  field TEXT,
  work_years INTEGER,
  goals TEXT,
  timezone TEXT,
  program_types TEXT,
  owner_email TEXT NOT NULL,
  org_id TEXT,
  created_at TEXT NOT NULL DEFAULT (now()),
  updated_at TEXT NOT NULL DEFAULT (now())
);
CREATE UNIQUE INDEX IF NOT EXISTS profiles_owner_idx ON profiles (owner_email);
CREATE TABLE IF NOT EXISTS programs (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  provider TEXT,
  source_url TEXT,
  summary TEXT,
  eligibility_json TEXT,
  criteria_json TEXT,
  deadline_at TEXT,
  deadline_tz TEXT,
  deadline_text TEXT,
  status TEXT NOT NULL DEFAULT 'researching',
  snapshot_text TEXT,
  snapshot_hash TEXT,
  last_checked_at TEXT,
  owner_email TEXT NOT NULL,
  org_id TEXT,
  created_at TEXT NOT NULL DEFAULT (now()),
  updated_at TEXT NOT NULL DEFAULT (now())
);
CREATE INDEX IF NOT EXISTS programs_owner_idx ON programs (owner_email, created_at);
CREATE TABLE IF NOT EXISTS requirements (
  id TEXT PRIMARY KEY,
  program_id TEXT NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  kind TEXT NOT NULL,
  label TEXT NOT NULL,
  details TEXT,
  done BOOLEAN NOT NULL DEFAULT FALSE,
  sort INTEGER NOT NULL DEFAULT 0,
  owner_email TEXT NOT NULL,
  org_id TEXT,
  created_at TEXT NOT NULL DEFAULT (now())
);
CREATE INDEX IF NOT EXISTS requirements_program_idx ON requirements (program_id, sort);
CREATE TABLE IF NOT EXISTS questions (
  id TEXT PRIMARY KEY,
  program_id TEXT NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  sort INTEGER NOT NULL DEFAULT 0,
  text TEXT NOT NULL,
  word_limit INTEGER,
  char_limit INTEGER,
  notes TEXT,
  owner_email TEXT NOT NULL,
  org_id TEXT,
  created_at TEXT NOT NULL DEFAULT (now())
);
CREATE INDEX IF NOT EXISTS questions_program_idx ON questions (program_id, sort)`,
    },
    {
      version: 2,
      name: "committee-reviewers-and-panel-reviews",
      sql: `CREATE TABLE IF NOT EXISTS reviewers (
  id TEXT PRIMARY KEY,
  program_id TEXT NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  "values" TEXT,
  penalises TEXT,
  rubric_json TEXT,
  agent_path TEXT NOT NULL,
  sort INTEGER NOT NULL DEFAULT 0,
  owner_email TEXT NOT NULL,
  org_id TEXT,
  created_at TEXT NOT NULL DEFAULT (now())
);
CREATE INDEX IF NOT EXISTS reviewers_program_idx ON reviewers (owner_email, program_id, sort);
CREATE TABLE IF NOT EXISTS panel_reviews (
  id TEXT PRIMARY KEY,
  run_id TEXT NOT NULL,
  program_id TEXT NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  question_id TEXT,
  answer_id TEXT,
  answer_text TEXT NOT NULL,
  reviewer_id TEXT NOT NULL,
  score INTEGER NOT NULL CHECK (score BETWEEN 1 AND 5),
  best_line TEXT,
  weakest_line TEXT,
  fix TEXT,
  owner_email TEXT NOT NULL,
  org_id TEXT,
  created_at TEXT NOT NULL DEFAULT (now())
);
CREATE INDEX IF NOT EXISTS panel_reviews_program_idx ON panel_reviews (owner_email, program_id, created_at);
CREATE INDEX IF NOT EXISTS panel_reviews_run_idx ON panel_reviews (run_id)`,
    },
    {
      version: 3,
      name: "eligibility-stories-writing-samples",
      sql: `ALTER TABLE programs ADD COLUMN IF NOT EXISTS eligibility_result_json TEXT;
ALTER TABLE programs ADD COLUMN IF NOT EXISTS eligibility_checked_at TEXT;
CREATE TABLE IF NOT EXISTS stories (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  situation TEXT,
  action TEXT,
  result TEXT,
  themes TEXT,
  owner_email TEXT NOT NULL,
  org_id TEXT,
  created_at TEXT NOT NULL DEFAULT (now()),
  updated_at TEXT NOT NULL DEFAULT (now())
);
CREATE INDEX IF NOT EXISTS stories_owner_idx ON stories (owner_email, updated_at);
CREATE TABLE IF NOT EXISTS writing_samples (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  word_count INTEGER NOT NULL DEFAULT 0,
  owner_email TEXT NOT NULL,
  org_id TEXT,
  created_at TEXT NOT NULL DEFAULT (now())
);
CREATE INDEX IF NOT EXISTS writing_samples_owner_idx ON writing_samples (owner_email, created_at)`,
    },
    {
      version: 4,
      name: "story-fits-answers-suggestions-voice",
      sql: `CREATE TABLE IF NOT EXISTS story_fits (
  id TEXT PRIMARY KEY,
  program_id TEXT NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  story_id TEXT NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score BETWEEN 0 AND 100),
  reason TEXT,
  owner_email TEXT NOT NULL,
  org_id TEXT,
  created_at TEXT NOT NULL DEFAULT (now())
);
CREATE UNIQUE INDEX IF NOT EXISTS story_fits_unique_idx ON story_fits (owner_email, question_id, story_id);
CREATE INDEX IF NOT EXISTS story_fits_program_idx ON story_fits (owner_email, program_id);
CREATE TABLE IF NOT EXISTS answers (
  id TEXT PRIMARY KEY,
  program_id TEXT NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  story_id TEXT,
  content TEXT NOT NULL DEFAULT '',
  word_count INTEGER NOT NULL DEFAULT 0,
  char_count INTEGER NOT NULL DEFAULT 0,
  voice_score INTEGER,
  voice_flags_json TEXT,
  voice_checked_at TEXT,
  panel_verdict TEXT,
  panel_average REAL,
  owner_email TEXT NOT NULL,
  org_id TEXT,
  created_at TEXT NOT NULL DEFAULT (now()),
  updated_at TEXT NOT NULL DEFAULT (now())
);
CREATE UNIQUE INDEX IF NOT EXISTS answers_question_idx ON answers (owner_email, question_id);
CREATE INDEX IF NOT EXISTS answers_program_idx ON answers (owner_email, program_id);
CREATE TABLE IF NOT EXISTS suggestions (
  id TEXT PRIMARY KEY,
  answer_id TEXT NOT NULL REFERENCES answers(id) ON DELETE CASCADE,
  find_text TEXT NOT NULL,
  replace_text TEXT NOT NULL,
  reason TEXT,
  origin TEXT NOT NULL CHECK (origin IN ('coach', 'voice', 'panel')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'stale')),
  owner_email TEXT NOT NULL,
  org_id TEXT,
  created_at TEXT NOT NULL DEFAULT (now()),
  resolved_at TEXT
);
CREATE INDEX IF NOT EXISTS suggestions_answer_idx ON suggestions (owner_email, answer_id, status);
CREATE TABLE IF NOT EXISTS voice_profiles (
  id TEXT PRIMARY KEY,
  summary TEXT,
  traits_json TEXT,
  phrases_json TEXT,
  avoid_json TEXT,
  avg_sentence_words REAL,
  sample_count INTEGER NOT NULL DEFAULT 0,
  owner_email TEXT NOT NULL,
  org_id TEXT,
  updated_at TEXT NOT NULL DEFAULT (now())
);
CREATE UNIQUE INDEX IF NOT EXISTS voice_profiles_owner_idx ON voice_profiles (owner_email)`,
    },
    {
      version: 5,
      name: "program-changes-watcher",
      sql: `CREATE TABLE IF NOT EXISTS program_changes (
  id TEXT PRIMARY KEY,
  program_id TEXT NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  source_url TEXT,
  old_hash TEXT,
  new_hash TEXT,
  added_json TEXT NOT NULL DEFAULT '[]',
  removed_json TEXT NOT NULL DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'reviewed')),
  owner_email TEXT NOT NULL,
  org_id TEXT,
  detected_at TEXT NOT NULL DEFAULT (now()),
  reviewed_at TEXT
);
CREATE INDEX IF NOT EXISTS program_changes_program_idx ON program_changes (owner_email, program_id, status);`,
    },
  ],
  { table: "dossier_migrations" },
);
