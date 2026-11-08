import { defineAction, fail } from "@agent-native/core/action";
import { ssrfSafeFetch } from "@agent-native/core/extensions/url-safety";
import { z } from "zod";

import { extractLinks, htmlToText, sha256Hex } from "../server/lib/dossier.js";

const MAX_BYTES = 3_000_000;
const MAX_TEXT = 60_000;

export default defineAction({
  description:
    "Fetch a program's web page and return its readable text plus its links (no AI, no guessing). Use it before add-program to read rules, eligibility, documents, questions, word limits, criteria and the deadline. If the page lists several programs, ask the user which one, then fetch that program's own page from `links` (prefer the official site over aggregators). Only public http(s) pages; PDFs and pages that need a login cannot be read — then ask the user to paste the text.",
  schema: z.object({
    url: z
      .string()
      .url()
      .max(2000)
      .describe("The official program page, starting with https://"),
  }),
  http: { method: "GET" },
  readOnly: true,
  run: async ({ url }) => {
    let res: Response;
    try {
      res = await ssrfSafeFetch(
        url,
        {
          headers: {
            "user-agent":
              "Mozilla/5.0 (compatible; DossierBot/1.0; +https://dossier-pied.vercel.app)",
            accept: "text/html,application/xhtml+xml,text/plain;q=0.9,*/*;q=0.5",
          },
          signal: AbortSignal.timeout(20_000),
        },
        { maxRedirects: 5 },
      );
    } catch (err) {
      fail(
        `We couldn't open this page (${err instanceof Error ? err.message : "network error"}). Paste the program text instead.`,
        { errorCode: "fetch_failed", statusCode: 502 },
      );
    }
    if (!res.ok)
      fail(
        `The page answered with HTTP ${res.status}. It may need a login or block robots. Paste the program text instead.`,
        { errorCode: "fetch_failed", statusCode: 502 },
      );
    const type = res.headers.get("content-type") ?? "";
    if (type.includes("application/pdf"))
      fail(
        "This link is a PDF, which Dossier can't read yet. Open it and paste the text instead.",
        { errorCode: "unsupported_type", statusCode: 415 },
      );
    const buf = await res.arrayBuffer();
    if (buf.byteLength > MAX_BYTES)
      fail("This page is too large to read. Paste the relevant text instead.", {
        errorCode: "too_large",
        statusCode: 413,
      });
    const raw = new TextDecoder("utf-8").decode(buf);
    const isHtml = type.includes("html") || /<html|<body/i.test(raw);
    const { title, text } = isHtml ? htmlToText(raw) : { title: "", text: raw.trim() };
    const links = isHtml ? extractLinks(raw, res.url || url) : [];
    if (text.length < 200)
      fail(
        "This page has almost no readable text (it may load its content with JavaScript). Paste the program text instead.",
        { errorCode: "empty_page", statusCode: 422 },
      );
    const truncated = text.length > MAX_TEXT;
    const body = truncated ? text.slice(0, MAX_TEXT) : text;
    return {
      url,
      finalUrl: res.url || url,
      title,
      text: body,
      truncated,
      links,
      hash: await sha256Hex(text),
      fetchedAt: new Date().toISOString(),
    };
  },
});
