// DecisionLog sidebar toggle (mobile collapse). Kept as an external, same-origin
// file ON PURPOSE: the strict CSP is `script-src 'self'` with no 'unsafe-inline'
// and no hash/nonce, so an inline <script> is refused. Astro inlines small hoisted
// scripts into the HTML, which the CSP then blocks — so this lives in public/ and
// is served from the Cloudflare static-assets layer (bypassing the host-routing
// middleware, exactly like the CSS and fonts).
const toggle = document.getElementById("sidebar-toggle");
const nav = document.getElementById("surface-nav");
toggle?.addEventListener("click", () => {
  const collapsed = nav?.hasAttribute("data-collapsed");
  if (collapsed) nav.removeAttribute("data-collapsed");
  else nav?.setAttribute("data-collapsed", "");
  toggle.setAttribute("aria-expanded", String(collapsed));
});
