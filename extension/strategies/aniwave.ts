import { parseTimeText } from "../utils/parser";
import type { AnimeSite } from "./types";

export const aniwaveStrategy: AnimeSite = {
	domains: ["aniwaves.ru"],
	iframe_src: ["play.echovideo.ru", "gn1r5n.org", "myvidplay.com"],

	getAnimeMetadata: () => {
		const titleElement = document.querySelector("h1.title.d-title");
		const episodeElement = document.querySelector(".tip b");
		const imageElement = document.querySelector(
			"#w-info .binfo .poster img",
		) as HTMLImageElement;

		const title = titleElement?.textContent?.trim() || "Unknown Anime";
		const episode = episodeElement?.textContent?.trim() || "Unknown Episode";
		const coverUrl = imageElement?.src || "No Image Found";

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
