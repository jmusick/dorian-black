// Regenerates public/og.png (1200x630 social share image) from the album cover
// and logo masters in src/assets. Run: node scripts/build-og-image.mjs
import sharp from "sharp";
import { fileURLToPath } from "node:url";

const root = new URL("../", import.meta.url);
const path = (p) => fileURLToPath(new URL(p, root));

const W = 1200;
const H = 630;
const COVER = 630;

// Background: the cover blown up, blurred and dimmed, so the 1.91:1 frame
// reads as one scene instead of a square on a flat fill.
const background = await sharp(path("src/assets/after-tonight-cover.png"))
	.resize(W, H, { fit: "cover", position: "centre" })
	.blur(40)
	.modulate({ brightness: 0.45 })
	.toBuffer();

const cover = await sharp(path("src/assets/after-tonight-cover.png"))
	.resize(COVER, COVER)
	.toBuffer();

// The logo master has a lot of transparent padding; trim before sizing.
const logoWidth = W - COVER - 80;
const logo = await sharp(path("src/assets/logo-transparent.png"))
	.trim()
	.resize({ width: logoWidth })
	.toBuffer();
const logoMeta = await sharp(logo).metadata();

await sharp(background)
	.composite([
		{ input: cover, left: 0, top: 0 },
		{
			input: logo,
			left: COVER + Math.round((W - COVER - logoMeta.width) / 2),
			top: Math.round((H - logoMeta.height) / 2),
		},
	])
	.png({ palette: true, quality: 90, compressionLevel: 9, effort: 10 })
	.toFile(path("public/og.png"));
