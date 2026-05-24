<script lang="ts">
	let { data } = $props();
</script>

<svelte:head>
	<title>Why Easel — rsb.sh</title>
</svelte:head>

<div class="page">
	<main class="article">
		<header class="article-header">
			<p class="meta">23 May 2026 · 12 min read</p>
			<h1>Why Easel</h1>
		</header>

		<div class="article-body">
			<p>
				Building a serious desktop application is harder than it should be. Not the kind of
				application that wraps a web page in a native frame — the kind that processes raw camera
				files at full resolution, manages libraries of tens of thousands of images, and renders
				real-time previews while the user adjusts a curve. The kind where latency is measured in
				milliseconds and correctness is measured in color accuracy.
			</p>

			<p>
				Small teams struggle to compete with large ones not because the problems are inherently
				hard, but because the infrastructure to solve them well doesn't exist as
				<a href="#">shared open-source components</a>. Every team that builds a
				photo editor rebuilds the same raw processing pipeline, the same color management stack,
				the same non-destructive editing model. This is waste on a staggering scale. Easel exists
				to eliminate it.
			</p>

			<h2>The four pillars</h2>

			<p>
				Every decision in the Easel ecosystem can be tested against four commitments:
				<a href="#">reliability</a>,
				<a href="#">accuracy</a>,
				<a href="#">performance</a>, and
				<a href="#">local-first</a>. These are not aspirational values
				printed on a wall. They are engineering constraints that shape what the code looks like,
				what trade-offs are acceptable, and what gets rejected.
			</p>

			<p>
				Reliability means that the software does not lose work. This sounds obvious, but the
				history of creative software is littered with applications that corrupt files, crash during
				export, or silently drop edits. A photographer who has spent four hours on a wedding
				shoot's color grade does not get those hours back when the application crashes.
			</p>

			<h2>Architecture: shells, services, domains</h2>

			<p>
				The framework decomposes applications into three layers. The shell is the user-facing
				application — the thing with a window, a menu bar, and an opinion about workflow.
				Services are the reusable infrastructure beneath: event buses, task queues, progress
				reporting, undo stacks. Domains are the problem-specific logic: raw processing, color
				science, image cataloging.
			</p>

			<blockquote>
				<p>
					The document is not a pixel buffer. It is a description of a pipeline — a sequence of
					operations that, when executed, produce pixels. This distinction is the foundation of
					non-destructive editing.
				</p>
			</blockquote>

			<p>
				Consider the three-shell decomposition for the photo family. The first shell is the
				library manager — it catalogs, searches, and organizes. The second shell is the raw
				processor — it develops raw files into rendered images. The third shell is the
				post-processor — it applies creative edits, retouching, and compositing.
			</p>

			<h3>The FFI boundary</h3>

			<p>
				The <code>libraw</code> integration demonstrates the copy-and-release discipline that
				governs all FFI in the ecosystem. When Rust calls into a C library, ownership semantics
				must be explicit at the boundary. The adapter copies data out of the C library's
				allocations and into Rust-owned memory before releasing the C-side resources:
			</p>

			{@html data.code}

			<p>
				This is more work than keeping a reference to the C library's memory, but it eliminates an
				entire class of use-after-free bugs. The performance cost of the copy is negligible
				compared to the cost of the raw processing itself.
			</p>

			<hr />

			<p>
				Easel is the work of one person, building open-source tools for the creative industry
				because those tools need to exist. There is no company behind the project, no commercial
				entity funding it. The framework is being built because building it is worthwhile work.
			</p>
		</div>

		<footer class="article-footer">
			<hr />
			<a href="/" class="back-link">← All writing</a>
		</footer>
	</main>
</div>

<style>
	.page {
		padding: var(--site-padding);
		padding-top: 4rem;
		padding-bottom: 6rem;
	}

	.article {
		max-width: var(--article-width);
		margin: 0 auto;
	}

	.article-header {
		margin-bottom: 2.5rem;
	}

	.meta {
		font-size: 0.875rem;
		color: var(--page-text-secondary);
		margin: 0 0 0.5rem 0;
		letter-spacing: 0.02em;
	}

	h1 {
		font-size: clamp(1.75rem, 4vw, 2.5rem);
		font-weight: 700;
		line-height: 1.2;
		margin: 0;
		letter-spacing: -0.015em;
	}

	.article-body h2 {
		font-size: 1.5rem;
		font-weight: 600;
		line-height: 1.3;
		margin: 2.5em 0 0.75em 0;
		letter-spacing: -0.01em;
	}

	.article-body h3 {
		font-size: 1.25rem;
		font-weight: 600;
		line-height: 1.35;
		margin: 2em 0 0.5em 0;
	}

	.article-body p {
		margin: 0 0 1.5em 0;
	}

	.article-body a {
		color: var(--page-link);
		text-decoration: underline;
		text-underline-offset: 2px;
		text-decoration-thickness: 1px;
		text-decoration-color: var(--page-border);
		transition: text-decoration-color 0.2s ease;
	}

	.article-body a:hover {
		text-decoration-color: var(--page-text);
	}

	blockquote {
		margin: 1.5em 0;
		padding-left: 1.25em;
		border-left: 3px solid var(--page-border);
	}

	blockquote p {
		font-style: italic;
		color: var(--page-text-secondary);
	}

	code {
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.9em;
		background-color: var(--page-code-bg);
		padding: 0.15em 0.3em;
		border-radius: 3px;
	}

	.article-body :global(pre),
	.article-body :global(.shiki) {
		padding: 1.25rem 1.5rem;
		border-radius: 3px;
		overflow-x: auto;
		margin: 1.5em -1rem;
	}

	.article-body :global(pre code) {
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.875rem;
		line-height: 1.5;
		background: none;
		padding: 0;
	}

	hr {
		border: none;
		text-align: center;
		margin: 3em auto;
		max-width: 100px;
	}

	hr::after {
		content: '· · ·';
		color: var(--page-text-secondary);
		letter-spacing: 0.5em;
		font-size: 0.875rem;
	}

	.article-footer {
		margin-top: 2rem;
	}

	.back-link {
		font-size: 0.875rem;
		color: var(--page-text-secondary);
		text-decoration: none;
		transition: color 0.2s ease;
	}

	.back-link:hover {
		color: var(--page-text);
	}
</style>
