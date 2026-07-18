import { parseTimeText } from "../utils/parser";
import type { AnimeSite } from "./types";

let cachedCoverUrl: string | null = null;
let currentAnilistId: number | null = null;
let isFetching = false;
let fetchFailed = false;

export const animepaheStrategy: AnimeSite = {
	domains: ["animepahe.pw"],
	iframe_src: ["kwik.cx"],

	getAnimeMetadata: () => {
		const titleElement = document.querySelector(".theatre-info h1 a");
		const episodeElement = document.querySelector("#episodeMenu");
		const imageElement = document.querySelector(
			".theatre-info .anime-poster img",
		) as HTMLImageElement;

		const title = titleElement?.textContent?.trim();
		const episode = episodeElement?.textContent?.trim();
		let coverUrl = imageElement?.src;

		// animepahe's coverUrl sources are protected behind cloudlfare protection, so we are fetching coverUrls from anilist api
		const anilistIdElement = document.querySelector(
			'meta[name="anilist"]',
		) as HTMLMetaElement;
		const anilistId = parseInt(anilistIdElement?.content, 10);

		if (anilistId && anilistId !== currentAnilistId) {
			currentAnilistId = anilistId;
			cachedCoverUrl = null;
			isFetching = false;
			fetchFailed = false;
		}

		if (!cachedCoverUrl && !isFetching && !fetchFailed && anilistId) {
			isFetching = true;

			browser.runtime
				.sendMessage({
					type: "FETCH_ANILIST",
					anilistId: anilistId,
				})
				.then((response: { coverUrl: string }) => {
					if (response && response.coverUrl) {
						cachedCoverUrl = response.coverUrl;
					} else {
						fetchFailed = true;
					}
				})
				.catch((error) => {
					console.error("Anilist:", error.message);
					fetchFailed = true;
				})
				.finally(() => {
					isFetching = false;
				});
		}

		if (cachedCoverUrl) {
			coverUrl = cachedCoverUrl;
		}

		return {
			title,
			episode,
			coverUrl,
		};
	},

	getProgressStats: () => {
		const videoElement = document.querySelector("video") as HTMLVideoElement;

		// currently working with videoElement
		if (videoElement) {
			return {
				currentMs: Math.floor(videoElement.currentTime * 1000),
				durationMs: Math.floor(videoElement.duration * 1000),
				remainingMs: Math.floor(
					(videoElement.duration - videoElement.currentTime) * 1000,
				),
				isPaused: videoElement.paused,
			};
		}

		// fallback but does not works
		const elapsedElement = document.querySelector(".jw-text-elapsed");
		const countdownElement = document.querySelector(".jw-text-countdown");
		const pausedElement = document.querySelector(".jw-state-paused");

		const currentMs = parseTimeText(elapsedElement?.textContent);
		const remainingMs = parseTimeText(countdownElement?.textContent);
		const durationMs = currentMs + remainingMs;

		return {
			currentMs,
			remainingMs,
			durationMs,
			isPaused: pausedElement ? true : null,
		};
	},
};
