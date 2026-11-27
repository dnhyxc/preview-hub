/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_PLUGIN_REGISTRY_URL?: string;
}

declare module '*.tsx?raw' {
	const src: string;
	export default src;
}
