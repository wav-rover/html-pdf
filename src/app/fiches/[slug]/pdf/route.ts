import { getGuidePdfBySlug } from "@/server/guides";

/** Serves the original PDF (drafts included, so the editor can show it). */
export const GET = async (_request: Request, { params }: { params: Promise<{ slug: string }> }) => {
  const guide = await getGuidePdfBySlug((await params).slug);
  if (!guide) return new Response("Fiche introuvable", { status: 404 });

  return new Response(Buffer.from(guide.pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename*=UTF-8''${encodeURIComponent(guide.pdfName)}`,
    },
  });
};
