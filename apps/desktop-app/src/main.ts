import fs from "node:fs";
import path from "node:path";
import type { PlaybackState } from "@pkg/shared";
import { app, BrowserWindow, ipcMain, Menu, nativeImage, Tray } from "electron";
import started from "electron-squirrel-startup";
import { WebSocketServer } from "ws";
import { DiscordManager } from "./discord";

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let wss: WebSocketServer | null = null;
let discordManager: DiscordManager | null = null;

let isBrowserConnected = false;
let isQuitting = false;

let rpcEnabled = true;

const originalLog = console.log;
const originalError = console.error;

function sendLogToWindow(level: "info" | "error", args: unknown[]) {
	if (mainWindow && !mainWindow.isDestroyed()) {
		const message = args
			.map((arg) => (typeof arg === "object" ? JSON.stringify(arg) : arg))
			.join(" ");

		mainWindow.webContents.send("app-log", {
			level,
			message,
			timestamp: new Date().toLocaleTimeString(),
		});
	}
}

console.log = (...args) => {
	originalLog(...args);
	sendLogToWindow("info", args);
};

console.error = (...args) => {
	originalError(...args);
	sendLogToWindow("error", args);
};

const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
	app.quit();
	process.exit(0);
} else {
	app.on("second-instance", () => {
		if (mainWindow) {
			if (mainWindow.isMinimized()) {
				mainWindow.restore();
			}
			if (!mainWindow.isVisible()) {
				mainWindow.show();
			}
			mainWindow.focus();
		}
	});
}

if (started) {
	app.quit();
}

const iconPath = app.isPackaged
	? path.join(process.resourcesPath, "icon.ico")
	: path.join(__dirname, "../../assets/icon.ico");

const firstRunMarkerPath = path.join(
	app.getPath("userData"),
	".first-run-complete",
);

const isFirstRun = () => !fs.existsSync(firstRunMarkerPath);

const markFirstRunComplete = () => {
	try {
		fs.writeFileSync(firstRunMarkerPath, String(Date.now()));
	} catch (err) {
		console.error("Failed to write first-run marker:", err);
	}
};

const AUTOSTART_ARG = "--autostart";

const wasLaunchedAtLogin = (): boolean => {
	if (process.argv.includes(AUTOSTART_ARG)) return true;

	if (process.platform === "darwin") {
		return app.getLoginItemSettings().wasOpenedAtLogin;
	}

	return false;
};

const createWindow = (showOnReady: boolean) => {
	mainWindow = new BrowserWindow({
		width: 400,
		height: 580,
		show: false,
		resizable: false,
		icon: iconPath,
		webPreferences: {
			preload: path.join(__dirname, "preload.js"),
		},
	});

	mainWindow.setMenu(null);

	mainWindow.once("ready-to-show", () => {
		if (showOnReady) {
			mainWindow?.show();
		}
	});

	if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
		mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
	} else {
		mainWindow.loadFile(
			path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
		);
	}

	mainWindow.on("close", (event) => {
		if (!isQuitting) {
			event.preventDefault();
			mainWindow?.hide();
		} else {
			app.quit();
		}
	});
};

const updateTrayMenu = () => {
	if (!tray || !discordManager) return;
	const contextMenu = Menu.buildFromTemplate([
		{ label: "Anime RPC is running", enabled: false },
		{ type: "separator" },
		{
			label: `Browser: ${isBrowserConnected ? "🟢 Connected" : "🔴 Disconnected"}`,
			enabled: false,
		},
		{
			label: `Discord: ${
				rpcEnabled
					? discordManager.isConnected
						? "🟢 Connected"
						: "🔴 Disconnected"
					: "⏸ Paused"
			}`,
			enabled: false,
		},
		{ type: "separator" },
		{ label: "Show App", click: () => mainWindow?.show() },
		{
			label: "Quit App",
			click: () => {
				app.exit();
			},
		},
	]);
	tray.setContextMenu(contextMenu);
};

const createTray = () => {
	const icon = nativeImage.createFromPath(iconPath);
	tray = new Tray(icon);
	tray.setToolTip("Anime Discord RPC");
	updateTrayMenu();

	tray.on("click", () => {
		mainWindow?.show();
	});
};

const initWebSocket = () => {
	wss = new WebSocketServer({ port: 8080 });

	wss.on("connection", (ws) => {
		isBrowserConnected = true;
		updateTrayMenu();

		ws.on("message", (message) => {
			try {
				const data: PlaybackState = JSON.parse(message.toString());

				if (mainWindow) {
					mainWindow.webContents.send("anime-update", data);
				}

				if (rpcEnabled) {
					discordManager?.updatePresence(data);
				}

				updateTrayMenu();
			} catch (err) {
				console.error("Failed to parse WebSocket message", err);
			}
		});

		ws.on("close", () => {
			isBrowserConnected = false;
			updateTrayMenu();

			if (mainWindow) {
				mainWindow.webContents.send("anime-update", { type: "STOPPED" });
			}

			if (rpcEnabled) {
				discordManager?.updatePresence({ type: "STOPPED" });
			}
		});
	});
};

const initIpcHandlers = () => {
	ipcMain.handle("get-app-version", () => app.getVersion());

	ipcMain.handle("get-rpc-enabled", () => rpcEnabled);

	ipcMain.on("set-rpc-enabled", (_event, enabled: boolean) => {
		rpcEnabled = enabled;
		console.log(
			`Discord status updates ${enabled ? "enabled" : "paused"} from Settings.`,
		);

		if (!rpcEnabled) {
			discordManager?.updatePresence({ type: "STOPPED" });
		}

		updateTrayMenu();
	});
};

app.on("ready", () => {
	app.setLoginItemSettings({
		openAtLogin: true,
		path: app.getPath("exe"),
		args: [AUTOSTART_ARG],
	});

	discordManager = new DiscordManager();

	const firstRun = isFirstRun();
	const shouldShow = firstRun || !wasLaunchedAtLogin();

	createWindow(shouldShow);
	createTray();
	initWebSocket();
	initIpcHandlers();

	if (firstRun) {
		markFirstRunComplete();
	}

	setInterval(updateTrayMenu, 6000);
});

app.on("window-all-closed", () => {
	if (process.platform !== "darwin") {
		app.quit();
	}
});

app.on("activate", () => {
	if (BrowserWindow.getAllWindows().length === 0) {
		createWindow(true);
	}
});

app.on("before-quit", () => {
	isQuitting = true;
});
