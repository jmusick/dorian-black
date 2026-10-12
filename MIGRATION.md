# Cloudflare Workers migration

Completed October 11, 2026. Account: Justin Musick
(`fdabb6996edf7688fdaf7c8c367f7d08`).

## Production

- Worker: `dorian-black`, custom domain `dorianblack.com`.
- Worker URL: `https://dorian-black.jd-fda.workers.dev`.
- Astro remains static. `dist/` contains public assets; `worker/index.ts`
  routes `/api/contact` to `worker/contact.ts` and uses the ASSETS binding
  for other requests. No Astro server adapter is needed.
- `CLOUDFLARE_API_TOKEN` and `TURNSTILE_SECRET_KEY` are encrypted Worker
  secrets. The existing Turnstile widget/site key was retained. The replacement
  Email Sending token has Email Sending Write permission for this account.
- Workers Builds is connected to `jmusick/dorian-black`, branch `master`,
  build command `npm run build`, deploy command `npx wrangler deploy`.
  The user approved Cloudflare's automatic `dorian-black-build` deployment
  token. Runtime secrets are separate from build variables.
- Pages project `dorian-black` and its deployed content/secrets are retained
  for rollback at `dorianblack.pages.dev`. Production and preview Pages builds
  are disabled. The Pages custom-domain attachment and old apex CNAME were
  removed; the Worker now manages its own domain record.
- The existing www-to-apex redirect and mail-related DNS records were retained.

## Verification

- Astro build, TypeScript check, and Wrangler deployment dry run passed.
- Local and remote Worker checks passed for all five pages, robots/sitemap,
  404s, contact method handling, malformed payloads, validation, and honeypot.
- The live site's hosting disclosure now identifies Cloudflare Workers.
- Both Worker secrets were confirmed encrypted, and the new email token was
  verified active.
- One approved migration email was accepted by Cloudflare Email Sending through
  the local contact Worker (HTTP 201), using the real email token and Cloudflare's
  Turnstile test key. Production Turnstile configuration was not changed.
- The browser form was checked on the production domain. The user completed
  its Turnstile challenge, but submission hit a local negative DNS cache from
  the brief gap during apex record replacement. No email was sent by that
  failed browser attempt. The local test above verifies email delivery; a
  successful production browser submission is still a follow-up once the
  local resolver refreshes. Public DNS already returns the Worker record.

## Rollback

Remove the Worker custom domain, restore the proxied apex CNAME to
`dorianblack.pages.dev` (TTL Auto), and reattach `dorianblack.com` to the
retained Pages project. Restore Pages-compatible source before re-enabling
Pages automatic builds. Saved pre-migration project settings are in ignored
`.wrangler/pages-migration-backup.json`. The last Pages production commit was
`957876d63f967a1debb53b3acf35f139d51a2c47`.

Reference: [Cloudflare migration guide](https://developers.cloudflare.com/workers/static-assets/migration-guides/migrate-from-pages/).
