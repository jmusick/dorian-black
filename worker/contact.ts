/// <reference types="@cloudflare/workers-types" />

/**
 * Contact form endpoint — POST /api/contact
 *
 * This Cloudflare Worker handler verifies Turnstile and sends the message
 * through Cloudflare Email Sending. The rest of the site remains static.
 */

interface ContactPayload {
	name?: unknown;
	email?: unknown;
	subject?: unknown;
	message?: unknown;
	captchaToken?: unknown;
	/** Honeypot — real visitors never fill this in. */
	website?: unknown;
}

const LIMITS = {
	name: 100,
	subject: 150,
	email: 254,
	messageMin: 10,
	messageMax: 4000,
	/** Turnstile tokens are at most 2048 characters. */
	captchaToken: 2048,
	/** Generous for four short fields plus a 4000-character message. */
	bodyBytes: 16 * 1024,
} as const;

/**
 * Production values. wrangler.toml `[vars]` repeats these, and `.dev.vars`
 * overrides them for `npm run dev:worker` (Cloudflare's Turnstile test keys
 * report hostname "example.com" and no action, and the page is served from
 * http://localhost:8787). Never relax them in wrangler.toml.
 */
const DEFAULT_ORIGIN = "https://dorianblack.com";
const DEFAULT_TURNSTILE_HOSTNAME = "dorianblack.com";
/** Must match `data-action` on the widget in src/pages/contact.astro. */
const DEFAULT_TURNSTILE_ACTION = "contact";

/** Sender must be on a connected and verified Email Sending domain. */
const DEFAULT_FROM = "contact@dorianblack.com";
/** Destination inbox — keep in step with CONTACT_EMAIL in src/config/site.ts. */
const DEFAULT_TO = "hello@dorianblack.com";

const json = (
	payload: Record<string, unknown>,
	status = 200,
	extraHeaders: Record<string, string> = {},
): Response =>
	new Response(JSON.stringify(payload), {
		status,
		headers: {
			"Content-Type": "application/json",
			"Cache-Control": "no-store",
			...extraHeaders,
		},
	});

const asString = (value: unknown): string => (typeof value === "string" ? value.trim() : "");

/**
 * Deliberately stricter than RFC 5322: no whitespace, control/format
 * characters, or the address-syntax characters <>()[],;:" -- the address is
 * used as `reply_to` and shown in the notification email.
 */
const EMAIL_PATTERN =
	/^[^\s@<>()[\],;:"\p{Cc}\p{Cf}]+@[^\s@<>()[\],;:"\p{Cc}\p{Cf}]+\.[^\s@<>()[\],;:"\p{Cc}\p{Cf}]+$/u;

const isValidEmail = (value: string): boolean =>
	value.length <= LIMITS.email && EMAIL_PATTERN.test(value);

const escapeHtml = (value: string): string =>
	value
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#39;");

/**
 * Collapse values interpolated into header-like fields (the subject) to one
 * plain line. Control characters (\p{Cc}, including CR/LF/NUL) and the Unicode
 * line/paragraph separators U+2028/2029 become spaces; format characters
 * (\p{Cf}: bidi overrides U+202A-202E and U+2066-2069, zero-width characters)
 * are removed so they cannot spoof the subject in an inbox.
 */
const singleLine = (value: string): string =>
	value
		.replace(/[\p{Cc}\p{Zl}\p{Zp}]+/gu, " ")
		.replace(/\p{Cf}+/gu, "")
		.trim();

interface SiteverifyResponse {
	success?: boolean;
	hostname?: string;
	action?: string;
	"error-codes"?: string[];
}

/** Read the body as text, giving up once more than `maxBytes` have arrived. */
const readBodyLimited = async (request: Request, maxBytes: number): Promise<string | null> => {
	const declared = Number(request.headers.get("Content-Length"));
	if (Number.isFinite(declared) && declared > maxBytes) return null;
	if (!request.body) return "";

	const reader = request.body.getReader();
	const chunks: Uint8Array[] = [];
	let received = 0;
	for (;;) {
		const { done, value } = await reader.read();
		if (done) break;
		received += value.byteLength;
		if (received > maxBytes) {
			await reader.cancel().catch(() => undefined);
			return null;
		}
		chunks.push(value);
	}

	const bytes = new Uint8Array(received);
	let offset = 0;
	for (const chunk of chunks) {
		bytes.set(chunk, offset);
		offset += chunk.byteLength;
	}
	return new TextDecoder().decode(bytes);
};

const verifyTurnstile = async (
	request: Request,
	env: Env,
	token: string,
): Promise<{ ok: true } | { ok: false; status: number; error: string; code?: string }> => {
	if (!env.TURNSTILE_SECRET_KEY) {
		console.error(
			JSON.stringify({ message: "Contact form unconfigured", missing: ["TURNSTILE_SECRET_KEY"] }),
		);
		return {
			ok: false,
			status: 503,
			error: "The contact form is not configured.",
			code: "turnstile_unconfigured",
		};
	}

	if (!token) {
		return { ok: false, status: 400, error: "Please complete the verification challenge." };
	}

	if (token.length > LIMITS.captchaToken) {
		return { ok: false, status: 400, error: "Verification failed. Please try again." };
	}

	const body = new URLSearchParams({
		secret: env.TURNSTILE_SECRET_KEY,
		response: token,
	});
	const remoteIp = request.headers.get("CF-Connecting-IP");
	if (remoteIp) body.set("remoteip", remoteIp);

	try {
		const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
			method: "POST",
			headers: { "Content-Type": "application/x-www-form-urlencoded" },
			body: body.toString(),
		});
		const data = (await response.json()) as SiteverifyResponse | null;

		const failed = { ok: false, status: 400, error: "Verification failed. Please try again." } as const;
		if (!data?.success) {
			console.error(
				JSON.stringify({ message: "Turnstile verification failed", errorCodes: data?.["error-codes"] ?? [] }),
			);
			return failed;
		}

		// A valid token minted for another site or widget must not pass here.
		const expectedHostname: string = env.TURNSTILE_HOSTNAME ?? DEFAULT_TURNSTILE_HOSTNAME;
		const expectedAction: string = env.TURNSTILE_ACTION ?? DEFAULT_TURNSTILE_ACTION;
		if (data.hostname !== expectedHostname || (expectedAction && data.action !== expectedAction)) {
			console.error(
				JSON.stringify({
					message: "Turnstile hostname/action mismatch",
					hostname: data.hostname,
					action: data.action,
				}),
			);
			return failed;
		}

		return { ok: true };
	} catch {
		return { ok: false, status: 502, error: "Could not reach the verification service." };
	}
};

const sendEmail = async (
	message: { to: string; from: string; subject: string; text: string; html: string; replyTo: string },
	env: Env,
): Promise<void> => {
	const response = await fetch(
		`https://api.cloudflare.com/client/v4/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/email/sending/send`,
		{
			method: "POST",
			headers: {
				Authorization: `Bearer ${env.CLOUDFLARE_API_TOKEN}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				to: message.to,
				from: message.from,
				subject: message.subject,
				text: message.text,
				html: message.html,
				// Cloudflare's REST schema requires this exact snake_case field.
				reply_to: message.replyTo,
			}),
		},
	);

	const data = (await response.json().catch(() => null)) as
		| { success?: boolean; errors?: { message?: string }[] }
		| null;

	if (!response.ok || !data?.success) {
		throw new Error(
			data?.errors?.[0]?.message || `Cloudflare Email Sending error: ${response.status}`,
		);
	}
};

const buildBodies = (fields: { name: string; email: string; subject: string; message: string }) => {
	const text = [
		"New message from the dorianblack.com contact form",
		"",
		`Name:    ${fields.name}`,
		`Email:   ${fields.email}`,
		`Subject: ${fields.subject}`,
		"",
		"Message:",
		fields.message,
	].join("\n");

	const safe = {
		name: escapeHtml(fields.name),
		email: escapeHtml(fields.email),
		subject: escapeHtml(fields.subject),
		message: escapeHtml(fields.message),
	};

	const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="light only" />
    <title>Contact form message</title>
  </head>
  <body style="margin:0;padding:24px;background-color:#f3f4f6;color:#111827;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;line-height:1.5;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:700px;margin:0 auto;border-collapse:collapse;">
      <tr>
        <td style="background-color:#ffffff;border:1px solid #e5e7eb;border-radius:12px;padding:20px;">
          <h2 style="margin:0 0 16px;font-size:20px;line-height:1.3;">New message from dorianblack.com</h2>
          <p style="margin:0 0 6px;"><strong>Name:</strong> ${safe.name}</p>
          <p style="margin:0 0 6px;"><strong>Email:</strong> <a href="mailto:${safe.email}" style="color:#111827;">${safe.email}</a></p>
          <p style="margin:0 0 16px;"><strong>Subject:</strong> ${safe.subject}</p>
          <div style="white-space:pre-wrap;background-color:#f9fafb;border:1px solid #e5e7eb;padding:12px;border-radius:8px;">${safe.message}</div>
          <p style="margin:16px 0 0;font-size:13px;color:#6b7280;">Reply directly to this email to answer the sender.</p>
        </td>
      </tr>
    </table>
  </body>
</html>`;

	return { text, html };
};

const handlePost = async (request: Request, env: Env): Promise<Response> => {
	// Reject cross-site posts. Browsers always send Origin on cross-origin
	// POSTs; its absence means a non-browser client, which Turnstile still gates.
	const origin = request.headers.get("Origin");
	const allowedOrigin: string = env.ALLOWED_ORIGIN ?? DEFAULT_ORIGIN;
	if (origin !== null && origin !== allowedOrigin) {
		return json({ error: "Forbidden." }, 403);
	}

	// Requiring application/json rules out cross-site "simple" requests
	// (text/plain, form-encoded) that skip the CORS preflight.
	const contentType = request.headers.get("Content-Type") ?? "";
	if (contentType.split(";")[0].trim().toLowerCase() !== "application/json") {
		return json({ error: "Unsupported media type." }, 415);
	}

	// Per-IP throttle runs before the body is parsed or Turnstile is called.
	const clientIp = request.headers.get("CF-Connecting-IP") ?? "unknown";
	const { success: withinLimit } = await env.CONTACT_LIMITER.limit({ key: clientIp });
	if (!withinLimit) {
		return json(
			{ error: "Too many messages from your connection. Please wait a minute and try again." },
			429,
			{ "Retry-After": "60" },
		);
	}

	const rawBody = await readBodyLimited(request, LIMITS.bodyBytes);
	if (rawBody === null) {
		return json({ error: "Request too large." }, 413);
	}

	let payload: ContactPayload;
	try {
		const value: unknown = JSON.parse(rawBody);
		if (!value || typeof value !== "object" || Array.isArray(value)) {
			return json({ error: "Malformed request." }, 400);
		}
		payload = value as ContactPayload;
	} catch {
		return json({ error: "Malformed request." }, 400);
	}

	// Make honeypot submissions look successful (same 201 as a real send)
	// without sending anything.
	if (asString(payload.website)) {
		return json({ message: "Thanks — your message has been sent." }, 201);
	}

	const name = singleLine(asString(payload.name));
	const email = asString(payload.email).toLowerCase();
	const subject = singleLine(asString(payload.subject)) || "Contact form message";
	const message = asString(payload.message);

	if (!name || !email || !message) {
		return json({ error: "Name, email, and message are required." }, 400);
	}
	if (name.length > LIMITS.name) {
		return json({ error: `Name must be ${LIMITS.name} characters or less.` }, 400);
	}
	if (!isValidEmail(email)) {
		return json({ error: "Please provide a valid email address." }, 400);
	}
	if (subject.length > LIMITS.subject) {
		return json({ error: `Subject must be ${LIMITS.subject} characters or less.` }, 400);
	}
	if (message.length < LIMITS.messageMin) {
		return json({ error: `Message must be at least ${LIMITS.messageMin} characters.` }, 400);
	}
	if (message.length > LIMITS.messageMax) {
		return json({ error: `Message must be ${LIMITS.messageMax} characters or less.` }, 400);
	}

	const captcha = await verifyTurnstile(request, env, asString(payload.captchaToken));
	if (!captcha.ok) {
		return json({ error: captcha.error, ...(captcha.code && { code: captcha.code }) }, captcha.status);
	}

	if (!env.CLOUDFLARE_API_TOKEN || !env.CLOUDFLARE_ACCOUNT_ID) {
		// Name the missing settings in the logs only, never in the response.
		console.error(
			JSON.stringify({
				message: "Contact form unconfigured",
				missing: [
					!env.CLOUDFLARE_API_TOKEN && "CLOUDFLARE_API_TOKEN",
					!env.CLOUDFLARE_ACCOUNT_ID && "CLOUDFLARE_ACCOUNT_ID",
				].filter(Boolean),
			}),
		);
		return json({ error: "The contact form is not configured.", code: "email_unconfigured" }, 503);
	}

	const { text, html } = buildBodies({ name, email, subject, message });

	try {
		await sendEmail(
			{
				to: env.CONTACT_TO_EMAIL || DEFAULT_TO,
				from: env.EMAIL_FROM_CONTACT || DEFAULT_FROM,
				replyTo: email,
				subject: `[dorianblack.com] ${subject} — ${name}`,
				text,
				html,
			},
			env,
		);
	} catch (error) {
		console.error(JSON.stringify({ message: "Contact email send failed", error: error instanceof Error ? error.message : String(error) }));
		return json({ error: "Could not send your message. Please try again in a moment." }, 502);
	}

	return json({ message: "Thanks — your message has been sent." }, 201);
};

export const handleContact = async (request: Request, env: Env): Promise<Response> =>
	request.method === "POST"
		? handlePost(request, env)
		: json({ error: "Method not allowed." }, 405, { Allow: "POST" });
