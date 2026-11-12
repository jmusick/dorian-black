/**
 * Dorian Black's releases, newest first. Track order, durations, and release
 * dates here are the single source for the Home and Music pages and the
 * JSON-LD graph; don't hardcode track info in components.
 *
 * Durations are read from the source WAVs in the project assets folder.
 * Cover images live in src/assets and are mapped by slug in
 * src/data/covers.ts, so this file stays free of asset imports.
 */

export interface Track {
	n: number;
	title: string;
	/** mm:ss, from the source WAV header. */
	duration: string;
	/** One line of context for the Music page. */
	note: string;
}

export interface Release {
	/** URL fragment on the Music page and key into src/data/covers.ts. */
	slug: "second-nature" | "after-tonight";
	title: string;
	kind: string;
	releaseDate: string;
	/**
	 * Whether `releaseDate` has been checked against the distributor's release
	 * record. The JSON-LD graph omits `datePublished` until it is.
	 */
	releaseDateConfirmed: boolean;
	blurb: string;
	/** Spotify album page; null until the stores publish it. */
	spotifyUrl: string | null;
	/** Apple Music album page; null until the store publishes it. */
	appleMusicUrl: string | null;
	/** DistroKid HyperFollow page: pre-save before release, store links after. */
	hyperfollowUrl: string | null;
	tracks: Track[];
}

export const SECOND_NATURE: Release = {
	slug: "second-nature",
	title: "Second Nature",
	kind: "Album",
	// Confirmed on the DistroKid release and HyperFollow page, 2026-10-27.
	releaseDate: "2026-11-06",
	releaseDateConfirmed: true,
	// DRAFT copy written from the lyrics, not approved artist copy (README "Content status").
	blurb:
		"Twelve songs about the love that outlasts last call: kitchen dances, the nine o'clock phone call, and the person still saving you the booth by the window.",
	// Verified on the linked artist profiles, 2026-11-06.
	spotifyUrl: "https://open.spotify.com/album/58vAqxS5rcvZA5tt9TjVEG",
	appleMusicUrl: "https://music.apple.com/us/album/second-nature/6827692918",
	hyperfollowUrl: "https://distrokid.com/hyperfollow/dorianblack2/second-nature",
	// Sequence from the DistroKid release. Notes are DRAFT copy drawn from the lyrics.
	tracks: [
		{ n: 1, title: "Same Name", duration: "3:50", note: "Off the wall when the bass comes in." },
		{ n: 2, title: "More Than I Asked For", duration: "4:00", note: "Folding sheets, missing the same note." },
		{ n: 3, title: "Leave the Light On", duration: "3:43", note: "Amber lamp, turned back up." },
		{ n: 4, title: "Nothing to Recover From", duration: "4:22", note: "The nine o'clock call." },
		{ n: 5, title: "We Came to Make a Scene", duration: "3:31", note: "The quiet one steals the show." },
		{ n: 6, title: "Strangers on Purpose", duration: "3:40", note: "Meeting again, like the first time." },
		{ n: 7, title: "All My Best Lines", duration: "3:29", note: "Asking for a lighter a year after quitting." },
		{ n: 8, title: "Stay Right There", duration: "3:25", note: "Speakers up, drinks untouched." },
		{ n: 9, title: "You Make Me Late", duration: "3:23", note: "Keys in hand, still at the door." },
		{ n: 10, title: "Do That Again", duration: "3:22", note: "Seven out of ten." },
		{ n: 11, title: "Used to Be Ours", duration: "3:31", note: "The old club, now a waiting room." },
		{ n: 12, title: "Let's Wake the City", duration: "4:12", note: "The booth by the diner window." },
	],
};

export const AFTER_TONIGHT: Release = {
	slug: "after-tonight",
	title: "After Tonight",
	kind: "Album",
	// Confirmed on the DistroKid release, 2026-10-27.
	releaseDate: "2026-08-14",
	releaseDateConfirmed: true,
	blurb:
		"Twelve songs about the hours between last call and sunrise — crowded rooms, reckless attraction, and the quiet that arrives when the party finally ends.",
	spotifyUrl: "https://open.spotify.com/album/1b10wj76W5exnmt1wkNlbW",
	appleMusicUrl: "https://music.apple.com/us/album/after-tonight/6801407412",
	hyperfollowUrl: null,
	// Sequence from the DistroKid release.
	tracks: [
		{ n: 1, title: "Bad Idea, Good Time", duration: "3:36", note: "Knowing better, going anyway." },
		{ n: 2, title: "Don't Wake the City", duration: "4:50", note: "Streets to themselves." },
		{ n: 3, title: "Neon Funeral", duration: "3:55", note: "Lights coming up." },
		{ n: 4, title: "Across the Room", duration: "4:45", note: "The first look." },
		{ n: 5, title: "Say It With Your Hands", duration: "4:13", note: "Too loud to talk." },
		{ n: 6, title: "The Night We Never Had", duration: "5:14", note: "The version that didn't happen." },
		{ n: 7, title: "The Morning Doesn't Care", duration: "5:05", note: "Sunrise, unmoved." },
		{ n: 8, title: "No One's Going Home", duration: "3:32", note: "Peak of the night." },
		{ n: 9, title: "Where You Are", duration: "4:09", note: "Looking for one person in the crowd." },
		{ n: 10, title: "No Alibi", duration: "3:28", note: "Caught, and not sorry." },
		{ n: 11, title: "Everybody Wants Tonight", duration: "4:23", note: "The doors open." },
		{ n: 12, title: "No Good Goodbye", duration: "4:28", note: "The parking lot." },
	],
};

/** Newest first. */
export const RELEASES: Release[] = [SECOND_NATURE, AFTER_TONIGHT];

/** The release the Home page leads with. */
export const LATEST = SECOND_NATURE;

/** Midnight local time on the release date: the moment the build counts it as out. */
export function releaseDay(release: Release): Date {
	return new Date(`${release.releaseDate}T00:00:00`);
}

/**
 * Whether a release is out as of the build. The site is static, so pages
 * switch from pre-release to "out now" copy on the first build on or after
 * the release date (any push to main, or `npm run deploy`).
 */
export function isReleased(release: Release, now = new Date()): boolean {
	return now >= releaseDay(release);
}

/** "November 6, 2026" */
export function formatReleaseDate(release: Release): string {
	return releaseDay(release).toLocaleDateString("en-US", {
		year: "numeric",
		month: "long",
		day: "numeric",
	});
}

/** "Out now" or "Out November 6". */
export function releaseStatus(release: Release): string {
	if (isReleased(release)) return "Out now";
	return `Out ${releaseDay(release).toLocaleDateString("en-US", { month: "long", day: "numeric" })}`;
}

/** The shape of a store profile from `ACTIVE_SOCIALS` in src/config/site.ts. */
export interface StoreProfile {
	label: string;
	href: string;
	streaming?: boolean;
}

/** One listen/store button for a release. */
export interface ListenLink<P extends StoreProfile = StoreProfile> {
	label: string;
	href: string;
	/** The release's main call to action: the pre-save, or the Spotify/HyperFollow link once out. */
	primary: boolean;
	/** The release's own Spotify or Apple Music album page (the JSON-LD `sameAs` links). */
	albumPage: boolean;
	/** Set when the button falls back to an artist store profile instead of an album link. */
	profile?: P;
}

export interface ListenLinkOptions<P extends StoreProfile> {
	/**
	 * Artist profiles (pass `ACTIVE_SOCIALS`) to fall back on for stores the
	 * release has no album link for. Passed in because src/config/site.ts
	 * imports this file. Omit for no profile fallback.
	 */
	profiles?: readonly P[];
	/** Treat the release as out (or not) instead of checking the build date. */
	released?: boolean;
}

/**
 * The listen/store buttons for a release, in display order: the HyperFollow
 * pre-save before release; once out, Spotify (HyperFollow "Listen now" until
 * the direct store link is available), then Apple Music, then any store
 * profile the release has no album link for. The Spotify button always
 * stands in for the Spotify profile.
 */
export function listenLinks<P extends StoreProfile>(
	release: Release,
	{ profiles = [], released = isReleased(release) }: ListenLinkOptions<P> = {},
): ListenLink<P>[] {
	const links: ListenLink<P>[] = [];
	if (!released) {
		if (release.hyperfollowUrl) {
			links.push({ label: "Pre-save on Spotify", href: release.hyperfollowUrl, primary: true, albumPage: false });
		}
		return links;
	}
	if (release.spotifyUrl) {
		links.push({ label: "Listen on Spotify", href: release.spotifyUrl, primary: true, albumPage: true });
	} else if (release.hyperfollowUrl) {
		links.push({ label: "Listen now", href: release.hyperfollowUrl, primary: true, albumPage: false });
	}
	if (release.appleMusicUrl) {
		links.push({ label: "Listen on Apple Music", href: release.appleMusicUrl, primary: false, albumPage: true });
	}
	for (const profile of profiles) {
		if (!profile.streaming || profile.label === "Spotify") continue;
		if (profile.label === "Apple Music" && release.appleMusicUrl) continue;
		links.push({ label: profile.label, href: profile.href, primary: false, albumPage: false, profile });
	}
	return links;
}

/**
 * Parses an "m:ss" duration into an ISO 8601 duration (for `<time datetime>`)
 * and a spoken form for screen readers, e.g. "4:23" -> "PT4M23S" /
 * "4 minutes 23 seconds".
 */
export function formatDuration(duration: string): { iso: string; spoken: string } {
	const [m, s] = duration.split(":").map(Number);
	const plural = (n: number, unit: string) => `${n} ${unit}${n === 1 ? "" : "s"}`;
	const spoken = [m > 0 && plural(m, "minute"), s > 0 && plural(s, "second")]
		.filter(Boolean)
		.join(" ");
	return { iso: `PT${m}M${s}S`, spoken: spoken || "0 seconds" };
}

/** Total runtime, formatted as "Nh Nm" / "Nm". */
export function releaseRuntime(release: Release): string {
	const seconds = release.tracks.reduce((total, track) => {
		const [m, s] = track.duration.split(":").map(Number);
		return total + m * 60 + s;
	}, 0);
	const hours = Math.floor(seconds / 3600);
	const minutes = Math.round((seconds % 3600) / 60);
	return hours ? `${hours}h ${minutes}m` : `${minutes}m`;
}
