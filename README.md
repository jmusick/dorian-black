# Dorian Black

Website for Dorian Black, a synth-pop recording artist. Albums: **Second Nature**
(12 tracks, out 2026-11-06) and the debut **After Tonight** (12 tracks).

Built with [Astro](https://astro.build), deployed to [Cloudflare Workers](https://workers.cloudflare.com/). Stack and structure mirror the [Pneumaris](https://pneumarisband.com) site.

## Visual style

The site's visual language uses near-black backgrounds, magenta/violet/blue neon glow, and Audiowide/Rajdhani/Dancing Script type. Its design tokens and component styles live in [src/styles/universal.css](src/styles/universal.css).

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
- `src/data/album.ts` holds both releases. Second Nature's sequence and
  release date (2026-11-06) come from the DistroKid release; its pre-save
  button links the DistroKid HyperFollow page.
- Second Nature's `blurb`, its track notes, and the About page sentence about
  it are draft copy written from the lyrics, not approved artist copy.
- The Second Nature cover is the 3000 x 3000 JPEG uploaded to DistroKid
  (`assets/concepts/second-nature/second-nature-broken-glass-straight-torso-3000x3000.jpg`
  in the project library), resized to 1400 px in `src/assets/`.
- The site is static, so Second Nature switches from "Out November 6" and
  "Pre-save" to "Out now" and "Listen" on the first build on or after the
  release date. Rebuild on release day and fill in `SECOND_NATURE.spotifyUrl`
  once the Spotify album page exists.
- After Tonight's track order and release date (2026-08-14) come from the
  DistroKid release.

The site has Home, Music, About, Contact, and Privacy Policy pages, plus a
branded 404 page. Home leads with the latest release (`LATEST`) and keeps the
After Tonight Spotify player; the Music page lists every release with its
tracklist. Track listings and WAV-derived durations come from
[src/data/album.ts](src/data/album.ts); cover art is mapped by slug in
[src/data/covers.ts](src/data/covers.ts). Official streaming and social profile
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
- `assets/albums/second-nature/` — WAVs and working song text for Second Nature.
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
npm run check                               # type check (astro sync + tsc --noEmit)
npm run dev:worker                          # includes /api/contact on :8787
```

GitHub Actions (`.github/workflows/ci.yml`) runs the shared
[jmusick/ci](https://github.com/jmusick/ci) checks on every pull request and
push to `main`: secret scan, dependency audit, type check, build, and
`scripts/check-seo.mjs`. See [AGENTS.md](AGENTS.md#ci) for details.

## Build

```bash
npm run build
npm run preview
```

## Deploy

Cloudflare Worker `dorian-black`, via `wrangler.toml`, served on the custom
domain `dorianblack.com` (`www` redirects to the apex). The `*.workers.dev`
hostname and per-version preview URLs are disabled (`workers_dev = false`,
`preview_urls = false`), so the custom domain is the only public entry point and
zone-level WAF, rate-limit and header rules always apply. Unknown paths serve
`dist/404.html` with a 404 status (`not_found_handling = "404-page"`). Astro builds static assets into `dist/`;
`worker/index.ts` routes only the contact API to server code. Publish locally
with:

```bash
npm run deploy
```

Worker Builds connects to `jmusick/dorian-black`, production branch
`main`, build command `npm run build`, deploy command `npx wrangler deploy`.
Other branches (pull requests) run the preview command
`npx wrangler versions upload --dry-run`, so PR checks build and validate the
config but upload nothing; preview URLs stay off. The builder installs with
npm 10.9.2. Build variables and runtime secrets are separate in Workers.

Dependabot (`.github/dependabot.yml`) opens a weekly grouped PR for minor and
patch npm updates.

`public/_redirects` gives existing pages permanent (308) redirects to their
canonical trailing-slash URLs, including `/index.html` aliases. Add aliases
there when adding a page. These rules run in Static Assets, keeping
`run_worker_first` limited to `/api/*`; `html_handling` retains its default
`auto-trailing-slash` behavior for other paths (its built-in redirects are 307).

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
`dorianblack.com/api/contact` in the dashboard; zone rules do not cover a
workers.dev hostname (now disabled).

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

Fonts are self-hosted (latin woff2 in `public/fonts/`, OFL licenses alongside),
so nothing reaches Google before consent. The home page's Spotify player loads
automatically for visitors who accepted the banner (CookieConsent sets
`data-consent="granted"` on `<html>` and fires a `db:consent` event); everyone
else gets a click-to-load button and nothing reaches Spotify until they click.

## Known issues and backlog

A security, SEO, and accessibility audit on 2026-10-11 filed 25 GitHub issues,
labelled by category and priority (`p1` first, then `p2`, `p3`). Most are
fixed; still open:

- [#13 programmatic contact form errors](https://github.com/jmusick/dorian-black/issues/13) (P3).
- [#23 thin content and keyword headings](https://github.com/jmusick/dorian-black/issues/23) (P3).
- [#25 oversized source images in `src/assets`](https://github.com/jmusick/dorian-black/issues/25) (P3).

See [all open issues](https://github.com/jmusick/dorian-black/issues).
