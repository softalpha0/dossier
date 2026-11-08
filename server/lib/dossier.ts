import { fail } from "@agent-native/core/action";
import { and, eq } from "drizzle-orm";

import { getDb, schema } from "../db/index.js";

export const PROGRAM_TYPES = [
  "scholarship",
  "fellowship",
  "grant",
  "accelerator",
  "residency",
  "award",
  "other",
] as const;

export const PROGRAM_STATUSES = [
  "researching",
  "preparing",
  "ready",
  "submitted",
  "shortlisted",
  "result",
] as const;

export const REQUIREMENT_KINDS = [
  "document",
  "reference",
  "form",
  "test",
  "fee",
  "interview",
  "other",
] as const;

type Ctx = { userEmail?: string | null; orgId?: string | null } | undefined;

/** The signed-in user's identity; fails with 401 when nobody is signed in. */
export function requireUser(ctx: Ctx, what = "use Dossier") {
  const ownerEmail =
    ctx?.userEmail ?? fail(`Sign in to ${what}.`, { statusCode: 401 });
  return { ownerEmail, orgId: ctx?.orgId ?? null };
}

/** Load a program the current user owns, or fail with 404. */
export async function requireProgram(programId: string, ownerEmail: string) {
  const p = schema.programs;
  const [row] = await getDb()
    .select()
    .from(p)
    .where(and(eq(p.id, programId), eq(p.ownerEmail, ownerEmail)))
    .limit(1);
  if (!row)
    fail("Program not found.", { errorCode: "not_found", statusCode: 404 });
  return row;
}

export function parseJsonArray<T = unknown>(value: string | null): T[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

export function nowIso() {
  return new Date().toISOString();
}

const ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  ndash: "–",
  mdash: "—",
  rsquo: "’",
  lsquo: "‘",
  rdquo: "”",
  ldquo: "“",
  hellip: "…",
  bull: "•",
};

/** Turn an HTML page into readable plain text, keeping line and list structure. */
export function htmlToText(html: string): { title: string; text: string } {
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  let s = html
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<head[\s\S]*?<\/head>/gi, " ")
    .replace(/<(script|style|noscript|svg|iframe|template)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<(nav|footer)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<li[^>]*>/gi, "\n• ")
    .replace(/<\/(p|div|section|article|h[1-6]|li|tr|table|ul|ol|header|dd|dt)>/gi, "\n")
    .replace(/<(h[1-6])[^>]*>/gi, "\n\n")
    .replace(/<\/t[dh]>/gi, " | ")
    .replace(/<[^>]+>/g, " ");
  const decode = (t: string) =>
    t
      .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
      .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
      .replace(/&([a-z]+);/gi, (m, n) => ENTITIES[n.toLowerCase()] ?? m);
  s = decode(s)
    .split("\n")
    .map((line) => line.replace(/[ \t ]+/g, " ").trim())
    .filter((line, i, arr) => line || (arr[i - 1] ?? "") !== "")
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  const title = titleMatch?.[1] ? decode(titleMatch[1]).replace(/\s+/g, " ").trim() : "";
  return { title, text: s };
}

export interface PageLink {
  text: string;
  url: string;
}

/** Links on a page (absolute http(s) URLs with their visible text), deduplicated. */
export function extractLinks(html: string, baseUrl: string, limit = 150): PageLink[] {
  const body = html
    .replace(/<(script|style|noscript|svg|template)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<head[\s\S]*?<\/head>/gi, " ");
  const out: PageLink[] = [];
  const seen = new Set<string>();
  const re = /<a\b[^>]*\bhref\s*=\s*(["'])(.*?)\1[^>]*>([\s\S]*?)<\/a>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(body)) && out.length < limit) {
    const href = (m[2] ?? "").trim();
    if (!href || /^(#|mailto:|tel:|javascript:)/i.test(href)) continue;
    let url: string;
    try {
      const u = new URL(href.replace(/&amp;/g, "&"), baseUrl);
      if (u.protocol !== "https:" && u.protocol !== "http:") continue;
      u.hash = "";
      url = u.toString();
    } catch {
      continue;
    }
    const text = htmlToText(`<p>${m[3] ?? ""}</p>`).text.replace(/\s+/g, " ").trim().slice(0, 120);
    if (!text || seen.has(url)) continue;
    seen.add(url);
    out.push({ text, url });
  }
  return out;
}

export async function sha256Hex(text: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** lowercase-hyphen slug, ascii only, bounded. */
export function slugify(value: string, max = 40): string {
  return (
    value
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, max)
      .replace(/-+$/g, "") || "item"
  );
}

export type Verdict = "Likely shortlist" | "Borderline" | "Unlikely";

/** Fixed rule from the PRD: average >= 4 likely, 3–3.9 borderline, < 3 unlikely. */
export function verdictFor(average: number): Verdict {
  if (average >= 4) return "Likely shortlist";
  if (average >= 3) return "Borderline";
  return "Unlikely";
}
