import adapter from '@sveltejs/adapter-static';
import preprocess from 'svelte-preprocess';

const isDevelopment = (process.env.MODE = process.env.MODE || 'development') === 'development';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	compilerOptions: {
		dev: isDevelopment
	},

	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: preprocess({
		sourceMap: isDevelopment,
		replace: [[/process\.env\.isDevelopment/g, isDevelopment]]
	}),

	kit: {
		adapter: adapter()
	}
};

export default config;
