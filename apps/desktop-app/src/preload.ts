import type { PlaybackState } from "@pkg/shared";
import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("api", {
	onAnimeUpdate: (callback: (data: PlaybackState) => void) => {
		ipcRenderer.on("anime-update", (_event, data) => callback(data));
	},

	onAppLog: (
		callback: (log: {
			level: string;
			message: string;
			timestamp: string;
		}) => void,
	) => {
		ipcRenderer.on("app-log", (_event, log) => callback(log));
	},
});
