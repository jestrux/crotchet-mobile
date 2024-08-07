import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react()],
	base: "",
	server: {
		port: 5178,
	},
	build: {
		rollupOptions: {
			maxParallelFileOps: 50,
		},
		outDir: "./docs",
		commonjsOptions: { include: [] },
	},
	optimizeDeps: {
		disabled: false,
	},
	resolve: {
		alias: {
			"@": path.resolve(
				path.dirname(fileURLToPath(import.meta.url)),
				"src"
			),
		},
	},
});
