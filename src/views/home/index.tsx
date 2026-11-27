import {
	ArrowUpRight,
	BookOpen,
	Circle,
	FlaskConical,
	Blocks,
	type LucideIcon,
	Puzzle,
} from 'lucide-react';
import { DynamicIcon } from 'lucide-react/dynamic';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
	type CatalogItem,
	type PreviewKind,
	devHint,
	hrefOf,
	KIND_LABEL,
} from '@/catalog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cardIcon } from '@/icons';
import { cn } from '@/lib/utils';
import { loadMockPaths, loadRegistry, registryMode, toItems } from '@/registry';

const GROUPS: PreviewKind[] = ['plugin', 'docs', 'lab'];

const KIND_ICON: Record<PreviewKind, LucideIcon> = {
	plugin: Puzzle,
	docs: BookOpen,
	lab: FlaskConical,
};

const mode = registryMode();

export function Home() {
	const [items, setItems] = useState<CatalogItem[]>([]);
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);
	const [up, setUp] = useState<Record<string, boolean>>({});
	const [filter, setFilter] = useState<PreviewKind | 'all'>('all');
	const lastOk = useRef<CatalogItem[] | null>(null);

	useEffect(() => {
		let cancel = false;
		setError(null);
		setLoading(true);
		setItems(lastOk.current ?? []);
		(async () => {
			try {
				const plugins = await loadRegistry(mode);
				const mock = mode === 'dev' ? await loadMockPaths() : new Set<string>();
				const next = toItems(plugins, mode, mock);
				if (cancel) return;
				lastOk.current = next;
				setItems(next);
				setError(null);
			} catch (e) {
				if (cancel) return;
				setError(e instanceof Error ? e.message : String(e));
				setItems(lastOk.current ?? []);
			} finally {
				if (!cancel) setLoading(false);
			}
		})();
		return () => {
			cancel = true;
		};
	}, []);

	useEffect(() => {
		const origins = [...new Set(items.map((item) => item.origin))];
		let cancel = false;
		setUp({});
		for (const origin of origins) {
			fetch(`${origin.replace(/\/$/, '')}/`, { mode: 'no-cors' })
				.then(() => {
					if (!cancel) setUp((prev) => ({ ...prev, [origin]: true }));
				})
				.catch(() => {
					if (!cancel) setUp((prev) => ({ ...prev, [origin]: false }));
				});
		}
		return () => {
			cancel = true;
		};
	}, [items]);

	const onlineCount = useMemo(
		() => items.filter((item) => up[item.origin] === true).length,
		[items, up],
	);
	const probing = useMemo(
		() => items.some((item) => up[item.origin] === undefined),
		[items, up],
	);
	const visibleKinds = filter === 'all' ? GROUPS : [filter];

	const status = error
		? error
		: loading && items.length === 0
			? '正在读取注册表'
			: probing
				? '正在检测端口'
				: `${onlineCount} / ${items.length} 在线`;

	return (
		<div className="relative flex h-full min-h-0 w-full flex-col bg-[#090b0e] font-sans text-[#f4f7f6] [background-image:radial-gradient(880px_420px_at_8%_-8%,rgba(45,212,191,0.16),transparent_62%),radial-gradient(640px_360px_at_100%_0%,rgba(125,211,252,0.08),transparent_58%)]">
			<header className="z-10 flex w-full max-w-5xl items-center justify-between self-center px-7 pt-[22px] mb-2">
				<div className="flex items-center gap-2.5 font-semibold tracking-tight">
					<span className="grid size-7 place-items-center rounded-lg bg-teal-400 text-teal-950">
						<Blocks className="size-4" aria-hidden />
					</span>
					<span>Preview Hub</span>
				</div>
				<div className="flex min-w-0 items-center gap-3.5">
					<p
						className={cn(
							'flex items-center gap-2 font-mono text-xs text-[#8b9794]',
							error && 'text-amber-400',
						)}
					>
						{error ? null : (
							<Circle
								className={cn(
									'size-1.5 fill-teal-400 text-teal-400',
									(probing || loading) && 'animate-pulse',
								)}
								aria-hidden
							/>
						)}
						{status}
					</p>
				</div>
			</header>

			<ScrollArea className="z-10 min-h-0 flex-1">
				<main className="mx-auto w-full max-w-5xl px-7 pt-14 pb-20">
					<p className="font-mono text-xs tracking-[0.18em] text-teal-400 uppercase">
						micro-apps
					</p>
					<h1 className="mt-2.5 text-4xl leading-[0.95] font-semibold tracking-[-0.045em]">
						预览门户
					</h1>
					<p className="mt-4 max-w-5xl text-base leading-relaxed text-[#8b9794]">
						本机打开读取本地注册表，线上站点读取线上注册表。卡片打开对应源站。不登录，不加载模块联邦。
					</p>

					<div className="mt-7 flex flex-wrap gap-2" role="tablist" aria-label="分组">
						<Filter
							active={filter === 'all'}
							label="全部"
							count={items.length}
							onClick={() => setFilter('all')}
						/>
						{GROUPS.map((kind) => (
							<Filter
								key={kind}
								active={filter === kind}
								label={KIND_LABEL[kind]}
								count={items.filter((item) => item.kind === kind).length}
								onClick={() => setFilter(kind)}
							/>
						))}
					</div>

					{visibleKinds.map((kind) => {
						const group = items.filter((item) => item.kind === kind);
						if (group.length === 0) return null;
						const Icon = KIND_ICON[kind];
						return (
							<section key={kind}>
								<div className="mt-9 mb-3.5 flex items-center gap-2.5">
									<Icon className="size-3.5 text-[#8b9794]" aria-hidden />
									<h2 className="text-[13px] font-medium tracking-[0.14em] text-[#8b9794] uppercase">
										{KIND_LABEL[kind]}
									</h2>
									<span className="font-mono text-xs text-[#5f6b68]">
										{group.length}
									</span>
								</div>
								<ul className="m-0 grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2 xl:grid-cols-3">
									{group.map((item, index) => (
										<li
											key={item.id}
											className="h-full animate-[rise_0.45s_ease_both] motion-reduce:animate-none"
											style={{ animationDelay: `${index * 40}ms` }}
										>
											<Card item={item} online={up[item.origin] !== false} />
										</li>
									))}
								</ul>
							</section>
						);
					})}
				</main>
			</ScrollArea>
		</div>
	);
}

function Filter({
	active,
	label,
	count,
	onClick,
}: {
	active: boolean;
	label: string;
	count: number;
	onClick: () => void;
}) {
	return (
		<button
			type="button"
			role="tab"
			aria-selected={active}
			className={cn(
				'inline-flex cursor-pointer items-center gap-2 rounded-full border px-3 py-[7px] font-sans text-sm',
				active
					? 'border-transparent bg-[#f4f7f6] text-[#111]'
					: 'border-white/8 bg-transparent text-[#8b9794]',
			)}
			onClick={onClick}
		>
			{label}
			<span className="font-mono text-[11px]">{count}</span>
		</button>
	);
}

function Card({ item, online }: { item: CatalogItem; online: boolean }) {
	const href = hrefOf(item);
	const path = new URL(href).pathname;
	const live = item.ready && online;
	const note = item.ready
		? online
			? item.origin
			: devHint(item.origin)
		: '插件仓没有这条预览路由';
	const body = (
		<>
			<span className="flex items-center gap-3">
				<span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-teal-900 text-teal-200">
					<DynamicIcon
						name={cardIcon(item.icon, item.id, item.kind)}
						className="size-5"
						fallback={() => <span className="size-5" />}
					/>
				</span>
				<strong className="min-w-0 flex-1 truncate text-base font-medium tracking-tight">
					{item.title}
				</strong>
				<span
					className={cn(
						'inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-1 font-mono text-[11px]',
						online
							? 'bg-teal-400/10 text-teal-300'
							: 'bg-amber-400/10 text-amber-300',
					)}
				>
					<Circle className="size-1.5 fill-current" aria-hidden />
					{online ? '在线' : '离线'}
				</span>
				<span
					className={cn(
						'grid size-7 shrink-0 place-items-center rounded-full bg-white/5 text-white/45 transition duration-200',
						live && 'group-hover:bg-teal-400 group-hover:text-teal-950',
					)}
				>
					<ArrowUpRight className="size-3.5" aria-hidden />
				</span>
			</span>
			<code className="mt-3 block truncate rounded-lg bg-black/25 px-2.5 py-1.5 font-mono text-[11px] text-white/50">
				{path === '/' ? href : path}
			</code>
			<span
				className={cn(
					'mt-3 block truncate border-t border-white/5 pt-3 font-mono text-[11px] leading-relaxed',
					live ? 'text-white/45' : 'text-amber-300/90',
				)}
			>
				{note}
			</span>
		</>
	);
	const className = cn(
		'group flex h-full flex-col rounded-2xl border border-white/10 bg-white/4 p-4 text-inherit no-underline shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition duration-200 motion-reduce:transition-none',
		live && 'hover:-translate-y-0.5 hover:border-teal-300/40 hover:bg-white/6',
		!live && 'opacity-75',
	);
	if (!live) return <span className={className}>{body}</span>;
	return (
		<a className={className} href={href} target="_blank" rel="noreferrer">
			{body}
		</a>
	);
}
