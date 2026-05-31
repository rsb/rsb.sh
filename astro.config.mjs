// @ts-check
import { defineConfig } from "astro/config";
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
  vite: {
    plugins: [tailwindcss()],
  },
});
