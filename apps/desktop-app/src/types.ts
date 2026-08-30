export interface IPayload {
	type: "WATCHING" | "PAUSED" | "STOPPED";
	title: string;
	episode: string;
	coverUrl: string;
	currentMs: number;
	durationMs: number;
}
