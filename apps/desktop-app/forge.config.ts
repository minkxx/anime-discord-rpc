import fs from "node:fs";
import path from "node:path";
import { FuseV1Options, FuseVersion } from "@electron/fuses";
import { MakerDeb } from "@electron-forge/maker-deb";
import { MakerRpm } from "@electron-forge/maker-rpm";
import { MakerSquirrel } from "@electron-forge/maker-squirrel";
import { MakerZIP } from "@electron-forge/maker-zip";
import { FusesPlugin } from "@electron-forge/plugin-fuses";
import { VitePlugin } from "@electron-forge/plugin-vite";
import type { ForgeConfig } from "@electron-forge/shared-types";

const config: ForgeConfig = {
	packagerConfig: {
		asar: true,
		icon: "./assets/icon",
		extraResource: ["./assets/icon.ico"],
	},
	rebuildConfig: {},
	makers: [
		new MakerSquirrel({
			name: "anime_rpc_desktop",
			description:
				"A desktop application to receive anime data from browser extension and send rpc updates to local discord client.",
			setupIcon: "./assets/icon.ico",
			iconUrl:
				"https://raw.githubusercontent.com/minkxx/anime-discord-rpc/refs/heads/main/apps/desktop-app/assets/icon.ico",
		}),
		new MakerZIP({}, ["darwin"]),
		new MakerRpm({}),
		new MakerDeb({}),
	],
	plugins: [
		new VitePlugin({
			build: [
				{
					entry: "src/main.ts",
					config: "vite.main.config.ts",
					target: "main",
				},
				{
					entry: "src/preload.ts",
					config: "vite.preload.config.ts",
					target: "preload",
				},
			],
			renderer: [
				{
					name: "main_window",
					config: "vite.renderer.config.ts",
				},
			],
		}),
		new FusesPlugin({
			version: FuseVersion.V1,
			[FuseV1Options.RunAsNode]: false,
			[FuseV1Options.EnableCookieEncryption]: true,
			[FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
			[FuseV1Options.EnableNodeCliInspectArguments]: false,
			[FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
			[FuseV1Options.OnlyLoadAppFromAsar]: true,
		}),
	],
	hooks: {
		postPackage: async (_config, packageResult) => {
			const localesToKeep = new Set(["en-US.pak", "en-GB.pak"]);

			for (const outputPath of packageResult.outputPaths) {
				const localesDir = path.join(outputPath, "locales");
				if (!fs.existsSync(localesDir)) continue;

				for (const file of fs.readdirSync(localesDir)) {
					if (!localesToKeep.has(file)) {
						fs.unlinkSync(path.join(localesDir, file));
					}
				}
			}
		},
	},
};

export default config;
