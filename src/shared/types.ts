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

export interface AnimeMetadata {
	title: string | null | undefined;
	episode: string | null | undefined;
	coverUrl: string | null | undefined;
}

export interface ProgressStats {
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

export interface AnimeState {
	title: string;
	episode: string;
	coverUrl: string;
	isPaused: boolean;
}

export type ViewName = "home" | "settings";

export interface StatusResponse {
	hasToken: boolean;
	isGatewayReady: boolean;
	activityEnabled?: boolean;
	authError?: string | null;
	currentAnime: AnimeState | null;
}

export interface LoginResponse {
	success: boolean;
	error?: string;
}

export interface SimpleResponse {
	success: boolean;
}
