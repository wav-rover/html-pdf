import FormImportGuide from "@/components/admin/FormImportGuide";

export const metadata = { title: "Importer une fiche" };

export default function ImportPage() {
  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">Importer une fiche</h1>
        <p className="text-muted-foreground">
          Dépose une fiche mémo PDF. Son contenu est extrait automatiquement, tu pourras le vérifier avant de publier.
        </p>
      </div>
      <FormImportGuide />
    </div>
  );
}
