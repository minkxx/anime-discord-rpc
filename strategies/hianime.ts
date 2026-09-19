import type { AnimeSite } from "../types";
import { getStandardVideoStats } from "../utils/parser";

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

	getProgressStats: () => getStandardVideoStats(),
};
