---
title: Errors are values
status: draft
reversibility: bedrock
---

## Context

ADR-0001 settled how RSB Ecosystem code looks, and drew a deliberate line while
doing it: the mechanical basics are deferred to community consensus, and the
places where the RSB Ecosystem holds a genuine opinion — error handling, module
and dependency relationships, API design — are each reserved for their own later
ADR. This is the first of those opinionated decisions to be recorded. ADR-0001
set the precedent for decisions the RSB Ecosystem _defers_; this ADR sets the
precedent for decisions the RSB Ecosystem _owns_.

Error handling is the right place to start holding an opinion, because it is
where two of the pillars stop being abstract. ADR-0001 already observed that the
reliability and accuracy pillars are realized in the shape of the code, not only
its behaviour — that readability is how a reader confirms a failure path is
actually handled. Errors are the sharp end of that claim. A failure that is
hidden, discarded, or smuggled through a side channel is not a behavioural
defect waiting to happen; it is one that has already happened and cannot be seen.
The way failure is represented in the code is therefore not an implementation
detail downstream of correctness — it is the surface on which reliability and
accuracy are either visible or absent.

This matters more for the RSB Ecosystem than for an application, because of what
the RSB Ecosystem ships. The crates are the product. A crate's failures are part
of the contract a downstream consumer programs against, across a published
version boundary that cannot be refactored on both sides at once. A second
consumer — the body of engineering knowledge the RSB Ecosystem exists to teach —
reads those same failure paths as worked examples. Both audiences are served by
the same decision: failures that are honest, legible values rather than hidden
control flow.

Rust gives this decision its starting point for free. `Result` and `Option` make
returned failure the path of least resistance, and the language has no
exceptions. So the decision here is not "use `Result`" — that is the language
default and records no real choice. The decision is the stance that gives the
default its teeth: what failure _is_ in RSB Ecosystem code, what it is not, and
where the boundary sits between a failure that is a value and a failure that is a
bug.

This ADR records that stance and nothing below it. It names no error type, no
trait, no message format, and no classification of failures by recovery action.
Those are separable decisions — a stance about errors-as-values does not by
itself choose how a crate's error type is shaped, how a failure is rendered, or
how a consumer decides what to do next — and each is reserved for its own later
ADR so that this principle can hold steady underneath them while they are argued,
revised, or replaced.

## Decision

In the RSB Ecosystem, **errors are values.** A function whose work can fail says
so in its signature and returns the failure as an ordinary value the caller can
inspect, propagate, or act on. This stance has four parts.

**Expected failure is a returned value, not a panic.** Any failure a function can
anticipate — a missing file, malformed input, a rejected operation, an
unavailable resource — is part of that function's contract and is returned, not
raised. The caller is never made to discover an anticipated failure by crashing.

**Panics are reserved for bugs and broken invariants.** A panic means the program
has reached a state its own logic says is impossible — a violated invariant, an
unreachable branch that was reached, a contract the code itself guarantees and
then breaks. Panics are not a control-flow mechanism for conditions the code can
foresee. `unwrap`, `expect`, and `panic!` standing in for an anticipated failure
are the rejected pattern this part names: they convert a recoverable situation
into process termination and move the failure out of the contract where the
caller could have handled it. Where the boundary falls in specific layers, and
how it is enforced, is a matter for the error-handling standard and later ADRs;
the principle is that the boundary exists and runs between _anticipated_ and
_impossible_, not between _inconvenient_ and _convenient_.

**No silent substitution.** When input or external data is found invalid and the
code continues by substituting something else — a default, a clamp, a nearest
legal value — that substitution is surfaced as part of the result, never made
silently. Quietly coercing bad input into "something close enough" is prohibited
because it is precisely the accuracy pillar failing invisibly: the program
returns a plausible answer that is not the true one, and nothing in the code or
its output admits it. A substitution that cannot be seen is a lie the code tells
on the program's behalf.

**Failure surfaces are designed before success paths.** The set of ways an
operation can fail is worked out and made explicit as the operation is designed,
not discovered afterward by the failures that happen to occur first. Designing
the failure surface first is what makes the other three parts achievable rather
than aspirational: a failure that was never enumerated cannot be returned as a
considered value, cannot have its panic-or-return boundary placed deliberately,
and cannot have its substitutions surfaced.

Together these establish that a failure in RSB Ecosystem code is a thing the
program holds and reasons about, not a thing it suffers. The error value is as
much a part of an operation's interface as its successful result, and is given
the same care.

## Consequences

- Error handling becomes design work, paid up front. A function that can fail
  must declare how, and its failure modes must be thought through before its happy
  path is written. This is more deliberate than reaching for `unwrap` and moving
  on, and that deliberateness is the point: the cost buys a failure surface a
  caller can rely on and a reader can audit.

- The decision is bedrock for everything the RSB Ecosystem builds. The error
  type architecture, the propagation and message conventions, and any
  classification of failures by recovery action are all later decisions that stand
  _on_ this one — they choose mechanisms for a stance that is already fixed.
  Reversing this principle would not be a revision of those mechanisms but a
  re-architecture beneath them, which is why it is treated as settled ground.

- It sets the precedent ADR-0001 anticipated for owned opinion. This is the first
  ADR where the RSB Ecosystem holds a position rather than deferring to consensus,
  and it establishes the pattern: an opinion is earned by tracing it to a pillar,
  stated as a principle that names no mechanism, and left clean so that the
  mechanisms beneath it can be decided, and changed, without disturbing it.

- The principle is enforced unevenly by nature, and the standard it drives must
  be honest about that rather than pretend uniformity. The panic boundary is
  largely mechanical — the absence of `unwrap`, `expect`, and `panic!` in code that
  should return failures can be checked structurally. No-silent-substitution and
  failure-surfaces-first are semantic: no tool can reliably tell an honest neutral
  default from a silent coercion, or confirm that a failure surface was designed
  rather than accreted. Those live as standard-plus-review. The error-handling
  standard records which of its clauses are machine-checkable and which rest on
  review, so that the strength of each rule is visible instead of assumed.

- The principle is thin on its own, deliberately. Following it produces code that
  returns honest failures, but not yet code that meets the RSB Ecosystem's full
  error-handling standard — the error type's shape, the diagnostic content a
  failure carries, and how a consumer classifies it are the substance, and they
  live in the later ADRs for which this is only the foundation.

## Alternatives considered

- **Record "use `Result`" as the decision.** Rejected as a non-decision. Returning
  `Result` is the Rust default and rejects no real alternative — the language has
  no exceptions to choose against. An ADR that recorded only this would document
  the language, not a position the RSB Ecosystem holds. The genuine decision is the
  stance around the default: the panic boundary, no silent substitution, and
  failure-surfaces-first are the parts a reader could not have inferred from
  "errors are values" alone, and they are where this ADR's weight sits.

- **Fold the error type, the message format, and a recovery classification into
  this decision.** Rejected, on the same reasoning ADR-0001 used to keep the
  opinionated rules out of the style decision. Errors-are-values does not entail
  any one error-type shape — per-crate typed errors and a single shared error type
  are both faithful to it — nor any particular rendering, nor any taxonomy of
  recovery actions. Bundling those contested mechanisms into the principle would
  produce one large ADR that is hard to revise and hard to cite, and would let a
  mechanism be decided implicitly under cover of the principle. Each is reserved
  for its own separately citable record.

- **Reserve a classification of failures by recovery action as part of the
  principle.** Rejected, and worth naming explicitly because it is the most
  tempting inclusion. A taxonomy that sorts failures by what a consumer should do
  about them — abort, retry, skip, report — is shaped by the _consumer's_ recovery
  verbs, and those are application-shaped, not ecosystem-shaped. A library crate
  has no main loop to skip a frame in and no launch to abort. Baking such a
  taxonomy into this foundational, ecosystem-wide principle would impose one
  application's recovery vocabulary on every crate and every downstream repo that
  inherits it. Recovery classification is deferred to where the recovery actually
  lives — a future application repository, or an ecosystem crate specific enough to
  own that concern — and is deliberately absent here.

- **Defer the principle until there is code to motivate it.** Rejected on the
  same sequencing ground as ADR-0001. This principle governs the first error any
  code will encounter; deciding it afterward means the earliest code is written
  with no stance on failure and reconciled later — exactly the compounding "fix it
  later" debt the pillars reject. The RSB Ecosystem cannot write its first crate
  without an answer to what a failure is, which is why this decision comes before
  the crate, not after it.

---

Drives standards: STD-ERRORS _(to be written)_

Related decisions: [ADR-0001](https://adrs.rsb.sh/adr/0001-base-coding-standard/)
(base coding standard — reserved error handling to this ADR)
