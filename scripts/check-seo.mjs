// Prints each built page's <title> and meta description length. Run after `npm run build`.
// Exits non-zero if a description is over 155 chars or missing.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const LIMIT = 155;
const walk = (dir) =>
	readdirSync(dir).flatMap((f) => {
		const p = join(dir, f);
		return statSync(p).isDirectory() ? walk(p) : p.endsWith(".html") ? [p] : [];
	});
// &amp; goes last so "&amp;quot;" decodes to "&quot;", not '"'.
const decode = (s) => s.replace(/&#39;|&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&");

let bad = 0;
for (const file of walk("dist")) {
	const html = readFileSync(file, "utf8");
	const title = decode(html.match(/<title>([^<]*)<\/title>/)?.[1] ?? "");
	const desc = decode(html.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? "");
	if (!desc || desc.length > LIMIT) bad++;
	console.log(`${file}\n  title (${title.length}): ${title}\n  description (${desc.length}): ${desc}`);
}
process.exit(bad ? 1 : 0);
