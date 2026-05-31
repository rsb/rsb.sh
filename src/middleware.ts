import { defineMiddleware } from "astro:middleware";
import { SECURITY_HEADERS } from "./security-headers";

// Subdomain host routing over one editorial build (IA doc §4): adrs.rsb.sh and
// standards.rsb.sh are served from this same project, mapped onto the /adrs and
// /standards route subtrees so their public origins stay clean
// (adrs.rsb.sh/adr/NNNN-slug/, not rsb.sh/adrs/...). Only docs.rsb.sh is a
// separate, monorepo-generated Pages project — not handled here.
//
// The entry pages for these hosts (and the root "/") must be on-demand
// (`export const prerender = false`) so this middleware runs at request time.
const HOST_ROUTES: Record<string, string> = {
  adrs: "/adrs",
  standards: "/standards",
};

function applySecurityHeaders(response: Response): Response {
  for (const [header, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(header, value);
  }
  return response;
}

export const onRequest = defineMiddleware(async (context, next) => {
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
    throw error;
  }
});
