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
