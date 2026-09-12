import { APPLICATION_ID } from "../constants";

export async function registerExternalAsset(
	url: string,
): Promise<string | null> {
	const storage = await browser.storage.local.get("discord_token");
	const token =
		typeof storage.discord_token === "string" ? storage.discord_token : null;

	const res = await fetch(
		`https://discord.com/api/v10/applications/${APPLICATION_ID}/external-assets`,
		{
			method: "POST",
			headers: {
				Authorization: `Bearer ${token}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ urls: [url] }),
		},
	);

	if (!res.ok) {
		console.error("[ExternalAssets] failed:", res.status, await res.text());
		return null;
	}

	const data = await res.json();
	console.log("[ExternalAssets] raw response:", data);

	const path = data?.[0]?.external_asset_path;
	return path ? `mp:${path}` : null;
}

const assetCache = new Map<string, string>();

export async function getLargeImageKey(coverUrl: string): Promise<string> {
	const cachedCoverUrl = assetCache.get(coverUrl);
	if (!cachedCoverUrl) {
		const key = await registerExternalAsset(coverUrl);
		const final = key ?? "default_cover";
		assetCache.set(coverUrl, final);
		return final;
	}
	return cachedCoverUrl;
}
