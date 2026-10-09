"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { guideContentSchema, type GuideContent } from "@/lib/guide-content";
import { isGuideParseError, parseGuidePdf } from "@/lib/parse-guide-pdf";
import slugify from "@/lib/slugify";
import { db } from "./db";
import requireAdmin from "./require-admin";

export type ImportState = { error?: string };

const MAX_PDF_BYTES = 5 * 1024 * 1024;

const statusSchema = z.enum(["DRAFT", "PUBLISHED"]);

/** Parses an uploaded PDF and stores it as a draft, then opens the editor. */
export async function importGuideAction(_state: ImportState, formData: FormData): Promise<ImportState> {
  await requireAdmin();

  const file = formData.get("pdf");
  if (!(file instanceof File) || file.size === 0 || file.type !== "application/pdf") {
    return { error: "Choisis un fichier PDF." };
  }
  if (file.size > MAX_PDF_BYTES) return { error: "Le PDF dépasse 5 Mo." };

  const pdf = new Uint8Array(await file.arrayBuffer());
  let content: GuideContent;
  try {
    // pdf.js may detach the buffer it reads, so it gets a copy.
    content = await parseGuidePdf(pdf.slice());
  } catch (error) {
    if (isGuideParseError(error)) return { error: error.message };
    throw error;
  }

  const guide = await db.guide.create({
    data: { slug: await getUniqueSlug(content.title), title: content.title, content, pdf, pdfName: file.name },
    select: { id: true },
  });

  revalidatePath("/admin");
  redirect(`/admin/fiches/${guide.id}`);
}

export async function updateGuideAction(id: string, content: GuideContent): Promise<{ error?: string }> {
  await requireAdmin();

  const parsed = guideContentSchema.safeParse(content);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Saisie invalide" };

  const guide = await db.guide.update({
    where: { id },
    data: { title: parsed.data.title, content: parsed.data },
    select: { slug: true },
  });

  revalidateGuide(guide.slug);
  return {};
}

export async function setGuideStatusAction(id: string, status: "DRAFT" | "PUBLISHED"): Promise<void> {
  await requireAdmin();

  const nextStatus = statusSchema.parse(status);
  const guide = await db.guide.update({
    where: { id },
    data: { status: nextStatus, publishedAt: nextStatus === "PUBLISHED" ? new Date() : null },
    select: { slug: true },
  });

  revalidateGuide(guide.slug);
}

export async function deleteGuideAction(id: string): Promise<void> {
  await requireAdmin();

  const guide = await db.guide.delete({ where: { id }, select: { slug: true } });
  revalidateGuide(guide.slug);
}

const getUniqueSlug = async (title: string) => {
  const base = slugify(title) || "fiche";
  const taken = await db.guide.findMany({ where: { slug: { startsWith: base } }, select: { slug: true } });
  const slugs = new Set(taken.map(({ slug }) => slug));

  let candidate = base;
  for (let suffix = 2; slugs.has(candidate); suffix++) candidate = `${base}-${suffix}`;
  return candidate;
};

const revalidateGuide = (slug: string) => {
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath(`/fiches/${slug}`);
};
