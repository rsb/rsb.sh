// Subdomain host routing (IA doc §4): adrs.rsb.sh and standards.rsb.sh are
// served from this one build, mapped onto these internal route subtrees. Shared
// by the request-time rewrite (src/middleware.ts) and the canonical-URL reverse
// mapping below, so the forward and reverse maps can never disagree.
export const HOST_ROUTES: Record<string, string> = {
  adrs: "/adrs",
  standards: "/standards",
};

// Build the canonical public URL for an internal route. Reverses HOST_ROUTES so
// a page rendered at the internal path /adrs/NNNN canonicalizes to its real
// public origin https://adrs.<apex>/NNNN, and every root/editorial path
// canonicalizes to the apex — collapsing the www.-vs-apex duplicate and the
// internal-path duplicate (the /adrs|/standards subtree is also reachable on the
// apex) so the same content resolves to one indexable URL.
export function canonicalUrl(pathname: string, site: URL): string {
  for (const [subdomain, prefix] of Object.entries(HOST_ROUTES)) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
      const rest = pathname.slice(prefix.length) || "/";
      return `${site.protocol}//${subdomain}.${site.host}${rest}`;
    }
  }
  return new URL(pathname, site).href;
}
