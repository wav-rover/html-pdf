import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Download } from "lucide-react";
import ButtonPrint from "@/components/guide/ButtonPrint";
import GuideArticle from "@/components/guide/GuideArticle";
import { Button } from "@/components/ui/button";
import { getPublishedGuideBySlug, toGuideContent } from "@/server/guides";

type Props = { params: Promise<{ slug: string }> };

export const generateMetadata = async ({ params }: Props): Promise<Metadata> => {
  const guide = await getPublishedGuideBySlug((await params).slug);
  return { title: guide?.title ?? "Fiche introuvable" };
};

export default async function GuidePage({ params }: Props) {
  const { slug } = await params;
  const guide = await getPublishedGuideBySlug(slug);
  if (!guide) notFound();

  return (
    <main className="px-4 py-6 sm:py-10">
      <nav className="mx-auto mb-8 flex max-w-2xl flex-wrap items-center justify-between gap-3 print:hidden">
        <Button asChild variant="ghost" size="lg" className="-ml-2.5">
          <Link href="/">
            <ArrowLeft />
            Toutes les fiches
          </Link>
        </Button>
        <div className="flex gap-2">
          <ButtonPrint />
          <Button asChild variant="outline" size="lg">
            <a href={`/fiches/${slug}/pdf`} download>
              <Download />
              PDF
            </a>
          </Button>
        </div>
      </nav>
      <GuideArticle content={toGuideContent(guide.content)} />
    </main>
  );
}
