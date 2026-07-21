import { contextBridge, ipcRenderer } from "electron";
import { IPayload } from "./types";

contextBridge.exposeInMainWorld("api", {
	onAnimeUpdate: (callback: (data: IPayload) => void) => {
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
