/**
 * Contact form field limits, shared by the Worker (worker/contact.ts) and the
 * contact page (src/pages/contact.astro) so the browser never accepts input
 * the server rejects.
 *
 * Keep this module free of imports: wrangler bundles it into the Worker, and
 * Node's test runner loads it directly.
 */
export const CONTACT_LIMITS = {
	name: 100,
	subject: 150,
	/** RFC 5321's practical maximum for an address. */
	email: 254,
	messageMin: 10,
	messageMax: 4000,
} as const;
