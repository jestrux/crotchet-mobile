import MutliGestureButton from "@/components/MutliGestureButton";
import clsx from "clsx";
import { motion } from "framer-motion";

import { getPreference } from "@/utils";
import useDataLoader from "@/hooks/useDataLoader";

export const BottomNavButton = ({
	disabled,
	icon,
	action,
	label,
	activeIcon: _activeIcon,
	selected,
	onClick,
	onHold,
}) => {
	const activeIcon = _activeIcon || icon;
	const activeClass =
		"bg-primary/[0.08] text-primary dark:bg-content/[0.08] dark:text-content";
	const inActiveClass = "dark:border-transparent text-content/50";
	const handleClick = () => {
		if (typeof onClick == "function") onClick();
	};

	return (
		<MutliGestureButton
			className={clsx(
				"h-[42px] flex-1 px-4 gap-2 flex-shrink-0 focus:outline-none rounded-full inline-flex items-center justify-center text-center text-sm lg:text-sm font-bold",
				selected ? activeClass : inActiveClass,
				disabled ? "" : "pointer-events-auto"
			)}
			onHold={onHold}
			onClick={handleClick}
		>
			<span className={"-ml-0.5 size-[18px] lg:size-5"}>
				{selected ? activeIcon : icon}
			</span>

			<span
				className={clsx({
					"shidden lg:inline": !selected,
				})}
			>
				{label || action}
			</span>
		</MutliGestureButton>
	);
};

const getNavItems = async () => {
	const pinnedItems = await getPreference("pinnedNavItems", [
		"Home",
		// "Search",
		"Projects",
		"People",
		// "Settings",
	]);
	const navItems = [
		{
			icon: (
				<svg
					viewBox="0 0 24 24"
					fill="none"
					strokeWidth={1.8}
					stroke="currentColor"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
					/>
				</svg>
			),
			action: "Home",
		},
		{
			icon: (
				<svg
					viewBox="0 0 24 24"
					fill="none"
					strokeWidth={1.5}
					stroke="currentColor"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z"
					/>
				</svg>
			),
			action: "Projects",
		},
		{
			icon: (
				<svg
					viewBox="0 0 24 24"
					fill="none"
					strokeWidth={1.8}
					stroke="currentColor"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
					/>
				</svg>
			),
			action: "People",
			label: "People",
		},

		{
			icon: (
				<svg
					fill="none"
					viewBox="0 0 24 24"
					strokeWidth={1.8}
					stroke="currentColor"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M9.348 14.652a3.75 3.75 0 0 1 0-5.304m5.304 0a3.75 3.75 0 0 1 0 5.304m-7.425 2.121a6.75 6.75 0 0 1 0-9.546m9.546 0a6.75 6.75 0 0 1 0 9.546M5.106 18.894c-3.808-3.807-3.808-9.98 0-13.788m13.788 0c3.808 3.807 3.808 9.98 0 13.788M12 12h.008v.008H12V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
					/>
				</svg>
			),
			action: "Remote",
			label: "Remote",
		},
		{
			icon: (
				<svg
					fill="none"
					viewBox="0 0 24 24"
					strokeWidth={1.5}
					stroke="currentColor"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M6 6.878V6a2.25 2.25 0 0 1 2.25-2.25h7.5A2.25 2.25 0 0 1 18 6v.878m-12 0c.235-.083.487-.128.75-.128h10.5c.263 0 .515.045.75.128m-12 0A2.25 2.25 0 0 0 4.5 9v.878m13.5-3A2.25 2.25 0 0 1 19.5 9v.878m0 0a2.246 2.246 0 0 0-.75-.128H5.25c-.263 0-.515.045-.75.128m15 0A2.25 2.25 0 0 1 21 12v6a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18v-6c0-.98.626-1.813 1.5-2.122"
					/>
				</svg>
			),
			label: "Pages",
			action: "Pages",
		},
		{
			icon: (
				<svg
					fill="none"
					viewBox="0 0 24 24"
					strokeWidth={1.8}
					stroke="currentColor"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
					/>
				</svg>
			),
			label: "Search",
			action: "Search",
		},
		{
			icon: (
				<svg
					className="size-[18px]"
					fill="none"
					viewBox="0 0 24 24"
					strokeWidth={1.8}
					stroke="currentColor"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75"
					/>
				</svg>
			),
			action: "Settings",
			label: "Settings",
		},
	];

	return navItems.filter((item) => pinnedItems.includes(item.action));
};

export default function NavItems() {
	const { data: bottomSheetVisible } = useDataLoader({
		handler: () =>
			_.filter(window.alerts || [], ({ type }) =>
				["sheet", "choice-picker"].includes(type)
			).length,
		listenForUpdates: "alerts-changed",
	});

	const { data: items } = useDataLoader({
		handler: getNavItems,
	});

	if (!items) return null;

	return (
		<motion.div
			className="pointer-events-none z-50 fixed inset-x-0 bottom-0 lg:bottom-8 lg:mb-[env(safe-area-inset-bottom)] flex items-center justify-center"
			animate={{
				opacity: bottomSheetVisible ? 0 : 1,
				y: bottomSheetVisible ? "3%" : 0,
			}}
		>
			<div className="border dark:border border-content/5 shadow-sm bg-stone-100/95 dark:bg-card/95 backdrop-blur-sm w-full lg:w-auto min-w-96 px-2 lg:rounded-full overflow-hidden">
				<div className="h-10 lg:h-14 px-3 lg:px-0 pt-3.5 lg:pt-0 mb-[env(safe-area-inset-bottom)] lg:mb-0 flex items-center justify-between gap-4 lg:gap-2 lg:max-w-sm mx-auto">
					{items.map((item, index) => {
						const isMainAction = ["home", "search"].includes(
							item.action?.toLowerCase()
						);
						return (
							<BottomNavButton
								key={item.action + index}
								{...item}
								selected={isMainAction}
								onClick={() => {
									// if (isMainAction) onExpand();
									// else {
									// 	window.openActionSheet({
									// 		title: item.action,
									// 		content:
									// 			item.action +
									// 			" details will go here...",
									// 	});
									// }
								}}
							/>
						);
					})}
				</div>
			</div>
		</motion.div>
	);
}
