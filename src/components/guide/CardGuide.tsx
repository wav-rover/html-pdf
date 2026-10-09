import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function CardGuide({ slug, title, stepCount }: { slug: string; title: string; stepCount: number }) {
  return (
    <Link href={`/fiches/${slug}`} className="group block h-full rounded-xl focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none">
      <Card className="h-full transition-shadow group-hover:shadow-md group-hover:ring-primary/40">
        <CardHeader className="grid-cols-[1fr_auto] items-center gap-3">
          <div className="space-y-1">
            <CardTitle className="text-lg font-bold">{title}</CardTitle>
            <CardDescription>{stepCount > 1 ? `${stepCount} étapes` : `${stepCount} étape`}</CardDescription>
          </div>
          <ChevronRight className="size-5 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
        </CardHeader>
      </Card>
    </Link>
  );
}
