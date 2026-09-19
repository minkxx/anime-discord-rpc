import { extractMatches } from "../scraper/extractor";
import { strategies } from "../scraper/sites";
import { CHECK_ACTIVITY_INTERVAL } from "../shared/constants";

export default defineContentScript({
	matches: [...extractMatches(strategies)],
	allFrames: true,

	main() {
		const host = window.location.hostname;

		const metaStrategy = strategies.find((stg) =>
			stg.domains.some((domain) => host.includes(domain)),
		);

		const iframeStrategy = strategies.find((stg) =>
			stg.iframe_src.some((src) => host.includes(src)),
		);

		if (!metaStrategy && !iframeStrategy) return;

		setInterval(() => {
			try {
				if (iframeStrategy) {
					const stats = iframeStrategy.getProgressStats();

					browser.runtime.sendMessage({
						type: "TIME_UPDATE",
						currentMs: stats.currentMs,
						durationMs: stats.durationMs,
						isPaused: !!stats.isPaused,
					});

					return;
				}

				if (metaStrategy) {
					const meta = metaStrategy.getAnimeMetadata();

					if (!meta.title || !meta.episode) {
						browser.runtime.sendMessage({ type: "STOPPED" });
						return;
					}

					browser.runtime.sendMessage({
						type: "INFO_UPDATE",
						title: meta.title,
						episode: meta.episode,
						coverUrl: meta.coverUrl,
					});
				}
			} catch (err) {
				console.error("[Anime RPC] DOM scraping error:", err);
			}
		}, CHECK_ACTIVITY_INTERVAL * 1000);
	},
});
