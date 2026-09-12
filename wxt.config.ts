import { defineConfig } from "wxt";
import { strategies } from "./strategies";
import { extractMatches } from "./utils/extractor";

// See https://wxt.dev/api/config.html
export default defineConfig({
	manifest: {
		name: "Anime RPC",
		permissions: ["storage", "identity"],
		host_permissions: [
			...extractMatches(strategies),
			"https://discord.com/*",
			"wss://gateway.discord.gg/*",
		],
		browser_specific_settings: {
			gecko: {
				id: "anime-rpc@minkxx.dev",
				strict_min_version: "142.0",
				data_collection_permissions: {
					required: ["none"],
				},
			},
		},
	},
	vite: () => ({
		server: {
			fs: {
				allow: ["../.."],
			},
		},
	}),
	modules: ["@wxt-dev/module-react"],
});
