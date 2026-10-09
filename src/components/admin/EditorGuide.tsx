"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ExternalLink, EyeOff, Loader2, Monitor, Save, Send, Smartphone } from "lucide-react";
import { toast } from "sonner";
import FieldList from "@/components/admin/FieldList";
import GuideArticle from "@/components/guide/GuideArticle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import { fromGlossaryEntry, toGlossaryEntry, type GuideContent } from "@/lib/guide-content";
import { setGuideStatusAction, updateGuideAction } from "@/server/guide-actions";

type Props = {
  guide: { id: string; slug: string; status: "DRAFT" | "PUBLISHED"; content: GuideContent };
};

type ListField = "steps" | "checklist" | "warnings";

const LIST_FIELDS: { field: ListField; label: string }[] = [
  { field: "steps", label: "L’essentiel (étapes)" },
  { field: "checklist", label: "À prévoir" },
  { field: "warnings", label: "Points de vigilance" },
];

export default function EditorGuide({ guide }: Props) {
  const router = useRouter();
  const [content, setContent] = useState(guide.content);
  // Raw "term = definition" lines, parsed only for preview/save so typing isn't trimmed mid-word.
  const [glossaryLines, setGlossaryLines] = useState(guide.content.glossary.map(fromGlossaryEntry));
  const draft = { ...content, glossary: glossaryLines.map(toGlossaryEntry) };
  const [device, setDevice] = useState<"mobile" | "desktop">("desktop");
  const [isPending, startTransition] = useTransition();
  const isPublished = guide.status === "PUBLISHED";
  const isDirty = JSON.stringify(draft) !== JSON.stringify(guide.content);

  const setField = <K extends keyof GuideContent>(key: K, value: GuideContent[K]) =>
    setContent((current) => ({ ...current, [key]: value }));

  const save = async () => {
    const { error } = await updateGuideAction(guide.id, draft);
    if (error) toast.error(error);
    return !error;
  };

  const handleSave = () =>
    startTransition(async () => {
      if (!(await save())) return;
      toast.success("Fiche enregistrée");
      router.refresh();
    });

  const handleToggleStatus = () =>
    startTransition(async () => {
      if (!isPublished && isDirty && !(await save())) return;
      await setGuideStatusAction(guide.id, isPublished ? "DRAFT" : "PUBLISHED");
      toast.success(isPublished ? "Fiche repassée en brouillon" : "Fiche publiée");
      router.refresh();
    });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <Button asChild variant="ghost" size="lg" className="-ml-2.5">
          <Link href="/admin">
            <ArrowLeft />
            Fiches
          </Link>
        </Button>
        <Badge variant={isPublished ? "default" : "secondary"}>{isPublished ? "Publiée" : "Brouillon"}</Badge>
        {isDirty && <span className="text-sm text-muted-foreground">Modifications non enregistrées</span>}
        <div className="ml-auto flex flex-wrap gap-2">
          {isPublished && (
            <Button asChild variant="ghost" size="lg">
              <Link href={`/fiches/${guide.slug}`} target="_blank">
                <ExternalLink />
                Voir la page
              </Link>
            </Button>
          )}
          <Button variant="outline" size="lg" disabled={isPending || !isDirty} onClick={handleSave}>
            {isPending ? <Loader2 className="animate-spin" /> : <Save />}
            Enregistrer
          </Button>
          <Button variant={isPublished ? "secondary" : "default"} size="lg" disabled={isPending} onClick={handleToggleStatus}>
            {isPublished ? <EyeOff /> : <Send />}
            {isPublished ? "Dépublier" : isDirty ? "Enregistrer et publier" : "Publier"}
          </Button>
        </div>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-2">
        <Tabs defaultValue="edit" className="rounded-xl border bg-background p-4">
          <TabsList className="w-full">
            <TabsTrigger value="edit">Modifier</TabsTrigger>
            <TabsTrigger value="pdf">PDF original</TabsTrigger>
          </TabsList>

          <TabsContent value="edit" className="mt-4 space-y-6">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Titre</Label>
                <Input id="title" value={content.title} onChange={(event) => setField("title", event.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="subtitle">Sous-titre</Label>
                <Input id="subtitle" value={content.subtitle} onChange={(event) => setField("subtitle", event.target.value)} />
              </div>
            </div>
            <Separator />
            {LIST_FIELDS.map(({ field, label }) => (
              <FieldList key={field} label={label} items={content[field]} onChange={(items) => setField(field, items)} />
            ))}
            <FieldList
              label="À comprendre (glossaire)"
              hint="Format : terme = définition"
              items={glossaryLines}
              onChange={setGlossaryLines}
            />
            <Separator />
            <div className="grid gap-2">
              <Label htmlFor="source">Source</Label>
              <Input id="source" value={content.source} onChange={(event) => setField("source", event.target.value)} />
            </div>
          </TabsContent>

          <TabsContent value="pdf" className="mt-4">
            <iframe title="PDF original" src={`/fiches/${guide.slug}/pdf`} className="h-[80vh] w-full rounded-md border" />
          </TabsContent>
        </Tabs>

        <section aria-label="Aperçu" className="space-y-3 lg:sticky lg:top-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold">Aperçu de la page</h2>
            <ToggleGroup
              type="single"
              variant="outline"
              value={device}
              onValueChange={(value) => value !== "" && setDevice(value as "mobile" | "desktop")}
            >
              <ToggleGroupItem value="mobile" aria-label="Aperçu mobile">
                <Smartphone />
              </ToggleGroupItem>
              <ToggleGroupItem value="desktop" aria-label="Aperçu ordinateur">
                <Monitor />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
          <div
            className={cn(
              "mx-auto overflow-y-auto rounded-xl border bg-background lg:max-h-[calc(100vh-7rem)]",
              device === "mobile" ? "w-[375px] max-w-full rounded-[2rem] border-4 px-4 py-6" : "w-full p-6 sm:p-10",
            )}
          >
            <GuideArticle content={draft} />
          </div>
        </section>
      </div>
    </div>
  );
}
