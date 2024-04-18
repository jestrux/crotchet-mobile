import { motion } from "framer-motion";
import { clsx } from "clsx";
import BottomSheet from "./BottomSheet";
import { useAppContext } from "@/providers/app";
import { useRef, useState } from "react";
import Loader from "./Loader";
import WidgetWrapper from "./WidgetWrapper";
import DesktopWidget from "@/crotchet/apps/Widgets/RemoteWidget";
import { matchSorter } from "match-sorter";
import GlobalSearch from "./GlobalSearch";
import { openUrl } from "@/utils";

const BottomNavAction = ({ action }) => {
	const [loading, setLoading] = useState(false);
	const handleClick = async () => {
		try {
			setLoading(true);
			await action.handler();
			setLoading(false);
		} catch (error) {
			setLoading(false);
			alert(`Error: ${error}`);
		}
	};

	return (
		<button
			key={action._id}
			disabled={loading}
			onClick={handleClick}
			className="w-full text-left outline:focus-none h-12 flex items-center gap-2 text-base leading-none disabled:opacity-50"
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
	const [fullHeight, setFullHeight] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const { currentPage, setCurrentPage, globalActions, openBottomSheet } =
		useAppContext();
	const navHeight = 56;

	const activeClass =
		"bg-content/5 dark:bg-content/10 border-content/5 dark:border-content/15 text-content";
	const inActiveClass = "opacity-70 border-transparent";
	let filteredActions = Object.entries(globalActions() ?? {})
		.filter(([, value]) => value.global)
		.map(([, value]) => value);

	const refocusInput = () => {
		if (!wrapperRef.current) return;

		if (searchQuery?.length) return;

		const input = wrapperRef.current.querySelector("#searchbar");
		if (input) input.focus();
	};

	if (searchQuery.length > 0) {
		filteredActions = matchSorter(filteredActions, searchQuery, {
			keys: ["label", "name", "tags"],
		});
	}

	const handleClear = () => {
		setSearchQuery("");
		const input = wrapperRef.current.querySelector("#searchbar");
		if (input) input.focus();
	};

	const handleSubmit = (e) => {
		e.preventDefault();

		const input = wrapperRef.current.querySelector("#searchbar");
		if (input) input.blur();
	};

	return (
		<div
			ref={wrapperRef}
			className="sticky bottom-0 z-50 overflow-hidden"
			style={{ height: navHeight + "px" }}
			onClick={refocusInput}
		>
			<BottomSheet peekSize={navHeight} fullHeight={fullHeight}>
				{({ collapsed, expand, dragRatio, maxHeight }) => {
					if (collapsed && !fullHeight) setFullHeight(false);
					// if (collapsed || dragRatio > 0.25) setFullHeight(false);

					return (
						<div data-ratio={dragRatio}>
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
									onClick={() =>
										openUrl("crotchet://search/heroIcons")
									}
									// onClick={() => setCurrentPage("listings")}
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
								className={clsx("relative overflow-hidden", {
									"pointer-events-none": collapsed,
								})}
								style={{
									height:
										Math.min(
											fullHeight ? maxHeight : 800,
											maxHeight
										) + "px",
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
									className="sticky top-0 z-10 px-4 backdrop-blur"
									style={{
										paddingTop:
											fullHeight && !dragRatio
												? "env(safe-area-inset-top)"
												: "",
									}}
								>
									{dragRatio || !fullHeight ? (
										<div
											className="my-4 w-full flex items-center h-12 p-5 rounded-full border border-content/5 bg-content/5 text-xl/none placeholder:text-content/30"
											onClick={() => setFullHeight(true)}
										>
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
										</div>
									) : (
										!collapsed &&
										!hidden &&
										fullHeight && (
											<form
												className="relative mb-4"
												onSubmit={handleSubmit}
											>
												<button
													type="button"
													className="absolute z-10 inset-y-0 left-0 rounded-l-full pl-2 pr-1 flex items-center justify-center"
													onClick={() =>
														setFullHeight(false)
													}
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

												<input
													id="searchbar"
													autoFocus
													type="text"
													className={clsx(
														"w-full h-12 rounded-full border border-content/5 bg-content/5 text-xl/none placeholder:text-content/30 focus:outline-none",
														fullHeight
															? "px-10"
															: "px-5"
													)}
													placeholder="Type to search..."
													value={searchQuery}
													onChange={(e) =>
														setSearchQuery(
															e.target.value
														)
													}
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
											</form>
										)
									)}
								</div>

								<div className="px-5 pb-5 h-full overflow-auto">
									{filteredActions.length > 0 && (
										<>
											<h3 className="mb-1 text-content/50">
												Quick Actions
											</h3>

											{filteredActions.map((action) => (
												<BottomNavAction
													key={action._id}
													action={action}
												/>
											))}
										</>
									)}

									{searchQuery.length > 0 &&
										filteredActions.length <= 2 && (
											<div
												className={clsx("-mx-5", {
													"border-t border-content/5 pt-4 mt-4":
														filteredActions.length,
												})}
											>
												<GlobalSearch
													searchQuery={searchQuery}
												/>
											</div>
										)}
								</div>
							</motion.div>
						</div>
					);
				}}
			</BottomSheet>
		</div>
	);
}
