import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area';
import { forwardRef, type ComponentProps } from 'react';
import { cn } from '@/lib/utils';

type Props = ComponentProps<typeof ScrollAreaPrimitive.Root> & {
	viewportClassName?: string;
};

export const ScrollArea = forwardRef<HTMLDivElement, Props>(
	function ScrollArea(
		{ className, viewportClassName, children, ...props },
		ref,
	) {
		return (
			<ScrollAreaPrimitive.Root
				className={cn('relative h-full overflow-hidden', className)}
				{...props}
				type="always"
			>
				<ScrollAreaPrimitive.Viewport
					ref={ref}
					className={cn(
						'size-full [&>div]:w-full!',
						viewportClassName,
					)}
				>
					{children}
				</ScrollAreaPrimitive.Viewport>
				<ScrollAreaPrimitive.ScrollAreaScrollbar
					orientation="vertical"
					className="flex h-full w-2 touch-none border-l border-l-transparent pr-px select-none"
				>
					<ScrollAreaPrimitive.ScrollAreaThumb className="relative flex-1 rounded-full bg-[oklch(1_0_0/10%)]" />
				</ScrollAreaPrimitive.ScrollAreaScrollbar>
				<ScrollAreaPrimitive.Corner />
			</ScrollAreaPrimitive.Root>
		);
	},
);
