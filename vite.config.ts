import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

const target = 'es2023';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	build: {
		target
	},
	esbuild: {
		target
	},
	optimizeDeps: {
		esbuildOptions: {
			target
		}
	}
});
