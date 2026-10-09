"use client";

import { ArrowDown, ArrowUp, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
  hint?: string;
};

/** Editable list of bullets: edit, add, remove and reorder. */
export default function FieldList({ label, items, onChange, hint }: Props) {
  const update = (index: number, value: string) => onChange(items.map((item, i) => (i === index ? value : item)));
  const remove = (index: number) => onChange(items.filter((_, i) => i !== index));
  const move = (index: number, offset: number) => {
    const next = [...items];
    [next[index], next[index + offset]] = [next[index + offset], next[index]];
    onChange(next);
  };

  return (
    <fieldset className="space-y-2">
      <legend className="mb-2 flex w-full items-center justify-between">
        <Label asChild>
          <span>{label}</span>
        </Label>
        <span className="text-xs text-muted-foreground">{items.length}</span>
      </legend>

      {items.length === 0 && (
        <p className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
          Section vide : elle ne sera pas affichée sur la page.
        </p>
      )}

      <ol className="space-y-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-start gap-1">
            <span className="w-5 pt-2 text-right text-xs text-muted-foreground tabular-nums">{index + 1}.</span>
            <Textarea
              value={item}
              rows={1}
              aria-label={`${label} ${index + 1}`}
              onChange={(event) => update(index, event.target.value)}
              className="min-h-9 flex-1 resize-y"
            />
            <div className="flex">
              <Button type="button" variant="ghost" size="icon" disabled={index === 0} onClick={() => move(index, -1)} aria-label="Monter">
                <ArrowUp />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={index === items.length - 1}
                onClick={() => move(index, 1)}
                aria-label="Descendre"
              >
                <ArrowDown />
              </Button>
              <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} aria-label="Supprimer la ligne">
                <X />
              </Button>
            </div>
          </li>
        ))}
      </ol>

      <div className="flex items-center justify-between gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => onChange([...items, ""])}>
          <Plus />
          Ajouter
        </Button>
        {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
      </div>
    </fieldset>
  );
}
