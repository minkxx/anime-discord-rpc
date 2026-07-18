import { fetchAnilistCover } from "../utils/anilist";

interface IPayload {
	type?: "WATCHING" | "PAUSED" | "STOPPED";
	title?: string;
	episode?: string;
	coverUrl?: string;
	currentMs?: number;
	durationMs?: number;
}

export default defineBackground(() => {
	let ws: WebSocket | null = null;
	let activityTimeout: ReturnType<typeof setTimeout> | null = null;
	let reconnectDelay = 5000;

	let currentAnimeState = {
		title: "Unknown",
		episode: "Unknown",
		coverUrl: "",
		currentMs: 0,
		durationMs: 0,
		isPaused: false,
	};

	function connect() {
		ws = new WebSocket("ws://127.0.0.1:8080");

		ws.onopen = () => {
			console.log("Background Worker connected to local RPC server");
			reconnectDelay = 5000;
		};

		ws.onclose = () => {
			setTimeout(connect, reconnectDelay);
			reconnectDelay = Math.min(reconnectDelay * 1.5, 30000);
		};
	}

	function sendToHost(payload: IPayload) {
		if (ws?.readyState === WebSocket.OPEN) {
			ws.send(JSON.stringify(payload));
		}
	}

	function resetActivityTimeout() {
		if (activityTimeout) clearTimeout(activityTimeout);
		activityTimeout = setTimeout(() => sendToHost({ type: "STOPPED" }), 10000);
	}

	connect();

	browser.runtime.onMessage.addListener((message, sender) => {
		if (!sender.tab || !sender.tab.active) return;

		if (message.type === "STOPPED") {
			sendToHost({ type: "STOPPED" });
			if (activityTimeout) clearTimeout(activityTimeout);
			return;
		}

		if (message.type === "FETCH_ANILIST") {
			const coverUrl = fetchAnilistCover(message.anilistId).then(
				(coverUrl) => ({
					coverUrl,
				}),
			);
			return coverUrl;
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

		sendToHost({
			type: currentAnimeState.isPaused ? "PAUSED" : "WATCHING",
			title: currentAnimeState.title,
			episode: currentAnimeState.episode,
			coverUrl: currentAnimeState.coverUrl,
			currentMs: currentAnimeState.currentMs,
			durationMs: currentAnimeState.durationMs,
		});
	});
});
