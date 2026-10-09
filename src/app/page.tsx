import Link from "next/link";
import { Search } from "lucide-react";
import CardGuide from "@/components/guide/CardGuide";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getPublishedGuides, toGuideContent } from "@/server/guides";

export default async function Home({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const query = ((await searchParams).q ?? "").trim();
  const guides = await getPublishedGuides(query || undefined);

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:py-16">
      <header className="mb-8 max-w-2xl space-y-3">
        <p className="text-sm font-bold tracking-wide text-primary uppercase">La Formation pour tous</p>
        <h1 className="font-heading text-4xl font-bold">Fiches pratiques</h1>
        <p className="text-lg text-muted-foreground">
          Des fiches simples pour réaliser vos démarches en ligne, étape par étape.
        </p>
      </header>

      <form role="search" className="mb-8 flex max-w-2xl gap-2">
        <Input
          name="q"
          defaultValue={query}
          placeholder="Rechercher une fiche (ex. CAF)"
          aria-label="Rechercher une fiche"
          className="h-12 text-base"
        />
        <Button type="submit" className="h-12 px-4">
          <Search />
          Rechercher
        </Button>
      </form>

      {guides.length === 0 ? (
        <p className="rounded-xl border border-dashed p-10 text-center text-lg text-muted-foreground">
          {query !== "" ? `Aucune fiche ne correspond à « ${query} ».` : "Aucune fiche publiée pour le moment."}
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {guides.map(({ id, slug, title, content }) => (
            <li key={id}>
              <CardGuide slug={slug} title={title} stepCount={toGuideContent(content).steps.length} />
            </li>
          ))}
        </ul>
      )}

      <footer className="mt-16 text-sm">
        <Link href="/admin" className="text-muted-foreground underline-offset-2 hover:underline">
          Espace admin
        </Link>
      </footer>
    </main>
  );
}
