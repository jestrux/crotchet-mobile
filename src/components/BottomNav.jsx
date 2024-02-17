"use client";

import { motion } from "framer-motion";
import { clsx } from "clsx";
import { BottomSheet } from "./BottomSheet";
import { useAppContext } from "@/providers/app";
import { useRef, useState } from "react";
import Loader from "./Loader";

const BottomNavAction = ({ action }) => {
	const [loading, setLoading] = useState(false);
	const handleClick = async () => {
		setLoading(true);
		await action.handler();
		setLoading(false);
	};

	return (
		<button
			key={action._id}
			onClick={handleClick}
			className="w-full text-left outline:focus-none h-12 flex items-center gap-2 text-base leading-none"
		>
			{
				<div className="w-5 flex-shrink-0">
					<svg
						className="mt-0.5 w-4 h-4 opacity-80"
						fill="none"
						viewBox="0 0 24 24"
						strokeWidth={1.5}
						stroke="currentColor"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
						/>
					</svg>
				</div>
			}
			<div className="flex-1">{action.label}</div>

			{loading && <Loader className="opacity-50" size={25} />}
		</button>
	);
};

export function BottomNav({ hidden }) {
	const wrapperRef = useRef(null);
	const { currentPage, setCurrentPage, actions } = useAppContext();
	const navHeight = 56;

	const activeClass =
		"bg-content/5 dark:bg-content/10 border-content/5 dark:border-content/15 text-content";
	const inActiveClass = "opacity-70 border-transparent";

	const refocusInput = () => {
		if (!wrapperRef.current) return;

		console.log("Handle click...");
		const input = wrapperRef.current.querySelector("#searchbar");
		if (input) input.focus();
	};

	return (
		<div
			ref={wrapperRef}
			className="sticky bottom-0 z-50"
			style={{ height: navHeight + "px" }}
			onClick={refocusInput}
		>
			<BottomSheet hidden={hidden} peekSize={navHeight}>
				{({ collapsed, expand, dragRatio, maxHeight }) => (
					<div>
						<motion.div
							className={clsx(
								"px-8 absolute top-0 inset-x-0 flex items-center justify-between gap-4",
								{
									"pointer-events-none":
										!collapsed || dragRatio,
								}
							)}
							animate={
								dragRatio
									? {
											opacity: 0,
									  }
									: {
											opacity: collapsed ? 1 : 0,
									  }
							}
							transition={
								dragRatio
									? {}
									: {
											duration: collapsed ? 0.3 : 0,
											delay: collapsed ? 0.1 : 0,
									  }
							}
							style={{
								height: navHeight + "px",
							}}
						>
							<button
								className={clsx(
									"flex-shrink-0 focus:outline-none rounded-full border inline-flex items-center justify-center h-9 w-16 px-2.5 text-center text-xs uppercase font-bold",
									currentPage == "widgets"
										? activeClass
										: inActiveClass
								)}
								onClick={() => setCurrentPage("widgets")}
							>
								<svg
									className="h-6"
									fill="none"
									viewBox="0 0 24 24"
									strokeWidth={1.5}
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z"
									/>
								</svg>
							</button>

							<button
								className={clsx(
									"flex-shrink-0 focus:outline-none rounded-full border inline-flex items-center justify-center h-9 w-16 px-2.5 text-center text-xs uppercase font-bold",
									currentPage == "home"
										? activeClass
										: inActiveClass
								)}
								onClick={() =>
									currentPage == "home"
										? expand()
										: setCurrentPage("home")
								}
							>
								<svg
									fill="none"
									viewBox="0 0 24 24"
									strokeWidth={1.8}
									stroke="currentColor"
									className="h-5"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										d="M4.098 19.902a3.75 3.75 0 0 0 5.304 0l6.401-6.402M6.75 21A3.75 3.75 0 0 1 3 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 0 0 3.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008Z"
									/>
								</svg>
							</button>

							<button
								className={clsx(
									"flex-shrink-0 focus:outline-none rounded-full border inline-flex items-center justify-center h-9 w-16 px-2.5 text-center text-xs uppercase font-bold",
									currentPage == "settings"
										? activeClass
										: inActiveClass
								)}
								onClick={() => setCurrentPage("settings")}
							>
								<svg
									className="h-6"
									fill="none"
									viewBox="0 0 24 24"
									strokeWidth={1.5}
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75"
									/>
								</svg>
							</button>
						</motion.div>

						<motion.div
							className={clsx("relative ", {
								"pointer-events-none": collapsed,
							})}
							style={{
								height: Math.min(800, maxHeight) + "px",
								overflow: "auto",
							}}
							animate={{
								opacity: !collapsed
									? dragRatio || 1
									: dragRatio || 0,
							}}
							transition={
								dragRatio
									? {}
									: {
											duration: !collapsed ? 0.3 : 0,
											delay: !collapsed ? 0.1 : 0,
									  }
							}
						>
							<div className="pt-5 px-4 sticky top-0 z-10 backdrop-blur">
								{dragRatio ? (
									<div className="w-full flex items-center h-12 px-5 rounded-full border border-content/5 bg-content/5 text-xl/none placeholder:text-content/30">
										<span className="text-content/30">
											Type to search...
										</span>
									</div>
								) : (
									!collapsed && (
										<input
											id="searchbar"
											autoFocus
											type="search"
											className="w-full h-12 px-5 rounded-full border border-content/5 bg-content/5 text-xl/none placeholder:text-content/30 focus:outline-none"
											placeholder="Type to search..."
										/>
									)
								)}
							</div>

							<div className="p-5">
								<h3 className="mb-1 text-content/50">
									Quick Actions
								</h3>

								{Object.entries(actions ?? {}).map(
									([, action]) => (
										<BottomNavAction
											key={action._id}
											action={action}
										/>
									)
								)}
							</div>
						</motion.div>
					</div>
				)}
			</BottomSheet>
		</div>
	);
}
