// @ts-check
import { defineConfig, sessionDrivers } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import tailwindcss from "@tailwindcss/vite";

// Default output is 'static': pages are prerendered unless they opt out with
// `export const prerender = false`. The Cloudflare adapter renders those
// opt-out pages on demand — that on-demand layer is what host routing (the
// adrs./standards. subdomains, see src/middleware.ts) needs.
export default defineConfig({
  site: "https://rsb.sh",
  // imageService: 'compile' keeps image optimization at build time (astro:assets
  // with sharp) and avoids the runtime Cloudflare Images binding — launch
  // artifacts §5: build-time pipeline, no Cloudflare Images.
  adapter: cloudflare({ imageService: "compile" }),
  // The Cloudflare adapter defaults to a KV-backed session store and emits a
  // `SESSION` KV binding. This site uses no sessions; configuring any non-KV
  // driver opts out so no unprovisioned binding reaches `wrangler deploy`. The
  // in-memory LRU driver pulls no bindings or node deps and is never actually
  // exercised (nothing reads Astro.session).
  session: { driver: sessionDrivers.lruCache() },
  build: {
    // Force all CSS into external stylesheets (no inlined <style>), so the CSP
    // in src/security-headers.ts needs no `style-src 'unsafe-inline'`.
    inlineStylesheets: "never",
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
