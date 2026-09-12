export interface StoppedState {
	type: "STOPPED";
}

export interface ActiveState {
	type: "WATCHING" | "PAUSED";
	title: string;
	episode: string;
	coverUrl: string;
	currentMs: number;
	durationMs: number;
}

export type PlaybackState = StoppedState | ActiveState;

interface AnimeMetadata {
	title: string | null | undefined;
	episode: string | null | undefined;
	coverUrl: string | null | undefined;
}

interface ProgressStats {
	currentMs: number | null | undefined;
	remainingMs: number | null | undefined;
	durationMs: number | null | undefined;
	isPaused: boolean | null | undefined;
}

export interface AnimeSite {
	domains: string[];
	iframe_src: string[];
	getAnimeMetadata: () => AnimeMetadata;
	getProgressStats: () => ProgressStats;
}
