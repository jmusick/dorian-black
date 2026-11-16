# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Listeners and fans. They arrive from a link on Spotify, Apple Music,
Instagram, TikTok, Facebook or X, usually after hearing a track or seeing a
post, and want to hear the music, see what has been released, and find
where to follow. Most of them are probably on a phone, since that is where
those links get tapped (inferred from the traffic sources, not measured).

Press, booking, licensing and collaborators are a secondary audience. They
are served by the Contact page and do not shape the primary flow.

## Product Purpose

dorianblack.com is the official home of Dorian Black, a synth-pop artist. It
presents the releases (the new album *Second Nature*, out 2026-11-06, and the
debut *After Tonight*, out 2026-08-14), their tracklists, and the artist's
official store and social profiles, and it takes enquiries through a contact
form.

A good visit ends with a stream or a follow: the visitor plays the latest
album or follows Dorian Black on Spotify or Apple Music. Contact is a
secondary outcome.

## Positioning

Dorian Black is an artist persona, not a real person's biography. The records
are concept albums about the city after dark: *After Tonight* runs across a
single night, from the doors opening to the morning after; *Second Nature*
follows what happens once that night turns into a life. The site is the one
place where both records, in sequence, read as a single story told by the
same character.

## Operating Context

- Visitors land from an artist profile, a post or a share link, and leave
  for a streaming app. The site is the step between the two, not the place
  the music plays (the Home page's Spotify embed loads only after consent or
  a click).
- Release status switches at build time: a release reads "Out now" on the
  first build on or after its date. Pre-release, the main action is the
  HyperFollow pre-save; once out, it's the direct Spotify album link.
- Pages: Home (leads with the latest release), Music (every release with its
  tracklist), About, Contact, Privacy Policy, and a 404.

## Capabilities and Constraints

- Static Astro site on Cloudflare Workers at `dorianblack.com`. The only
  server route is `POST /api/contact`. No other server routes or client-side
  data fetching without an explicit requirement.
- Release, track, store-link and social data live in `src/data/album.ts` and
  `src/config/site.ts`, and pages render from them. Content changes go there,
  not into components. Profiles with no URL (YouTube and SoundCloud for now)
  stay hidden until a URL is added.
- Privacy before reach: Google Analytics and the Spotify embed load only
  after consent. Fonts are self-hosted. Any new third-party origin needs the
  CSP, the privacy policy and the consent wording updated together.
- Terminology: "album", "release", "tracklist", "pre-save", "Out now".
- Undecided: per-track pages, lyrics on the site, a mailing list, video.
  None exists today, so none should be implied.

## Brand Commitments

- Name: Dorian Black. Tagline: "Synth-pop from the city after dark."
- Persona voice: copy stays in character and speaks in concrete late-night
  scenes (last call, the booth by the diner window, the walk home) rather
  than abstract claims. Copy never invents biographical facts about a real
  person: no hometown, age, influences, career history or quotes.
- The site doesn't say how the music is produced. Adding that is the
  owner's decision, not a copy edit.
- Approved assets: the logo (`src/assets/logo-transparent.png`, masters in
  the project library's `assets/brand/`), the two album covers in
  `src/assets/`, and the neon "DB" social avatar in the project library.
  Artwork in the library's `assets/concepts/` is unapproved.
- No confirmed brand fonts or custom icon set exist yet (see README).

## Evidence on Hand

- Two released albums of 12 tracks each, with sequence, durations, release
  dates confirmed against DistroKid, and verified Spotify and Apple Music
  album links (`src/data/album.ts`).
- Live Spotify, Apple Music, Instagram, TikTok, Facebook and X profiles
  (`src/config/site.ts`).
- Album covers (`src/assets/`) and an 18-second vertical *After Tonight*
  promo video in the project library (`assets/social/campaigns/`), which the
  site doesn't use yet.
- Draft, unapproved copy: the About bio, the *Second Nature* blurb and its
  track notes. They are flagged in code and must not be presented as final.
- Absent, and must not be fabricated: press quotes, reviews, testimonials,
  stream or follower counts, playlist placements, tour or show dates, awards,
  credits, and an approved biography.

## Product Principles

1. **Get them to the music.** Every page should put a play or a follow within
   one step. Everything else supports that.
2. **In character, never invented.** The persona can carry mood and story,
   but every fact shown (dates, tracks, links) comes from the data files, and
   nothing biographical, social-proof or press-related gets made up.
3. **The albums are the story.** Present releases as a sequence (one night,
   then the life after it) rather than as a pile of products.
4. **Privacy is part of the brand.** Nothing reaches a third party before the
   visitor says yes.
5. **Light and static.** It's a fast static page for someone who tapped a
   link on a phone and wants to hear the album.

## Accessibility & Inclusion

Target WCAG 2.2 AA. The guardrails in `AGENTS.md` are binding: skip link and
landmarks, one `<h1>` per page, 4.5:1 text contrast against the actual
background, non-color cues on inline links, labelled icon-only links,
visible focus, `prefers-reduced-motion` respected, and form errors announced
through a live region.
