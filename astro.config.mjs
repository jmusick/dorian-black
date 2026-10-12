// @ts-check
import { defineConfig } from 'astro/config';
import icon from 'astro-icon';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
	site: 'https://dorianblack.com',
	// Astro 7 defaults to 'jsx' whitespace rules, which drop the space before an
	// inline element that starts on a new line ("in the<a>"). Keep Astro 6 behavior.
	compressHTML: true,
	server: {
		port: 4321,
	},
	integrations: [icon(), sitemap()],
});
