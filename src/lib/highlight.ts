import { createHighlighter } from 'shiki';

let highlighterPromise: ReturnType<typeof createHighlighter> | null = null;

function getHighlighter() {
	if (!highlighterPromise) {
		highlighterPromise = createHighlighter({
			themes: ['catppuccin-mocha'],
			langs: ['rust', 'typescript', 'javascript', 'svelte', 'html', 'css', 'toml', 'yaml', 'json', 'bash', 'markdown', 'diff']
		});
	}
	return highlighterPromise;
}

export async function highlight(code: string, lang: string, theme = 'catppuccin-mocha'): Promise<string> {
	const highlighter = await getHighlighter();
	return highlighter.codeToHtml(code, { lang, theme });
}
