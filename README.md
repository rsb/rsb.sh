# rsb.sh

rsb.sh is the landing page for the RSB body of work. It is where a visitor arrives to understand what the body of work is, why it exists, what holds it together, and how the projects within it relate to each other. The site is part publication and part map — it carries the long-form writing that explains the worldview behind the projects, and it serves as the index that points outward to where each project's code and documentation actually live.

## How the site is built

The site is a SvelteKit application deployed to Cloudflare Pages. It consumes the Lumen design system (`@rsb/tokens`, `@rsb/primitives`, `@rsb/ui` from GitHub Packages) for its visual and interactive identity, so what appears on rsb.sh shares its vocabulary with every other RSB site. Content is authored in markdown and processed through the SvelteKit pipeline at build time. The repository contains the application that renders the site; it does not contain the content of every project's deeper documentation, which lives wherever each project's documentation makes sense — in its repository, in dedicated documentation, or on a future subdomain.

## Content and code

The application code in this repository is licensed under MIT or Apache 2.0, consistent with the rest of the work at [github.com/rsb](https://github.com/rsb). This covers the SvelteKit scaffolding, the layouts, the components specific to the site, and the build infrastructure.

The written content on the site — the essays, the pillars, the position pieces, the project descriptions, the blog posts — is licensed under [Creative Commons BY-NC 4.0](LICENSE-CC). This allows the writing to be quoted, shared, translated, and referenced freely with attribution, while reserving commercial republication and use. The content is creative work and the licensing reflects that; the license file in the repository covers the application code, and the CC license covers the writing.

## Development

The repository uses Bun. To work on the site locally, clone the repository and install dependencies with `bun install --frozen-lockfile`. The development server runs with `bun run dev`. The site can be built for production with `bun run build` and previewed locally with `bun run preview`.

Content lives under `content/`, organized by section. New essays, blog posts, and project pages are added as markdown files in the appropriate directory; the build pipeline picks them up automatically. The conventions for frontmatter and content structure are documented under `docs/` in the repository.

Deploys happen through GitHub Actions on every push to `main`. The workflow builds the site and publishes the result to Cloudflare Pages, which serves rsb.sh at the apex domain.

## License and links

Application code is licensed under [MIT](LICENSE-MIT) or [Apache 2.0](LICENSE-APACHE), at your option. Written content is licensed under [Creative Commons BY-NC 4.0](LICENSE-CC).

- Live site: [rsb.sh](https://rsb.sh)
- Other work: [github.com/rsb](https://github.com/rsb)
