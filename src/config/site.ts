import pkg from "../../package.json";
import { ALBUM, TRACK_COUNT } from "../data/album";

/** Sourced from package.json — bump the version there (and tag the release to match) to update this everywhere. */
export const SITE_VERSION: string = pkg.version;

/**
 * Single source of truth for the public origin. Change this (and `site` in
 * astro.config.mjs) once the real domain is registered — nothing else
 * hardcodes a URL.
 */
export const SITE_URL = "https://dorianblack.com";
export const SITE_NAME = "Dorian Black";
export const SITE_TAGLINE = "Synth-pop from the city after dark.";
/** The artist's genre, used in the JSON-LD graph (src/lib/schema.ts). */
export const ARTIST_GENRE = "Synth-pop";

/**
 * Cloudflare Turnstile site key for the contact form. The key is public by
 * design and committed so production cannot silently render a form-less page
 * when a build variable is missing. The matching secret must only exist in
 * Cloudflare or .dev.vars. PUBLIC_TURNSTILE_SITE_KEY remains an optional
 * override for another deployment.
 */
export const TURNSTILE_SITE_KEY: string =
	import.meta.env.PUBLIC_TURNSTILE_SITE_KEY ?? "0x4AAAAAAER8KqCPg1Pn7fHL";

/**
 * Google Analytics 4 measurement ID.
 *
 * Set to null to remove analytics from the site entirely — Layout.astro then
 * renders no consent banner and the footer drops its "Cookie choices" link.
 * The tag itself only loads after the visitor accepts the banner; see
 * src/components/CookieConsent.astro.
 *
 * This is third-party tracking, so src/pages/privacy-policy.astro describes it.
 * Changing or removing it means updating that page in the same commit.
 */
export const GA_MEASUREMENT_ID: string | null = "G-V51M2PHK0H";

/**
 * The ID actually handed to the loader. Null in `astro dev` so local page views
 * never reach the property — the consent banner still renders there so it can be
 * worked on, it just has nothing to load when accepted.
 */
export const ANALYTICS_ID: string | null = import.meta.env.PROD ? GA_MEASUREMENT_ID : null;

/**
 * Social and streaming profiles.
 *
 * Nothing is released yet, so every entry is `href: null`. The header and
 * footer skip null entries entirely, so the site renders clean today and
 * lights up the moment a URL is pasted in.
 */
export interface SocialLink {
	label: string;
	href: string | null;
	icon: string;
}

export const SOCIALS: SocialLink[] = [
	{ label: "Spotify", href: "https://open.spotify.com/artist/1e0DxuIekYHipCZlcNwVVt", icon: "simple-icons:spotify" },
	{ label: "Apple Music", href: "https://music.apple.com/us/artist/dorian-black/6801309828", icon: "simple-icons:applemusic" },
	{ label: "YouTube", href: null, icon: "simple-icons:youtube" },
	{ label: "SoundCloud", href: null, icon: "simple-icons:soundcloud" },
	{
		label: "Instagram",
		href: "https://www.instagram.com/dorian.black.music/",
		icon: "simple-icons:instagram",
	},
	{
		label: "TikTok",
		href: "https://www.tiktok.com/@dorian.black.band",
		icon: "simple-icons:tiktok",
	},
	{
		label: "Facebook",
		href: "https://www.facebook.com/people/Dorian-Black/61593270907107/",
		icon: "simple-icons:facebook",
	},
	{ label: "X", href: "https://x.com/dorianblackband", icon: "simple-icons:x" },
];

/** Appended (visually hidden or in an aria-label) to every link that opens a new tab. */
export const NEW_TAB_HINT = "(opens in a new tab)";

/** Accessible name for a profile link, e.g. "Dorian Black on Spotify (opens in a new tab)". */
export function socialLabel(s: SocialLink): string {
	return `${SITE_NAME} on ${s.label} ${NEW_TAB_HINT}`;
}

/**
 * rel for the artist's own profile links: `me` declares identity (all SOCIALS
 * are the artist's own profiles); noopener/noreferrer are required for
 * target="_blank".
 */
export const SOCIAL_REL = "me noopener noreferrer";

export const ACTIVE_SOCIALS = SOCIALS.filter(
	(s): s is SocialLink & { href: string } => s.href !== null,
);

/** Contact-form destination and fallback address when Turnstile is unavailable. */
export const CONTACT_EMAIL = "hello@dorianblack.com";

/**
 * Dedicated meta descriptions (<=155 chars each; scripts/check-seo.mjs checks
 * the built output). Kept separate from on-page copy so search snippets can be
 * tuned without touching the page. Built only from facts already in the repo:
 * artist name, synth-pop genre, album name and track count. The Music page's
 * description lives on ALBUM.metaDescription in src/data/album.ts.
 */
export const META_DESCRIPTIONS = {
	home: `${SITE_NAME} is a synth-pop artist. Hear the debut album ${ALBUM.title}, ${TRACK_COUNT} songs for the hours between last call and sunrise.`,
	// PLACEHOLDER: deliberately generic until approved bio copy exists. Do not add biography facts here.
	about: `About ${SITE_NAME}, a synth-pop artist, and the debut album ${ALBUM.title}.`,
	contact: `Contact ${SITE_NAME} for booking, press, licensing, collaborations, and general enquiries.`,
	privacy: `How the ${SITE_NAME} website handles contact-form messages, optional analytics cookies, and your privacy choices.`,
} as const;
