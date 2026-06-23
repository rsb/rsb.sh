---
title: Views draw through an abstract painter
status: draft
reversibility: hard-to-reverse
---

## Context

The pump contract gives a view three responsibilities — handle events, listen
for topics, draw — and the third raises a question the first two do not: a view that
draws needs something to draw *into*, and that something has a type. The crate
that names it is the shell contract, which sits one level above the foundation
and is referenced by every view, every editor, and the shared view-support tier.
Whatever type the contract hands a view is inherited everywhere a view is
written.

There are two things to consider for this decision. The first is boundary
discipline, already settled for the workspace: a contract crate may not name its
own backend. The contract is kept separate from its backends
precisely so more than one can satisfy it. Name `wgpu::RenderPass` in `draw` and
the separation is no longer honest: every implementation is coupled to wgpu, and one
built on any other substrate is unwritable.
The second is fan-in: the contract sits near the root of the dependency graph,
referenced by every view, so any vocabulary it carries — every drawing primitive
it names — is among the most expensive things to add or change, paid for by every
view at once.

A third fact narrows the problem before it is solved. There are two rendering
worlds, and only one touches the contract. The photograph being edited is
custom wgpu regardless of every other decision: precision-critical, GPU-resident,
rendered off the main thread, and handed up as a presentation-ready buffer. The
imaging layer below owns that pipeline. Everything the contract's drawing target
must serve is therefore the *other* world — panels, sliders, menus, the node
graph, histograms, and the act of compositing that finished buffer onto the
window. The target never runs the precision pipeline. That bounds how much
vocabulary is even in play to a small, stable set of chrome operations.

## Decision

The shell defines an abstract `Painter` trait, and a view draws through
`&mut dyn Painter`. The trait names a deliberately small, chrome-only vocabulary
— filled and stroked shapes, text, clipping, and compositing a finished image
referenced by an opaque texture handle. It names no GPU type, no buffer format,
and no backend. Each shell implements `Painter` over its own substrate: the
synchronous shell backs it with wgpu, a different shell would back it with its
own implementation, whatever that might be, and neither leaks across the contract
seam.

The photograph is not drawn through the painter. It arrives as an opaque texture
handle produced off-thread by the imaging layer and is composited with a single
blit. How a implementation backs that handle — a wgpu texture, anything else — is
private to the implementation. The painter's job is chrome and compositing; the
precision pipeline stays below the contract and off the main thread.

## Consequences

A view is `Box<dyn View<Ctx>>` with nothing further to carry: erasing the target
behind `&mut dyn Painter` hides the implementation's frame lifetime, so no view
signature acquires a backend lifetime or a second type parameter. Editors are
written once against the painter and run unchanged on any shell that implements
it. wgpu is confined to the synchronous shell crate, where the workspace
boundary discipline expects it.

The honest cost is that a contract crate now holds a drawing opinion. A vocabulary
can drift toward a renderer, and this one lives in the worst place for churn. The
discipline that keeps it bounded is the two-worlds split made into a rule: the
painter serves chrome and compositing only, never the precision pipeline. The bar
for adding a primitive is "the chrome genuinely needs it," not "a particular view
would find it convenient" — and because the addition is inherited by every view,
it is a contract change, weighed as one.

The opaque texture handle becomes a contract type whose backing is implementation-
private. This is the first place the relocated colour-neutral / shell-independent
commitment is actually tested: the photograph crosses the seam as a handle the
contract cannot inspect, so no colour or backend opinion can ride across with it.

## Alternatives considered

**An open `Target` type parameter, with the drawing vocabulary in a separate
presentation crate.** This is the purest form of neutrality — the contract names
no primitives at all — and was the standing lean. It loses on ergonomics that
never go away: the implementation's drawing target carries the GPU frame's lifetime,
so the boxed view becomes `Box<dyn for<'a> View<Ctx, Target<'a>>>`, and a second
type parameter rides every view signature forever. A permanent tax to keep out a
vocabulary the two-worlds split already keeps small.

**The target as an associated type of the app context.** Tempting because the
context is already the neutrality vehicle, but it files the target on the subject
axis when the target varies by *implementation*, not by subject. It conflates two
axes the design keeps separate, and forces two shells of one app to share a
target while denying one shell across two apps.

**An opaque frame plus capability lookup.** A view would ask a frame for the
capability it needs. The accessor's return type comes from a crate the contract
cannot name without an illegal downward edge, so the shape collapses into the
parameter option or reintroduces `Any`. It may still serve *inside* the
synchronous shell; it is rejected as the contract shape.

**Naming `wgpu::RenderPass` in the contract.** The simplest signature and the one
rejected outright: it welds the contract to wgpu, violates the workspace
boundary discipline, and forecloses the web implementation the contract exists to
keep possible.

---

Drives standards: none yet _(a view-contract standard may follow on acceptance)_

Related decisions: the workspace boundary discipline — a contract crate may not
name its own backend — is the load-bearing premise here; it is recorded in the
dependency-and-module planning and not yet a draft in this corpus.
[ADR-0001](https://adrs.rsb.sh/adr/0001-base-coding-standard/)
(base coding standard) is the corpus root.
