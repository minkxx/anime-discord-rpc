import { fetchAnilistCover } from "../core/anilist/api";
import {
	loginWithDiscord,
	processLocalhostRedirect,
} from "../core/discord/auth";
import { DiscordGateway } from "../core/discord/gateway";
import {
	activityEnabled,
	clearAnimeState,
	commitBroadcast,
	currentAnimeState,
	evaluateDiscordUpdate,
	setActivityEnabledFlag,
} from "../core/state/playback";
import { RESET_ACTIVITY_TIMEOUT } from "../shared/constants";

export default defineBackground(() => {
	const gateway = new DiscordGateway();
	gateway.connect();

	let activityTimeout: ReturnType<typeof setTimeout> | null = null;

	browser.storage.local.get("activity_enabled").then((storage) => {
		if (typeof storage.activity_enabled === "boolean") {
			setActivityEnabledFlag(storage.activity_enabled);
		}
	});

	function resetActivityTimeout() {
		if (activityTimeout) clearTimeout(activityTimeout);
		activityTimeout = setTimeout(() => {
			gateway
				.setActivity({ type: "STOPPED", ...currentAnimeState })
				.catch((err) => console.error("[setActivity/timeout]", err));
			clearAnimeState();
		}, RESET_ACTIVITY_TIMEOUT * 1000);
	}

	browser.runtime.onInstalled.addListener((details) => {
		if (details.reason === "install") {
			browser.tabs.create({
				url: browser.runtime.getURL("/popup.html"),
				active: true,
			});
		}
	});

	browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
		const targetUrl = changeInfo.url || tab.url;
		if (targetUrl?.startsWith("http://127.0.0.1/discord-auth")) {
			browser.tabs.remove(tabId).catch(() => {});

			processLocalhostRedirect(targetUrl).then(async (result) => {
				if (result.success && result.token) {
					await browser.storage.local.remove("auth_error");
					await gateway.connect();
				} else if (!result.success && result.error) {
					await browser.storage.local.set({ auth_error: result.error });
				}
			});
		}
	});

	browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
		if (message.type === "LOGIN_DISCORD") {
			browser.storage.local.remove("auth_error");

			loginWithDiscord()
				.then(async (token) => {
					if (token === "mobile_pending") {
						sendResponse({ success: true, pending: true });
					} else if (token) {
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

		if (message.type === "SET_ACTIVITY_ENABLED") {
			setActivityEnabledFlag(!!message.enabled);
			browser.storage.local
				.set({ activity_enabled: activityEnabled })
				.then(() => {
					if (!activityEnabled) {
						if (activityTimeout) clearTimeout(activityTimeout);
						gateway
							.setActivity({ type: "STOPPED", ...currentAnimeState })
							.catch((err) => console.error("[setActivity/toggle]", err));
						clearAnimeState();
					}
					sendResponse({ success: true });
				});
			return true;
		}

		if (message.type === "GET_STATUS") {
			browser.storage.local
				.get(["discord_token", "auth_error"])
				.then((storage) => {
					sendResponse({
						hasToken:
							typeof storage.discord_token === "string" &&
							!!storage.discord_token,
						isGatewayReady: gateway.isConnected(),
						activityEnabled,
						authError: storage.auth_error || null,
						currentAnime: currentAnimeState,
					});
				});
			return true;
		}

		if (!sender.tab?.active) return;

		if (message.type === "STOPPED") {
			gateway
				.setActivity({ type: "STOPPED", ...currentAnimeState })
				.catch((err) => console.error("[setActivity/stopped]", err));
			if (activityTimeout) clearTimeout(activityTimeout);
			clearAnimeState();
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

		if (!activityEnabled) return;
		resetActivityTimeout();

		const { shouldUpdate, newEstimatedStart } = evaluateDiscordUpdate(
			message.type,
		);

		if (!shouldUpdate) return;
		commitBroadcast(newEstimatedStart);

		gateway
			.setActivity({
				type: currentAnimeState.isPaused ? "PAUSED" : "WATCHING",
				...currentAnimeState,
			})
			.catch((err) => console.error("[setActivity/update]", err));
	});
});
