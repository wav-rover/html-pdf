import { describe, expect, it } from "vitest";
import slugify from "./slugify";

describe("slugify", () => {
  it("lowercases and strips accents", () => {
    expect(slugify("Se connecter à son compte CAF")).toBe("se-connecter-a-son-compte-caf");
  });

  it("collapses punctuation and trims dashes", () => {
    expect(slugify("  L’essentiel — été !  ")).toBe("l-essentiel-ete");
  });
});
