import type { Handle } from '@sveltejs/kit';

const securityHeaders: Record<string, string> = {
	'Strict-Transport-Security': 'max-age=63072000; includeSubDomains',
	'X-Frame-Options': 'DENY',
	'X-Content-Type-Options': 'nosniff',
	'Referrer-Policy': 'strict-origin-when-cross-origin',
	'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), bluetooth=(), autoplay=(), display-capture=()',
	'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
	'X-XSS-Protection': '0'
};

export const handle: Handle = async ({ event, resolve }) => {
	const response = await resolve(event);
	for (const [header, value] of Object.entries(securityHeaders)) {
		response.headers.set(header, value);
	}
	return response;
};
