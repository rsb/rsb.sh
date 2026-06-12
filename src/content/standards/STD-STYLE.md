---
title: Code follows the Rust Style Guide
sourceAdr: 0001-base-coding-standard
corpusVersion: 1
---

Code in RSB must conform to the official
[Rust Style Guide](https://doc.rust-lang.org/style-guide/), applied through
[`rustfmt`](https://rust-lang.github.io/rustfmt/) at its default configuration. A
crate complies when `cargo fmt --check` reports no changes; any formatting
`rustfmt` would rewrite is non-compliant.

This standard governs formatting and style only — indentation, line width, import
layout, brace and expression conventions. It does not cover module and dependency
relationships, error handling, API design, or lint configuration; each of those
is governed by its own standard as the decision behind it is made.

## Rationale

This standard exists because ADR-0001 established that RSB stands on
community consensus for the mechanical basics rather than authoring its own. The
Rust Style Guide is the community's settled answer and `rustfmt` is its mechanical
enforcement, so compliance is automatic and machine-verifiable, with no human
judgment to drift. The rule is kept deliberately thin: it points at the canonical
source instead of restating it, so it cannot fall out of sync with upstream.

## References

- [The Rust Style Guide](https://doc.rust-lang.org/style-guide/) — the formatting
  and style conventions this standard adopts.
- [rustfmt](https://rust-lang.github.io/rustfmt/) — the tool that applies and
  checks them, plus its configuration reference.
