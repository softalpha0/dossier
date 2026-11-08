export const PROGRAM_TYPES = [
  "scholarship",
  "fellowship",
  "grant",
  "accelerator",
  "residency",
  "award",
  "other",
] as const;
export type ProgramType = (typeof PROGRAM_TYPES)[number];

export const STAGES = [
  { id: "researching", label: "Researching" },
  { id: "preparing", label: "Preparing" },
  { id: "ready", label: "Ready" },
  { id: "submitted", label: "Submitted" },
  { id: "shortlisted", label: "Shortlisted" },
  { id: "result", label: "Result" },
] as const;
export type StageId = (typeof STAGES)[number]["id"];

export function stageLabel(id: string): string {
  return STAGES.find((s) => s.id === id)?.label ?? id;
}

export function typeLabel(type: string): string {
  return type.charAt(0).toUpperCase() + type.slice(1);
}

export function browserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

function formatIn(iso: string, timeZone: string): string {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      timeZone,
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short",
    }).format(new Date(iso));
  } catch {
    return new Date(iso).toUTCString();
  }
}

export interface DeadlineView {
  /** e.g. "Fri, 15 Jan 2027, 00:59 WAT" */
  yours: string | null;
  /** In the program's own timezone, when it is stated. */
  theirs: string | null;
  /** Whole days left (negative when passed); null when no deadline. */
  daysLeft: number | null;
  /** Short badge text: "12 days left", "Due today", "Closed", "No deadline stated". */
  badge: string;
  tone: "calm" | "soon" | "urgent" | "closed" | "none";
}

export function deadlineView(
  deadlineAt: string | null,
  programTz: string | null,
  userTz: string | null | undefined,
): DeadlineView {
  if (!deadlineAt)
    return {
      yours: null,
      theirs: null,
      daysLeft: null,
      badge: "No deadline stated",
      tone: "none",
    };
  const tz = userTz || browserTimezone();
  const ms = Date.parse(deadlineAt) - Date.now();
  const daysLeft = Math.floor(ms / 86_400_000);
  let badge: string;
  let tone: DeadlineView["tone"];
  if (ms < 0) {
    badge = "Closed";
    tone = "closed";
  } else if (daysLeft < 1) {
    badge = "Due within 24 hours";
    tone = "urgent";
  } else {
    badge = `${daysLeft} day${daysLeft === 1 ? "" : "s"} left`;
    tone = daysLeft <= 3 ? "urgent" : daysLeft <= 14 ? "soon" : "calm";
  }
  return {
    yours: formatIn(deadlineAt, tz),
    theirs: programTz && programTz !== tz ? formatIn(deadlineAt, programTz) : null,
    daysLeft,
    badge,
    tone,
  };
}

export const TONE_CLASSES: Record<DeadlineView["tone"], string> = {
  calm: "bg-secondary text-secondary-foreground",
  soon: "bg-amber-100 text-amber-900 dark:bg-amber-900/30 dark:text-amber-200",
  urgent: "bg-red-100 text-red-900 dark:bg-red-900/30 dark:text-red-200",
  closed: "bg-muted text-muted-foreground line-through",
  none: "bg-muted text-muted-foreground",
};
