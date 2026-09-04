import "./index.css";
import type { PlaybackState } from "@pkg/shared";

declare global {
	interface Window {
		api: {
			onAnimeUpdate: (callback: (data: PlaybackState) => void) => void;
			onAppLog: (
				callback: (log: {
					level: string;
					message: string;
					timestamp: string;
				}) => void,
			) => void;
			getAppVersion: () => Promise<string>;
			getRpcEnabled: () => Promise<boolean>;
			setRpcEnabled: (enabled: boolean) => void;
		};
	}
}

// screen navigation
type ScreenName = "home" | "settings" | "logs";

const screens: Record<ScreenName, HTMLElement> = {
	home: document.getElementById("screen-home") as HTMLElement,
	settings: document.getElementById("screen-settings") as HTMLElement,
	logs: document.getElementById("screen-logs") as HTMLElement,
};

const navButtons = Array.from(
	document.querySelectorAll<HTMLButtonElement>(".nav-btn"),
);
const bottomNav = document.getElementById("bottom-nav") as HTMLElement;

let currentTab: "home" | "settings" = "home";

function showTab(target: "home" | "settings") {
	if (target === currentTab) return;

	screens[currentTab].classList.remove("is-active");
	screens[target].classList.add("is-active");
	currentTab = target;

	for (const btn of navButtons) {
		btn.classList.toggle("is-active", btn.dataset.target === target);
	}
}

for (const btn of navButtons) {
	btn.addEventListener("click", () => {
		if (screens.logs.classList.contains("is-active")) {
			closeLogs();
		}
		showTab(btn.dataset.target as "home" | "settings");
	});
}

function openLogs() {
	screens.logs.classList.add("is-active");
	updateNavShadow();
}

function closeLogs() {
	screens.logs.classList.remove("is-active");
	bottomNav.classList.remove("is-elevated");
}

document.getElementById("open-logs")?.addEventListener("click", openLogs);
document.getElementById("back-from-logs")?.addEventListener("click", closeLogs);

// home
const titleEl = document.getElementById("title") as HTMLHeadingElement;
const episodeEl = document.getElementById("episode") as HTMLParagraphElement;
const coverEl = document.getElementById("cover") as HTMLImageElement;
const noSignalEl = document.getElementById("no-signal") as HTMLDivElement;
const recBadgeEl = document.getElementById("rec-badge") as HTMLDivElement;
const recLabelEl = document.getElementById("rec-label") as HTMLSpanElement;

function setIdle() {
	titleEl.textContent = "Nothing playing";
	episodeEl.textContent = "";
	coverEl.classList.remove("is-visible");
	coverEl.removeAttribute("src");
	noSignalEl.classList.remove("is-hidden");
	recBadgeEl.classList.remove("is-visible", "state-playing", "state-paused");
}

window.api.onAnimeUpdate((data) => {
	if (data.type === "STOPPED") {
		setIdle();
		return;
	}

	titleEl.textContent = data.title;
	episodeEl.textContent = data.episode;

	recBadgeEl.classList.add("is-visible");
	if (data.type === "WATCHING") {
		recBadgeEl.classList.add("state-playing");
		recBadgeEl.classList.remove("state-paused");
		recLabelEl.textContent = "REC";
	} else {
		recBadgeEl.classList.add("state-paused");
		recBadgeEl.classList.remove("state-playing");
		recLabelEl.textContent = "PAUSED";
	}

	if (data.coverUrl && coverEl.src !== data.coverUrl) {
		noSignalEl.classList.add("is-hidden");
		coverEl.classList.remove("is-visible");
		coverEl.src = data.coverUrl;
		// restart the tune-in animation on every new cover
		requestAnimationFrame(() => coverEl.classList.add("is-visible"));
	} else if (data.coverUrl) {
		noSignalEl.classList.add("is-hidden");
	}
});

setIdle();

// settings
const versionEl = document.getElementById("app-version") as HTMLSpanElement;
const rpcToggle = document.getElementById("rpc-toggle") as HTMLButtonElement;

window.api.getAppVersion().then((version) => {
	versionEl.textContent = `v${version}`;
});

window.api.getRpcEnabled().then((enabled) => {
	rpcToggle.setAttribute("aria-checked", String(enabled));
});

rpcToggle.addEventListener("click", () => {
	const nextEnabled = rpcToggle.getAttribute("aria-checked") !== "true";
	rpcToggle.setAttribute("aria-checked", String(nextEnabled));
	window.api.setRpcEnabled(nextEnabled);
});

// logs
const logContainer = document.getElementById("log-container") as HTMLDivElement;
const clearLogsBtn = document.getElementById("clear-logs") as HTMLButtonElement;
const toastEl = document.getElementById("toast") as HTMLDivElement;

function updateNavShadow() {
	const isScrollable =
		logContainer.scrollHeight > logContainer.clientHeight + 1;
	bottomNav.classList.toggle("is-elevated", isScrollable);
}

let toastTimeout: ReturnType<typeof setTimeout> | null = null;

function showToast(message: string) {
	toastEl.textContent = message;
	toastEl.classList.add("is-visible");
	if (toastTimeout) clearTimeout(toastTimeout);
	toastTimeout = setTimeout(() => toastEl.classList.remove("is-visible"), 1600);
}

function appendLog(
	level: string,
	message: string,
	timestamp: string = new Date().toLocaleTimeString(),
) {
	const logEl = document.createElement("div");
	logEl.classList.add(
		"log-entry",
		level === "error" ? "log-level-error" : "log-level-info",
	);
	logEl.tabIndex = 0;

	const timeSpan = document.createElement("span");
	timeSpan.classList.add("log-time");
	timeSpan.textContent = `[${timestamp}]`;

	const msgSpan = document.createElement("span");
	msgSpan.classList.add("log-message");
	msgSpan.textContent = message;

	logEl.append(timeSpan, msgSpan);

	logEl.addEventListener("click", async () => {
		try {
			await navigator.clipboard.writeText(`[${timestamp}] ${message}`);
			logEl.classList.add("is-copied");
			showToast("Copied to clipboard");
			setTimeout(() => logEl.classList.remove("is-copied"), 500);
		} catch {
			showToast("Couldn't copy log");
		}
	});

	logContainer.appendChild(logEl);
	logContainer.scrollTop = logContainer.scrollHeight;
	updateNavShadow();
}

clearLogsBtn.addEventListener("click", () => {
	logContainer.innerHTML = "";
	updateNavShadow();
});

window.api.onAppLog((log) => {
	appendLog(log.level, log.message, log.timestamp);
});

console.error = (...args) => {
	appendLog("error", args.join(" "));
};
