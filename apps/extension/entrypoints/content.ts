import { strategies } from "../strategies";
import { extractMatches } from "../utils/extractor";

export default defineContentScript({
	matches: [...extractMatches(strategies)],
	allFrames: true,

	main() {
		setInterval(() => {
			const host = window.location.hostname;

			const metaStrategy = strategies.find((stg) =>
				stg.domains.some((domain) => host.includes(domain)),
			);

			const iframeStrategy = strategies.find((stg) =>
				stg.iframe_src.some((src) => host.includes(src)),
			);

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

				if (!meta.title) {
					browser.runtime.sendMessage({ type: "STOPPED" });
					return;
				}

				browser.runtime.sendMessage({
					type: "INFO_UPDATE",
					title: meta.title,
					episode: meta.episode || "Unknown Episode",
					coverUrl: meta.coverUrl || "No Image Found",
				});
			}
		}, 5000);
	},
});
