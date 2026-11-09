import { ssrfSafeFetch } from "@agent-native/core/extensions/url-safety";

import { extractLinks, htmlToText, sha256Hex } from "./dossier.js";

const MAX_BYTES = 3_000_000;

export class PageFetchError extends Error {
  constructor(
    message: string,
    readonly code: "fetch_failed" | "unsupported_type" | "too_large" | "empty_page",
    readonly status: number,
  ) {
    super(message);
  }
}

/** Read a public page as plain text (no AI). Shared by fetch-program-page and the rules watcher. */
export async function fetchPage(url: string) {
  let res: Response;
  try {
    res = await ssrfSafeFetch(
      url,
      {
        headers: {
          "user-agent": "Mozilla/5.0 (compatible; DossierBot/1.0; +https://dossier-pied.vercel.app)",
          accept: "text/html,application/xhtml+xml,text/plain;q=0.9,*/*;q=0.5",
        },
        signal: AbortSignal.timeout(20_000),
      },
      { maxRedirects: 5 },
    );
  } catch (err) {
    throw new PageFetchError(
      `We couldn't open this page (${err instanceof Error ? err.message : "network error"}). Paste the program text instead.`,
      "fetch_failed",
      502,
    );
  }
  if (!res.ok)
    throw new PageFetchError(
      `The page answered with HTTP ${res.status}. It may need a login or block robots. Paste the program text instead.`,
      "fetch_failed",
      502,
    );
  const type = res.headers.get("content-type") ?? "";
  if (type.includes("application/pdf"))
    throw new PageFetchError("This link is a PDF, which Dossier can't read yet. Open it and paste the text instead.", "unsupported_type", 415);
  const buf = await res.arrayBuffer();
  if (buf.byteLength > MAX_BYTES)
    throw new PageFetchError("This page is too large to read. Paste the relevant text instead.", "too_large", 413);
  // Null characters are never meaningful in page text, and Postgres refuses them in JSON.
  const raw = new TextDecoder("utf-8").decode(buf).replace(/\u0000/g, "");
  const isHtml = type.includes("html") || /<html|<body/i.test(raw);
  const { title, text } = isHtml ? htmlToText(raw) : { title: "", text: raw.trim() };
  const links = isHtml ? extractLinks(raw, res.url || url) : [];
  if (text.length < 200)
    throw new PageFetchError(
      "This page has almost no readable text (it may load its content with JavaScript). Paste the program text instead.",
      "empty_page",
      422,
    );
  return { finalUrl: res.url || url, title, text, links, hash: await sha256Hex(text) };
}
