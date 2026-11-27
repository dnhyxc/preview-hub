import { iconNames, type IconName } from 'lucide-react/dynamic';
import type { PreviewKind } from '@/catalog';

const NAMES = new Set<string>(iconNames);

const BY_ID: Record<string, IconName> = {
	learningNotes: 'notebook-pen',
	routeOnlyDemo: 'route',
	remoteDocsUpdateInfo: 'refresh-cw',
	remoteDocsProjectGuide: 'book-open',
	remoteDocsPluginDevGuide: 'code',
	remoteDocsServicePolicy: 'shield',
	remoteDocsUserAgreement: 'file-text',
};

const BY_KIND: Record<PreviewKind, IconName> = {
	plugin: 'puzzle',
	docs: 'book-open',
	lab: 'flask-conical',
};

/** 注册表图标是 Lucide 名或带图标名的 SVG 地址。对不上时用 id，再退回分组图标。 */
export function cardIcon(
	icon: string | undefined,
	id: string,
	kind: PreviewKind,
): IconName {
	const name = kebab(icon);
	if (name && NAMES.has(name)) return name as IconName;
	return BY_ID[id] ?? BY_KIND[kind];
}

function kebab(icon?: string): string | undefined {
	if (!icon) return;
	const file = icon.startsWith('http')
		? decodeURIComponent(icon.split('/').pop() ?? '')
		: icon;
	const raw = file.replace(/\.svg$/i, '').split('_').pop()?.trim();
	if (!raw) return;
	return raw
		.replace(/([a-z0-9])([A-Z])/g, '$1-$2')
		.replace(/[\s_]+/g, '-')
		.toLowerCase();
}
