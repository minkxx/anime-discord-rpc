import { APPLICATION_ID } from "../constants";

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
		const redirectUri = browser.identity.getRedirectURL();
		console.log("Add this exact URL to your Discord Dev Portal:", redirectUri);

		const verifier = generateCodeVerifier();
		const challenge = await generateCodeChallenge(verifier);

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
		return null;
	} catch (error) {
		console.error("Auth Error:", error);
		return null;
	}
}
