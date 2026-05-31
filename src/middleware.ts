import { defineMiddleware } from "astro:middleware";

// Security headers applied to on-demand (SSR) responses. Prerendered static
// assets are covered separately by public/_headers (Cloudflare serves those
// directly from the assets layer, so middleware never runs for them).
const SECURITY_HEADERS: Record<string, string> = {
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains",
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy":
    "camera=(), microphone=(), geolocation=(), payment=(), usb=(), bluetooth=(), autoplay=(), display-capture=()",
  "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
  "X-XSS-Protection": "0",
};

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

export const onRequest = defineMiddleware(async (context, next) => {
  const subdomain = context.url.hostname.split(".")[0];
  const prefix = HOST_ROUTES[subdomain];

  let response: Response;
  if (prefix && !context.url.pathname.startsWith(prefix)) {
    const rest = context.url.pathname === "/" ? "" : context.url.pathname;
    response = await next(prefix + rest);
  } else {
    response = await next();
  }

  for (const [header, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(header, value);
  }
  return response;
});
