// Fills the CSP in dist/_headers with the sha256 of every inline <script> Astro
// emitted, so the policy can drop 'unsafe-inline' without hand-kept hashes.
// Runs on every `astro build`; fails the build if the placeholder is missing.
import { createHash } from "node:crypto";
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const PLACEHOLDER = "CSP_SCRIPT_HASHES";
// Data blocks are never executed, so CSP ignores them.
const NON_SCRIPT_TYPES = new Set(["application/ld+json", "application/json"]);

const walk = (dir) =>
	readdirSync(dir).flatMap((f) => {
		const p = join(dir, f);
		return statSync(p).isDirectory() ? walk(p) : p.endsWith(".html") ? [p] : [];
	});

/** @returns {import("astro").AstroIntegration} */
export default function cspHeaders() {
	return {
		name: "csp-headers",
		hooks: {
			"astro:build:done": ({ dir, logger }) => {
				const outDir = fileURLToPath(dir);
				const hashes = new Set();
				for (const file of walk(outDir)) {
					const html = readFileSync(file, "utf8");
					for (const [, attrs, body] of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) {
						if (/\ssrc=/.test(attrs)) continue;
						const type = attrs.match(/\stype="([^"]*)"/)?.[1];
						if (type && NON_SCRIPT_TYPES.has(type)) continue;
						hashes.add(`'sha256-${createHash("sha256").update(body, "utf8").digest("base64")}'`);
					}
				}

				const headersPath = join(outDir, "_headers");
				const headers = readFileSync(headersPath, "utf8");
				if (!headers.includes(PLACEHOLDER)) {
					throw new Error(`${PLACEHOLDER} not found in dist/_headers`);
				}
				writeFileSync(headersPath, headers.replaceAll(PLACEHOLDER, [...hashes].sort().join(" ")));
				logger.info(`${hashes.size} inline script hash(es) written to _headers`);
			},
		},
	};
}
