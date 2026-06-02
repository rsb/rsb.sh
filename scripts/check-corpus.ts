// Content-integrity checks for the adrs + standards collections.
//
// Zod (src/content.config.ts) validates each entry in isolation and `reference()`
// guarantees a cited id EXISTS — but neither can see ACROSS entries. This script
// enforces the cross-entry invariants that make the decision corpus coherent, and
// FAILS THE BUILD when they break. Same pattern as scripts/gen-headers.ts: a Bun
// script, run before `astro build` (see package.json `prebuild`/`check:corpus`).
//
// Identity model (mirrors content.config.ts `keepStem`): an entry's id is its
// filename stem. An accepted/deprecated ADR is `NNNN-slug.md` (id `NNNN-slug`); a
// standard is `STD-NAME.md` (id `STD-NAME`). Frontmatter `reference()` fields hold
// those ids verbatim — `sourceAdr` a string id, `supersedes`/`drives` arrays of
// string ids.
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const ADRS_DIR = "src/content/adrs";
const STANDARDS_DIR = "src/content/standards";
const STD_ID = /^STD-[A-Z0-9-]+$/;
const ADR_NUMBERED_STEM = /^(\d+)-/; // accepted/deprecated filenames lead with the number

const errors: string[] = [];
const warnings: string[] = [];

interface Entry {
  id: string; // filename stem = canonical identity
  data: Record<string, unknown>;
}

// Collect non-template (`_`-prefixed are excluded) markdown entries from a
// collection dir, parsing frontmatter with Bun.YAML. Mirrors the glob loader's
// `[!_]*.md` pattern. Missing dir → empty collection (a valid launch state).
function load(dir: string): Entry[] {
  let names: string[];
  try {
    names = readdirSync(dir);
  } catch {
    return [];
  }
  const entries: Entry[] = [];
  for (const name of names) {
    if (!name.endsWith(".md") || name.startsWith("_")) continue;
    const raw = readFileSync(join(dir, name), "utf8");
    const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!match) {
      errors.push(`${join(dir, name)}: no frontmatter block`);
      continue;
    }
    let data: Record<string, unknown>;
    try {
      data = (Bun.YAML.parse(match[1]) ?? {}) as Record<string, unknown>;
    } catch (e) {
      errors.push(`${join(dir, name)}: unparseable frontmatter — ${(e as Error).message}`);
      continue;
    }
    entries.push({ id: name.replace(/\.md$/i, ""), data });
  }
  return entries;
}

const adrs = load(ADRS_DIR);
const standards = load(STANDARDS_DIR);

const adrById = new Map(adrs.map((a) => [a.id, a]));
const standardById = new Map(standards.map((s) => [s.id, s]));
const isDraft = (a: Entry) => a.data.status === "draft";
const asIds = (v: unknown): string[] => (Array.isArray(v) ? v.map(String) : []);

// 1. ADR identity agreement — the NNNN- prefix of an accepted/deprecated filename
//    must equal its frontmatter `number` (the number IS the canonical identity).
// 2. ADR number uniqueness — no two non-draft ADRs share a number.
const numberOwners = new Map<number, string>();
for (const adr of adrs) {
  if (isDraft(adr)) continue; // drafts carry no number
  const stemNum = adr.id.match(ADR_NUMBERED_STEM)?.[1];
  const fmNum = adr.data.number;
  if (stemNum === undefined) {
    errors.push(`adr ${adr.id}: ${adr.data.status} ADR filename must start with its number (NNNN-slug)`);
  } else if (typeof fmNum !== "number" || Number.parseInt(stemNum, 10) !== fmNum) {
    errors.push(`adr ${adr.id}: filename number ${stemNum} ≠ frontmatter number ${String(fmNum)}`);
  }
  if (typeof fmNum === "number") {
    const owner = numberOwners.get(fmNum);
    if (owner) errors.push(`adr number ${fmNum} used by both ${owner} and ${adr.id}`);
    else numberOwners.set(fmNum, adr.id);
  }
}

// 3. Standard id format/uniqueness — filename (= entry id) matches ^STD-…$. Astro
//    guarantees id uniqueness within a collection; this adds the format gate.
for (const std of standards) {
  if (!STD_ID.test(std.id)) {
    errors.push(`standard ${std.id}: id must match ${STD_ID} (e.g. STD-NAMING)`);
  }
}

// 4. Reciprocal citation — every adr.drives → STD-X must be matched by
//    STD-X.sourceAdr → that ADR, and vice-versa. Both ends must agree.
for (const adr of adrs) {
  for (const stdId of asIds(adr.data.drives)) {
    const std = standardById.get(stdId);
    if (!std) {
      errors.push(`adr ${adr.id}: drives "${stdId}" but no such standard`);
    } else if (std.data.sourceAdr !== adr.id) {
      errors.push(`adr ${adr.id}: drives "${stdId}", but ${stdId}.sourceAdr = "${String(std.data.sourceAdr)}" (one-way)`);
    }
  }
}

// 5. Source must be accepted — every standard.sourceAdr resolves to a non-draft
//    ADR (a standard is published only when its driving ADR is accepted). Also
//    closes the reverse leg of the reciprocity check.
for (const std of standards) {
  const srcId = std.data.sourceAdr;
  if (typeof srcId !== "string") {
    errors.push(`standard ${std.id}: missing sourceAdr`);
    continue;
  }
  const src = adrById.get(srcId);
  if (!src) {
    errors.push(`standard ${std.id}: sourceAdr "${srcId}" resolves to no ADR`);
  } else if (isDraft(src)) {
    errors.push(`standard ${std.id}: sourceAdr "${srcId}" is a draft ADR (must be accepted)`);
  } else if (!asIds(src.data.drives).includes(std.id)) {
    errors.push(`standard ${std.id}: sourceAdr "${srcId}" does not list it in drives (one-way)`);
  }
}

// 6. (warn) Corpus coherence — flag mismatched corpusVersions across the set.
//    A stopgap until corpus.json owns the canonical clock (out of scope here).
const versions = new Set<number>();
for (const e of [...adrs, ...standards]) {
  if (typeof e.data.corpusVersion === "number") versions.add(e.data.corpusVersion);
}
if (versions.size > 1) {
  warnings.push(`mixed corpusVersions present: ${[...versions].sort((a, b) => a - b).join(", ")}`);
}

for (const w of warnings) console.warn(`⚠ corpus: ${w}`);
if (errors.length) {
  console.error(`✗ corpus integrity: ${errors.length} error(s)`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log(`✓ corpus integrity: ${adrs.length} ADR(s), ${standards.length} standard(s) — OK`);
