import Link from "next/link";
import { FileUp } from "lucide-react";
import MenuGuideActions from "@/components/admin/MenuGuideActions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getAllGuides } from "@/server/guides";

export const metadata = { title: "Admin" };

const dateFormat = new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" });

export default async function AdminPage() {
  const guides = await getAllGuides();

  if (guides.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed bg-background p-12 text-center">
        <h1 className="text-2xl font-bold">Aucune fiche pour l’instant</h1>
        <p className="text-muted-foreground">Importe une fiche mémo PDF pour la transformer en page web.</p>
        <Button asChild size="lg">
          <Link href="/admin/import">
            <FileUp />
            Importer une fiche
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Fiches ({guides.length})</h1>
      <div className="rounded-xl border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-4">Titre</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="hidden md:table-cell">Mise à jour</TableHead>
              <TableHead className="pr-4 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {guides.map(({ id, slug, title, status, updatedAt }) => (
              <TableRow key={id}>
                <TableCell className="pl-4 font-medium whitespace-normal">
                  <Link href={`/admin/fiches/${id}`} className="hover:underline">
                    {title}
                  </Link>
                </TableCell>
                <TableCell>
                  <Badge variant={status === "PUBLISHED" ? "default" : "secondary"}>
                    {status === "PUBLISHED" ? "Publiée" : "Brouillon"}
                  </Badge>
                </TableCell>
                <TableCell className="hidden text-muted-foreground md:table-cell">{dateFormat.format(updatedAt)}</TableCell>
                <TableCell className="pr-4">
                  <MenuGuideActions id={id} slug={slug} status={status} title={title} showEdit />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
