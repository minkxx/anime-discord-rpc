import { getLargeImageKey } from "@/utils/register-assets";
import { APPLICATION_ID, GATEWAY_RECONNECT_INTERVAL } from "../constants";
import type { PlaybackState } from "../types";

export class DiscordGateway {
	private ws: WebSocket | null = null;
	private token: string | null = null;
	private heartbeatInterval: ReturnType<typeof setInterval> | null = null;
	private isReady = false;
	private isManualDisconnect = false;

	async connect() {
		this.isManualDisconnect = false;
		const storage = await browser.storage.local.get("discord_token");
		this.token =
			typeof storage.discord_token === "string" ? storage.discord_token : null;

		if (!this.token) {
			console.log("[Gateway] No token found in storage.");
			return;
		}

		if (
			this.ws &&
			(this.ws.readyState === WebSocket.OPEN ||
				this.ws.readyState === WebSocket.CONNECTING)
		) {
			console.log("[Gateway] Already connected or connecting.");
			return;
		}

		this.ws = new WebSocket("wss://gateway.discord.gg/?v=10&encoding=json");

		this.ws.onopen = () => console.log("[Gateway] Connected to WebSocket");

		this.ws.onmessage = (event) => {
			const payload = JSON.parse(event.data);
			const { op, t, d } = payload;

			if (op === 10) {
				const interval = d.heartbeat_interval;
				this.startHeartbeat(interval);
				this.identify();
			}

			if (op === 0 && t === "READY") {
				this.isReady = true;
				console.log("[Gateway] Ready and authenticated!");
			}

			if (op === 9) {
				console.error("[Gateway] Session Invalidated. Clearing token.");
				this.disconnect();
				browser.storage.local.remove("discord_token");
			}
		};

		this.ws.onclose = () => {
			this.isReady = false;
			this.stopHeartbeat();
			if (!this.isManualDisconnect) {
				console.log("[Gateway] Connection dropped. Reconnecting in 5s...");
				setTimeout(() => this.connect(), GATEWAY_RECONNECT_INTERVAL * 1000);
			}
		};
	}

	private startHeartbeat(interval: number) {
		this.stopHeartbeat();
		this.heartbeatInterval = setInterval(() => {
			if (this.ws?.readyState === WebSocket.OPEN) {
				this.ws.send(JSON.stringify({ op: 1, d: null }));
			}
		}, interval);
	}

	private stopHeartbeat() {
		if (this.heartbeatInterval) {
			clearInterval(this.heartbeatInterval);
			this.heartbeatInterval = null;
		}
	}

	private identify() {
		this.ws?.send(
			JSON.stringify({
				op: 2,
				d: {
					token: `Bearer ${this.token}`,
					properties: {
						$os: "windows",
						$browser: import.meta.env.BROWSER || "chrome",
						$device: "pc",
					},
				},
			}),
		);
	}

	public async setActivity(
		state: PlaybackState & {
			title: string;
			episode: string;
			coverUrl: string;
			currentMs: number;
			durationMs: number;
			isPaused: boolean;
		},
	) {
		if (!this.isReady || !this.ws) return;

		const isStopped = state.type === "STOPPED";

		let timestamps: { start?: number; end?: number } | undefined;
		if (!state.isPaused && state.currentMs > 0 && state.durationMs > 0) {
			const start = Math.floor(Date.now() - state.currentMs);
			const end = Math.floor(start + state.durationMs);
			timestamps = { start, end };
		}

		const largeImage = state.coverUrl
			? await getLargeImageKey(state.coverUrl)
			: "default_cover";

		const payload = {
			op: 3,
			d: {
				since: null,
				activities: isStopped
					? []
					: [
							{
								name: "Anime",
								type: 3,
								application_id: APPLICATION_ID,
								details: state.title,
								state: `${state.episode} ${state.isPaused ? "(Paused)" : ""}`,
								timestamps,
								assets: {
									large_image: largeImage,
									large_text: state.title,
								},
							},
						],
				status: "online",
				afk: false,
			},
		};

		console.log(
			"[Gateway] Sending presence payload:",
			JSON.stringify(payload, null, 2),
		);
		this.ws.send(JSON.stringify(payload));
	}

	public disconnect() {
		this.isManualDisconnect = true;
		this.isReady = false;
		this.stopHeartbeat();
		this.ws?.close();
		this.ws = null;
	}

	public isConnected(): boolean {
		return this.isReady;
	}
}
