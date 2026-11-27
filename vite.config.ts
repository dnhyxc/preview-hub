import path from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv, type ProxyOptions } from 'vite';

const host = '127.0.0.1';
const port = 9021;

function registryProxy(raw: string | undefined, fallback: string): ProxyOptions {
	const url = new URL(raw?.trim() || fallback);
	return {
		target: url.origin,
		changeOrigin: true,
		secure: url.protocol === 'https:',
		rewrite: () => `${url.pathname}${url.search}`,
	};
}

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, __dirname, '');
	return {
		plugins: [react(), tailwindcss()],
		resolve: {
			alias: {
				'@': path.resolve(__dirname, 'src'),
			},
		},
		server: {
			host,
			port,
			strictPort: true,
			fs: {
				allow: [path.resolve(__dirname, '..')],
			},
			proxy: {
				'/registry': registryProxy(
					env.DEV_PLUGIN_REGISTRY_URL,
					'http://localhost:9002/remotes/plugins-registry.json',
				),
			},
		},
		preview: {
			host,
			port,
			strictPort: true,
		},
	};
});
