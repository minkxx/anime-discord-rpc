import type { AnimeSite } from "../types";
import { parseTimeText } from "../utils/parser";

export const hianimeStrategy: AnimeSite = {
	domains: ["hianime.at"],
	iframe_src: ["zokoanime.video", "megaplay.buzz"],

	getAnimeMetadata: () => {
		const titleElement = document.querySelector(".anisc-detail .film-name a");
		const episodeElement = document.querySelector(".server-notice b");
		const imageElement = document.querySelector(
			".anisc-poster .film-poster img",
		) as HTMLImageElement;

		const title = titleElement?.textContent?.trim();
		const episode = episodeElement?.textContent?.trim();
		const coverUrl = imageElement?.src;

		return {
			title: titleElement ? title : null,
			episode: episodeElement ? episode : null,
			coverUrl: coverUrl ? coverUrl : null,
		};
	},

	getProgressStats: () => {
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
