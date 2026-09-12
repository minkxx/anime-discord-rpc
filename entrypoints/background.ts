import { RESET_ACTIVITY_TIMEOUT } from "../constants";
import { loginWithDiscord } from "../discord/auth";
import { DiscordGateway } from "../discord/gateway";
import { fetchAnilistCover } from "../utils/anilist";

export default defineBackground(() => {
	const gateway = new DiscordGateway();
	gateway.connect();

	let activityTimeout: ReturnType<typeof setTimeout> | null = null;
	const currentAnimeState = {
		title: "Unknown",
		episode: "Unknown",
		coverUrl: "",
		currentMs: 0,
		durationMs: 0,
		isPaused: false,
	};

	function resetActivityTimeout() {
		if (activityTimeout) clearTimeout(activityTimeout);
		activityTimeout = setTimeout(() => {
			gateway
				.setActivity({ type: "STOPPED", ...currentAnimeState })
				.catch((err) => console.error("[setActivity/timeout]", err));
		}, RESET_ACTIVITY_TIMEOUT * 1000);
	}

	browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
		// auth handlers
		if (message.type === "LOGIN_DISCORD") {
			loginWithDiscord()
				.then(async (token) => {
					if (token) {
						await gateway.connect();
						sendResponse({ success: true });
					} else {
						sendResponse({ success: false, error: "Failed to obtain token." });
					}
				})
				.catch((err) => {
					sendResponse({ success: false, error: err.message });
				});
			return true;
		}

		if (message.type === "LOGOUT_DISCORD") {
			gateway.disconnect();
			browser.storage.local.remove("discord_token").then(() => {
				sendResponse({ success: true });
			});
			return true;
		}

		if (message.type === "GET_STATUS") {
			browser.storage.local.get("discord_token").then((storage) => {
				sendResponse({
					hasToken:
						typeof storage.discord_token === "string" &&
						!!storage.discord_token,
					isGatewayReady: gateway.isConnected(),
					currentAnime: currentAnimeState,
				});
			});
			return true;
		}

		// content.ts handlers
		if (!sender.tab?.active) return;

		if (message.type === "STOPPED") {
			gateway
				.setActivity({ type: "STOPPED", ...currentAnimeState })
				.catch((err) => console.error("[setActivity/stopped]", err));
			if (activityTimeout) clearTimeout(activityTimeout);
			return;
		}

		if (message.type === "FETCH_ANILIST") {
			fetchAnilistCover(message.anilistId).then((coverUrl) =>
				sendResponse({ coverUrl }),
			);
			return true;
		}

		if (message.type === "INFO_UPDATE") {
			currentAnimeState.title = message.title;
			currentAnimeState.episode = message.episode;
			currentAnimeState.coverUrl = message.coverUrl;
		} else if (message.type === "TIME_UPDATE") {
			currentAnimeState.currentMs = message.currentMs;
			currentAnimeState.durationMs = message.durationMs;
			currentAnimeState.isPaused = message.isPaused;
		} else {
			return;
		}

		resetActivityTimeout();

		gateway
			.setActivity({
				type: currentAnimeState.isPaused ? "PAUSED" : "WATCHING",
				...currentAnimeState,
			})
			.catch((err) => console.error("[setActivity/update]", err));
	});
});
