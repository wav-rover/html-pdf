"use client";

import { useActionState, useRef, useState, type DragEvent } from "react";
import { FileText, Loader2, Upload } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { importGuideAction, type ImportState } from "@/server/guide-actions";

export default function FormImportGuide() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState("");
  // React resets the form after the action, so the displayed file name is reset too.
  const [state, formAction, isPending] = useActionState<ImportState, FormData>(async (previous, formData) => {
    const result = await importGuideAction(previous, formData);
    setFileName("");
    return result;
  }, {});
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(false);
    if (!inputRef.current || event.dataTransfer.files.length === 0) return;
    inputRef.current.files = event.dataTransfer.files;
    setFileName(event.dataTransfer.files[0].name);
  };

  return (
    <form action={formAction} className="space-y-4">
      <label
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed bg-background p-10 text-center transition-colors hover:border-primary/50",
          isDragging && "border-primary bg-primary/5",
        )}
      >
        {fileName !== "" ? <FileText className="size-10 text-primary" /> : <Upload className="size-10 text-muted-foreground" />}
        <span className="font-medium">{fileName !== "" ? fileName : "Glisse un PDF ici ou clique pour choisir"}</span>
        <span className="text-sm text-muted-foreground">PDF uniquement, 5 Mo maximum</span>
        <input
          ref={inputRef}
          type="file"
          name="pdf"
          accept="application/pdf"
          required
          className="sr-only"
          onChange={(event) => setFileName(event.target.files?.[0]?.name ?? "")}
        />
      </label>

      {state.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      <Button type="submit" size="lg" className="w-full" disabled={isPending || fileName === ""}>
        {isPending && <Loader2 className="animate-spin" />}
        {isPending ? "Analyse du PDF…" : "Importer et vérifier"}
      </Button>
    </form>
  );
}
