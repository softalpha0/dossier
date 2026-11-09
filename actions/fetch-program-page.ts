import { defineAction, fail } from "@agent-native/core/action";
import { z } from "zod";

import { fetchPage, PageFetchError } from "../server/lib/page-fetch.js";

const MAX_TEXT = 60_000;

export default defineAction({
  description:
    "Fetch a program's web page and return its readable text plus its links (no AI, no guessing). Use it before add-program to read rules, eligibility, documents, questions, word limits, criteria and the deadline. If the page lists several programs, ask the user which one, then fetch that program's own page from `links` (prefer the official site over aggregators). Only public http(s) pages; PDFs and pages that need a login cannot be read — then ask the user to paste the text.",
  schema: z.object({
    url: z.string().url().max(2000).describe("The official program page, starting with https://"),
  }),
  http: { method: "GET" },
  readOnly: true,
  run: async ({ url }) => {
    try {
      const page = await fetchPage(url);
      const truncated = page.text.length > MAX_TEXT;
      return {
        url,
        finalUrl: page.finalUrl,
        title: page.title,
        text: truncated ? page.text.slice(0, MAX_TEXT) : page.text,
        truncated,
        links: page.links,
        hash: page.hash,
        fetchedAt: new Date().toISOString(),
      };
    } catch (err) {
      if (err instanceof PageFetchError) fail(err.message, { errorCode: err.code, statusCode: err.status });
      throw err;
    }
  },
});
