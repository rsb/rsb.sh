<svelte:head>
	<title>Writing — rsb.sh</title>
	<meta name="description" content="Technical writing on creative tools, Rust, and desktop application architecture." />
</svelte:head>

<div class="page">
	<main class="writing">
		<p class="mark"><a href="/">rsb.sh</a></p>

		<h1>Writing</h1>

		<p class="empty">
			Nothing here yet. The first piece is on its way.
		</p>
	</main>
</div>

<style>
	.page {
		padding: var(--site-padding);
		padding-top: 6rem;
		padding-bottom: 6rem;
	}

	.writing {
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

	.mark a {
		color: inherit;
		text-decoration: none;
		transition: color 0.2s ease;
	}

	.mark a:hover {
		color: var(--page-text);
	}

	h1 {
		font-size: clamp(1.5rem, 3.5vw, 2rem);
		font-weight: 600;
		line-height: 1.3;
		margin: 0 0 2rem 0;
		letter-spacing: -0.01em;
	}

	.empty {
		color: var(--page-text-secondary);
		font-style: italic;
	}
</style>
