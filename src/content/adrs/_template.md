---
# Copy this file to start a new ADR. While drafting, name it `<slug>.md` (no
# number) and leave status: draft. At ACCEPTANCE: rename to `NNNN-<slug>.md`,
# flip status to accepted, and uncomment number/dateAccepted/corpusVersion —
# `number` MUST equal the NNNN in the filename (check-corpus.ts enforces this).
# There is no `id` field: the filename stem is the canonical identity.
title: Short decision title in the imperative
status: draft # draft → accepted → deprecated. "superseded" is NOT a status —
# it is derived from a later ADR's `supersedes` link, so this file is never
# edited to mark itself superseded.
reversibility: hard-to-reverse # bedrock | hard-to-reverse | reversible
# --- filled in at acceptance (the decision content freezes here) ---
# number: 0
# dateAccepted: 2026-01-01
# corpusVersion: 1
# --- optional edges ---
# supersedes: ["0000-prior-decision"] # ADR ids this replaces (allowed while draft)
# drives: ["STD-NAME"] # standards this decision governs (accepted/deprecated only)
---

## Context

What forces the decision? The constraints, the pressure, the prior state. Enough
that a reader who wasn't there understands why this came up. Trace anything load-
bearing back to its source rather than asserting it.

## Decision

The decision itself, stated plainly and in the present tense ("rsb uses …"). One
clear position — not a survey of possibilities.

## Consequences

What follows — good and bad. What becomes easier, what becomes harder, what is now
foreclosed. Name the costs honestly; an ADR that lists only upsides isn't trusted.

## Alternatives considered

Each real alternative and why it lost. This is what makes the record worth keeping:
it shows the decision was contested, not defaulted into. Keep the whole body to
roughly 300–1000 words.
