import type { ReactNode } from "react";
import Link from "next/link";
import { ExternalLink, FileUp } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-muted/40">
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-4 py-3">
          <Link href="/admin" className="mr-auto text-lg font-bold">
            Fiches pratiques <span className="font-normal text-muted-foreground">· admin</span>
          </Link>
          <Button asChild size="lg">
            <Link href="/admin/import">
              <FileUp />
              Importer
            </Link>
          </Button>
          <Button asChild variant="ghost" size="lg">
            <Link href="/" target="_blank">
              <ExternalLink />
              Voir le site
            </Link>
          </Button>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-4 py-8">{children}</div>
    </div>
  );
}
