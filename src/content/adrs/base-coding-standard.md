---
title: The base coding standard is the official Rust Style Guide
status: draft
reversibility: bedrock
---

## Context

The RSB Ecosystem is starting from zero — no crates, no code, no contributors yet.
Before any code is written, it needs a settled answer to how that code looks and
reads, because the look and shape of the code is load-bearing twice over. The
reliability and accuracy pillars are realized in the shape of the code, not only
its behaviour: readability is how a reader confirms that a model is honest and
that a failure path is actually handled. And the RSB Ecosystem's second half — a
body of engineering knowledge a newcomer can learn proper practice from — is only
as trustworthy as the code is legible. A coding standard is not housekeeping here;
it governs both the software and the knowledge.

The first question is how much of that standard the RSB Ecosystem should author
itself. The basic mechanics of Rust formatting and style — indentation, line
width, import layout, brace and expression conventions — are a solved problem the
community has already converged on, tooled, and documented. Inventing a parallel
set would relitigate settled questions, fragment the RSB Ecosystem from the wider
Rust ecosystem a contributor already knows, and claim an understanding the work
has not earned. What the RSB Ecosystem does hold a genuine opinion about — error
handling, module and dependency relationships, API design — is a separate matter,
decided elsewhere.

## Decision

The RSB Ecosystem adopts the official Rust Style Guide as its base coding
standard, enforced by `rustfmt` at its default configuration. For formatting and
style — the basic, mechanical questions every line answers — the RSB Ecosystem
follows community consensus rather than its own conventions.

This decision covers formatting and style only. The RSB Ecosystem's opinionated
positions are out of scope here and are each recorded in their own later ADR:
import / module and dependency relationships, error handling, and API design.
Linting is deferred further still, to a decision made after those rules exist — a
linter enforces rules, and there is nothing to enforce until they are written.

The rules themselves are not reproduced here. This ADR is the decision; the
standard it drives, `STD-STYLE`, is the published rule of record and points to the
Rust Style Guide and the `rustfmt` baseline.

## Consequences

- A contributor who already writes Rust needs to learn nothing new to format code
  in the RSB Ecosystem correctly; `cargo fmt` is the whole story, and conformance
  is mechanically verifiable in CI without human judgment.
- Code in the RSB Ecosystem reads like the rest of the Rust ecosystem, which
  lowers the cost of entry for exactly the independent developers the RSB
  Ecosystem exists to serve, and lets it spend its opinion where it is distinctive
  rather than on settled mechanics.
- The base is owned by the community, not by the RSB Ecosystem. If the Rust Style
  Guide or `rustfmt` defaults change, the RSB Ecosystem inherits the change. This
  is accepted deliberately: standing on the community standard is the point, and
  tracking it is cheaper and more honest than maintaining a fork.
- The base is thin. Following it produces conventionally formatted code, not yet
  code that meets the RSB Ecosystem's own standards; the substance lives in the
  later overlay ADRs, for which this decision is only the foundation.
- It sets a precedent: the RSB Ecosystem authors opinion only where it has earned
  one, and otherwise stands on the community's work. Every later coding ADR is
  read against this baseline.

## Alternatives considered

- **Author the RSB Ecosystem's own style guide from scratch.** Rejected. It would
  relitigate questions the community has already settled and tooled, fragment the
  RSB Ecosystem from the conventions contributors already know, and produce a
  teaching artifact whose first lesson is a parochial reformatting of consensus.
  There is nothing to be earned by re-deriving brace placement.
- **Adopt the community base but customise `rustfmt`.** Rejected for this decision.
  Custom knobs — a wider line width, bespoke import grouping — are cheap to add
  later if a concrete need appears, but starting from defaults keeps the baseline
  unambiguous, maximally familiar, and free of justification-debt for choices made
  before any code exists to motivate them.
- **Fold the opinionated rules into this decision.** Rejected. Bundling a settled,
  mechanical adoption with several genuinely contested design decisions makes one
  large ADR that is hard to revise and hard to cite precisely. Each opinionated
  dimension is more useful as its own self-contained, separately citable record.
- **Defer the standard until there is code.** Rejected on sequencing. The standard
  governs the code that gets written; deciding it afterwards means the earliest
  code is written to no standard and conformed later — exactly the "format it
  later" debt the pillars treat as compounding.
