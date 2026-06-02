# rsb.sh

rsb.sh is the public web property for the RSB body of work. It is where a visitor arrives to understand what the body of work is, why it exists, what holds it together, and how the projects within it relate to each other. The site is part publication and part map — it carries the long-form writing and the living architecture reference, and it serves as the index that points outward to where each project's code and documentation actually live.

## How the site is built

The site is an [Astro](https://astro.build) application styled with [Tailwind CSS](https://tailwindcss.com) v4 and deployed to Cloudflare Workers (Workers Static Assets). Fonts (Inter and JetBrains Mono) are self-hosted as woff2 — no CDN font requests, no third-party analytics, no off-origin calls on load.

Most pages are prerendered to static HTML at build time. A small on-demand layer handles **subdomain host routing**: `adrs.rsb.sh` and `standards.rsb.sh` are served from this same build via `src/middleware.ts`, which maps each host onto the `/adrs` and `/standards` route subtrees so their public origins stay clean. (`docs.rsb.sh` is a separate, monorepo-generated Pages project and is not part of this repository.)

Content is authored in markdown / MDX and processed through Astro's content collections at build time. The repository contains the application that renders the site; it does not contain the content of every project's deeper documentation, which lives wherever each project's documentation makes sense — in its repository, in dedicated documentation, or on `docs.rsb.sh`.

## Content and code

The application code in this repository is licensed under MIT or Apache 2.0, consistent with the rest of the work at [github.com/rsb](https://github.com/rsb). This covers the Astro scaffolding, the layouts, the components specific to the site, and the build infrastructure.

The written content on the site — the essays, the architecture reference, the decisions and standards — is licensed under [Creative Commons BY-NC 4.0](LICENSE-CC). This allows the writing to be quoted, shared, translated, and referenced freely with attribution, while reserving commercial republication and use.

## Development

The repository uses Bun. To work on the site locally, clone the repository and install dependencies with `bun install --frozen-lockfile`. The development server runs with `bun run dev`. The site can be built for production with `bun run build` and previewed locally with `bun run preview`. Type and content checks run with `bun run check`.

Subdomain host routing keys off the request hostname, so in local development everything resolves to the root site. To exercise the `adrs.`/`standards.` surfaces locally, visit the `/adrs` and `/standards` paths directly, or send a matching `Host` header.

The strict Content-Security-Policy cannot be enforced by the Vite dev server (it injects styles inline), so `bun run dev` renders the decision and standards pages unstyled. Verify those surfaces the way production serves them — a clean build plus preview:

```sh
rm -rf .astro node_modules/.astro dist
bun run build && bun run preview
# then open http://localhost:4321/adrs/  and  /standards/std/<id>/
```

The `rm -rf` matters when you have **deleted or renamed** content files: Astro's content-layer store under `.astro/` is incremental and does not always purge removed entries, so a stale entry can otherwise render as a "ghost" in a local build. `check:corpus` reads the markdown files directly and reports the true set even when the rendered store is stale — if the two disagree, clear the cache and rebuild. CI and deploy always build from a fresh checkout, so this never affects production.

Deploys happen through GitHub Actions on every push to `main`. The workflow builds the site and publishes the result with `wrangler deploy`, which serves rsb.sh at the apex domain.

## License and links

Application code is licensed under [MIT](LICENSE-MIT) or [Apache 2.0](LICENSE-APACHE), at your option. Written content is licensed under [Creative Commons BY-NC 4.0](LICENSE-CC).

- Live site: [rsb.sh](https://rsb.sh)
- Other work: [github.com/rsb](https://github.com/rsb)
