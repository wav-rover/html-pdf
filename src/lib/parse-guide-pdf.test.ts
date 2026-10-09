import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { isGuideParseError, linesToGuide, parseGuidePdf, type PdfLine } from "./parse-guide-pdf";

const FIXTURE = new URL("./__fixtures__/tuto-peda-caf.pdf", import.meta.url);

const toLines = (spec: [string, number][]): PdfLine[] =>
  spec.map(([text, size], index) => ({ text, size, y: 800 - index * 20 }));

const header: [string, number][] = [
  ["Titre de la fiche", 18],
  ["Fiche mémo — La Formation pour tous", 12],
];

const catchError = (run: () => unknown) => {
  try {
    run();
  } catch (error) {
    return error;
  }
  throw new Error("expected an error");
};

describe("parseGuidePdf", () => {
  it("extracts every field of the CAF guide", async () => {
    const data = new Uint8Array(await readFile(FIXTURE));

    expect(await parseGuidePdf(data)).toEqual({
      title: "Se connecter à son compte CAF",
      subtitle: "Fiche mémo — La Formation pour tous",
      steps: [
        "Aller sur le site de la CAF et cliquer sur Mon Compte.",
        "Saisir les 13 chiffres de son numéro de sécurité sociale.",
        "Entrer son mot de passe puis cliquer sur Se connecter.",
        "Accéder à la page d’accueil du compte.",
        "Ouvrir les rubriques pour voir ses paiements et ses démarches.",
      ],
      checklist: [
        "Avoir son numéro de sécurité sociale à portée de main.",
        "Connaître son mot de passe CAF ou pouvoir le récupérer.",
        "Être dans un endroit calme pour saisir ses informations.",
      ],
      warnings: [
        "Vérifier les chiffres du numéro de sécurité sociale avant de valider.",
        "Ne pas entrer son mot de passe sur un ordinateur partagé non sécurisé.",
        "Se déconnecter après consultation surtout sur un poste public.",
      ],
      glossary: [
        { term: "Mon Compte", definition: "espace en ligne pour suivre son dossier CAF." },
        { term: "numero de securite sociale", definition: "identifiant utilisé pour se connecter." },
        { term: "mot de passe", definition: "code secret pour protéger l’accès au compte." },
      ],
      source: "Vidéo par La Caf - Officiel",
    });
  });

  it("rejects bytes that are not a PDF", async () => {
    const error = await parseGuidePdf(new Uint8Array([1, 2, 3])).catch((caught: unknown) => caught);

    expect(isGuideParseError(error)).toBe(true);
    expect((error as Error).message).toBe("Impossible de lire ce PDF.");
  });
});

describe("linesToGuide", () => {
  it("joins a bullet wrapped over several lines", () => {
    const guide = linesToGuide(
      toLines([...header, ["L'essentiel", 13], ["•  Première partie", 10], ["suite du texte", 10]]),
    );

    expect(guide.steps).toEqual(["Première partie suite du texte"]);
  });

  it("joins a title wrapped over two lines", () => {
    const guide = linesToGuide(
      toLines([
        ["Se connecter à son", 18],
        ["compte CAF", 18],
        ["Fiche mémo", 12],
        ["L'essentiel", 13],
        ["•  Étape", 10],
      ]),
    );

    expect(guide.title).toBe("Se connecter à son compte CAF");
    expect(guide.subtitle).toBe("Fiche mémo");
  });

  it("recognises headings regardless of apostrophe, accents and case", () => {
    const guide = linesToGuide(
      toLines([...header, ["L’essentiel", 13], ["•  Étape", 10], ["A PREVOIR", 13], ["•  Carte vitale", 10]]),
    );

    expect(guide.steps).toEqual(["Étape"]);
    expect(guide.checklist).toEqual(["Carte vitale"]);
  });

  it("keeps a glossary bullet without '=' as a term with an empty definition", () => {
    const guide = linesToGuide(toLines([...header, ["À comprendre", 13], ["•  FranceConnect", 10]]));

    expect(guide.glossary).toEqual([{ term: "FranceConnect", definition: "" }]);
  });

  it("returns an empty list for a missing section", () => {
    const guide = linesToGuide(toLines([...header, ["L'essentiel", 13], ["•  Étape", 10]]));

    expect(guide.warnings).toEqual([]);
    expect(guide.source).toBe("");
  });

  it("reads the smaller footer line as the source", () => {
    const guide = linesToGuide(
      toLines([...header, ["Points de vigilance", 13], ["•  Attention", 10], ["Vidéo par La Caf", 9]]),
    );

    expect(guide.warnings).toEqual(["Attention"]);
    expect(guide.source).toBe("Vidéo par La Caf");
  });

  it("fails when no known section is found", () => {
    const error = catchError(() => linesToGuide(toLines([...header, ["Un autre document", 10]])));

    expect(isGuideParseError(error)).toBe(true);
    expect((error as Error).message).toBe("Ce PDF ne suit pas la trame des fiches mémo.");
  });
});
