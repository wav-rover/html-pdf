import { notFound } from "next/navigation";
import EditorGuide from "@/components/admin/EditorGuide";
import { getGuideById, toGuideContent } from "@/server/guides";

export const metadata = { title: "Modifier une fiche" };

export default async function EditGuidePage({ params }: { params: Promise<{ id: string }> }) {
  const guide = await getGuideById((await params).id);
  if (!guide) notFound();

  return (
    <EditorGuide
      key={guide.updatedAt.toISOString()}
      guide={{ id: guide.id, slug: guide.slug, status: guide.status, content: toGuideContent(guide.content) }}
    />
  );
}
