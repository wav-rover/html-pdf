import { z } from "zod";

const text = z.string().trim();
// Blank rows left over in the editor are dropped rather than rejected.
const list = z.array(text).transform((items) => items.filter((item) => item !== ""));

export const guideContentSchema = z.object({
  title: text.min(1, "Le titre est obligatoire"),
  subtitle: text,
  steps: list,
  checklist: list,
  warnings: list,
  glossary: z
    .array(z.object({ term: text, definition: text }))
    .transform((entries) => entries.filter(({ term }) => term !== "")),
  source: text,
});

export type GuideContent = z.infer<typeof guideContentSchema>;
