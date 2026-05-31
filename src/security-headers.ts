// Single source of truth for the site's security headers.
//
// Applied two ways, both derived from this map:
//   - on-demand (SSR) responses  → set in src/middleware.ts
//   - static (prerendered) assets → written to public/_headers by
//     scripts/gen-headers.ts (runs as the `prebuild` step)
//
// Edit here only. `bun run build` regenerates public/_headers; never edit that
// file by hand.

// Content-Security-Policy. Everything loads from the same origin (self-hosted
// fonts, externalized CSS via build.inlineStylesheets:'never', no third-party
// scripts/analytics). `data:` is allowed for images so inline SVG/data-URI
// favicons work. No 'unsafe-inline' anywhere.
const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "img-src 'self' data:",
  "font-src 'self'",
  "style-src 'self'",
  "script-src 'self'",
  "object-src 'none'",
  "base-uri 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
].join("; ");

export const SECURITY_HEADERS: Record<string, string> = {
  "Content-Security-Policy": CONTENT_SECURITY_POLICY,
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains",
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy":
    "camera=(), microphone=(), geolocation=(), payment=(), usb=(), bluetooth=(), autoplay=(), display-capture=()",
  "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
  "X-XSS-Protection": "0",
};
