// "How to cite this" copy button (standards detail). External + same-origin so it
// satisfies the strict `script-src 'self'` CSP (see public/scripts/decision-log.js
// for why these can't be inline). The cite string rides on the button's data-cite.
const btn = document.getElementById("cite-copy");
btn?.addEventListener("click", async () => {
  const text = btn.dataset.cite ?? "";
  try {
    await navigator.clipboard.writeText(text);
    const original = btn.textContent;
    btn.textContent = "Copied";
    setTimeout(() => {
      btn.textContent = original;
    }, 1500);
  } catch {
    // Clipboard unavailable — the string stays selectable in the <code> block.
  }
});
