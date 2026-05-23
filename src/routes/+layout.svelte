<script lang="ts">
	import '@rsb/tokens/base.css';
	import '@rsb/tokens/themes/neutral.css';
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}
