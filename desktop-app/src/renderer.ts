import "./index.css";
import { IPayload } from "./types";

declare global {
	interface Window {
		api: {
			onAnimeUpdate: (callback: (data: IPayload) => void) => void;
			onAppLog: (
				callback: (log: {
					level: string;
					message: string;
					timestamp: string;
				}) => void,
			) => void;
		};
	}
}

// Status
const titleEl = document.getElementById("title") as HTMLHeadingElement;
const episodeEl = document.getElementById("episode") as HTMLParagraphElement;
const coverEl = document.getElementById("cover") as HTMLImageElement;
const statusEl = document.getElementById("status") as HTMLSpanElement;

// Tabs
const tabStatusBtn = document.getElementById("tab-status") as HTMLButtonElement;
const tabLogsBtn = document.getElementById("tab-logs") as HTMLButtonElement;
const viewStatus = document.getElementById("view-status") as HTMLDivElement;
const viewLogs = document.getElementById("view-logs") as HTMLDivElement;
const logContainer = document.getElementById("log-container") as HTMLDivElement;

tabStatusBtn.addEventListener("click", () => {
	tabStatusBtn.classList.add("active");
	tabLogsBtn.classList.remove("active");
	viewStatus.classList.add("active-view");
	viewLogs.classList.remove("active-view");
});

tabLogsBtn.addEventListener("click", () => {
	tabLogsBtn.classList.add("active");
	tabStatusBtn.classList.remove("active");
	viewLogs.classList.add("active-view");
	viewStatus.classList.remove("active-view");
});

function appendLog(
	level: string,
	message: string,
	timestamp: string = new Date().toLocaleTimeString(),
) {
	const logEl = document.createElement("div");
	logEl.classList.add("log-entry");

	const colorClass = level === "error" ? "log-error" : "log-info";

	logEl.innerHTML = `<span class="log-time">[${timestamp}]</span> <span class="${colorClass}">${message}</span>`;
	logContainer.appendChild(logEl);

	logContainer.scrollTop = logContainer.scrollHeight;
}

window.api.onAppLog((log) => {
	appendLog(log.level, log.message, log.timestamp);
});

console.error = (...args) => {
	appendLog("error", args.join(" "));
};

window.api.onAnimeUpdate((data) => {
	if (data.type === "STOPPED") {
		titleEl.innerText = "Not watching anything";
		episodeEl.innerText = "";
		coverEl.src = "";
		coverEl.style.display = "none";
		statusEl.innerText = "Idle";
		statusEl.style.background = "#45475a";
		return;
	}

	titleEl.innerText = data.title;
	episodeEl.innerText = data.episode;

	if (data.type === "WATCHING") {
		statusEl.innerText = "▶ Playing";
		statusEl.style.background = "#a6e3a1";
		statusEl.style.color = "#11111b";
	} else {
		statusEl.innerText = "⏸ Paused";
		statusEl.style.background = "#f9e2af";
		statusEl.style.color = "#11111b";
	}

	if (data.coverUrl) {
		coverEl.src = data.coverUrl;
		coverEl.style.display = "block";
	}
});
