import { getDocumentProxy } from "unpdf";
import type { GuideContent } from "./guide-content";

export type PdfLine = { text: string; size: number; y: number };

type SectionKey = "steps" | "checklist" | "warnings" | "glossary";

const SECTION_HEADINGS: Record<string, SectionKey> = {
  "l'essentiel": "steps",
  "a prevoir": "checklist",
  "points de vigilance": "warnings",
  "a comprendre": "glossary",
};

const BULLET = /^[•·]\s*/;
// Fragments whose baselines differ by less than this (in pt) belong to the same line.
const LINE_TOLERANCE = 2;

export const createGuideParseError = (message: string) =>
  Object.assign(new Error(message), { name: "GuideParseError" });

export const isGuideParseError = (error: unknown): error is Error =>
  error instanceof Error && error.name === "GuideParseError";

export const parseGuidePdf = async (data: Uint8Array): Promise<GuideContent> => {
  const lines = await extractLines(data).catch(() => {
    throw createGuideParseError("Impossible de lire ce PDF.");
  });
  return linesToGuide(lines);
};

/** Maps the fixed "fiche mémo" layout (lines sorted top to bottom) to its content. */
export const linesToGuide = (lines: PdfLine[]): GuideContent => {
  const titleSize = Math.max(...lines.map(({ size }) => size));
  const titleEnd = lines.findIndex(({ size }) => size < titleSize);
  const rest = titleEnd === -1 ? [] : lines.slice(titleEnd);
  const hasSubtitle = rest.length > 0 && !toSection(rest[0].text);
  const body = hasSubtitle ? rest.slice(1) : rest;
  const bodySize = mostFrequent(body.filter(({ text }) => BULLET.test(text)).map(({ size }) => size)) ?? 0;

  const items: Record<SectionKey, string[]> = { steps: [], checklist: [], warnings: [], glossary: [] };
  const sourceLines: string[] = [];
  let current: SectionKey | undefined;

  body.forEach(({ text, size }) => {
    const section = toSection(text);
    if (section) {
      current = section;
      return;
    }
    if (!current) return;
    if (size < bodySize) {
      sourceLines.push(text);
      return;
    }

    const list = items[current];
    if (BULLET.test(text) || list.length === 0) list.push(text.replace(BULLET, ""));
    else list[list.length - 1] = `${list[list.length - 1]} ${text}`;
  });

  if (!current) throw createGuideParseError("Ce PDF ne suit pas la trame des fiches mémo.");

  return {
    title: joinLines(lines.slice(0, titleEnd === -1 ? lines.length : titleEnd).map(({ text }) => text)),
    subtitle: hasSubtitle ? rest[0].text.trim() : "",
    steps: items.steps.map((item) => item.trim()),
    checklist: items.checklist.map((item) => item.trim()),
    warnings: items.warnings.map((item) => item.trim()),
    glossary: items.glossary.map(toGlossaryEntry),
    source: joinLines(sourceLines),
  };
};

const extractLines = async (data: Uint8Array): Promise<PdfLine[]> => {
  const pdf = await getDocumentProxy(data);
  const page = await pdf.getPage(1);
  const { items } = await page.getTextContent();

  const fragments = items
    .flatMap((item) =>
      "str" in item && item.str.trim() !== ""
        ? [{ text: item.str, size: Math.hypot(item.transform[0], item.transform[1]), x: item.transform[4], y: item.transform[5] }]
        : [],
    )
    .sort((a, b) => b.y - a.y || a.x - b.x);

  return fragments.reduce<PdfLine[]>((lines, { text, size, y }) => {
    const last = lines.at(-1);
    if (last && Math.abs(last.y - y) <= LINE_TOLERANCE) {
      last.text = `${last.text} ${text}`.replace(/\s+/g, " ");
      last.size = Math.max(last.size, size);
      return lines;
    }
    return [...lines, { text: text.replace(/\s+/g, " "), size, y }];
  }, []);
};

const normalize = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[’‘]/g, "'")
    .toLowerCase()
    .trim();

const toSection = (text: string): SectionKey | undefined => SECTION_HEADINGS[normalize(text)];

const joinLines = (texts: string[]) => texts.join(" ").replace(/\s+/g, " ").trim();

const mostFrequent = (values: number[]) => {
  const counts = values.reduce((map, value) => map.set(value, (map.get(value) ?? 0) + 1), new Map<number, number>());
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
};

const toGlossaryEntry = (item: string) => {
  const separator = item.indexOf(" = ");
  if (separator === -1) return { term: item.trim(), definition: "" };
  return { term: item.slice(0, separator).trim(), definition: item.slice(separator + 3).trim() };
};
