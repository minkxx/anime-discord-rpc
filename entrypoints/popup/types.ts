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
	currentAnime: {
		title: string;
		episode: string;
		coverUrl: string;
		isPaused: boolean;
	};
}

export interface LoginResponse {
	success: boolean;
	error?: string;
}

export interface SimpleResponse {
	success: boolean;
}
