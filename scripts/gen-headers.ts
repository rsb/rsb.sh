// Generates public/_headers from src/security-headers.ts so the static-asset
// headers can never drift from the SSR ones. Runs as the `prebuild` step (Bun
// runs pre<script> automatically), and can be run directly: `bun scripts/gen-headers.ts`.
import { writeFile } from "node:fs/promises";
import { SECURITY_HEADERS } from "../src/security-headers.ts";

const body = [
  "# GENERATED from src/security-headers.ts by scripts/gen-headers.ts.",
  "# Do not edit by hand — run `bun run build` (or `bun scripts/gen-headers.ts`).",
  "# Applies the same security headers as src/middleware.ts to static",
  "# (prerendered) responses, which Cloudflare serves from the assets layer",
  "# without invoking the worker.",
  "/*",
  ...Object.entries(SECURITY_HEADERS).map(([name, value]) => `  ${name}: ${value}`),
  "",
  "# Content-hashed build assets (/_astro/*): the filename changes whenever the",
  "# contents change, so they are safe to cache permanently. Cloudflare applies",
  "# matching _headers rules cumulatively, so the /* security headers above still",
  "# apply here too. (HTML pages are the opposite — no-cache in src/middleware.ts —",
  "# so a cached page can never outlive the hashed assets it references; rsb/rsb.sh.)",
  "/_astro/*",
  "  Cache-Control: public, max-age=31536000, immutable",
  "",
].join("\n");

const target = new URL("../public/_headers", import.meta.url);
await writeFile(target, body);
console.log(`Wrote ${target.pathname}`);
