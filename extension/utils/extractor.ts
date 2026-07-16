import { AnimeSite } from "@/strategies/types";

export function extractMatches(strategies: AnimeSite[]) {
	const domains = strategies
		.flatMap((stg) => stg.domains)
		.map((domain) => `*://${domain}/*`);

	const iframe_srcs = strategies
		.flatMap((stg) => stg.iframe_src)
		.map((src) => `*://${src}/*`);

	return [...domains, ...iframe_srcs];
}
