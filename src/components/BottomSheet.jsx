import { clsx } from "clsx";
import { Children, cloneElement, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import useKeyboard from "@/hooks/useKeyboard";

export default function BottomSheet({
	_id,
	background,
	hidden,
	open,
	noScroll = false,
	peekSize = 0,
	dismissible = true,
	fullHeight = false,
	minHeight,
	children,
	onClose = () => {},
}) {
	const { KeyboardPlaceholder } = useKeyboard();
	// const dragControls = useDragControls();
	// function onDragStart(e, info) {
	// 	// We will ignore the request to drag if it's not coming from the handle
	// 	if (!e.target.classList.contains("drag-handle")) {
	// 		// Stop the drag - `e` and `info` are needed from the library
	// 		dragControls.componentControls.forEach((entry) => {
	// 			entry.stop(e, info);
	// 		});
	// 	}
	// }

	const maxHeight = window.innerHeight;
	// fullHeight ? window.innerHeight * 0.93
	//   : Math.min(window.innerHeight * 0.93, 700);
	const [dragRatio, setDragRatio] = useState(0);
	const [_collapsed, setCollapsed] = useState(!open);
	const collapsed = _collapsed || hidden;
	const initialized = useRef(null);
	const wrapper = useRef(null);
	const fullRadius = fullHeight && !dragRatio ? 0 : 32;
	const borderRadius = dragRatio
		? fullRadius * (collapsed ? dragRatio : 1 - dragRatio)
		: !collapsed
		? fullRadius
		: 0;
	const collapsedTransform = {
		y: !collapsed
			? 0
			: !peekSize
			? "100%"
			: `calc(100% - ${peekSize}px - env(safe-area-inset-bottom) * 0.6)`,
	};
	const dragDetails = {
		// dragControls,
		// onDragStart,
		dragListener: dismissible == "auto" ? collapsed : dismissible,
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

	const dismiss = (payload) => {
		if (payload?.type == "click") payload = null;

		const resolverRef = `bottomsheet-${_id}`;

		setCollapsed(true);

		const resolve = __crotchet._promiseResolvers[resolverRef];

		if (_.isFunction(resolve)) {
			resolve(payload);
			delete __crotchet._promiseResolvers[resolverRef];
		}
	};

	useEffect(() => {
		const parent = document.querySelector("#crotchetAppWrapper");
		if (parent) {
			parent.style.overflow = collapsed ? "" : "hidden";
		}

		if (!initialized.current) {
			initialized.current = true;
			return;
		}

		if (collapsed) onClose();
	}, [collapsed]);

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
				onClick={dismiss}
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
						"md:max-w-lg mx-auto border-t border-content/5 relative pointer-events-auto focus:outline-none w-full backdrop-blur",
						!peekSize
							? "bg-canvas"
							: collapsed
							? "bg-stone-100/85 dark:bg-card/85"
							: "bg-stone-100/90 dark:bg-card/90"
					)}
					style={{
						...(["white", "black"].includes(background)
							? {
									background,
									color:
										background == "white"
											? "black"
											: "white",
									borderColor: background,
							  }
							: {}),
						minHeight: peekSize + "px",
						maxHeight: maxHeight + "px",
						overflowY:
							!fullHeight || dragRatio || collapsed || noScroll
								? "hidden"
								: "auto",
					}}
					{...((dismissible == "auto" ? collapsed : dismissible)
						? dragDetails
						: {
								initial: {
									borderTopLeftRadius: fullRadius,
									borderTopRightRadius: fullRadius,
								},
						  })}
				>
					<div
						style={{
							minHeight: fullHeight ? `${maxHeight}px` : "",
						}}
					>
						{typeof children == "function"
							? children({
									fullHeight,
									minHeight,
									maxHeight: maxHeight,
									dragRatio,
									collapsed,
									expand: () => setCollapsed(false),
									collapse: dismiss,
									dismiss: dismiss,
							  })
							: Children.map(children, (child) => {
									if (!child?.type) return null;

									return cloneElement(child, {
										fullHeight,
										minHeight,
										maxHeight: maxHeight,
										dragRatio,
										collapsed,
										expand: () => setCollapsed(false),
										collapse: dismiss,
										dismiss: dismiss,
										onClose: dismiss,
									});
							  })}

						<KeyboardPlaceholder />
					</div>
				</motion.div>
			</motion.div>
		</>
	);
}
