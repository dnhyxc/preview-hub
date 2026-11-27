import type { CatalogItem, PreviewKind } from '@/catalog';

export type RegistryMode = 'dev' | 'prod';

export type RegistryRow = {
	id: string;
	title?: { 'zh-CN'?: string; 'en-US'?: string };
	routePath?: string;
	entry?: string;
	injectRoute?: boolean;
	host?: { icon?: string } | unknown;
	menu?: { icon?: string };
	remoteName?: string;
	enabled?: boolean;
};

/** 开发服走同源代理；生产构建直接请求线上注册表。 */
export function registryMode(): RegistryMode {
	return import.meta.env.PROD ? 'prod' : 'dev';
}

export function registryUrl(): string {
	if (import.meta.env.DEV) return '/registry';
	return (
		import.meta.env.VITE_PLUGIN_REGISTRY_URL ||
		'https://dnhyxc.cn:9002/remotes/plugins-registry.json'
	);
}

export function previewKind(row: {
	host?: unknown;
	injectRoute?: boolean;
	remoteName?: string;
	id: string;
}): PreviewKind {
	if (row.host || row.injectRoute === false) return 'plugin';
	if (row.remoteName === 'remoteDocs' || row.id.startsWith('remoteDocs')) return 'docs';
	return 'lab';
}

export async function loadRegistry(mode: RegistryMode): Promise<RegistryRow[]> {
	const res = await fetch(registryUrl());
	if (!res.ok) throw new Error(`注册表请求失败 ${res.status}`);
	const data = (await res.json()) as { plugins?: RegistryRow[] };
	if (!Array.isArray(data.plugins)) throw new Error('registry.plugins missing');
	return data.plugins;
}

function rowIcon(row: RegistryRow): string | undefined {
	const menu = row.menu?.icon?.trim();
	if (menu) return menu;
	const host = row.host;
	if (!host || typeof host !== 'object' || !('icon' in host)) return;
	const icon = host.icon;
	return typeof icon === 'string' && icon.trim() ? icon.trim() : undefined;
}

export function mockPaths(routesText: string): Set<string> {
	const found = routesText.matchAll(/path:\s+'([^']+)'/g);
	const paths = new Set<string>();
	for (const hit of found) {
		paths.add(hit[1].replace(/^\//, ''));
	}
	return paths;
}

export async function loadMockPaths(): Promise<Set<string>> {
	const mod = await import('../../dnhyxc-ai-plugins/src/router/routes.tsx?raw');
	return mockPaths(mod.default);
}

export function toItems(
	plugins: RegistryRow[],
	mode: RegistryMode,
	mockPathSet: Set<string>,
): CatalogItem[] {
	const items: CatalogItem[] = [];
	for (const row of plugins) {
		if (!row.id || !row.entry || !row.routePath) continue;
		const origin = new URL(row.entry).origin;
		const path = row.routePath.startsWith('/') ? row.routePath : `/${row.routePath}`;
		const checkLocalPlugin =
			mode === 'dev' &&
			/^(localhost|127\.0\.0\.1):9008$/.test(new URL(row.entry).host);
		const ready = !checkLocalPlugin || mockPathSet.has(path.replace(/^\//, ''));
		items.push({
			id: row.id,
			kind: previewKind(row),
			title: row.title?.['zh-CN'] || row.title?.['en-US'] || row.id,
			origin,
			path,
			ready,
			icon: rowIcon(row),
		});
	}
	return items;
}
