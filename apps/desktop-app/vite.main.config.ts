import { defineConfig } from "vite";

// https://vitejs.dev/config
export default defineConfig({
	resolve: {
		mainFields: ["module", "jsnext:main", "jsnext"],
	},
	build: {
		rollupOptions: {
			external: ["bufferutil", "utf-8-validate"],
		},
	},
});
