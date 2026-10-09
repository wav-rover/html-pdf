import { z } from "zod";

const text = z.string().trim();

export const guideContentSchema = z.object({
  title: text.min(1, "Le titre est obligatoire"),
  subtitle: text,
  steps: z.array(text),
  checklist: z.array(text),
  warnings: z.array(text),
  glossary: z.array(z.object({ term: text, definition: text })),
  source: text,
});

export type GuideContent = z.infer<typeof guideContentSchema>;
