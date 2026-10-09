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

/** Glossary bullets are written "term = definition" in the PDFs and in the editor. */
export const toGlossaryEntry = (item: string) => {
  const separator = item.indexOf(" = ");
  if (separator === -1) return { term: item.trim(), definition: "" };
  return { term: item.slice(0, separator).trim(), definition: item.slice(separator + 3).trim() };
};

export const fromGlossaryEntry = ({ term, definition }: { term: string; definition: string }) =>
  definition === "" ? term : `${term} = ${definition}`;
