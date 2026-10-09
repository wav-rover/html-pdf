import type { ComponentType, ReactNode } from "react";
import { BookOpen, ListChecks, ListOrdered, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GuideContent } from "@/lib/guide-content";

/** Web rendering of a "fiche mémo". Pure markup: used by the public page and the editor preview. */
export default function GuideArticle({ content }: { content: GuideContent }) {
  const { title, subtitle, steps, checklist, warnings, glossary, source } = content;

  return (
    <article className="mx-auto max-w-2xl space-y-10 text-lg leading-relaxed">
      <header className="space-y-3 border-b pb-6">
        {subtitle !== "" && <p className="text-sm font-bold tracking-wide text-primary uppercase">{subtitle}</p>}
        <h1 className="font-heading text-3xl leading-tight font-bold text-balance sm:text-4xl">{title}</h1>
      </header>

      {steps.length > 0 && (
        <GuideSection title="L’essentiel" icon={ListOrdered} className="text-section-essentials">
          <ol className="space-y-4">
            {steps.map((step, index) => (
              <li key={index} className="flex gap-4">
                <span
                  aria-hidden
                  className="flex size-10 shrink-0 items-center justify-center rounded-full bg-section-essentials text-lg font-bold text-white"
                >
                  {index + 1}
                </span>
                <span className="pt-1">{step}</span>
              </li>
            ))}
          </ol>
        </GuideSection>
      )}

      {checklist.length > 0 && (
        <GuideSection title="À prévoir" icon={ListChecks} className="text-section-prepare">
          <ul className="space-y-2">
            {checklist.map((item, index) => (
              <li key={index}>
                <label className="flex cursor-pointer gap-3 rounded-lg border p-3 transition-colors has-checked:border-section-prepare/40 has-checked:bg-section-prepare/10">
                  <input type="checkbox" className="mt-1.5 size-5 shrink-0 accent-section-prepare" />
                  <span>{item}</span>
                </label>
              </li>
            ))}
          </ul>
        </GuideSection>
      )}

      {warnings.length > 0 && (
        <GuideSection title="Points de vigilance" icon={TriangleAlert} className="text-section-warning">
          <ul className="space-y-3 rounded-lg border border-section-warning/30 bg-section-warning/5 p-4" role="note">
            {warnings.map((warning, index) => (
              <li key={index} className="flex gap-3">
                <TriangleAlert aria-hidden className="mt-1.5 size-5 shrink-0 text-section-warning" />
                <span>{warning}</span>
              </li>
            ))}
          </ul>
        </GuideSection>
      )}

      {glossary.length > 0 && (
        <GuideSection title="À comprendre" icon={BookOpen} className="text-section-glossary">
          <dl className="divide-y rounded-lg border">
            {glossary.map(({ term, definition }, index) => (
              <div key={index} className="p-4">
                <dt className="font-bold first-letter:uppercase">{term}</dt>
                {definition !== "" && <dd className="text-muted-foreground first-letter:uppercase">{definition}</dd>}
              </div>
            ))}
          </dl>
        </GuideSection>
      )}

      {source !== "" && <footer className="border-t pt-4 text-sm text-muted-foreground">Source : {source}</footer>}
    </article>
  );
}

const GuideSection = ({
  title,
  icon: Icon,
  className,
  children,
}: {
  title: string;
  icon: ComponentType<{ className?: string }>;
  className: string;
  children: ReactNode;
}) => (
  <section className="space-y-4">
    <h2 className={cn("flex items-center gap-2 font-heading text-2xl font-bold", className)}>
      <Icon className="size-6" />
      {title}
    </h2>
    {children}
  </section>
);
