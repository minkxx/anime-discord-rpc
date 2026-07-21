import path from "node:path";
import { app, BrowserWindow, Menu, nativeImage, Tray } from "electron";
import started from "electron-squirrel-startup";
import { WebSocketServer } from "ws";
import { DiscordManager } from "./discord";
import { IPayload } from "./types";

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let wss: WebSocketServer | null = null;
let discordManager: DiscordManager | null = null;

let isBrowserConnected = false;

const originalLog = console.log;
const originalError = console.error;

function sendLogToWindow(level: "info" | "error", args: any[]) {
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
}

if (started) {
	app.quit();
}

const iconPath = path.join(__dirname, "../../assets/icon.ico");

console.log("Icon path: ", iconPath);

const createWindow = () => {
	mainWindow = new BrowserWindow({
		width: 400,
		height: 550,
		show: false,
		resizable: false,
		icon: iconPath,
		webPreferences: {
			preload: path.join(__dirname, "preload.js"),
		},
	});

	mainWindow.setMenu(null);

	if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
		mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
	} else {
		mainWindow.loadFile(
			path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
		);
	}

	mainWindow.on("close", (event) => {
		event.preventDefault();
		mainWindow?.hide();
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
			label: `Discord: ${discordManager.isConnected ? "🟢 Connected" : "🔴 Disconnected"}`,
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
				const data = JSON.parse(message.toString());

				if (mainWindow) {
					mainWindow.webContents.send("anime-update", data);
				}

				discordManager?.updatePresence(data);

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

			discordManager?.updatePresence({ type: "STOPPED" } as IPayload);
		});
	});
};

app.on("ready", () => {
	app.setLoginItemSettings({
		openAtLogin: true,
		path: app.getPath("exe"),
	});

	discordManager = new DiscordManager();

	createWindow();
	createTray();
	initWebSocket();

	setInterval(updateTrayMenu, 6000);
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
	if (process.platform !== "darwin") {
		app.quit();
	}
});

app.on("activate", () => {
	// On OS X it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (BrowserWindow.getAllWindows().length === 0) {
		createWindow();
	}
});
