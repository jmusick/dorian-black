/**
 * Tests for the POST /api/contact hardening rules (#5) in worker/contact.ts.
 *
 * Run with `npm test`. Everything goes through the exported handleContact()
 * with a fake env and a stubbed global fetch, so no test reaches Turnstile,
 * Cloudflare Email Sending, or any other network service.
 */

import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, mock, test } from "node:test";

import { handleContact } from "./contact.ts";

const ENDPOINT = "https://dorianblack.com/api/contact";
const ORIGIN = "https://dorianblack.com";
const SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const SUCCESS_MESSAGE = "Thanks — your message has been sent.";

// Dummy values only. None of these is a real secret or account.
const TEST_ACCOUNT_ID = "test-account-id";
const TEST_API_TOKEN = "test-api-token";
const TEST_TURNSTILE_SECRET = "test-turnstile-secret";
const EMAIL_SEND_URL = `https://api.cloudflare.com/client/v4/accounts/${TEST_ACCOUNT_ID}/email/sending/send`;

interface FetchCall {
	url: string;
	init: RequestInit | undefined;
}

let fetchCalls: FetchCall[] = [];
let siteverifyResult: Record<string, unknown> = {};
let emailResult: { status: number; body: unknown } = { status: 200, body: { success: true } };
let limiterResult = true;
let limiterKeys: string[] = [];

const originalFetch = globalThis.fetch;

const jsonResponse = (body: unknown, status = 200): Response =>
	new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

const stubFetch = async (input: string | URL | Request, init?: RequestInit): Promise<Response> => {
	const url = input instanceof Request ? input.url : String(input);
	fetchCalls.push({ url, init });
	if (url === SITEVERIFY_URL) return jsonResponse(siteverifyResult);
	if (url === EMAIL_SEND_URL) return jsonResponse(emailResult.body, emailResult.status);
	throw new Error(`Unexpected fetch in test: ${url}`);
};

const makeEnv = (overrides: Record<string, unknown> = {}): Env =>
	({
		CONTACT_LIMITER: {
			limit: async ({ key }: { key: string }) => {
				limiterKeys.push(key);
				return { success: limiterResult };
			},
		},
		CLOUDFLARE_ACCOUNT_ID: TEST_ACCOUNT_ID,
		CLOUDFLARE_API_TOKEN: TEST_API_TOKEN,
		TURNSTILE_SECRET_KEY: TEST_TURNSTILE_SECRET,
		EMAIL_FROM_CONTACT: "contact@dorianblack.com",
		CONTACT_TO_EMAIL: "hello@dorianblack.com",
		ALLOWED_ORIGIN: ORIGIN,
		TURNSTILE_HOSTNAME: "dorianblack.com",
		TURNSTILE_ACTION: "contact",
		...overrides,
	}) as unknown as Env;

const validPayload = (overrides: Record<string, unknown> = {}): Record<string, unknown> => ({
	name: "Ada Lovelace",
	email: "ada@example.com",
	subject: "Booking",
	message: "Hello, I would like to book a show.",
	captchaToken: "test-captcha-token",
	...overrides,
});

const post = (
	body: unknown,
	{ headers = {}, raw = false }: { headers?: Record<string, string>; raw?: boolean } = {},
): Request =>
	new Request(ENDPOINT, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Origin: ORIGIN,
			"CF-Connecting-IP": "203.0.113.7",
			...headers,
		},
		body: raw ? (body as string) : JSON.stringify(body),
	});

const send = async (request: Request, env: Env = makeEnv()) => {
	const response = await handleContact(request, env);
	const body = (await response.json()) as { error?: string; message?: string; code?: string };
	return { response, body };
};

const emailCalls = () => fetchCalls.filter((call) => call.url === EMAIL_SEND_URL);
const siteverifyCalls = () => fetchCalls.filter((call) => call.url === SITEVERIFY_URL);
const sentEmail = () => {
	const calls = emailCalls();
	assert.equal(calls.length, 1, "expected exactly one Email Sending call");
	return JSON.parse(String(calls[0].init?.body)) as Record<string, string>;
};

beforeEach(() => {
	fetchCalls = [];
	siteverifyResult = { success: true, hostname: "dorianblack.com", action: "contact" };
	emailResult = { status: 200, body: { success: true } };
	limiterResult = true;
	limiterKeys = [];
	globalThis.fetch = stubFetch as typeof fetch;
	// The handler logs failures with console.error; keep test output clean.
	mock.method(console, "error", () => undefined);
});

afterEach(() => {
	globalThis.fetch = originalFetch;
	mock.restoreAll();
});

describe("happy path", () => {
	test("sends one email and returns 201", async () => {
		const { response, body } = await send(post(validPayload()));

		assert.equal(response.status, 201);
		assert.equal(body.message, SUCCESS_MESSAGE);
		assert.equal(siteverifyCalls().length, 1);
		assert.equal(emailCalls().length, 1);
	});

	test("Worker responses carry the no-store and nosniff headers", async () => {
		const { response } = await send(post(validPayload()));

		assert.equal(response.headers.get("Content-Type"), "application/json");
		assert.equal(response.headers.get("Cache-Control"), "no-store");
		assert.equal(response.headers.get("X-Content-Type-Options"), "nosniff");
		assert.equal(
			response.headers.get("Content-Security-Policy"),
			"default-src 'none'; frame-ancestors 'none'",
		);
	});

	test("siteverify gets the secret, the token and the client IP", async () => {
		await send(post(validPayload()));

		const params = new URLSearchParams(String(siteverifyCalls()[0].init?.body));
		assert.equal(params.get("secret"), TEST_TURNSTILE_SECRET);
		assert.equal(params.get("response"), "test-captcha-token");
		assert.equal(params.get("remoteip"), "203.0.113.7");
	});

	test("the Email Sending request has reply_to, a one-line subject, and escaped HTML", async () => {
		await send(
			post(
				validPayload({
					name: "Eve\r\nBcc: victim@example.com",
					email: "Eve@Example.com",
					subject: "Hi\u2028there\u202e",
					message: '<script>alert("x")</script> & \'quotes\'',
				}),
			),
		);

		const call = emailCalls()[0];
		const headers = new Headers(call.init?.headers);
		assert.equal(call.init?.method, "POST");
		assert.equal(headers.get("Authorization"), `Bearer ${TEST_API_TOKEN}`);
		assert.equal(headers.get("Content-Type"), "application/json");

		const email = sentEmail();
		assert.equal(email.to, "hello@dorianblack.com");
		assert.equal(email.from, "contact@dorianblack.com");
		assert.equal(email.reply_to, "eve@example.com");
		assert.equal(email.replyTo, undefined, "Cloudflare's API needs snake_case reply_to");
		assert.equal(email.subject, "[dorianblack.com] Hi there — Eve Bcc: victim@example.com");
		assert.doesNotMatch(email.subject, /[\r\n\u2028\u2029\u202e]/);

		assert.match(email.html, /&lt;script&gt;alert\(&quot;x&quot;\)&lt;\/script&gt; &amp; &#39;quotes&#39;/);
		assert.doesNotMatch(email.html, /<script>/);
		assert.match(email.text, /<script>alert\("x"\)<\/script>/, "the plain-text body is not escaped");
	});

	test("an empty subject falls back to a default", async () => {
		await send(post(validPayload({ subject: "   " })));

		assert.equal(sentEmail().subject, "[dorianblack.com] Contact form message — Ada Lovelace");
	});

	test("Email Sending failure returns 502 without the upstream error", async () => {
		emailResult = { status: 200, body: { success: false, errors: [{ message: "upstream secret detail" }] } };

		const { response, body } = await send(post(validPayload()));

		assert.equal(response.status, 502);
		assert.doesNotMatch(JSON.stringify(body), /upstream secret detail/);
	});
});

describe("method", () => {
	for (const method of ["GET", "PUT", "DELETE"]) {
		test(`${method} returns 405 with Allow: POST`, async () => {
			const { response } = await send(new Request(ENDPOINT, { method }));

			assert.equal(response.status, 405);
			assert.equal(response.headers.get("Allow"), "POST");
			assert.equal(fetchCalls.length, 0);
		});
	}
});

describe("origin", () => {
	test("a cross-site Origin returns 403", async () => {
		const { response } = await send(post(validPayload(), { headers: { Origin: "https://evil.example" } }));

		assert.equal(response.status, 403);
		assert.equal(limiterKeys.length, 0, "rejected before the rate limiter");
		assert.equal(fetchCalls.length, 0);
	});

	test("a lookalike Origin returns 403", async () => {
		const { response } = await send(
			post(validPayload(), { headers: { Origin: "https://dorianblack.com.evil.example" } }),
		);

		assert.equal(response.status, 403);
	});

	test("a missing Origin is allowed (Turnstile still gates it)", async () => {
		const request = post(validPayload());
		request.headers.delete("Origin");

		const { response } = await send(request);

		assert.equal(response.status, 201);
		assert.equal(siteverifyCalls().length, 1);
	});
});

describe("content type", () => {
	for (const contentType of ["text/plain", "application/x-www-form-urlencoded", "multipart/form-data", ""]) {
		test(`Content-Type ${JSON.stringify(contentType)} returns 415`, async () => {
			const { response } = await send(post(validPayload(), { headers: { "Content-Type": contentType } }));

			assert.equal(response.status, 415);
			assert.equal(fetchCalls.length, 0);
		});
	}

	test("application/json with a charset parameter is accepted", async () => {
		const { response } = await send(
			post(validPayload(), { headers: { "Content-Type": "Application/JSON; charset=utf-8" } }),
		);

		assert.equal(response.status, 201);
	});
});

describe("rate limit", () => {
	test("over the limit returns 429 with Retry-After: 60", async () => {
		limiterResult = false;

		const { response } = await send(post(validPayload()));

		assert.equal(response.status, 429);
		assert.equal(response.headers.get("Retry-After"), "60");
		assert.equal(fetchCalls.length, 0, "no Turnstile call or email once throttled");
	});

	test("the limiter is keyed by CF-Connecting-IP", async () => {
		await send(post(validPayload()));

		assert.deepEqual(limiterKeys, ["203.0.113.7"]);
	});
});

describe("body size", () => {
	const oversized = JSON.stringify(validPayload({ message: "x".repeat(16 * 1024) }));

	test("a declared Content-Length over 16 KB returns 413", async () => {
		const { response } = await send(
			post("{}", { raw: true, headers: { "Content-Length": String(16 * 1024 + 1) } }),
		);

		assert.equal(response.status, 413);
		assert.equal(fetchCalls.length, 0);
	});

	test("a streamed body over 16 KB returns 413", async () => {
		const request = post(oversized, { raw: true });
		assert.equal(request.headers.get("Content-Length"), null, "exercises the streaming check");

		const { response } = await send(request);

		assert.equal(response.status, 413);
		assert.equal(fetchCalls.length, 0);
	});
});

describe("malformed JSON", () => {
	for (const raw of ["[]", "null", '"text"', "42", "true", "{not json", ""]) {
		test(`body ${JSON.stringify(raw)} returns 400`, async () => {
			const { response, body } = await send(post(raw, { raw: true }));

			assert.equal(response.status, 400);
			assert.equal(body.error, "Malformed request.");
			assert.equal(fetchCalls.length, 0);
		});
	}
});

describe("honeypot", () => {
	test("a filled website field returns the real 201 success and sends nothing", async () => {
		const { response, body } = await send(post(validPayload({ website: "https://spam.example" })));

		assert.equal(response.status, 201);
		assert.equal(body.message, SUCCESS_MESSAGE);
		assert.equal(fetchCalls.length, 0, "no Turnstile call and no email");
	});

	test("it short-circuits before field validation", async () => {
		const { response } = await send(post({ website: "x" }));

		assert.equal(response.status, 201);
		assert.equal(fetchCalls.length, 0);
	});

	test("a whitespace-only website field is ignored", async () => {
		const { response } = await send(post(validPayload({ website: "   " })));

		assert.equal(response.status, 201);
		assert.equal(emailCalls().length, 1);
	});
});

describe("field rules", () => {
	const rejects = (label: string, overrides: Record<string, unknown>, error: string | RegExp) =>
		test(`${label} returns 400`, async () => {
			const { response, body } = await send(post(validPayload(overrides)));

			assert.equal(response.status, 400);
			if (typeof error === "string") assert.equal(body.error, error);
			else assert.match(body.error ?? "", error);
			assert.equal(fetchCalls.length, 0, "rejected before Turnstile");
		});

	const accepts = (label: string, overrides: Record<string, unknown>) =>
		test(`${label} is accepted`, async () => {
			const { response } = await send(post(validPayload(overrides)));

			assert.equal(response.status, 201);
		});

	const required = "Name, email, and message are required.";
	rejects("a missing name", { name: undefined }, required);
	rejects("a whitespace-only name", { name: "   " }, required);
	rejects("a missing email", { email: undefined }, required);
	rejects("a missing message", { message: undefined }, required);
	rejects("a non-string message", { message: 12345678901 }, required);

	accepts("a 100-character name", { name: "n".repeat(100) });
	rejects("a 101-character name", { name: "n".repeat(101) }, "Name must be 100 characters or less.");
	accepts("a 150-character subject", { subject: "s".repeat(150) });
	rejects("a 151-character subject", { subject: "s".repeat(151) }, "Subject must be 150 characters or less.");
	accepts("a 10-character message", { message: "m".repeat(10) });
	rejects("a 9-character message", { message: "m".repeat(9) }, "Message must be at least 10 characters.");
	accepts("a 4000-character message", { message: "m".repeat(4000) });
	rejects("a 4001-character message", { message: "m".repeat(4001) }, "Message must be 4000 characters or less.");
	rejects(
		"a message that is short once trimmed",
		{ message: `   ${"m".repeat(9)}   ` },
		"Message must be at least 10 characters.",
	);

	test("control characters in the name are collapsed before the length check", async () => {
		// 100 visible characters plus CR/LF: still 101 after singleLine turns the pair into one space.
		const { response } = await send(post(validPayload({ name: `${"n".repeat(50)}\r\n${"n".repeat(50)}` })));

		assert.equal(response.status, 400);
	});

	test("format characters are stripped from the name and subject", async () => {
		await send(
			post(validPayload({ name: "Ad\u200ba\u2066", subject: "\u202eBooking\u200f" })),
		);

		assert.equal(sentEmail().subject, "[dorianblack.com] Booking — Ada");
	});
});

describe("email address", () => {
	const invalid = [
		"plainaddress",
		"no-at.example.com",
		"a@b",
		"a@@example.com",
		"a b@example.com",
		"<a@example.com>",
		"a@example.com>",
		"a(b)@example.com",
		"a[b]@example.com",
		"a,b@example.com",
		"a;b@example.com",
		"a:b@example.com",
		'"a"@example.com',
		"a@exam\u0000ple.com",
		"a@example.com\u200e",
		"a\u202e@example.com",
		"a\u2028b@example.com",
		`${"a".repeat(243)}@example.com`, // 255 characters
	];

	for (const email of invalid) {
		test(`${JSON.stringify(email)} returns 400`, async () => {
			const { response, body } = await send(post(validPayload({ email })));

			assert.equal(response.status, 400);
			assert.equal(body.error, "Please provide a valid email address.");
			assert.equal(fetchCalls.length, 0);
		});
	}

	test("a 254-character address is accepted", async () => {
		const email = `${"a".repeat(242)}@example.com`;
		assert.equal(email.length, 254);

		const { response } = await send(post(validPayload({ email })));

		assert.equal(response.status, 201);
		assert.equal(sentEmail().reply_to, email);
	});

	test("surrounding whitespace is trimmed and the address lowercased", async () => {
		await send(post(validPayload({ email: "  Ada.Lovelace+Site@Example.CO.uk  " })));

		assert.equal(sentEmail().reply_to, "ada.lovelace+site@example.co.uk");
	});
});

describe("Turnstile", () => {
	test("a missing token returns 400 without calling siteverify", async () => {
		const { response, body } = await send(post(validPayload({ captchaToken: undefined })));

		assert.equal(response.status, 400);
		assert.equal(body.error, "Please complete the verification challenge.");
		assert.equal(fetchCalls.length, 0);
	});

	test("a token over 2048 characters returns 400 without calling siteverify", async () => {
		const { response } = await send(post(validPayload({ captchaToken: "t".repeat(2049) })));

		assert.equal(response.status, 400);
		assert.equal(fetchCalls.length, 0);
	});

	test("a failed verification returns 400 and sends nothing", async () => {
		siteverifyResult = { success: false, "error-codes": ["invalid-input-response"] };

		const { response } = await send(post(validPayload()));

		assert.equal(response.status, 400);
		assert.equal(emailCalls().length, 0);
	});

	test("a token minted for another hostname returns 400", async () => {
		siteverifyResult = { success: true, hostname: "evil.example", action: "contact" };

		const { response } = await send(post(validPayload()));

		assert.equal(response.status, 400);
		assert.equal(emailCalls().length, 0);
	});

	test("a token minted for another action returns 400", async () => {
		siteverifyResult = { success: true, hostname: "dorianblack.com", action: "login" };

		const { response } = await send(post(validPayload()));

		assert.equal(response.status, 400);
		assert.equal(emailCalls().length, 0);
	});

	test("a token with no action returns 400", async () => {
		siteverifyResult = { success: true, hostname: "dorianblack.com" };

		const { response } = await send(post(validPayload()));

		assert.equal(response.status, 400);
		assert.equal(emailCalls().length, 0);
	});

	test("an unreachable siteverify returns 502", async () => {
		globalThis.fetch = (async () => {
			throw new TypeError("network down");
		}) as typeof fetch;

		const { response } = await send(post(validPayload()));

		assert.equal(response.status, 502);
	});
});

describe("missing secrets", () => {
	const secretNames = /TURNSTILE_SECRET_KEY|CLOUDFLARE_API_TOKEN|CLOUDFLARE_ACCOUNT_ID/;

	test("no Turnstile secret returns 503 without naming it", async () => {
		const { response, body } = await send(post(validPayload()), makeEnv({ TURNSTILE_SECRET_KEY: "" }));

		assert.equal(response.status, 503);
		assert.equal(body.code, "turnstile_unconfigured");
		assert.doesNotMatch(JSON.stringify(body), secretNames);
		assert.equal(fetchCalls.length, 0);
	});

	for (const missing of ["CLOUDFLARE_API_TOKEN", "CLOUDFLARE_ACCOUNT_ID"]) {
		test(`no ${missing} returns 503 without naming it`, async () => {
			const { response, body } = await send(post(validPayload()), makeEnv({ [missing]: "" }));

			assert.equal(response.status, 503);
			assert.equal(body.code, "email_unconfigured");
			assert.doesNotMatch(JSON.stringify(body), secretNames);
			assert.equal(emailCalls().length, 0);
		});
	}
});
