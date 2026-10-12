/**
 * "After Tonight" — the debut album.
 *
 * Track order is a proposed sequence, not a confirmed master order; durations
 * are read from the source WAVs in the project assets folder. Adjust `tracks`
 * here and the Music page follows.
 */

export interface Track {
	n: number;
	title: string;
	/** mm:ss, from the source WAV header. */
	duration: string;
	/** One line of context for the Music page. */
	note: string;
}

export const ALBUM = {
	title: "After Tonight",
	kind: "Album",
	status: "Out now",
	year: 2026,
	releaseDate: "2026-08-14" as string | null,
	blurb:
		"Twelve songs about the hours between last call and sunrise — crowded rooms, reckless attraction, and the quiet that arrives when the party finally ends.",
	spotifyUrl: "https://open.spotify.com/album/1b10wj76W5exnmt1wkNlbW",
	tracks: [
		{ n: 1, title: "Everybody Wants Tonight", duration: "4:23", note: "The doors open." },
		{ n: 2, title: "Bad Idea, Good Time", duration: "3:36", note: "Knowing better, going anyway." },
		{ n: 3, title: "Across the Room", duration: "4:45", note: "The first look." },
		{ n: 4, title: "Say It With Your Hands", duration: "4:13", note: "Too loud to talk." },
		{ n: 5, title: "No Alibi", duration: "3:28", note: "Caught, and not sorry." },
		{ n: 6, title: "No One's Going Home", duration: "3:32", note: "Peak of the night." },
		{ n: 7, title: "Don't Wake the City", duration: "4:50", note: "Streets to themselves." },
		{ n: 8, title: "The Night We Never Had", duration: "5:14", note: "The version that didn't happen." },
		{ n: 9, title: "Where You Are", duration: "4:09", note: "Looking for one person in the crowd." },
		{ n: 10, title: "Neon Funeral", duration: "3:55", note: "Lights coming up." },
		{ n: 11, title: "No Good Goodbye", duration: "4:28", note: "The parking lot." },
		{ n: 12, title: "The Morning Doesn't Care", duration: "5:05", note: "Sunrise, unmoved." },
	] satisfies Track[],
} as const;

export const TRACK_COUNT = ALBUM.tracks.length;

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
export const ALBUM_RUNTIME = (() => {
	const seconds = ALBUM.tracks.reduce((total, track) => {
		const [m, s] = track.duration.split(":").map(Number);
		return total + m * 60 + s;
	}, 0);
	const hours = Math.floor(seconds / 3600);
	const minutes = Math.round((seconds % 3600) / 60);
	return hours ? `${hours}h ${minutes}m` : `${minutes}m`;
})();
