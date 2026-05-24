<script lang="ts">
	import { onMount } from 'svelte';

	let contactAnchor: HTMLAnchorElement;

	onMount(() => {
		const p = ['\x63\x6f\x6e\x74\x61\x63\x74', '\x72\x73\x62\x2e\x73\x68'];
		contactAnchor.href = `mailto:${p[0]}@${p[1]}`;
	});
</script>

<svelte:head>
	<title>rsb.sh</title>
	<meta name="description" content="Open-source tools for the creative industry, built by Robert Scott-Buccleuch." />
</svelte:head>

<div class="page">
	<main class="home">
		<p class="mark">rsb.sh</p>

		<h1>Open-source tools for the creative industry.</h1>

		<p>
			I'm building a body of open-source work for people who make things — photographers,
			designers, artists — and the developers who build tools for them. The centerpiece is
			<a href="https://github.com/rsb/easel">Easel</a>, a Rust framework for creative desktop
			applications that takes reliability, accuracy, and performance seriously. The work is
			early, honest about where it is, and moving forward.
		</p>

		<nav class="links">
			<a href="/writing">Writing</a>
			<a href="https://github.com/rsb">Code</a>
			<a href="https://rsb.ink">About me</a>
			<a href="/contact" bind:this={contactAnchor}>Contact</a>
		</nav>

		<p class="wip">
			This site is a work in progress. Please forgive any temporary inconsistencies,
			broken links, or missing pages.
		</p>
	</main>
</div>

<style>
	.page {
		padding: var(--site-padding);
		padding-top: 6rem;
		padding-bottom: 6rem;
	}

	.home {
		max-width: var(--article-width);
		margin: 0 auto;
	}

	.mark {
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.8rem;
		color: var(--page-text-secondary);
		letter-spacing: 0.1em;
		text-transform: uppercase;
		margin: 0 0 3rem 0;
	}

	h1 {
		font-size: clamp(1.5rem, 3.5vw, 2rem);
		font-weight: 600;
		line-height: 1.3;
		margin: 0 0 1.5rem 0;
		letter-spacing: -0.01em;
	}

	.home > p {
		margin: 0 0 2.5rem 0;
	}

	.home a {
		color: var(--page-link);
		text-decoration: underline;
		text-underline-offset: 2px;
		text-decoration-thickness: 1px;
		text-decoration-color: var(--page-border);
		transition: text-decoration-color 0.2s ease;
	}

	.home a:hover {
		text-decoration-color: var(--page-text);
	}

	.links {
		display: flex;
		gap: 2rem;
	}

	.links a {
		font-size: 0.95rem;
		color: var(--page-text-secondary);
		text-decoration: none;
		transition: color 0.2s ease;
	}

	.links a:hover {
		color: var(--page-text);
	}

	.wip {
		margin-top: 3rem;
		font-size: 0.85rem;
		color: var(--page-text-secondary);
		font-style: italic;
	}
</style>
