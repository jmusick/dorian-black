// Regenerates the fixed-URL browser and home-screen icons from the approved
// logo master in src/assets. Run: node scripts/build-icons.mjs
import sharp from "sharp";
import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const root = new URL("../", import.meta.url);
const path = (p) => fileURLToPath(new URL(p, root));
const background = "#04000a";

// Remove the master's transparent padding so the lettering stays as large as
// possible at favicon sizes, with a small inset to preserve the neon edges.
const logo = await sharp(path("src/assets/logo-transparent.png"))
	.trim()
	.toBuffer();

const icon = (size) => {
	const inset = Math.max(1, Math.round(size * 0.04));
	return sharp(logo)
		.resize(size - inset * 2, size - inset * 2, { fit: "contain", background })
		.extend({ top: inset, bottom: inset, left: inset, right: inset, background })
		.flatten({ background })
		.png({ compressionLevel: 9 });
};

for (const [name, size] of [
	["apple-touch-icon.png", 180],
	["icon-192.png", 192],
	["icon-512.png", 512],
]) {
	await icon(size).toFile(path(`public/${name}`));
}

// ICO header + one 16-byte directory entry per PNG frame. Modern browsers
// support PNG-compressed frames, so no separate image encoder is needed.
const sizes = [16, 32, 48];
const frames = await Promise.all(sizes.map((size) => icon(size).toBuffer()));
const directory = Buffer.alloc(6 + frames.length * 16);
directory.writeUInt16LE(1, 2); // Type: icon.
directory.writeUInt16LE(frames.length, 4);
let offset = directory.length;
for (const [index, frame] of frames.entries()) {
	const entry = 6 + index * 16;
	directory.writeUInt8(sizes[index], entry);
	directory.writeUInt8(sizes[index], entry + 1);
	directory.writeUInt16LE(1, entry + 4); // Color planes.
	directory.writeUInt16LE(24, entry + 6); // Bits per pixel (opaque RGB).
	directory.writeUInt32LE(frame.length, entry + 8);
	directory.writeUInt32LE(offset, entry + 12);
	offset += frame.length;
}
await writeFile(path("public/favicon.ico"), Buffer.concat([directory, ...frames]));
