// Fails the build if any prerendered HTML was emitted into dist/client.
//
// rsb.sh serves every page on-demand (`prerender = false`) so the host-routing
// middleware (src/middleware.ts) runs for all of them. A prerendered page is
// served straight from Cloudflare's static-assets layer — the @astrojs/cloudflare
// handler returns it BEFORE middleware (utils/handler.js `matchStaticAsset`) — so
// it would leak onto the adrs./standards. subdomains as a 200 (issue #2; the
// static-vs-on-demand trade-off is tracked in #15). This guard enforces that
// invariant instead of trusting the prose note in src/middleware.ts: the moment a
// page goes prerendered — directly, or because a future content collection
// defaults to it — the build fails here rather than silently reopening the leak.
//
// Runs as the `postbuild` step (Bun runs post<script> after `bun run build`), so
// CI's `bun run build` exercises it too. Companion to scripts/gen-headers.ts and
// scripts/check-corpus.ts.
import { readdirSync } from "node:fs";

const CLIENT_DIR = "dist/client";

let entries: string[];
try {
  entries = readdirSync(CLIENT_DIR, { recursive: true }) as string[];
} catch {
  // No dist/client — build hasn't run. Nothing to assert; `postbuild` only fires
  // after a real build, so this path is just the run-directly-without-building case.
  console.log(`… prerender guard: ${CLIENT_DIR} absent — run after \`bun run build\``);
  process.exit(0);
}

const leaked = entries.filter((p) => p.endsWith(".html")).sort();
if (leaked.length) {
  console.error(
    `✗ prerender guard: ${leaked.length} prerendered HTML file(s) in ${CLIENT_DIR} — ` +
      `these are served before host-routing middleware and would leak onto the ` +
      `adrs./standards. subdomains as a 200 (issue #2). Mark the page(s) ` +
      `\`prerender = false\`:`,
  );
  for (const f of leaked) console.error(`  - ${CLIENT_DIR}/${f}`);
  process.exit(1);
}
console.log("✓ prerender guard: no prerendered HTML in dist/client — every page is on-demand");
