"use client";

import { clsx } from "clsx";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Keyboard } from "@capacitor/keyboard";

export function BottomSheet({ peekSize = 0, children }) {
	const maxHeight = Math.min(window.innerHeight * 0.9, 700);
	const [dragRatio, setDragRatio] = useState(0);
	const [collapsed, setCollapsed] = useState(true);
	const wrapper = useRef(null);
	const borderRadius = dragRatio
		? 32 * (collapsed ? dragRatio : 1 - dragRatio)
		: !collapsed
		? 32
		: 0;
	const collapsedTransform = {
		y: !collapsed
			? 0
			: !peekSize
			? "100%"
			: `calc(100% - ${peekSize}px - env(safe-area-inset-bottom) * 0.6)`,
	};
	const dragDetails = {
		drag: "y",
		dragConstraints: wrapper,
		dragElastic: {
			top: collapsed ? 0.5 : false,
			bottom: !collapsed ? 0.5 : 0.1,
		},
		dragTransition: {
			bounceDamping: 10000,
			bounceStiffness: 10000,
		},
		onDrag: (_, info) => {
			const draggingUp = collapsed && info.offset.y < 0;
			const draggingDown = !collapsed && info.offset.y > 0;
			const dragging = draggingUp || draggingDown;
			const percentage = Math.min(
				0.96,
				Math.abs(info.offset.y) / maxHeight
			);

			setDragRatio(!dragging ? 0 : percentage);
		},
		onDragEnd: (_, info) => {
			setDragRatio(0);

			if (collapsed && info.offset.y < -90) setCollapsed(false);
			if (!collapsed && info.offset.y > 90) setCollapsed(true);
		},
		animate: {
			borderTopLeftRadius: borderRadius,
			borderTopRightRadius: borderRadius,
		},
		transition: {
			borderTopLeftRadius: { bounce: 0 },
			borderTopRightRadius: { bounce: 0 },
		},
	};

	useEffect(() => {
		try {
			Keyboard.setAccessoryBarVisible({
				isVisible: false,
			});
			Keyboard.setResizeMode({
				mode: "none",
			});
		} catch (error) {
			//
		}
	}, []);

	return (
		<>
			<motion.div
				className={clsx(
					"fixed inset-0 bg-black/20 dark:bg-black/80 z-50",
					collapsed ? "pointer-events-none" : "pointer-events-auto"
				)}
				style={{
					// opacity: dragRatio ? dragRatio : collapsed ? 0 : 1,
					opacity: dragRatio
						? collapsed
							? dragRatio
							: 1 - dragRatio
						: collapsed
						? 0
						: 1,
				}}
				onClick={() => setCollapsed(true)}
			/>

			<motion.div
				ref={wrapper}
				className="fixed inset-x-0 bottom-0 flex items-end z-50 pointer-events-none"
				animate={collapsedTransform}
				initial={collapsedTransform}
				transition={{
					y: {
						bounce: 0.5,
						duration: 0.1,
					},
				}}
			>
				<motion.div
					className={clsx(
						"relative pointer-events-auto focus:outline-none w-full backdrop-blur",
						collapsed
							? "bg-stone-100/85 dark:bg-card/85"
							: "bg-stone-100/90 dark:bg-card/90"
					)}
					style={{
						minHeight: peekSize + "px",
						maxHeight: maxHeight + "px",
					}}
					{...dragDetails}
				>
					{typeof children == "function"
						? children({
								dragRatio,
								collapsed,
								expand: () => setCollapsed(false),
								collapse: () => setCollapsed(true),
						  })
						: children}
				</motion.div>
			</motion.div>
		</>
	);
}
