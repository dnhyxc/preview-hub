export type PreviewKind = 'plugin' | 'docs' | 'lab';

export type CatalogItem = {
	id: string;
	kind: PreviewKind;
	title: string;
	origin: string;
	path: string;
	ready: boolean;
	icon?: string;
};

export const KIND_LABEL: Record<PreviewKind, string> = {
	plugin: '插件',
	docs: '文档',
	lab: '实验室',
};

export function hrefOf(item: Pick<CatalogItem, 'origin' | 'path'>): string {
	const origin = item.origin.replace(/\/$/, '');
	const path = item.path.startsWith('/') ? item.path : `/${item.path}`;
	return `${origin}${path}`;
}

export function devHint(origin: string): string {
	let url: URL;
	try {
		url = new URL(origin);
	} catch {
		return `未启动。${origin}`;
	}
	if (url.hostname === 'dnhyxc.cn') return '线上未响应';
	return `未启动。${origin}`;
}
