import { motion } from "framer-motion";
import { clsx } from "clsx";
import BottomSheet from "./BottomSheet";
import { useAppContext } from "@/providers/app";
import { useRef, useState } from "react";
import WidgetWrapper from "./WidgetWrapper";
import DesktopWidget from "@/crotchet/apps/Widgets/DesktopWidget";
import GlobalSearch from "./GlobalSearch";
import useKeyboard from "@/hooks/useKeyboard";

export function BottomNav({ hidden }) {
	const { keyboardHeight } = useKeyboard();
	const [searchQuery, setSearchQuery] = useState("");
	const wrapperRef = useRef(null);
	const { currentPage, setCurrentPage, openBottomSheet } = useAppContext();
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

	const activeClass =
		"bg-content/5 dark:bg-content/10 border-content/5 dark:border-content/15 text-content";
	const inActiveClass = "opacity-70 border-transparent";

	return (
		<div
			ref={wrapperRef}
			className="sticky bottom-0 z-50 overflow-hidden"
			style={{ height: navHeight + "px" }}
		>
			<BottomSheet peekSize={navHeight} fullHeight>
				{({
					collapse,
					collapsed,
					expand,
					dragRatio,
					// keyboardHeight = 0,
				}) => {
					// if (collapsed && searchQuery?.length) setSearchQuery("");

					return (
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
										currentPage == "listings"
											? activeClass
											: inActiveClass
									)}
									onClick={() => setCurrentPage("listings")}
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
										{/* <path
											strokeLinecap="round"
											strokeLinejoin="round"
											d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
										/> */}
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
											d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
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
									// onClick={() => setCurrentPage("settings")}
									onClick={() =>
										openBottomSheet({
											// title: "Control Desktop",
											// ...props,
											// image,
											// fullHeight,
											// dismissible: !fullHeight,
											content: (
												<div className="pb-8 px-3 pt-4">
													<WidgetWrapper
														widget={DesktopWidget}
													/>
												</div>
											),
										})
									}
								>
									<svg
										className="h-6"
										fill="none"
										viewBox="0 0 24 24"
										strokeWidth={1.5}
										stroke="currentColor"
									>
										{/* <path
											strokeLinecap="round"
											strokeLinejoin="round"
											d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75"
										/> */}
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											d="m6.75 7.5 3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0 0 21 18V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v12a2.25 2.25 0 0 0 2.25 2.25Z"
										/>
									</svg>
								</button>
							</motion.div>

							<motion.div
								className={clsx("relative", {
									"pointer-events-none": collapsed,
								})}
								style={{
									// height: Math.min(800, maxHeight) + "px",
									height: "100vh",
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
								<div
									className="px-4 pb-4 sticky top-0 z-10"
									style={{
										marginTop:
											!collapsed && !dragRatio
												? "env(safe-area-inset-top)"
												: "1rem",
										// marginTop: !collapsed
										// 	? "env(safe-area-inset-top)"
										// 	: "",
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
													<input
														id="searchbar"
														autoFocus
														type="text"
														className="w-full h-full bg-transparent text-xl/none placeholder:text-content/30 focus:outline-none"
														placeholder="Type to search..."
														value={searchQuery}
														onChange={(e) => {
															setSearchQuery(
																e.target.value
															);
														}}
														// onFocus={(e) => {
														// 	const input =
														// 		e.target;
														// 	if (
														// 		input.value
														// 			.length > 0
														// 	)
														// 		input.select();
														// }}
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

								<div className="h-full overflow-y-auto">
									<GlobalSearch searchQuery={searchQuery} />

									<div
										className="h-16"
										style={{
											height: `${64 + keyboardHeight}px`,
											marginTop:
												"env(safe-area-inset-top)",
											marginBottom:
												"env(safe-area-inset-bottom)",
										}}
									>
										&nbsp;
									</div>
								</div>
								{/* <div className="px-5 pb-5">
									<h3 className="mb-1 text-content/50">
										Quick Actions
									</h3>
	
									{globalActions().map((action) => (
										<BottomNavAction
											key={action._id}
											action={action}
										/>
									))}
								</div> */}
							</motion.div>
						</div>
					);
				}}
			</BottomSheet>
		</div>
	);
}
