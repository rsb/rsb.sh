import { defineCollection, reference } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

// The entry id is the single canonical identity for both collections. Preserving
// the filename stem verbatim makes the id = the on-disk name: an ADR file
// `0003-rsb-is-the-opinion.md` has id `0003-rsb-is-the-opinion` (what
// `reference("adrs")` resolves and what `/adr/[slug]` routes on), and a standard
// `STD-NAMING.md` has id `STD-NAMING` (what crates cite, case-preserving through
// canonicalUrl). No second identity namespace, no frontmatter `id` field.
// Both collections are FLAT (non-recursive `[!_]*.md`): the entry id must equal a
// bare filename stem so it matches the single-segment routes (`/adr/[slug]`,
// `/std/[id]`) AND the flat directory scan in scripts/check-corpus.ts. A recursive
// `**/` pattern would admit `sub/0002-foo` ids that the routes can't serve and the
// integrity checker would silently skip — the loader and checker must agree.
const keepStem = ({ entry }: { entry: string }) => entry.replace(/\.md$/i, "");

const reversibility = z.enum(["bedrock", "hard-to-reverse", "reversible"]);

// Frontmatter shared by every ADR regardless of status. `supersedes` is allowed
// on drafts too, so a draft replacement can declare its intent before acceptance.
const adrShared = {
  title: z.string(),
  reversibility,
  supersedes: z.array(reference("adrs")).optional(),
};

// Accepted/deprecated ADRs carry the decision-bearing fields drafts lack: a
// number (canonical identity, assigned at acceptance), the acceptance date, the
// corpus version, and the `drives` edges down to the standards they govern.
// "superseded" is NOT a status — it is a display state derived from incoming
// `supersedes` links, so an old ADR is never edited to mark itself superseded.
const numbered = (status: "accepted" | "deprecated") =>
  z.object({
    status: z.literal(status),
    ...adrShared,
    number: z.number().int().positive(),
    dateAccepted: z.coerce.date(),
    corpusVersion: z.number().int().positive(),
    drives: z.array(reference("standards")).optional(),
  });

const adrs = defineCollection({
  loader: glob({
    pattern: "[!_]*.md",
    base: "./src/content/adrs",
    generateId: keepStem,
  }),
  schema: z.discriminatedUnion("status", [
    z.object({ status: z.literal("draft"), ...adrShared }),
    numbered("accepted"),
    numbered("deprecated"),
  ]),
});

// Standards are simpler by design: no status/lifecycle union (a standard exists
// once published; revision is a corpus bump, not a state machine). `sourceAdr`
// is required — an uncited standard is unrepresentable. The id format/uniqueness,
// reciprocal `drives`↔`sourceAdr` agreement, and source-must-be-accepted
// invariants that Zod cannot express are enforced by scripts/check-corpus.ts.
const standards = defineCollection({
  loader: glob({
    pattern: "[!_]*.md",
    base: "./src/content/standards",
    generateId: keepStem,
  }),
  schema: z.object({
    title: z.string(),
    sourceAdr: reference("adrs"),
    corpusVersion: z.number().int().positive(),
  }),
});

export const collections = { adrs, standards };
