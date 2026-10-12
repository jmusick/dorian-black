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
- No confirmed release date (`src/data/album.ts` `ALBUM.releaseDate`).
- Track order in `src/data/album.ts` is a proposed sequence, not a confirmed master order.

## Development

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

Cloudflare Worker `dorian-black`, via `wrangler.toml`. Astro builds static assets
into `dist/`; `worker/index.ts` routes only the contact API to server code.
Publish locally with:

```bash
npm run deploy
```

Worker Builds connects to `jmusick/dorian-black`, production branch
`master`, build command `npm run build`, deploy command `npx wrangler deploy`.
Build variables and runtime secrets are separate in Workers.

Migration tracking and cutover checks are in [MIGRATION.md](MIGRATION.md).

## Contact form

`POST /api/contact` is the site's only server-side route. The Cloudflare Worker
handler in [`worker/contact.ts`](worker/contact.ts) verifies
Turnstile and sends messages through the Cloudflare Email Sending REST API.

Production configuration:

| Location | Type | Name |
| --- | --- | --- |
| `wrangler.toml` `[vars]` | Plaintext | `CLOUDFLARE_ACCOUNT_ID` |
| Worker secret | Encrypted | `CLOUDFLARE_API_TOKEN` |
| Worker secret | Encrypted | `TURNSTILE_SECRET_KEY` |

The API token needs `Email Sending: Edit` permission for the account. The
Worker handler defaults to `contact@dorianblack.com` as its verified sender and
`hello@dorianblack.com` as its destination; `EMAIL_FROM_CONTACT` and
`CONTACT_TO_EMAIL` can override those at runtime.

The public Turnstile site key is committed in `src/config/site.ts` so the form
cannot silently disappear when a build variable is missing.
`PUBLIC_TURNSTILE_SITE_KEY` remains an optional build-time override. Copy
`.dev.vars.example` to `.dev.vars` for local Worker testing; never commit the
populated file.
