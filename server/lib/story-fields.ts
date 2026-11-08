import { z } from "zod";

export const storyFields = {
  title: z.string().min(2).max(120).describe('Short name, e.g. "Clinic test drive"'),
  situation: z.string().max(2000).nullable().describe("The context or problem, in the user's words"),
  action: z.string().max(2000).nullable().describe("What the user personally did"),
  result: z.string().max(2000).nullable().describe("What changed — numbers only if the user gave them"),
  themes: z
    .array(z.string().min(1).max(40))
    .max(8)
    .describe('Theme tags, e.g. ["leadership", "resilience", "community"]'),
};
