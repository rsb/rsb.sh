import { defineMiddleware } from "astro:middleware";
import { SECURITY_HEADERS } from "./security-headers";
import { HOST_ROUTES } from "./host-routes";

// Subdomain host routing over one editorial build (IA doc §4): adrs.rsb.sh and
// standards.rsb.sh are served from this same project, mapped (via HOST_ROUTES,
// shared with the canonical-URL helper) onto the /adrs and /standards route
// subtrees so their public origins stay clean (adrs.rsb.sh/adr/NNNN-slug/, not
// rsb.sh/adrs/...). docs.rsb.sh will eventually be its own crate-docs project, but
// until that ships the host still resolves here, so it is held on a coming-soon
// placeholder (see the docs branch below) rather than left to fall through.
//
// The entry pages for these hosts (and the root "/") must be on-demand
// (`export const prerender = false`) so this middleware runs at request time.

// docs.rsb.sh is special-cased rather than added to HOST_ROUTES: it has no
// internal subtree (no /docs/* content), so every path collapses onto the one
// placeholder page rather than being rewritten subtree-style.
const DOCS_SUBDOMAIN = "docs";
const DOCS_PLACEHOLDER = "/docs";

function applySecurityHeaders(response: Response): Response {
  for (const [header, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(header, value);
  }
  applyHtmlCachePolicy(response);
  return response;
}

// HTML pages embed content-hashed asset URLs (/_astro/<hash>.css|js). A deploy
// generates new hashes and removes the old files, so any HTML a browser keeps
// across a deploy points at assets that now 404 (text/html, not the asset) —
// which makes a render-blocking stylesheet fail and the page paint unstyled
// until a reload (rsb/rsb.sh). The only deploy-safe answer without retaining old
// assets or purging an HTML cache is to never reuse a page without revalidating:
// no-cache means the browser always checks the server, so it always gets HTML
// that references live hashes. (Content-hashed assets are cached hard instead —
// public/_headers, scripts/gen-headers.ts.) Set centrally here so every HTML
// surface is covered and new pages are safe by default. A page that has already
// chosen the stricter no-store (unpublished drafts) is left untouched; non-HTML
// responses (redirects, the 500) reference no assets and keep their own caching.
function applyHtmlCachePolicy(response: Response): void {
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("text/html")) return;
  if (response.headers.get("cache-control") === "no-store") return;
  response.headers.set("Cache-Control", "no-cache");
}

export const onRequest = defineMiddleware(async (context, next) => {
  // The rewrite intentionally keys off the request Host. This is safe to trust
  // because the content served is public and host-independent, and canonicalUrl()
  // derives the canonical origin from the configured Astro.site (not the Host) —
  // so a spoofed Host cannot cause host injection or an open redirect, only a
  // request for the same public content under a different name.
  //
  // That safety holds ONLY while every host serves the same public, read-only
  // content. Host routing here is presentation, NOT a trust boundary. If any
  // per-host access distinction is ever introduced (gated drafts, host-specific
  // data, differing auth), it MUST derive from a trustworthy signal — an
  // authenticated session, an edge-validated host allowlist, or separate Workers
  // per trust domain — never the raw, client-spoofable Host header read here.
  // (Settled constraint, rsb/rsb.sh#4. rsb.sh decisions live in code + issues,
  // not the Rust-ecosystem ADR corpus, so this is recorded here rather than as an ADR.)
  const subdomain = context.url.hostname.split(".")[0];
  const prefix = HOST_ROUTES[subdomain];
  const { pathname } = context.url;

  // Match the subtree exactly ("/adrs") or as a path segment ("/adrs/..."), so
  // sibling paths like "/adrsfoo" are still rewritten rather than slipping
  // through as already-scoped. The guard also prevents re-prefixing on the
  // rewritten request (its pathname already starts with the prefix).
  const alreadyScoped =
    !!prefix && (pathname === prefix || pathname.startsWith(`${prefix}/`));

  try {
    // docs.rsb.sh is reserved for the not-yet-built crate-docs pipeline (its own
    // project). Until that ships the host still resolves to THIS worker, so serve
    // a single coming-soon placeholder for every path instead of falling through
    // to the editorial root — which would clone the homepage and loop its
    // root-relative nav onto the docs origin (rsb/rsb.sh). Unlike HOST_ROUTES this
    // is not a subtree rewrite (there is no /docs/* content), so every path maps to
    // the one placeholder. The pathname guard mirrors `alreadyScoped`: don't
    // re-rewrite once the request is already on the placeholder.
    if (subdomain === DOCS_SUBDOMAIN && pathname !== DOCS_PLACEHOLDER) {
      return applySecurityHeaders(await next(DOCS_PLACEHOLDER));
    }
    if (prefix && !alreadyScoped) {
      const rest = pathname === "/" ? "" : pathname;
      return applySecurityHeaders(await next(prefix + rest));
    }
    return applySecurityHeaders(await next());
  } catch (error) {
    // Even when downstream throws, don't leak a response without the headers.
    if (error instanceof Response) {
      return applySecurityHeaders(error);
    }
    // A genuine exception would otherwise surface as the adapter's own 500 page,
    // which never passes through this middleware — shipping an error response with
    // no CSP/HSTS/etc. Log for observability, then return a headered generic 500.
    console.error(error);
    return applySecurityHeaders(
      new Response("Internal Server Error", {
        status: 500,
        headers: { "content-type": "text/plain; charset=utf-8" },
      }),
    );
  }
});
