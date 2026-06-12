---
title: The error contract is a trait
status: draft
reversibility: hard-to-reverse
---

## Context

The errors-are-values draft fixed the stance: failures are
returned values, the panic boundary runs between anticipated and impossible, bad
input is never silently substituted, and failure surfaces are designed before
success paths. That decision deliberately named no error *type*. It said what a
failure must be, not what shape the thing holding the failure has. This draft
records that shape.

The question it answers is narrow and consequential: when a crate
returns a failure, what does the foundation provide, and what does the crate
provide? There are two extremes, and the whole decision is about rejecting both.

At one extreme, the foundation provides nothing and every crate invents its
error type from scratch. This is faithful to errors-are-values — typed errors are
values — but it gives the crates no shared shape. Two crates' errors have
nothing in common, a consumer composing them learns each one separately, and the
body of engineering knowledge RSB exists to teach has no through
line for how failure is modelled. The pillars are realized crate by crate with no
shared spine.

At the other extreme, the foundation provides one concrete error *type* that
every crate uses. This is the path a single application usually takes — and Lab
is a single application, which is why the temptation deserves naming. But the
foundation sits at the root of the dependency graph: every crate references it,
so its shape is the most expensive thing in the codebase to change, and any
opinion baked into that type — a fixed set of fields, and above all any
classification of failures by recovery action — is inherited by every crate
whether it fits or not. The errors-are-values draft already pushed recovery
classification out of the foundation for exactly this reason; a foundational
concrete type is the back door that same classification would climb back in
through.

What RSB needs sits between these: a shared *contract* that every
error honours, with the concrete *type* owned by the crate that defines it. The
foundation publishes obligations; each crate publishes a type that meets them.
This is the same shape Rust's own `serde` takes — `serde::de::Error` is a trait,
and each data-format crate brings its own concrete error implementing it — and it
is the shape RSB's crate organization — many small crates with enforced seams —
already points at.

This draft also settles what the contract requires, because a contract that names
no obligations is empty. Two design forces shape those requirements. The first is
interoperability: "open and free, built to be used" means an RSB error should
drop into the wider Rust error ecosystem without ceremony — `?`-convert, box,
log, and compose with non-RSB errors the way every other Rust error does. The
second is the house style carried over from the errors-are-values reasoning: the
Go-influenced habit of a failure that reads as a chain of named call sites,
`outer: middle: leaf`, so the propagation path is legible in the message itself
without a debugger. The contract must serve both, and the resolution below is
that they are the same causal chain seen two ways, not two competing mechanisms.

This draft is `hard to reverse`. The supertrait requirement and the source-chain
obligation are inherited by every crate that can fail — and by anything external
the day a crate is published. They are not bedrock — a different contract shape
is conceivable and the code could in principle migrate — but undoing them means
reworking every error type and every consumer of a chain at once, which is
why the requirements are kept deliberately small.

## Decision

The foundational error facility is a **contract trait**, not a
concrete type. The foundation publishes the trait; each crate that can fail
defines its own concrete error type implementing it. There is no foundational
error struct and no foundational error enum.

The contract has three parts.

**It requires `std::error::Error` as a supertrait.** Every RSB error is
a `std::error::Error`, and therefore `Display + Debug`. This is the
interoperability commitment: an RSB error is, with no conversion, an ordinary
member of the Rust error ecosystem. A downstream consumer can `?` it into their
own error handling, box it as `Box<dyn Error>`, log it through any error-aware
machinery, and compose it alongside errors from crates that have never heard of
RSB. The cost of interoperability is paid once, here, in the
contract, rather than paid repeatedly by every consumer at every boundary.

**The causal chain is the standard one, populated.** When an RSB error wraps an
underlying cause, that cause is exposed through `std::error::Error::source()` —
the method the entire Rust ecosystem already reaches for. `source()` is the real
mechanism, not a defaulted stub: a wrapping error returns its cause, and a leaf
error returns `None` because it genuinely has none. This is the path of least
resistance made true. A consumer follows the instinct the ecosystem taught them,
calls `source()`, and walks the actual chain. There is no second, RSB-specific
source method a consumer must know to look for, and `source()` never returns
`None` while a real cause exists — a chain that lied about its own depth would be
precisely the kind of invisible failure the errors-are-values draft prohibits.

**The Go-style rendering is a view over that chain.** The house style — a failure
that reads `outer: middle: leaf`, each level naming its call site — is produced by
walking `source()` and joining each level's `Display` output. It is provided by
the contract as shared behaviour over the standard chain, not built from a
separate data structure. The rendering and the interoperable chain are therefore
the same links seen two ways: the wider ecosystem reads the chain through
`source()` as it reads any error, and RSB consumers additionally get the
consistent `: `-joined log for free because the contract supplies the walk. One
chain, one source of truth, two views.

The contract requires the *structure* of the chain — that a wrapping error
populates `source()` with its cause — because that obligation is mechanically
observable and can be a genuine contract term. The contract does **not** dictate
the *content* of each level's message: the call-site phrasing that makes the
Go-rendering legible is written by the implementing crate, and the discipline of
attaching context at each propagation point is a matter for the error-handling
standard and the propagation decision that follows this one, not something a
trait can guarantee. The contract owns the shape of the log; it cannot author
what goes in each link.

The contract carries no classification of failures by recovery action, no
construction-site location capture, and no fixed field set. Recovery
classification was deferred by the errors-are-values draft and stays deferred —
admitting it here through the contract would reintroduce exactly the
application-shaped opinion that draft pushed out of the foundation. Location
capture is deliberately absent and is addressed in the alternatives below.

## Consequences

- Each crate's error type is its own published surface, meeting a shared
contract. A consumer learns one set of obligations once — every RSB error is a
`std::error::Error` with a real `source()` chain and a consistent rendering — and
then reads each crate's concrete type for what is specific to it. The codebase
has a shared spine without a shared straitjacket.

- Interoperability is structural, not bolted on. Because every RSB error is a
`std::error::Error`, the whole external Rust ecosystem composes with RSB errors
with no conversion layer. This is the "built to be used" pillar realized at the
type level: the cost of joining the ecosystem is paid in the contract, so no
downstream consumer pays it again.

- The Go-rendering survives the move from type to trait without becoming a second
mechanism. Carried over from the errors-are-values reasoning as a house style, it
is preserved here as a view over the standard chain rather than a parallel
structure — which is what keeps interoperability and house style from competing.
The cost is that the rendering is only as good as the message content each crate
writes, and that content is convention, not contract.

- The contract guarantees less than a concrete type could, and this is the
deliberate trade. A concrete foundational type could *own* the constructor and so
*enforce* that every error carries context; a contract can only require what is
mechanically observable from the outside — the supertrait and the populated
`source()`. Context discipline and message quality therefore drop to the standard
and to review rather than being type-enforced. The errors-are-values draft
already established that uneven enforcement is the honest state of affairs; this
is the same pattern, and the error-handling standard will record which clauses
are contract-guaranteed, which are mechanically checkable, and which rest on
review.

- The requirements are inherited and `hard to reverse`. The supertrait and the
`source()` obligation are commitments every failing crate's API
carries — and that anything external inherits the day a crate is published.
Removing either means reworking every error type and every chain consumer at
once. They are kept small for this reason: the
contract requires the two things that buy interoperability and a legible chain,
and nothing more, so the inherited surface is as light as the goals allow.

- The propagation decision that follows inherits a sharpened question rather than
a blank one. With `source()` fixed as the chain and the Go-rendering fixed as a
walk over it, the next decision is not "how is the chain represented" but "what
content does each level carry, and how is the discipline of attaching it
enforced." That decision stands on this one and cites it.

## Alternatives considered

- **A foundational concrete error type, with no recovery classification.** The
shape a single application reaches for: one shared `Error` struct carrying a
cause and a message, used by every crate. Attractive because it is the most
direct way to give the codebase a shared shape, and because it can *enforce*
context discipline by owning the constructor — the strongest enforcement
available, which a trait cannot match. Rejected because a foundational concrete
type is the most general artifact in the codebase — every crate inherits its
shape, and its field set is then frozen for all of them. Even stripped of
recovery classification, it is the back door through which application-shaped
opinion re-enters the foundation, and it makes every crate's error the *same*
type rather than each crate's *own* type — the wrong granularity when each
crate designs its own failure surface. The enforcement it would buy is real,
and its loss is the genuine
cost of choosing the trait; the standard and review absorb that cost instead.

- **A generic foundational type, `Error<K>`.** One foundational type parameterized
by a crate-supplied classification, so the expensive machinery (cause, rendering)
is shared while each crate injects its own recovery vocabulary. Attractive
because it appears to thread the needle — shared machinery, no fixed taxonomy.
Rejected because the type parameter infects every signature in every crate,
including the many crates that have no recovery classification to inject and
would carry or default `K` for nothing. It also still presumes recovery
classification is the axis of variation worth designing the foundation around,
when the errors-are-values draft already established that classification is
application-shaped and does not belong in the foundation at all. The generic
buys flexibility along an axis the foundation should not have an opinion about.

- **An RSB-native contract that does not require `std::error::Error`.** A wholly
owned contract trait with its own printability and its own source mechanism,
beholden to no external trait. Attractive for purity — the contract would be
entirely RSB's own, with no external dependency shaping it. Rejected because
the purity benefits no one. RSB code lives in the Rust world —
its errors wrap external crates' errors and are handled by code that speaks
`std::error::Error` — and under this option every boundary between an RSB error
and that world pays an explicit conversion, forever, in exchange for a
cleanliness only the foundation appreciates. "Open and free, built to be used"
points directly away from this:
the standard interop trait is the cheapest door between RSB failures and
everything else, and refusing it taxes precisely the consumers the contract
exists to serve. The duplication this option avoids — std's `source()` shadowing an
RSB-native chain — is avoided more cleanly by the chosen decision, which makes
std's `source()` *the* chain rather than a competitor to it.

- **Require `std::error::Error` but leave `source()` defaulted, with an
RSB-native chain alongside.** A middle path: take the supertrait for interop, but
carry the real causal chain in a separate RSB method and let std's `source()`
return `None`. Rejected because it builds the exact trap the path-of-least-
resistance goal forbids. A consumer calls `source()` — the method the ecosystem
taught them — receives `None`, and concludes there is no chain, while the real
chain hides in a method they had to know to find. A `source()` that returns
`None` beside a populated private chain is an error lying about its own depth,
which the errors-are-values draft prohibits. Making std's `source()` the single
real mechanism costs nothing this option was protecting and removes the trap
entirely.

- **Capture the construction-site location in the contract.** Require each error
to record the file, line, and column where it was built, as earlier RSB
prototyping did via `#[track_caller]`. Rejected on the Reliability pillar. The
attribute is silently fragile: it reports the correct location only if every
constructor in the path carries it, and a single omission makes it report the
wrong location with no error — a tool that misleads precisely where it claims to
help. As a *contract* obligation this is worse than as a concrete-type feature,
because the burden falls on implementing crates the foundation does not control,
and a contract cannot guarantee the attribute is applied correctly across them. A
mechanism whose precision degrades invisibly is a reliability defect even when it
"works," so it is dropped entirely rather than made optional — an optional
location slot that is empty across most crates is its own small
dishonesty. The legible `source()` chain with implementor-written call-site
messages carries the diagnostic weight instead, honestly and without a fragile
dependency on an attribute.

---

Drives standards: contributes to STD-ERRORS _(to be written, on acceptance)_

Related decisions:
[errors-are-values draft](https://adrs.rsb.sh/draft/errors-are-values/)
(the principle this gives a shape to);
[ADR-0001](https://adrs.rsb.sh/adr/0001-base-coding-standard/)
(base coding standard — reserved error handling)
