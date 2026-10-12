import { handleContact } from "./contact";

export default {
	async fetch(request, env): Promise<Response> {
		const path = new URL(request.url).pathname;
		if (path === "/api/contact" || path === "/api/contact/") {
			return handleContact(request, env);
		}
		return env.ASSETS.fetch(request);
	},
} satisfies ExportedHandler<Env>;
