"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { EyeOff, ExternalLink, Pencil, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { deleteGuideAction, setGuideStatusAction } from "@/server/guide-actions";

type Props = {
  id: string;
  slug: string;
  title: string;
  status: "DRAFT" | "PUBLISHED";
  showEdit?: boolean;
  redirectAfterDelete?: string;
};

export default function MenuGuideActions({ id, slug, title, status, showEdit = false, redirectAfterDelete }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isPublished = status === "PUBLISHED";

  const toggleStatus = () =>
    startTransition(async () => {
      await setGuideStatusAction(id, isPublished ? "DRAFT" : "PUBLISHED");
      toast.success(isPublished ? "Fiche repassée en brouillon" : "Fiche publiée");
      router.refresh();
    });

  const remove = () =>
    startTransition(async () => {
      await deleteGuideAction(id);
      toast.success("Fiche supprimée");
      if (redirectAfterDelete) router.push(redirectAfterDelete);
      else router.refresh();
    });

  return (
    <div className="flex flex-wrap justify-end gap-1">
      {showEdit && (
        <Button asChild variant="ghost" size="sm">
          <Link href={`/admin/fiches/${id}`}>
            <Pencil />
            Modifier
          </Link>
        </Button>
      )}
      {isPublished && (
        <Button asChild variant="ghost" size="sm">
          <Link href={`/fiches/${slug}`} target="_blank">
            <ExternalLink />
            Voir
          </Link>
        </Button>
      )}
      <Button variant={isPublished ? "ghost" : "secondary"} size="sm" disabled={isPending} onClick={toggleStatus}>
        {isPublished ? <EyeOff /> : <Send />}
        {isPublished ? "Dépublier" : "Publier"}
      </Button>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="ghost" size="sm" disabled={isPending} aria-label={`Supprimer « ${title} »`}>
            <Trash2 className="text-destructive" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette fiche ?</AlertDialogTitle>
            <AlertDialogDescription>
              « {title} » et son PDF seront supprimés définitivement. Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={remove}>
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
