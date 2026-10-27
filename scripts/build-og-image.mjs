// Regenerates public/og.png (1200x630 social share image) from the latest
// album cover in src/assets. Run: node scripts/build-og-image.mjs
import sharp from "sharp";
import { fileURLToPath } from "node:url";

const root = new URL("../", import.meta.url);
const path = (p) => fileURLToPath(new URL(p, root));

const W = 1200;
const H = 630;
const COVER = 630;
// Keep in step with LATEST in src/data/album.ts. The Second Nature cover
// already carries the logo and title, so it is centred on its own.
const SOURCE = path("src/assets/second-nature-cover.jpg");

// Background: the cover blown up, blurred and dimmed, so the 1.91:1 frame
// reads as one scene instead of a square on a flat fill.
const background = await sharp(SOURCE)
	.resize(W, H, { fit: "cover", position: "centre" })
	.blur(40)
	.modulate({ brightness: 0.45 })
	.toBuffer();

const cover = await sharp(SOURCE).resize(COVER, COVER).toBuffer();

await sharp(background)
	.composite([{ input: cover, left: Math.round((W - COVER) / 2), top: 0 }])
	.png({ palette: true, quality: 90, compressionLevel: 9, effort: 10 })
	.toFile(path("public/og.png"));
