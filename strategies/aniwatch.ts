import type { AnimeSite } from "../types";
import { parseTimeText } from "../utils/parser";

export const aniwatchStrategy: AnimeSite = {
	domains: ["aniwatch.cx"],
	iframe_src: ["vidnest.fun", "tryembed.us.cc", "megaplay.buzz"],

	getAnimeMetadata: () => {
		const titleElement = document.querySelector(
			".awt-watch-info-bar .awt-wib-meta h1.awt-wib-title",
		);
		const episodeElement = document.getElementById("wc-ep-label");
		const imageElement = document.querySelector(
			".awt-watch-info-bar img.awt-wib-poster",
		) as HTMLImageElement;

		const title = titleElement?.textContent?.trim().split("Episode")[0];
		const episode = episodeElement?.textContent?.trim();
		const coverUrl = imageElement?.src;

		return {
			title: titleElement ? title : null,
			episode: episodeElement ? episode : null,
			coverUrl: coverUrl ? coverUrl : null,
		};
	},

	getProgressStats: () => {
		const videoElement = document.querySelector("video") as HTMLVideoElement;

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
