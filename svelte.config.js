// import adapter from '@sveltejs/adapter-auto';
import adapter from '@sveltejs/adapter-static';

import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess({script: true}),

	kit: {
		adapter: adapter({
			// default output dir for adapter-static
			pages: 'build',
			assets: 'build',
			// generate a fallback 404 for GitHub Pages SPA fallback behavior
			fallback: '404.html',
			precompress: false,
			strict: true
    	}),
		paths: {
      		base: process.argv.includes('dev') ? '' : process.env.BASE_PATH
    	},
		alias: {
			$components: 'src/lib/components',
			$scripts: 'src/lib/scripts',
			$icons: "src/assets/icons",
			$assets: "src/assets"
		}
	}
};



export default config;
