function parseTimeText(timeStr: string | null | undefined): number {
	if (!timeStr) return 0;
	const cleanStr = timeStr.replace("-", "").trim();
	const parts = cleanStr.split(":").map(Number);

	if (parts.length === 2) {
		return (parts[0] * 60 + parts[1]) * 1000;
	} else if (parts.length === 3) {
		return (parts[0] * 3600 + parts[1] * 60 + parts[2]) * 1000;
	}
	return 0;
}

export default defineContentScript({
	matches: ["*://anikototv.to/*", "*://anikoto.cz/*", "*://vidtube.site/*"],
	allFrames: true,

	main() {
		setInterval(() => {
			if (window.location.hostname.includes("vidtube.site")) {
				const elapsedElement = document.querySelector(".jw-text-elapsed");
				const countdownElement = document.querySelector(".jw-text-countdown");
				const pausedElement = document.querySelector(".jw-state-paused");

				if (elapsedElement && countdownElement) {
					const currentMs = parseTimeText(elapsedElement.textContent);
					const remainingMs = parseTimeText(countdownElement.textContent);
					const durationMs = currentMs + remainingMs;

					browser.runtime.sendMessage({
						type: "TIME_UPDATE",
						currentMs,
						durationMs,
						isPaused: pausedElement !== null,
					});
				}
				return;
			}

			if (
				window.location.hostname.includes("anikototv.to") ||
				window.location.hostname.includes("anikoto.cz")
			) {
				const titleElement = document.querySelector("h1.title");
				const episodeElement = document.querySelector(".tip b");
				const imageElement = document.querySelector(
					".poster img",
				) as HTMLImageElement;

				if (!titleElement) {
					browser.runtime.sendMessage({ type: "STOPPED" });
					return;
				}

				browser.runtime.sendMessage({
					type: "INFO_UPDATE",
					title: titleElement?.textContent?.trim() || "Unknown Anime",
					episode: episodeElement?.textContent?.trim() || "Unknown Episode",
					coverUrl: imageElement?.src || "No Image Found",
				});
			}
		}, 5000);
	},
});
