import { WebSocketServer } from "ws";
import { DiscordManager } from "./discord";
import type { IPayload } from "./types";

const discord = new DiscordManager();

const wss = new WebSocketServer({ port: 8080 });
console.log("WS Host server running on ws://127.0.0.1:8080");

wss.on("connection", (ws) => {
	console.log("Extension connected to Host");

	ws.on("message", (message: string) => {
		try {
			const payload: IPayload = JSON.parse(message);
			discord.updatePresence(payload);
		} catch (e) {
			console.error("Failed to parse extension message:", e);
		}
	});

	ws.on("close", () => {
		console.log("Extension disconnected from Host");
	});
});
