import type { ImageMetadata } from "astro";
import afterTonightCover from "../assets/after-tonight-cover.png";
import secondNatureCover from "../assets/second-nature-cover.jpg";
import type { Release } from "./album";

/** Cover art per release, kept apart from album.ts so that file has no asset imports. */
export const COVERS: Record<Release["slug"], ImageMetadata> = {
	"second-nature": secondNatureCover,
	"after-tonight": afterTonightCover,
};
