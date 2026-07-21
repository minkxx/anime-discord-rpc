import { Client } from "@xhayper/discord-rpc";
import { IPayload } from "./types";

const CLIENT_ID = "1526911509878538340";

export class DiscordManager {
	private client: Client;
	public isConnected = false;
	private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
	private retryDelay = 5000;
	private activityTimeout: ReturnType<typeof setTimeout> | null = null;

	constructor() {
		this.client = new Client({ clientId: CLIENT_ID });
		this.setupListeners();
		this.connect();
	}

	private setupListeners() {
		this.client.on("ready", () => {
			console.log("Connected to Discord Rich Presence!");
			this.isConnected = true;
			this.retryDelay = 5000;
		});

		this.client.on("disconnected", () => {
			console.log("Disconnected from Discord.");
			this.handleReconnect();
		});
	}

	public connect() {
		if (this.isConnected) return;

		console.log("Attempting to connect to Discord RPC...");

		this.client.login().catch((err) => {
			console.error(`Discord login failed: ${err.message}`);
			this.handleReconnect();
		});
	}

	private handleReconnect() {
		this.isConnected = false;

		if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);

		console.log(`Retrying Discord connection in ${this.retryDelay / 1000}s...`);
		this.reconnectTimeout = setTimeout(() => {
			this.retryDelay = Math.min(this.retryDelay * 1.5, 30000);
			this.connect();
		}, this.retryDelay);
	}

	public updatePresence(payload: IPayload) {
		if (!this.isConnected || !this.client.user) {
			console.log(
				"RPC received data, but Discord is not connected. Skipping update.",
			);
			return;
		}

		if (this.activityTimeout) {
			clearTimeout(this.activityTimeout);
			this.activityTimeout = null;
		}

		try {
			if (payload.type === "STOPPED") {
				this.client.user.clearActivity();
				return;
			}

			const isPaused = payload.type === "PAUSED";
			const startTimestamp =
				!isPaused && payload.currentMs
					? Math.floor((Date.now() - payload.currentMs) / 1000)
					: undefined;
			const endTimestamp =
				!isPaused && payload.durationMs && payload.currentMs
					? Math.floor(
							(Date.now() + (payload.durationMs - payload.currentMs)) / 1000,
						)
					: undefined;

			this.client.user.setActivity({
				type: 3,
				details: payload.title,
				state: `${payload.episode} ${isPaused ? "(Paused)" : ""}`,
				largeImageKey: payload.coverUrl || "default_large",
				largeImageText: payload.title,
				startTimestamp,
				endTimestamp,
				instance: false,
			});

			this.activityTimeout = setTimeout(() => {
				console.log(
					"No updates received for 10 seconds. Clearing Discord activity.",
				);
				if (this.isConnected && this.client.user) {
					this.client.user.clearActivity();
				}
			}, 10000);
		} catch (error) {
			console.error("Failed to update Discord presence:", error);
		}
	}
}
