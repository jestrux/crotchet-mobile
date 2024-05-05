import { motion } from "framer-motion";
import { clsx } from "clsx";
import BottomSheet from "./BottomSheet";
import { useRef, openUrl, ActionGrid, useAppContext } from "@/crotchet";
import MutliGestureButton from "./MutliGestureButton";
import ActionButton from "./ActionButton";
import { useState } from "react";

function ActionCenter({ onClose = () => {} }) {
	const {
		globalActions,
		queryDb,
		automationActions: allAutomationActions,
		actions,
	} = useAppContext();

	let filteredActions = globalActions();

	const automationActions = Object.values(allAutomationActions).reduce(
		(agg, action) => {
			if (!action.global) return agg;

			return [
				...agg,
				{
					...action,
					handler: () =>
						openUrl(
							`crotchet://app/automate?action=${action.name}`
						),
				},
			];
		},
		[]
	);

	return (
		<div className="space-y-6 pt-2 px-5">
			<ActionGrid
				type="wrap"
				color="#F97315"
				colorDark="#FDBA74"
				title="Quick Actions"
				data={filteredActions}
				fallbackIcon="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
				onClose={onClose}
			/>

			<ActionGrid
				type="wrap"
				title="Run an Automation"
				color="#84cc16"
				colorDark="#bef264"
				data={() =>
					queryDb("automations").then((res) =>
						res.map((automation) => {
							return {
								_id: automation._id,
								label: automation.name,
								handler: () =>
									actions.runAutomation.handler({
										actions: automation.actions,
									}),
								// url: automation.url,
							};
						})
					)
				}
				fallbackIcon="m6.75 7.5 3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0 0 21 18V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v12a2.25 2.25 0 0 0 2.25 2.25Z"
				onClose={onClose}
			/>

			<ActionGrid
				type="wrap"
				title="Start an Automation"
				data={automationActions}
				color="#1e3a8a"
				colorDark="#93c5fd"
				fallbackIcon="m6.75 7.5 3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0 0 21 18V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v12a2.25 2.25 0 0 0 2.25 2.25Z"
				onClose={onClose}
				maxLines={3}
			/>
		</div>
	);
}

export const BottomNavButton = ({
	disabled,
	page,
	selected,
	onClick,
	onHold,
}) => {
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
		<MutliGestureButton
			className={clsx(
				"flex-shrink-0 focus:outline-none rounded-full border inline-flex items-center justify-center h-9 w-16 px-2.5 text-center text-xs uppercase font-bold",
				selected ? activeClass : inActiveClass,
				disabled ? "" : "pointer-events-auto"
			)}
			style={
				page == "home" && selected
					? {
							background:
								"linear-gradient(45deg, #d3ffff, #f2ddb0)",
							color: "#3E3215",
					  }
					: {}
			}
			onHold={onHold}
			onClick={handleClick}
		>
			<span className={clsx("size-5", !selected && "opacity-70")}>
				{selected ? activeIcon : icon}
			</span>
		</MutliGestureButton>
	);
};

export function BottomNav({ hidden, pinnedApps, currentPage, setCurrentPage }) {
	const { __crotchetApp } = useAppContext();
	const [hidePinnedMenu, setHidePinnedMenu] = useState(false);
	const navRef = useRef(null);
	const navHeight = 56;
	const expand = useRef();

	return (
		<div>
			<BottomSheet
				hidden={hidden}
				peekSize={pinnedApps?.length ? navHeight : 0}
				noScroll
				fullHeight
				dismissible
				// dismissible="auto"
				// dismissible={!searchQuery?.length}
			>
				{({ collapse, collapsed, expand: _expand, dragRatio }) => {
					if (!expand.current) expand.current = _expand;

					setHidePinnedMenu(!collapsed || dragRatio);

					return (
						<div style={{ minHeight: navHeight + "px" }}>
							<motion.div
								onClick={() => collapse()}
								className={clsx(
									"relative h-screen flex flex-col items-stretch justify-end",
									{
										"pointer-events-none": collapsed,
									}
								)}
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
								<div className="bg-primary dark:bg-primary-dark opacity-5 z-[-1] absolute inset-0 bottom-1 pointer-events-none"></div>

								<div
									ref={navRef}
									className={clsx(
										"flex-1 flex flex-col items-stretch justify-end gap-6 px-4 pb-6 sticky top-0 z-10"
									)}
									style={{
										paddingTop:
											!collapsed && !dragRatio
												? "env(safe-area-inset-top)"
												: "1rem",
									}}
								>
									<div className="mt-2 flex-shrink-0 flex items-center justify-between">
										<button
											type="button"
											className="bg-content/5 dark:border border-stroke size-10 rounded-full flex items-center justify-center"
										>
											<svg
												className="w-6 opacity-80"
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
									</div>

									<div className="flex-1 flex flex-col items-center justify-center">
										<h2 className="text-primary dark:text-primary-dark text-4xl/none font-bold">
											{__crotchetApp.name}
										</h2>
									</div>

									<ActionButton
										action="crotchet://app/search"
										className="flex-shrink-0 h-12 px-3 flex items-center gap-1.5 bg-card dark:bg-content/5 text-content/50 shadow dark:border border-stroke rounded-full"
									>
										<div
											className={clsx(
												"size-8 rounded-full flex items-center justify-center"
											)}
										>
											<svg
												className="size-5"
												viewBox="0 0 24 24"
												fill="none"
												strokeWidth={1.5}
												stroke="currentColor"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
												/>
											</svg>
										</div>

										<div className="mr-5 text-lg/none">
											Search...
										</div>
									</ActionButton>
								</div>

								<div
									className="overflow-hidden"
									style={{
										maxHeight: "calc(90vh-180px)",
									}}
								>
									<ActionCenter onClose={collapse} />

									<div
										className="mb-8"
										style={{
											height: "env(safe-area-inset-bottom)",
										}}
									></div>
								</div>
							</motion.div>
						</div>
					);
				}}
			</BottomSheet>

			<div
				className={clsx(
					"pointer-events-none z-50 fixed inset-x-8 bottom-0 flex items-center justify-between gap-4 transition",
					{ "opacity-0 translate-y-4": hidePinnedMenu }
				)}
				style={{
					height: navHeight + "px",
					paddingBottom: "env(safe-area-inset-bottom)",
				}}
			>
				{(pinnedApps || ["", "home", ""]).map((page, index) => (
					<BottomNavButton
						key={page + index}
						page={page}
						disabled={hidePinnedMenu}
						selected={currentPage == page}
						onHold={
							page == "home" && currentPage == page
								? () => openUrl("crotchet://action/remote")
								: null
						}
						onClick={() => {
							if (currentPage != page) setCurrentPage(page);
							else if (page == "home") {
								// setAutoFocus(true);
								expand.current?.();
							}
						}}
					/>
				))}
			</div>
		</div>
	);
}
