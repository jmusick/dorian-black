# Dorian Black

Website for Dorian Black, a synth-pop recording artist. Debut album: **After Tonight** (12 tracks).

Built with [Astro](https://astro.build), deployed to [Cloudflare Workers](https://workers.cloudflare.com/). Stack and structure mirror the [Pneumaris](https://pneumarisband.com) site.

## Visual style

The site's visual language uses near-black backgrounds, magenta/violet/blue neon glow, and Audiowide/Rajdhani/Dancing Script type. Its design tokens and component styles live in [public/universal.css](public/universal.css).

**Unresolved brand details:**
- Fonts (Audiowide, Rajdhani, Dancing Script) are Google Fonts approximations, not confirmed brand fonts.
- No real icon set — social icons currently use `astro-icon` + `simple-icons`, swap if a custom set shows up.
- Bio copy on the About page is placeholder, written to match the documented voice guidelines, not approved artist copy.

## Content status

- Spotify, Apple Music, Instagram, TikTok, Facebook, and X links are live;
  YouTube and SoundCloud are still unset ([src/config/site.ts](src/config/site.ts)
  `SOCIALS` — `href: null` entries auto-hide from the header/footer/Music page
  until filled in).
- The Contact page, Turnstile widget, and Email Sending handler are configured;
  production requires encrypted Worker secrets for the API token and Turnstile.
- `src/data/album.ts` `ALBUM.releaseDate` currently contains `2026-08-14`.
  Earlier documentation treated that date as unconfirmed; confirm it against
  the release record before treating it as approved metadata.
- Track order in `src/data/album.ts` is a proposed sequence, not a confirmed master order.

The site has Home, Music, About, Contact, and Privacy Policy pages. The Music
page reads its track listing and WAV-derived durations from
[src/data/album.ts](src/data/album.ts). Official streaming and social profile
URLs are maintained in [src/config/site.ts](src/config/site.ts).

## Workspace and documentation

The active website source is `C:\Users\JD\source\dorian-black`. Website setup,
architecture, styling, public-copy status, deployment, and technical follow-up
belong in this repository's Markdown documentation. Coding conventions live
in [AGENTS.md](AGENTS.md); this README owns the website's content checks.

Original creative assets and song text live in
`C:\Users\JD\projects\dorian-black`, separately from the optimized copies used
by the site in `public/`. The project library uses lowercase kebab-case folders:

- `assets/brand/` — approved logo masters.
- `assets/albums/after-tonight/` — original WAVs, approved cover, and individual
  song `.txt` files in `lyrics/`.
- `assets/albums/second-nature/lyrics/` — working song text for the next album.
- `assets/social/` — campaign masters and platform upload copies.
- `assets/concepts/` — exploratory artwork.
- `sources/` — historical drafts, exports, recovery provenance, and backups.

The project's `README.md` and `LYRICS.md` index those files. The source does not
import lyrics, raw recovery archives, or original media at build time. The
album data remains the single source for the website's display metadata;
asset indexes and playlist order do not establish a final master sequence.

## Development

Requires Node `>=22.12.0`.

```bash
npm install
npm run dev                                  # static pages only
npm run build
npm run dev:worker                          # includes /api/contact on :8787
```

## Build

```bash
npm run build
npm run preview
```

## Deploy

Cloudflare Worker `dorian-black`, via `wrangler.toml`, served on the custom
domain `dorianblack.com` (`www` redirects to the apex). The Worker is also
reachable at `https://dorian-black.jd-fda.workers.dev` while `workers_dev` is
enabled (see issue #6). Astro builds static assets into `dist/`;
`worker/index.ts` routes only the contact API to server code. Publish locally
with:

```bash
npm run deploy
```

Worker Builds connects to `jmusick/dorian-black`, production branch
`master`, build command `npm run build`, deploy command `npx wrangler deploy`.
Build variables and runtime secrets are separate in Workers.

DNS for `dorianblack.com` is managed in Cloudflare. The Worker owns the apex
custom-domain record; the `www` → apex redirect and mail records are separate
zone records. To roll back, restore an earlier version from the Worker's
deployment history. The site moved from Cloudflare Pages to Workers on
2026-10-11 and the Pages project was deleted, so there is no Pages deployment
to fall back to.

## Contact form

`POST /api/contact` is the site's only server-side route. The Cloudflare Worker
handler in [`worker/contact.ts`](worker/contact.ts) verifies
Turnstile and sends messages through the Cloudflare Email Sending REST API.

Request handling, in order (each failure returns JSON `{ "error": ... }`):

1. Non-POST: `405` with `Allow: POST`.
2. `Origin` present and not `https://dorianblack.com`: `403`.
3. `Content-Type` not `application/json`: `415`.
4. Rate limit, 3 requests per 60 s per `CF-Connecting-IP`: `429` with
   `Retry-After: 60`. This runs before the body is read and before Turnstile.
5. Body over 16 KB: `413`. Then JSON parse and field validation (`400`).
   A filled honeypot returns the same `201` as a real send.
6. Turnstile siteverify: the token must be at most 2048 characters, `success`
   must be true, and `hostname` and `action` must match (`dorianblack.com` and
   `contact`; the widget sets `data-action="contact"`). `error-codes` are logged.
7. Email Sending call; `201` on success, `502` on upstream failure. Missing
   secrets return a generic `503`; the missing names go to the Worker logs only.

Rate limiting uses a Workers Rate Limiting binding (`CONTACT_LIMITER`,
`[[ratelimits]]` in `wrangler.toml`). The binding only supports 10 s or 60 s
periods, and counters are per Cloudflare location and eventually consistent, so
it is a burst limiter rather than exact accounting. For a longer window (for
example 5 per 10 minutes), add a zone WAF rate-limiting rule on
`dorianblack.com/api/contact` in the dashboard; zone rules do not cover the
workers.dev hostname.

Production configuration:

| Location | Type | Name |
| --- | --- | --- |
| `wrangler.toml` `[vars]` | Plaintext | `CLOUDFLARE_ACCOUNT_ID` |
| `wrangler.toml` `[vars]` | Plaintext | `EMAIL_FROM_CONTACT` (`contact@dorianblack.com`) |
| `wrangler.toml` `[vars]` | Plaintext | `CONTACT_TO_EMAIL` (`hello@dorianblack.com`) |
| `wrangler.toml` `[vars]` | Plaintext | `ALLOWED_ORIGIN` (`https://dorianblack.com`) |
| `wrangler.toml` `[vars]` | Plaintext | `TURNSTILE_HOSTNAME` (`dorianblack.com`) |
| `wrangler.toml` `[vars]` | Plaintext | `TURNSTILE_ACTION` (`contact`) |
| `wrangler.toml` `[[ratelimits]]` | Binding | `CONTACT_LIMITER` (3 per 60 s) |
| Worker secret | Encrypted | `CLOUDFLARE_API_TOKEN` |
| Worker secret | Encrypted | `TURNSTILE_SECRET_KEY` |

The API token needs `Email Sending: Edit` permission for the account. The
sender must stay on the verified `dorianblack.com` domain; the handler falls
back to the same two addresses if the vars are missing.

The public Turnstile site key is committed in `src/config/site.ts` so the form
cannot silently disappear when a build variable is missing.
`PUBLIC_TURNSTILE_SITE_KEY` remains an optional build-time override. Copy
`.dev.vars.example` to `.dev.vars` for local Worker testing; never commit the
populated file.

For `npm run dev:worker` the page is served from `http://localhost:8787` and
Cloudflare's Turnstile test keys report hostname `example.com` with no action.
`.dev.vars.example` therefore overrides `ALLOWED_ORIGIN`, `TURNSTILE_HOSTNAME`,
and `TURNSTILE_ACTION` for local use only, and suggests the test secret
`1x0000000000000000000000000000000AA`. The strict values stay in
`wrangler.toml` (and as code defaults), so production never loosens them.

## Analytics and cookie consent

Google Analytics 4 is opt-in. `GA_MEASUREMENT_ID` in
[src/config/site.ts](src/config/site.ts) is passed to
[CookieConsent.astro](src/components/CookieConsent.astro), which loads gtag.js
only after acceptance. Analytics is disabled in `astro dev`; the footer's
"Cookie choices" button reopens preferences. Keep the Analytics section of
[the privacy policy](src/pages/privacy-policy.astro) aligned with this behavior.

Google Fonts still load before consent through `public/universal.css`, so the
banner's "Nothing is sent to Google unless you accept" is not yet accurate.
Self-hosting the fonts is tracked in issue #4.

## Known issues and backlog

A security, SEO, and accessibility audit on 2026-10-11 filed 25 GitHub issues,
labelled by category and priority (`priority: P1` first, then P2, P3):

- [Security](https://github.com/jmusick/dorian-black/issues?q=is%3Aissue+is%3Aopen+label%3Asecurity)
  — dependency upgrade (Astro 7, npm audit), response headers/CSP, contact
  endpoint rate limiting and hardening, workers.dev exposure, pre-consent
  Google Fonts.
- [SEO](https://github.com/jmusick/dorian-black/issues?q=is%3Aissue+is%3Aopen+label%3Aseo)
  — 404 page, linked JSON-LD, titles/descriptions, share image, favicons,
  caching and LCP, content depth.
- [Accessibility](https://github.com/jmusick/dorian-black/issues?q=is%3Aissue+is%3Aopen+label%3Aaccessibility)
  — link underlines, muted-text and input-border contrast, cookie banner
  overlap and focus, mobile menu focus order, form errors, tracklist semantics.

Highest priority: [#1 Astro / npm audit upgrade](https://github.com/jmusick/dorian-black/issues/1)
and [#7 underline inline links](https://github.com/jmusick/dorian-black/issues/7).
