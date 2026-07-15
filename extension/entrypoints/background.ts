export default defineBackground(() => {
	let ws: WebSocket | null = null;
	let activityTimeout: ReturnType<typeof setTimeout> | null = null;

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
		ws.onopen = () =>
			console.log("Background Worker connected to local RPC server");
		ws.onclose = () => setTimeout(connect, 5000);
	}

	function resetActivityTimeout() {
		if (activityTimeout) clearTimeout(activityTimeout);

		activityTimeout = setTimeout(() => {
			if (ws?.readyState === WebSocket.OPEN) {
				ws.send(JSON.stringify({ type: "STOPPED" }));
			}
		}, 15000);
	}

	connect();

	browser.runtime.onMessage.addListener((message) => {
		if (message.type === "STOPPED") {
			if (ws?.readyState === WebSocket.OPEN) {
				ws.send(JSON.stringify({ type: "STOPPED" }));
			}
			if (activityTimeout) clearTimeout(activityTimeout);
			return;
		}

		if (message.type === "INFO_UPDATE") {
			currentAnimeState.title = message.title;
			currentAnimeState.episode = message.episode;
			currentAnimeState.coverUrl = message.coverUrl;
			resetActivityTimeout();
		} else if (message.type === "TIME_UPDATE") {
			currentAnimeState.currentMs = message.currentMs;
			currentAnimeState.durationMs = message.durationMs;
			currentAnimeState.isPaused = message.isPaused;
			resetActivityTimeout();
		}

		if (ws?.readyState === WebSocket.OPEN) {
			const payload = {
				type: currentAnimeState.isPaused ? "PAUSED" : "WATCHING",
				title: currentAnimeState.title,
				episode: currentAnimeState.episode,
				coverUrl: currentAnimeState.coverUrl,
				currentMs: currentAnimeState.currentMs,
				durationMs: currentAnimeState.durationMs,
			};

			ws.send(JSON.stringify(payload));
		}
	});
});
