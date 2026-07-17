import { defineConfig } from "wxt";
import { strategies } from "./strategies";
import { extractMatches } from "./utils/extractor";

// See https://wxt.dev/api/config.html
export default defineConfig({
	manifest: {
		name: "Anime RPC",
		host_permissions: extractMatches(strategies),
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
});
