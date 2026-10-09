import { auth } from "@/server/auth";
import { getGuidePdfBySlug } from "@/server/guides";
import { isAdmin } from "@/server/roles";

/** Serves the original PDF: published guides for everyone, drafts for admins only. */
export const GET = async (_request: Request, { params }: { params: Promise<{ slug: string }> }) => {
  const guide = await getGuidePdfBySlug((await params).slug);
  const canRead = guide && (guide.status === "PUBLISHED" || isAdmin((await auth())?.user));
  if (!canRead) return new Response("Fiche introuvable", { status: 404 });

  return new Response(Buffer.from(guide.pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename*=UTF-8''${encodeURIComponent(guide.pdfName)}`,
    },
  });
};
