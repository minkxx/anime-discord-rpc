import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
	manifest: {
		name: "Anime RPC",
		host_permissions: ["*://anikototv.to/*", "*://vidtube.site/*"],
		browser_specific_settings: {
			gecko: {
				id: "anime-rpc@minkxx.dev",
				strict_min_version: "109.0",
				data_collection_permissions: {
					required: ["none"],
				},
			},
		},
	},
	suppressWarnings: {
		firefoxDataCollection: true,
	},
});
