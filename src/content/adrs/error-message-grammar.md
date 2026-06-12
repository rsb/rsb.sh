---
title: Error message grammar
status: draft
reversibility: reversible
---

## Context

The errors-are-values draft fixed the stance: failures are returned values, and
each carries enough to be reasoned about rather than suffered. The error-contract
draft fixed the shape: every RSB error is its crate's own type
implementing a shared contract trait, the causal chain is the populated
`std::error::Error::source()`, and the Go-style `outer: middle: leaf` reading is
a walk over that chain. Both drafts deferred one thing to here, and named it
explicitly: the contract owns the _structure_ of the chain, not the _content_ of
each link. This draft decides the content — what a failure message says, and the
discipline a developer follows when attaching it.

It begins from a principle that every rule below expresses: **a failure message
serves whoever debugs the failure later, who is probably not the author and
probably does not have the code open.** This is the reader the message is written
for. "Enough context," "clarity," "meaning," and "identity" are not abstract
virtues — they are all judged against whether _that reader_, seeing this message
in a log they did not produce, understands what went wrong. A message that is
clear to the author and opaque to the reader has failed, however well it
documents the code. The reader who is not you is the standard.

Two things make this draft different from the two it follows, and the difference
is deliberate. First, it is the operational one. The principle and the contract
named no rule a developer types day to day; this one does — it is the grammar a
developer writes and the thing a reviewer flags. Second, its scope is narrower
than its reach suggests: the grammar is **internal law, not a published
obligation.** It binds RSB's own crates so that every RSB error
reads and greps the same way. It is invisible at the contract boundary — a
downstream consumer reads RSB errors through `Display` and `source()` like any
error and never has to know the grammar exists. They simply benefit from the
uniformity. Because nothing downstream programs against the grammar, RSB
can refine it without breaking a single consumer, which is
why this draft is `reversible` where the contract draft was `hard to reverse`.

The motivation for a grammar at all — rather than leaving each crate to phrase
failures as it likes — is the shape of the codebase. A one-author monolith can
phrase its errors however reads best; it has one log, one author's habits, one
mental model. Many crates written across years — and, in time, by many hands —
feeding the same logs have none of that coherence unless it is imposed. A
uniform grammar makes every failure predictable to read and, more importantly,
searchable: a stable call-site token is greppable across the whole codebase and
every log it reaches, so a developer seeing a failure in production can search
for the exact token and land on the construction site. That searchability is
what the grammar buys, and it grows with the number of crates.

The grammar fixes a frame and leaves the fill to judgment. The frame — the
skeleton of every message — is law, and is uniform enough to be predictable and
greppable. The fill — the meaning a message carries — is craft, written by the
author and judged by a reviewer against the reader principle. Uniform without
being rigid: the structure is dictated so failures are searchable, the wording is
not, so messages stay meaningful rather than collapsing into fill-in-the-blank
boilerplate.

## Decision

Every error message follows one grammar:

```
[decoration] function | receiver.method failed[: msg]
```

The frame is law. The `msg` content is craft, governed by the discipline below.

**`function | receiver.method`** — the operation that failed, named as the caller
would recognise it. A free function is its bare name (`execute failed`); a method
is its receiver and name (`config.load failed`). This is the searchable anchor —
the stable, greppable token that leads from a log line back to the code. **The
crate is omitted.** Every RSB error is its crate's own type, so the type already
carries crate identity; repeating it in the message duplicates against the type,
which the no-duplication rule below forbids. The operation names _what_; the type
names _where_.

**`failed`** — the fixed verb. It is mandated, not chosen, because the grammar's
searchability depends on one anchor word: `grep "failed:"` finds RSB failures only
if every message uses `failed` and not `could not`, `unable to`, or `error`. The
uniform verb is the spine of the greppable pattern.

**`: msg`** — present when the operation name does not, on its own, convey the
meaning of the failure; omitted when it does. The bare form `config.load failed`
is legitimate _only_ when `receiver.method failed` already explains what went
wrong — when the operation's identity is the meaning. It is not a lazy default: a
bare message must _earn_ its bareness by being self-explaining. When the operation
name does not fully explain the failure, `msg` is required, and an unexplained
failure whose call site does not carry the meaning is not well-formed. The test a
reviewer applies is the reader's: does `receiver.method failed` already tell the
reader what happened? If yes, `msg` would only duplicate. If no, `msg` is owed.

**`[decoration]`** — an optional leading bracket carrying call-site information
_not related to inputs_ — structural context about where or how the code is
executing, such as a closure detached from an ordinary call site
(`[unnamed closure] x failed: ...`), a thread, or a retry. Decoration is about the
_execution context_, never about the data the operation received; data belongs in
`msg`. The bracket itself is the searchable convention — its presence is greppable
— and its content is a concise structural descriptor left to the author within the
"not related to inputs" boundary.

The escalation in practice, from least to most context:

```
foo.execute failed
foo.execute failed: system not initialized
foo.execute failed: id given is invalid
foo.execute failed: id (abc) is invalid
[unnamed closure] x failed: some message
```

Each step adds meaning only where the level below it did not already carry it.

**`msg` carries the meaning of the failure, plus additional context where it
exists.** The meaning — what went wrong, in terms the reader understands — is
mandatory whenever a `msg` is written; a `msg` that states no meaning is the empty
message the identity rule forbids. Additional context, including the specific
offending value (`id given is invalid`), is added when it exists and helps the
reader, under three constraints:

- **Once, not repeated up the chain.** A value or fact is surfaced at the level
  that first knows it is the problem, and not re-injected by levels above it. The
  chain must add information as it ascends, not echo it. A wrapping level that has
  nothing to add beyond the call site adds only the call site, not a restatement of
  the level below.

- **Only when safe to log.** This is the one rule whose violation is a security
  defect rather than a clarity defect, and it overrides the pull toward surfacing
  values. The offending value is included only when it is safe to write into a log
  that may travel anywhere. When it is not — a token, a credential, a path or
  identifier carrying personal data — the message names the failure _without_ the
  value: `auth.verify failed: token is invalid`, never the token itself. Surfacing a
  sensitive value to make a message clearer is never the right trade.

- **Judged in the chain.** Read the rendered chain top to bottom: it should tell
  the story of the failure to someone who did not write the code. "Think about the
  failure chain" is made concrete as an act the author and reviewer both perform —
  read the `Display` output as a narrative and judge whether it coheres.

**Every error has an identity.** No message is empty, absent where one is owed, or
copy-pasted boilerplate shared across unrelated failures. A failure that says
nothing, or says the same nothing as ten others, is invisible in the log in the
same way a silent substitution is invisible in the code — and is forbidden for the
same reason the errors-are-values draft forbids silent substitution. Every
failure is named as the distinct thing it is.

**Propagation carries context by default.** An error propagated with `?` is
expected to attach call-site context at the level it passes through. A bare `?`
that adds nothing is a review finding: the developer either adds the context the
grammar calls for or justifies, to the reviewer, why this propagation legitimately
carries none. The default is to add; the burden is on leaving it bare. Whether any
particular bare `?` is justified is a case-by-case judgment made in review against
the actual code — the standard does not enumerate sanctioned exceptions, because a
named exception becomes the reflexive answer that hollows out the rule. The
judgment stays with the reviewer, where a case-by-case call belongs.

## Consequences

- Failures are predictable and searchable across the whole codebase. A stable
  call-site token and a fixed verb mean a developer who sees a failure in any
  log can grep for the exact string and reach the code. This is the
  payoff the grammar exists for, and it grows with the number of
  crates rather than degrading.

- The grammar is internal and carries no cost to consumers. It binds RSB crates,
  not the wider world; a downstream consumer reads RSB errors as ordinary
  `std::error::Error` values and benefits from the uniformity without obeying any
  rule. Because nothing downstream depends on the grammar, it can be adjusted
  without a breaking change — the reason this decision is `reversible`.

- The frame is enforceable; the fill is judged. The skeleton — the verb, the
  separator, the presence of a call-site token, the absence of a crate prefix — is
  mechanically checkable, and a guard can flag a message that violates it. The
  content — whether the meaning is clear, whether the bare form is genuinely
  self-explaining, whether a value is safe to log, whether a bare `?` is justified —
  is judgment a guard can surface but only a reviewer can settle. The error-handling
  standard records, clause by clause, which side of that line each rule sits on,
  rather than pretending the whole grammar is mechanical. The sensitive-data rule in
  particular is guard-_assisted_ but review-_judged_: a guard can flag a raw value in
  a message for attention; only a human can decide whether that value is safe.

- The discipline leans on review. Without a
  foundational concrete error type owning the constructor, the grammar cannot be
  enforced purely by construction the way a type could enforce it; a guard surfaces
  candidates and review judges them. This is the same uneven-enforcement reality the
  two prior drafts established, now at its most operational — the rules a developer
  touches most often are the ones most dependent on a reviewer reading the actual
  message.

- It completes the error chain. The principle said failures are values; the
  contract said what shape holds a value and how its chain is exposed; this says what
  the value's message contains and how a developer writes it. Together the three are
  RSB's error model, and this draft is the one a developer consults
  while typing.

## Alternatives considered

- **No grammar — each crate phrases failures as it likes.** Leave message wording
  entirely to the author, governed only by the soft discipline of "be clear."
  Attractive because it imposes nothing and trusts authors. Rejected because it
  forfeits what many crates can only have by imposing it:
  uniformity. Without a fixed call-site
  token and verb, failures are legible one crate at a time but not _searchable_
  as a body — a developer cannot grep a stable pattern across the codebase, and the
  coherence that makes a many-crate codebase feel like one thing is lost. The
  clarity-only discipline is kept; the grammar is added on top of it for the
  searchability the discipline alone cannot provide.

- **A rigid grammar that fixes the message wording, not just its frame.** Specify
  not only the skeleton but the phrasing — a closed vocabulary of reasons, a
  template the whole message must match. Attractive because it would make the entire
  message mechanically checkable and maximally uniform. Rejected because it optimises
  the wrong thing: a message can match a rigid template perfectly and tell the reader
  nothing (`thing failed: error occurred`), and forcing wording into templates
  produces exactly the copy-paste boilerplate the identity rule forbids. The grammar
  is therefore drawn at the structural layer only — frame is law, wording is craft —
  so that searchability and meaning are both served instead of the first crushing the
  second.

- **Carry the crate name in the message** (`foo.config.load failed`). Attractive
  because it would make each message fully self-identifying in isolation. Rejected
  because every RSB error is its crate's own type, so the type already carries crate
  identity and a `source()` walk across crates carries each level's type with it.
  Repeating the crate in the message is duplication against the type — the same
  no-duplication rule that governs the chain, applied to provenance. The operation
  names what happened; the type names where; neither needs to restate the other.

- **Bless pass-through `?` as a named, sanctioned exception.** Write into the
  standard that a bare `?` is acceptable when the error is a pure pass-through whose
  context is owned by a delegating caller. Attractive because it is the most common
  legitimate reason for a bare `?` and naming it seems honest. Rejected because a
  named exception becomes the reflexive answer — every bare `?` gets defended as "a
  pass-through," and the reviewer is then arguing against a blessed category rather
  than judging a specific case. Leaving the exception unwritten keeps the burden
  where it belongs: on the developer to justify _this_ bare `?` to _this_ reviewer,
  with no standing category to hide behind. The rule is simply "bare `?` is a
  finding"; whether a given one is justified is review's call, decided against the
  code, not pre-licensed by the standard.

---

Drives standards: STD-ERRORS _(to be written, on acceptance — this decision is its
principal source)_

Related decisions:
[errors-are-values draft](https://adrs.rsb.sh/draft/errors-are-values/)
(failures are values with identity);
[error-contract-is-a-trait draft](https://adrs.rsb.sh/draft/error-contract-is-a-trait/)
(the contract owns chain structure; this owns chain content);
[ADR-0001](https://adrs.rsb.sh/adr/0001-base-coding-standard/)
(base coding standard — reserved error handling)
