import { guideContentSchema, type GuideContent } from "@/lib/guide-content";
import { db } from "./db";

// Never select the PDF bytes unless they are actually served.
const guideSelect = {
  id: true,
  slug: true,
  title: true,
  status: true,
  content: true,
  publishedAt: true,
  updatedAt: true,
} as const;

export const toGuideContent = (json: unknown): GuideContent => guideContentSchema.parse(json);

export const getPublishedGuides = (query?: string) =>
  db.guide.findMany({
    where: {
      status: "PUBLISHED",
      ...(query ? { title: { contains: query, mode: "insensitive" as const } } : {}),
    },
    select: guideSelect,
    orderBy: { title: "asc" },
  });

export const getPublishedGuideBySlug = (slug: string) =>
  db.guide.findFirst({ where: { slug, status: "PUBLISHED" }, select: guideSelect });

export const getAllGuides = () => db.guide.findMany({ select: guideSelect, orderBy: { updatedAt: "desc" } });

export const getGuideById = (id: string) => db.guide.findUnique({ where: { id }, select: guideSelect });

export const getGuidePdfBySlug = (slug: string) =>
  db.guide.findUnique({ where: { slug }, select: { pdf: true, pdfName: true } });
