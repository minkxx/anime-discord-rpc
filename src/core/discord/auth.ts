import { APPLICATION_ID } from "../../shared/constants";

function generateCodeVerifier() {
	const array = new Uint8Array(32);
	crypto.getRandomValues(array);
	return btoa(String.fromCharCode(...array))
		.replace(/\+/g, "-")
		.replace(/\//g, "_")
		.replace(/=+$/, "");
}

async function generateCodeChallenge(verifier: string) {
	const encoder = new TextEncoder();
	const data = encoder.encode(verifier);
	const digest = await crypto.subtle.digest("SHA-256", data);
	return btoa(String.fromCharCode(...new Uint8Array(digest)))
		.replace(/\+/g, "-")
		.replace(/\//g, "_")
		.replace(/=+$/, "");
}

export async function loginWithDiscord(): Promise<string | null> {
	try {
		const verifier = generateCodeVerifier();
		const challenge = await generateCodeChallenge(verifier);

		if (browser?.identity?.getRedirectURL) {
			const redirectUri = browser.identity.getRedirectURL();

			const authUrl = new URL("https://discord.com/oauth2/authorize");
			authUrl.searchParams.set("client_id", APPLICATION_ID);
			authUrl.searchParams.set("response_type", "code");
			authUrl.searchParams.set("redirect_uri", redirectUri);
			authUrl.searchParams.set("scope", "openid sdk.social_layer_presence");
			authUrl.searchParams.set("code_challenge", challenge);
			authUrl.searchParams.set("code_challenge_method", "S256");

			const responseUrl = await browser.identity.launchWebAuthFlow({
				url: authUrl.toString(),
				interactive: true,
			});
			if (!responseUrl) throw new Error("No response url generated.");
			const code = new URL(responseUrl).searchParams.get("code");
			if (!code) throw new Error("No authorization code returned.");

			return await exchangeCodeForToken(code, redirectUri, verifier);
		} else {
			const mobileRedirectUri = "http://127.0.0.1/discord-auth";

			await browser.storage.local.set({ mobile_oauth_verifier: verifier });

			const authUrl = new URL("https://discord.com/oauth2/authorize");
			authUrl.searchParams.set("client_id", APPLICATION_ID);
			authUrl.searchParams.set("response_type", "code");
			authUrl.searchParams.set("redirect_uri", mobileRedirectUri);
			authUrl.searchParams.set("scope", "openid sdk.social_layer_presence");
			authUrl.searchParams.set("code_challenge", challenge);
			authUrl.searchParams.set("code_challenge_method", "S256");

			await browser.tabs.create({ url: authUrl.toString() });

			return "mobile_pending";
		}
	} catch (error) {
		console.error("Auth Error:", error);
		return null;
	}
}

async function exchangeCodeForToken(
	code: string,
	redirectUri: string,
	verifier: string,
) {
	const body = new URLSearchParams({
		client_id: APPLICATION_ID,
		grant_type: "authorization_code",
		code,
		redirect_uri: redirectUri,
		code_verifier: verifier,
	});

	const res = await fetch("https://discord.com/api/oauth2/token", {
		method: "POST",
		headers: { "Content-Type": "application/x-www-form-urlencoded" },
		body: body.toString(),
	});

	const data = await res.json();
	if (data.access_token) {
		await browser.storage.local.set({ discord_token: data.access_token });
		return data.access_token;
	}
	throw new Error("Failed to exchange code for token.");
}

export async function processLocalhostRedirect(
	urlStr: string,
): Promise<{ success: boolean; token?: string; error?: string }> {
	try {
		const url = new URL(urlStr);

		const errorParam =
			url.searchParams.get("error_description") ||
			url.searchParams.get("error");
		if (errorParam) {
			await browser.storage.local.remove("mobile_oauth_verifier");
			return {
				success: false,
				error: decodeURIComponent(errorParam.replace(/\+/g, " ")),
			};
		}

		const code = url.searchParams.get("code");
		if (!code) {
			await browser.storage.local.remove("mobile_oauth_verifier");
			return {
				success: false,
				error: "No authorization code was returned.",
			};
		}

		const storage = await browser.storage.local.get("mobile_oauth_verifier");
		const verifier = storage.mobile_oauth_verifier as string;

		if (!verifier || typeof verifier !== "string") {
			return {
				success: false,
				error: "Session verifier lost. Please try logging in again.",
			};
		}

		const token = await exchangeCodeForToken(
			code,
			"http://127.0.0.1/discord-auth",
			verifier,
		);
		await browser.storage.local.remove("mobile_oauth_verifier");

		return { success: true, token };
	} catch (e) {
		console.error("Mobile Exchange Error:", e);
		await browser.storage.local.remove("mobile_oauth_verifier");
		const message =
			e instanceof Error ? e.message : "Failed to exchange authorization code.";
		return { success: false, error: message };
	}
}
