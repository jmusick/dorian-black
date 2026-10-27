import { getImage } from "astro:assets";
import { ACTIVE_SOCIALS, ARTIST_GENRE, SITE_NAME, SITE_TAGLINE, SITE_URL } from "../config/site";
import { RELEASES, formatDuration, type Release } from "../data/album";
import { COVERS } from "../data/covers";

/**
 * One linked schema.org @graph for the whole site (#18). Every page gets the
 * WebSite and the artist (MusicGroup); Home and Music also get every album
 * with its tracks. Nodes reference each other by @id so search engines see a single
 * artist entity across pages. Everything comes from src/config/site.ts and
 * src/data/album.ts — add facts there, not here.
 */

const HOME_URL = `${SITE_URL}/`;
const MUSIC_URL = `${SITE_URL}/music/`;

export const SCHEMA_IDS = {
	website: `${HOME_URL}#website`,
	artist: `${HOME_URL}#artist`,
} as const;

/** Each album's @id is its anchor on the Music page. */
const albumId = (release: Release) => `${MUSIC_URL}#${release.slug}`;

type Node = Record<string, unknown>;

const ref = (id: string) => ({ "@id": id });

export interface SchemaGraphOptions {
	/** Include the MusicAlbum nodes and their tracks (Home and Music pages). */
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
		// Only link the albums where their nodes are in the same graph, so
		// every @id reference on a page resolves.
		...(album ? { album: RELEASES.map((r) => ref(albumId(r))) } : {}),
	};

	const graph: Node[] = [website, artist];

	if (album) {
		for (const release of RELEASES) {
			const coverImage = await getImage({ src: COVERS[release.slug], width: 1200 });
			const id = albumId(release);
			graph.push({
				"@type": "MusicAlbum",
				"@id": id,
				name: release.title,
				url: id,
				description: release.blurb,
				image: new URL(coverImage.src, SITE_URL).href,
				// Omitted until the release date is confirmed (README "Content status").
				...(release.releaseDateConfirmed ? { datePublished: release.releaseDate } : {}),
				genre: ARTIST_GENRE,
				albumProductionType: "https://schema.org/StudioAlbum",
				albumReleaseType: "https://schema.org/AlbumRelease",
				numTracks: release.tracks.length,
				byArtist: ref(SCHEMA_IDS.artist),
				...(release.spotifyUrl ? { sameAs: [release.spotifyUrl] } : {}),
				track: release.tracks.map((t) => ({
					"@type": "MusicRecording",
					position: t.n,
					name: t.title,
					duration: formatDuration(t.duration).iso,
					inAlbum: ref(id),
					byArtist: ref(SCHEMA_IDS.artist),
				})),
			});
		}
	}

	return { "@context": "https://schema.org", "@graph": graph };
}
