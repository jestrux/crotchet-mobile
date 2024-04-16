import { motion } from "framer-motion";
import { clsx } from "clsx";
import BottomSheet from "./BottomSheet";
import { useAppContext } from "@/providers/app";
import { useRef, useState } from "react";
import { Input } from "@/crotchet";
import GlobalSearch from "./GlobalSearch";

export const BottomNavButton = ({ page, selected, onClick }) => {
	const { apps } = useAppContext();
	const icon = apps?.[page]?.icon;
	const activeIcon = apps?.[page]?.activeIcon || icon;
	const activeClass =
		"bg-content/5 dark:bg-content/10 border-content/5 dark:border-content/15 text-content";
	const inActiveClass = "opacity-70 border-transparent";
	const handleClick = () => {
		if (typeof onClick == "function") onClick();
	};

	return (
		<button
			className={clsx(
				"flex-shrink-0 focus:outline-none rounded-full border inline-flex items-center justify-center h-9 w-16 px-2.5 text-center text-xs uppercase font-bold",
				selected ? activeClass : inActiveClass
			)}
			onClick={handleClick}
		>
			<span className={clsx("size-5", !selected && "opacity-70")}>
				{selected ? activeIcon : icon}
			</span>
		</button>
	);
};

export function BottomNav({ hidden, pinnedApps, currentPage, setCurrentPage }) {
	const [autoFocus, setAutoFocus] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const wrapperRef = useRef(null);
	const navHeight = 56;

	const input = () => {
		return wrapperRef.current.querySelector("input");
	};

	const handleClear = () => {
		setSearchQuery("");
		input()?.focus();
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		input()?.blur();
		// if (query?.length && query != searchQuery) setSearchQuery(query);
		// searchbar.current.blur();
	};

	return (
		<div ref={wrapperRef}>
			<BottomSheet
				hidden={hidden}
				peekSize={pinnedApps?.length ? navHeight : 0}
				fullHeight
				dismissible={!searchQuery?.length}
			>
				{({ collapse, collapsed, expand, dragRatio }) => {
					if(collapsed && autoFocus) setAutoFocus(false);

					return (
						<div style={{ minHeight: navHeight + "px" }}>
							<motion.div
								className={clsx("px-8 fixed inset-x-0", {
									"pointer-events-none":
										!collapsed || dragRatio,
								})}
								animate={
									dragRatio
										? {
												opacity: 0,
												y: "30%",
										  }
										: {
												opacity: collapsed ? 1 : 0,
												y: collapsed ? 0 : "20%",
										  }
								}
								transition={
									dragRatio
										? {
												duration: collapsed ? 0.6 : 0,
										  }
										: {
												duration: collapsed ? 0.3 : 0,
												delay: collapsed ? 0.1 : 0,
										  }
								}
								style={{
									paddingBottom:
										"env(safe-area-inset-bottom)",
								}}
							>
								<div
									className="flex items-center justify-between gap-4"
									style={{
										height: navHeight + "px",
									}}
								>
									{(pinnedApps || ["", "home", ""]).map(
										(page, index) => (
											<BottomNavButton
												key={page + index}
												page={page}
												selected={currentPage == page}
												onClick={() => {
													if (currentPage != page)
														setCurrentPage(page);
													else if (page == "home") {
														setAutoFocus(true);
														expand();
													}
												}}
											/>
										)
									)}
								</div>
							</motion.div>

							<motion.div
								className={clsx("relative", {
									"pointer-events-none": collapsed,
								})}
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
								<div
									className="px-4 pb-4 sticky top-0 z-10"
									style={{
										paddingTop:
											!collapsed && !dragRatio
												? "env(safe-area-inset-top)"
												: "1rem",
									}}
								>
									<form
										className="relative w-full flex items-center h-12 pl-10 pr-5 rounded-full border border-content/5 bg-content/5 text-xl/none placeholder:text-content/30"
										onSubmit={handleSubmit}
									>
										<button
											type="button"
											className="absolute z-10 inset-y-0 left-0 rounded-l-full pl-2 pr-1 flex items-center justify-center"
											onClick={() => {
												setSearchQuery("");
												collapse();
											}}
										>
											<svg
												className="w-6 opacity-40"
												fill="none"
												viewBox="0 0 24 24"
												strokeWidth="2"
												stroke="currentColor"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													d="M15.75 19.5 8.25 12l7.5-7.5"
												/>
											</svg>
										</button>

										{dragRatio ? (
											<span
												className={clsx(
													!searchQuery?.length
														? "text-content/30"
														: ""
												)}
											>
												{searchQuery?.length > 0
													? searchQuery
													: "Type to search..."}
											</span>
										) : (
											!collapsed &&
											!hidden && (
												<>
													<Input
														id="searchbar"
														autoFocus={autoFocus}
														type="text"
														className="w-full h-full bg-transparent text-xl/none placeholder:text-content/30 focus:outline-none"
														placeholder="Type to search..."
														value={searchQuery}
														onChange={
															setSearchQuery
														}
														onEnter={handleSubmit}
													/>

													<button
														type="button"
														className={clsx(
															"absolute top-0 bottom-0 my-auto right-1.5 w-8 h-8 flex items-center justify-center rounded-full",
															{
																"opacity-0":
																	!searchQuery,
															}
														)}
														onClick={handleClear}
													>
														<svg
															className="w-4"
															fill="none"
															viewBox="0 0 24 24"
															strokeWidth="1.5"
															stroke="currentColor"
														>
															<path
																strokeLinecap="round"
																strokeLinejoin="round"
																d="M6 18 18 6M6 6l12 12"
															/>
														</svg>
													</button>
												</>
											)
										)}
									</form>
								</div>

								<GlobalSearch
									searchQuery={searchQuery}
									onClose={collapse}
								/>
							</motion.div>
						</div>
					);
				}}
			</BottomSheet>
		</div>
	);
}
