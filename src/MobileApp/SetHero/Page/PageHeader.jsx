import { useRef } from "react";
import clsx from "clsx";
import useStickyObserver from "@/hooks/useStickyObserver";

export default function PageHeader({ title, onClose }) {
	const navRef = useRef(null);
	const stuck = useStickyObserver(navRef.current, -50);
	const pageHasHeader = title?.length;
	const pageCanPop = typeof onClose == "function";

	if (!pageHasHeader) {
		return (
			<div
				className={clsx(
					"sticky top-0 bg-canvas/20 backdrop-blur pt-[env(safe-area-inset-top)] z-[999]"
				)}
			></div>
		);
	}

	return (
		<div
			ref={navRef}
			className={clsx("sticky w-full flex flex-col z-50", {
				"bg-card": pageHasHeader && stuck,
			})}
		>
			{pageHasHeader && (
				<div
					className={clsx(
						"w-full max-w-4xl mx-auto flex flex-col pt-8 mt-[env(safe-area-inset-top)]",
						{
							"-translate-x-1": stuck,
						}
					)}
				>
					<div className="h-16 w-full flex items-center gap-1">
						{pageCanPop && (
							<button
								type="button"
								className="flex-shrink-0 -ml-1.5 mr-2.5 rounded flex items-center justify-center size-10"
								onClick={onClose}
							>
								<svg
									className="size-6 opacity-70"
									fill="none"
									viewBox="0 0 24 24"
									strokeWidth={2}
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										d="M15.75 19.5 8.25 12l7.5-7.5"
									/>
								</svg>
							</button>
						)}

						{stuck ? (
							<div
								className={clsx(
									"text-lg font-bold flex-1 text-center",
									pageCanPop ? "pr-12" : "pl-2"
								)}
							>
								{title}
							</div>
						) : (
							<div className="px-6 text-3xl font-bold">
								{title}
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	);
}
