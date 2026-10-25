# AGENTS.md

Guidance for AI coding agents working in this repo.

## What this is

Marketing site for Dorian Black, a synth-pop recording artist. Astro static
site, deployed to Cloudflare Workers at `dorianblack.com`. See
[README.md](README.md) for the visual-style background and current
content-status caveats (fonts, icons, release info) — read it before touching
visual styling or copy.

## Stack

- **Astro 7** (static output), TypeScript, no UI framework — components are
  `.astro` files with inline `<style>`/`<script>`. Node `>=22.12.0`.
- Styling is hand-written CSS. Design tokens and shared component styles live
  in [src/styles/universal.css](src/styles/universal.css), imported first in
  `Layout.astro` so Astro bundles it into a hashed `/_astro/*.css` file. Its
  `@font-face` rules point at the self-hosted woff2 files in `public/fonts/`.
- Images live in `src/assets/` and go through `astro:assets` (`<Image>`), which
  emits WebP, `srcset`, and intrinsic width/height. Only files that must keep a
  fixed URL (favicons, `site.webmanifest`, `og.png`, `robots.txt`) belong in
  `public/`. `public/og.png` (1200x630) is generated from the cover and logo in
  `src/assets/` by `node scripts/build-og-image.mjs`; keep it ≤300 KB.
  `favicon.ico`, `apple-touch-icon.png` and `icon-192/512.png` come from the
  logo via `node scripts/build-icons.mjs`.
- Icons via `astro-icon` + `@iconify-json/simple-icons` / `lucide`.
- `@astrojs/sitemap` generates `sitemap-index.xml` at build time.
- Deploy target: Cloudflare Worker `dorian-black` via `wrangler.toml`
  (`npm run deploy`, or Workers Builds on push to `master`).
- Workers Builds installs with npm 10.9.2 (`npm ci`), which ignores nested
  `overrides` and then rejects the lockfile. `package.json` overrides use the
  version-selector form (`"undici@7": "^7.30.1"` lifts miniflare's undici for
  Dependabot alert #5; drop it once wrangler ships undici ≥ 7.30.1). After
  touching overrides or the lockfile, check `npx -y npm@10.9.2 ci` passes.

## Structure

- `src/pages/` — routes (`index.astro`, `about.astro`, `music.astro`,
  `contact.astro`, `privacy-policy.astro`, `404.astro`). Each page passes `title`,
  `description`, `canonicalUrl`, and optional `robots` / `structuredData` /
  social-image props to the layout.
- `src/layouts/Layout.astro` — shared page shell: `<head>` metadata (canonical,
  Open Graph, Twitter, JSON-LD), skip link, header, `<main id="main">`, footer,
  and the cookie banner.
- `src/components/` — `SiteHeader.astro` (nav + mobile menu toggle),
  `SiteFooter.astro`, `CookieConsent.astro` (GA consent banner).
- `src/config/site.ts` — single source of truth for site URL, name, tagline,
  `SOCIALS` (streaming/social links), contact email, Turnstile site key, and
  GA measurement ID. Entries with `href: null` are auto-hidden by the
  header/footer/Music page — don't special-case missing links elsewhere, just
  fill in the `href`. Use `ACTIVE_SOCIALS` when you need only live links.
- `src/data/album.ts` — album/track data (`After Tonight`). Track order,
  durations, and release date here are the single source for the Music page;
  don't hardcode track info in components.
- `src/lib/schema.ts` — builds the site's linked JSON-LD `@graph` from
  `site.ts` / `album.ts`; `Layout.astro` uses it by default.
- `src/integrations/csp-headers.mjs` — build integration that writes inline
  script hashes into `dist/_headers`.
- `worker/index.ts` — Worker routing: `/api/contact` goes to the handler,
  everything else to the `ASSETS` binding.
- `worker/contact.ts` — the only server-side endpoint. It validates Contact
  page submissions, verifies Turnstile, and uses Cloudflare Email Sending.
- `worker-configuration.d.ts` — generated Worker types (`npm run types:worker`).
- `.vscode/` — Firefox debug launch config plus the `dev server` task it runs.

## Commands

```bash
npm run dev           # astro dev, http://localhost:4321 (no Worker handler)
npm run build         # astro build -> dist/
npm run preview       # serve the built output
npm run dev:worker    # build + wrangler dev on :8787, includes /api/contact
npm run deploy        # build + wrangler deploy
npm run types:worker  # regenerate worker-configuration.d.ts
```

`.claude/launch.json` defines a `dorian-black-dev` preview on port 4331 for
browser checks, and `dorian-black-worker` (`wrangler dev` on 8791, serving the
current `dist/`) for checking response headers and the CSP. Rebuild before
starting it.

No test suite or linter is configured. Verify changes with `npm run build`
and, for anything visual, `npm run dev` + a browser check (desktop and a
320px-wide viewport). After a build, `node scripts/check-seo.mjs` prints each
page's title and description length and exits non-zero if a description is
missing or over 155 characters.

## Issue tracker and backlog

Work is tracked in GitHub issues on `jmusick/dorian-black`. A security, SEO,
and accessibility audit on 2026-10-11 filed issues #1–#25.

- Labels: one or more categories (`security`, `seo`, `accessibility`) plus one
  priority (`p1` fix first, `p2`, `p3` polish).
- Before changing an area, check for an open issue that covers it
  (`gh issue list --label <category>`) and follow its checklist rather than
  redesigning the fix. Several issues share files (`public/_headers`,
  `Layout.astro`, `universal.css`); each issue notes the overlap.
- Reference the issue in the commit (`Fixes #N`) and tick off checklist items
  that a change only partly covers.
- New findings get their own issue with a category and priority label, cite
  `file:line`, and include a concrete fix.

## Conventions

- Keep website setup, implementation details, styling/public-copy status,
  deployment, and technical follow-up in this source repository's Markdown.
  Other project notes should link these documents instead of duplicating them.
- The original asset library is `C:\Users\JD\projects\dorian-black`; every
  folder there uses lowercase kebab-case. It owns media masters, album-grouped
  song `.txt` files in `assets/albums/<album>/lyrics/`, and historical sources.
  Keep only optimized production assets in this repository's `public/`.
- Read the project-library indexes before selecting artwork or song sources.
  Approved assets and exploratory concepts stay separate. Do not change lyrics,
  source archives, or album decisions as a side effect of a website edit.
- Keep the site static except for `POST /api/contact`; it is a Worker handler
  because the Email Sending token cannot ship to the browser. Do not add other
  server routes or client-side data fetching without an explicit requirement.
  Content changes go through `src/config/site.ts` / `src/data/album.ts`, not
  component-level hardcoding.
- Remaining placeholder values are flagged inline (see README "Content
  status" and comments in `site.ts`/`album.ts`, e.g. release date, track
  order, About bio). Don't quietly invent real-looking replacements — either
  use the flagged placeholder or ask.
- `astro.config.mjs` `site`, `src/config/site.ts` `SITE_URL`, and
  `public/robots.txt`'s `Sitemap:` line must all point at the same domain
  (`dorianblack.com`) — nothing else in the codebase hardcodes it.

## Accessibility guardrails

Target WCAG 2.2 AA. Don't regress what already passes:

- Keep the skip link, landmarks (`header`/`nav`/`main#main`/`footer`), one
  `<h1>` per page, and logical heading order. Section labels that introduce
  content should be headings, not styled `<p>`s.
- Text must meet 4.5:1 (3:1 for large text and UI boundaries such as input
  borders) against its actual background. `--ink-3` (`#9389a8`) passes 4.5:1 on every
  surface (5.5:1 on `--surface-2`, the worst case); re-check any new color
  with the WCAG luminance formula before adding it.
- Links inside running text are underlined (`main p a`, `main li a`,
  `.footer-legal a`, `.cc-body a`, link-style buttons); keep a non-color cue
  on any new inline link.
- Icon-only links need an `aria-label`; decorative SVGs and images get
  `aria-hidden="true"` / `alt=""`.
- Never hide focusable content with only `opacity`/`max-height` — use
  `hidden`, `inert`, or `visibility: hidden` (#11).
- Keep the global `:focus-visible` outline; if a component removes `outline`,
  replace it with an equally visible style.
- New motion must respect the existing `prefers-reduced-motion` block in
  `universal.css`.
- Form fields need `<label for>`, `autocomplete` where applicable, and errors
  announced through a live region.

## SEO guardrails

- Every page needs a unique `title` and a ≤155-character `description` passed
  to `Layout.astro`, and an absolute `canonicalUrl` with a trailing slash
  (matching Astro's directory output and the internal links).
- Build JSON-LD from `site.ts` / `album.ts` data rather than literal strings,
  and keep one artist entity across pages (#18).
- Non-content pages (404, legal) should pass `robots="noindex,follow"`.
- Use `astro:assets` `<Image>` for raster images; the above-the-fold hero gets
  `loading="eager"`, `fetchpriority="high"`, and a real `sizes` value.

## Security guardrails

- Never commit secrets. `.dev.vars` and `.env` are gitignored; only
  `.dev.vars.example` / `.env.example` belong in git.
- Security headers and the CSP live in `public/_headers`. Any new
  third-party origin (script, font, frame, image) requires updating that CSP,
  the privacy policy, and — if it contacts the
  third party before consent — the cookie banner wording (#4).
- Inline `<script>`s are allowed by sha256 hash, which
  `src/integrations/csp-headers.mjs` writes into `dist/_headers` on every
  build, so never hand-edit hashes. The CSP ships as `Report-Only` until it has
  been watched in production.
- `public/_headers` also sets caching: `/_astro/*` (hashed) is immutable for a
  year; fonts and the fixed-URL files in `public/` get one day plus
  `stale-while-revalidate`; HTML keeps the platform default and revalidates.
  A new fixed-URL file in `public/` needs its own rule there. Small page
  `<style>` blocks are inlined by Astro (`inlineStylesheets: "auto"`), which
  the CSP's `style-src 'unsafe-inline'` allows.
- External `target="_blank"` links keep `rel="noopener noreferrer"`.
- Client scripts write user-visible text with `textContent`, never
  `innerHTML`. `set:html` is only for static JSON-LD built from repo data.
- The contact handler must validate and length-cap every field, strip control
  characters from anything that reaches an email header, and never return
  secret names, stack traces, or upstream error bodies to the client (#5).

## Contact form and email

- Mail uses Cloudflare Email Sending's REST API. The token must have
  `Email Sending: Edit` permission.
- Keep `from` on the connected and verified domain. Put the visitor's address
  in the API's top-level snake_case `reply_to` field; `replyTo` is invalid.
- Treat success as `data.success`, not merely an HTTP 2xx response.
- `CLOUDFLARE_ACCOUNT_ID`, `EMAIL_FROM_CONTACT`, and `CONTACT_TO_EMAIL` are
  plaintext `[vars]` in `wrangler.toml`. `CLOUDFLARE_API_TOKEN` and
  `TURNSTILE_SECRET_KEY` are Worker secrets and must never be committed.
- The public Turnstile site key is committed in `src/config/site.ts`, with
  `PUBLIC_TURNSTILE_SITE_KEY` available only as an optional build override.
  `astro dev` uses Cloudflare's test key, but does not serve the Worker handler; use
  `npm run dev:worker` for end-to-end local tests.
- Don't POST to the production `/api/contact` for testing — it sends real email.
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
- Fonts are self-hosted from `public/fonts/` (`@font-face` in
  `src/styles/universal.css`), so nothing reaches Google before consent. Keep
  it that way; don't reintroduce a Google Fonts `@import` or `<link>`.
