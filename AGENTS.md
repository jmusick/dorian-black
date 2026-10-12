# AGENTS.md

Guidance for AI coding agents working in this repo.

## What this is

Marketing site for Dorian Black, a synth-pop recording artist. Astro static
site, deployed to Cloudflare Workers. See [README.md](README.md) for the
visual-style background and current content-status caveats (fonts, icons,
release info) — read it before touching visual styling or copy.

## Stack

- **Astro** (static output), TypeScript, no UI framework — components are
  `.astro` files with inline `<style>`/`<script>`.
- Styling is hand-written CSS. Design tokens and shared component styles live
  in [public/universal.css](public/universal.css).
- Icons via `astro-icon` + `@iconify-json/simple-icons` / `lucide`.
- Deploy target: Cloudflare Worker `dorian-black` via `wrangler.toml`
  (`npm run deploy`).

## Structure

- `src/pages/` — routes (`index.astro`, `about.astro`, `music.astro`,
  `contact.astro`, `privacy-policy.astro`).
- `src/components/` — `SiteHeader.astro`, `SiteFooter.astro`.
- `src/layouts/Layout.astro` — shared page shell.
- `src/config/site.ts` — single source of truth for site URL, name, tagline,
  and `SOCIALS` (streaming/social links). Entries with `href: null` are
  auto-hidden by the header/footer/Music page — don't special-case missing
  links elsewhere, just fill in the `href`.
- `src/data/album.ts` — album/track data (`After Tonight`). Track order,
  durations, and release date here are the single source for the Music page;
  don't hardcode track info in components.
- `worker/index.ts` — Worker routing and static asset fallback.
- `worker/contact.ts` — the only server-side endpoint. It validates Contact
  page submissions, verifies Turnstile, and uses Cloudflare Email Sending.

## Commands

```bash
npm run dev       # astro dev, http://localhost:4321
npm run build     # astro build -> dist/
npm run preview   # serve the built output
npm run dev:worker  # includes the contact Worker handler
```

No test suite or linter is configured. Verify changes with `npm run build`
and, for anything visual, `npm run dev` + a browser check.

## Conventions

- Keep the site static except for `POST /api/contact`; it is a Worker handler
  because the Email Sending token cannot ship to the browser. Do not add other
  server routes or client-side data fetching without an explicit requirement.
  Content changes go through `src/config/site.ts` / `src/data/album.ts`, not
  component-level hardcoding.
- Remaining placeholder values are flagged inline (see README "Content
  status" and comments in `site.ts`/`album.ts`, e.g. release date, track
  order). Don't quietly invent real-looking replacements — either use the
  flagged placeholder or ask.
- `astro.config.mjs` `site`, `src/config/site.ts` `SITE_URL`, and
  `public/robots.txt`'s `Sitemap:` line must all point at the same domain
  (`dorianblack.com`) — nothing else in the codebase hardcodes it.

## Contact form and email

- Mail uses Cloudflare Email Sending's REST API. The token must have
  `Email Sending: Edit` permission.
- Keep `from` on the connected and verified domain. Put the visitor's address
  in the API's top-level snake_case `reply_to` field; `replyTo` is invalid.
- Treat success as `data.success`, not merely an HTTP 2xx response.
- `CLOUDFLARE_ACCOUNT_ID` is plaintext in `wrangler.toml`. The API token and
  `TURNSTILE_SECRET_KEY` are Worker secrets and must never be committed.
- The public Turnstile site key is committed in `src/config/site.ts`, with
  `PUBLIC_TURNSTILE_SITE_KEY` available only as an optional build override.
  `astro dev` uses Cloudflare's test key, but does not serve the Worker handler; use
  `npm run dev:worker` for end-to-end local tests.
- Keep the contact-form data description in `privacy-policy.astro` accurate if
  fields, providers, storage, or retention behavior change.

## Analytics and cookie consent

- Google Analytics 4 is opt-in. `GA_MEASUREMENT_ID` lives in
  `src/config/site.ts`; `src/components/CookieConsent.astro` loads gtag.js only
  after the visitor accepts, and never in `astro dev` (`ANALYTICS_ID` is null
  there). The footer's "Cookie choices" button (`data-cookie-preferences`)
  reopens the banner. Same pattern as the SimonRook and Pneumaris sites.
- Don't add a GA snippet to `<head>` directly — that would send data to Google
  before consent. Keep the Analytics section of `privacy-policy.astro` in sync.
