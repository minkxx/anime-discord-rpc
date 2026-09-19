import type { AnimeSite } from "../../shared/types";
import { getStandardVideoStats } from "../parser";

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

	getProgressStats: () => getStandardVideoStats(),
};
