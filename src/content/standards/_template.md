---
# Copy this file to author a new standard. Name it `STD-NAME.md` — the filename
# (uppercase, ^STD-[A-Z0-9-]+$) IS the citable identity; there is no `id` field.
# A standard is published only once its driving ADR is ACCEPTED, and `sourceAdr`
# must name that ADR's id (check-corpus.ts rejects a draft source and enforces
# that the ADR lists this standard in its `drives`).
title: Short normative title
sourceAdr: 0000-driving-decision # the accepted ADR this standard derives from
corpusVersion: 1
---

State the rule prescriptively — "code must …", "crates shall …" — not as
discussion. A reader should be able to comply or detect non-compliance from this
text alone.

Then give the rationale, tracing back to the source decision: the standard exists
because the linked ADR decided it should. Keep the binding rule and its reasoning
clearly separable, so a crate can cite the rule without re-litigating the decision.
