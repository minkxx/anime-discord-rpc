import type { AnimeSite } from "../../shared/types";
import { getStandardVideoStats } from "../parser";

// Watch pages look like: https://reanime.to/watch/overgeared-vc4j78?ep=2
// and have a <title> like:  "Overgeared - Episode 2 | Re:ANIME"
const TITLE_REGEX = /^(.+?)\s+-\s+Episode\s+(\S+)\s+\|\s+Re:ANIME$/i;

// Text pieces inside an episode list item that are NOT the episode name
const EP_NUMBER_REGEX = /^EP\s*\d+/i;
const AUDIO_REGEX = /^(sub|dub)$/i;
const DATE_REGEX = /^[A-Z]{3}\s+\d{1,2},\s*\d{4}$/i;

// Finds the name of the current episode in the episode list on the page
const getEpisodeName = (episodeNumber: string): string | null => {
	const links = document.querySelectorAll<HTMLAnchorElement>(
		'a[href*="/watch/"][href*="ep="]',
	);

	for (const link of links) {
		const ep = new URL(link.href, window.location.origin).searchParams.get(
			"ep",
		);
		if (ep !== episodeNumber) continue;

		const walker = document.createTreeWalker(link, NodeFilter.SHOW_TEXT);
		while (walker.nextNode()) {
			const text = walker.currentNode.textContent?.trim();
			if (
				!text ||
				EP_NUMBER_REGEX.test(text) ||
				AUDIO_REGEX.test(text) ||
				DATE_REGEX.test(text)
			) {
				continue;
			}
			return text;
		}
	}

	return null;
};

export const reanimeStrategy: AnimeSite = {
	domains: ["reanime.to"],
	iframe_src: ["flixcloud.cc"],

	getAnimeMetadata: () => {
		// Only report activity on actual watch pages (not /home, /search, ...)
		if (!/\/watch\//.test(window.location.pathname)) {
			return { title: null, episode: null, coverUrl: null };
		}

		const match = document.title.trim().match(TITLE_REGEX);

		// Fallback: the ?ep= query param holds the episode number
		const epParam = new URLSearchParams(window.location.search).get("ep");
		const epFromUrl = epParam && /^\d+(\.\d+)?$/.test(epParam) ? epParam : null;

		const title = match?.[1]?.trim();
		const episodeNumber = match?.[2] ?? epFromUrl;

		// Shown as "Episode {n}: {name}"
		const episode = episodeNumber ? `Episode ${episodeNumber}` : null;
		const episodeName = episodeNumber ? getEpisodeName(episodeNumber) : null;

		// og:image already points to the public AniList CDN (not protected),
		// so no background FETCH_ANILIST call is needed here.
		const coverUrl = document
			.querySelector<HTMLMetaElement>('meta[property="og:image"]')
			?.content?.trim();

		return {
			title: title || null,
			episode,
			// Sites without a real name just repeat "Episode N", so skip that
			episodeName: episodeName && episodeName !== episode ? episodeName : null,
			coverUrl: coverUrl || null,
		};
	},

	getProgressStats: () => getStandardVideoStats(),
};
