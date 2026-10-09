"use client";

import { useEffect, useId, useState, type ReactNode } from "react";
import { BookOpen, Check, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import styles from "./GuideReadingView.module.css";

type ReadingPreferences = { colorblind: boolean; dyslexic: boolean };

const STORAGE_KEY = "fiches:reading-preferences";
const READING_MODES = [
  {
    key: "colorblind",
    label: "Mode daltonien",
    description: "Couleurs contrastées et repères visuels distincts.",
    icon: Eye,
  },
  {
    key: "dyslexic",
    label: "Mode dyslexique",
    description: "Texte agrandi et espacement renforcé pour la lecture.",
    icon: BookOpen,
  },
] as const;

/** Only the public guide page mounts this wrapper; the editor preview stays independent. */
export default function GuideReadingView({ navigation, children }: { navigation: ReactNode; children: ReactNode }) {
  const optionsId = useId();
  const [preferences, setPreferences] = useState<ReadingPreferences>({ colorblind: false, dyslexic: false });

  useEffect(() => {
    try {
      const saved: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "null");
      if (typeof saved !== "object" || saved === null) return;
      const values = saved as Record<string, unknown>;
      setPreferences({ colorblind: values.colorblind === true, dyslexic: values.dyslexic === true });
    } catch {
      // Reading modes also work when browser storage is unavailable or malformed.
    }
  }, []);

  const toggleMode = (key: keyof ReadingPreferences) => {
    const next = { ...preferences, [key]: !preferences[key] };
    setPreferences(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Keep the current reading preference even when it cannot be saved.
    }
  };

  return (
    <main
      className={`${styles.view} px-4 py-6 sm:py-10`}
      data-colorblind={preferences.colorblind}
      data-dyslexic={preferences.dyslexic}
    >
      {navigation}
      <section aria-labelledby={optionsId} className="mx-auto mb-8 max-w-2xl rounded-xl border bg-background p-4 print:hidden">
        <h2 id={optionsId} className="text-lg font-bold">Options de lecture</h2>
        <p className="mt-1 text-sm text-muted-foreground">Les deux modes peuvent être combinés.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {READING_MODES.map(({ key, label, description, icon: Icon }) => (
            <div key={key} className="min-w-0">
              <Button
                type="button"
                variant="outline"
                aria-label={label}
                aria-pressed={preferences[key]}
                aria-describedby={`${optionsId}-${key}`}
                onClick={() => toggleMode(key)}
                className={`${styles.modeButton} h-auto min-h-11 w-full justify-between gap-3 px-3 py-2 text-left whitespace-normal`}
              >
                <span className="flex min-w-0 items-center gap-2">
                  <Icon aria-hidden="true" />
                  <span>{label}</span>
                </span>
                <span className="flex shrink-0 items-center gap-1 text-xs">
                  {preferences[key] && <Check aria-hidden="true" />}
                  {preferences[key] ? "Activé" : "Désactivé"}
                </span>
              </Button>
              <p id={`${optionsId}-${key}`} className="mt-2 text-sm text-muted-foreground">{description}</p>
            </div>
          ))}
        </div>
      </section>
      {children}
    </main>
  );
}
