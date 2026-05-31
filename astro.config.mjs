// @ts-check
import { defineConfig, sessionDrivers } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { HOST_ROUTES } from "./src/host-routes.ts";

// Host-routed subtrees ("/adrs", "/standards") are served on their own
// subdomains; their internal apex paths must not appear in the apex sitemap.
const HOST_ROUTE_PREFIXES = Object.values(HOST_ROUTES);

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
  // Sitemap covers the apex editorial routes only. The host-routed
  // adrs./standards. pages live on their own subdomains and grow their own
  // sitemaps when those collections land, so their internal apex paths are
  // filtered out here. robots.txt points at the index.
  integrations: [
    sitemap({
      filter: (page) => {
        const { pathname } = new URL(page);
        return !HOST_ROUTE_PREFIXES.some(
          (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
        );
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
