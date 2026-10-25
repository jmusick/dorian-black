import { getImage } from "astro:assets";
import cover from "../assets/after-tonight-cover.png";
import { ACTIVE_SOCIALS, ARTIST_GENRE, SITE_NAME, SITE_TAGLINE, SITE_URL } from "../config/site";
import { ALBUM, TRACK_COUNT, formatDuration } from "../data/album";

/**
 * One linked schema.org @graph for the whole site (#18). Every page gets the
 * WebSite and the artist (MusicGroup); Home and Music also get the album with
 * its tracks. Nodes reference each other by @id so search engines see a single
 * artist entity across pages. Everything comes from src/config/site.ts and
 * src/data/album.ts — add facts there, not here.
 */

const HOME_URL = `${SITE_URL}/`;
const MUSIC_URL = `${SITE_URL}/music/`;

export const SCHEMA_IDS = {
	website: `${HOME_URL}#website`,
	artist: `${HOME_URL}#artist`,
	album: `${MUSIC_URL}#album`,
} as const;

type Node = Record<string, unknown>;

const ref = (id: string) => ({ "@id": id });

export interface SchemaGraphOptions {
	/** Include the MusicAlbum node and its tracks (Home and Music pages). */
	album?: boolean;
}

export async function buildSchemaGraph({ album = false }: SchemaGraphOptions = {}) {
	const website: Node = {
		"@type": "WebSite",
		"@id": SCHEMA_IDS.website,
		url: HOME_URL,
		name: SITE_NAME,
		publisher: ref(SCHEMA_IDS.artist),
		inLanguage: "en",
	};

	const artist: Node = {
		"@type": "MusicGroup",
		"@id": SCHEMA_IDS.artist,
		name: SITE_NAME,
		url: HOME_URL,
		description: SITE_TAGLINE,
		genre: ARTIST_GENRE,
		image: `${SITE_URL}/og.png`,
		sameAs: ACTIVE_SOCIALS.map((s) => s.href),
		// Only link the album where its node is in the same graph, so every
		// @id reference on a page resolves.
		...(album ? { album: ref(SCHEMA_IDS.album) } : {}),
	};

	const graph: Node[] = [website, artist];

	if (album) {
		const coverImage = await getImage({ src: cover, width: 1200 });
		graph.push({
			"@type": "MusicAlbum",
			"@id": SCHEMA_IDS.album,
			name: ALBUM.title,
			url: MUSIC_URL,
			description: ALBUM.blurb,
			image: new URL(coverImage.src, SITE_URL).href,
			// Omitted until the release date is confirmed (README "Content status").
			...(ALBUM.releaseDateConfirmed && ALBUM.releaseDate
				? { datePublished: ALBUM.releaseDate }
				: {}),
			genre: ARTIST_GENRE,
			albumProductionType: "https://schema.org/StudioAlbum",
			albumReleaseType: "https://schema.org/AlbumRelease",
			numTracks: TRACK_COUNT,
			byArtist: ref(SCHEMA_IDS.artist),
			sameAs: [ALBUM.spotifyUrl],
			track: ALBUM.tracks.map((t) => ({
				"@type": "MusicRecording",
				position: t.n,
				name: t.title,
				duration: formatDuration(t.duration).iso,
				inAlbum: ref(SCHEMA_IDS.album),
				byArtist: ref(SCHEMA_IDS.artist),
			})),
		});
	}

	return { "@context": "https://schema.org", "@graph": graph };
}
