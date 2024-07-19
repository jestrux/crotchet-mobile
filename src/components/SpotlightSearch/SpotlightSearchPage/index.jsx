import { Children, cloneElement, useRef, useState } from "react";
import { SpotlightPageProvider } from "./SpotlightPageContext";
import useLoadableView from "@/hooks/useLoadableView";
import SearchPage from "./SearchPage";
import DetailPage from "./DetailPage";
import clsx from "clsx";

export default function SpotlightSearchPage({
	open,
	onClose,
	onPop,
	onPopAll,
	children,
	page,
}) {
	const { data: pageData, pendingView: pagePendingView } = useLoadableView({
		data: page?.resolve || (() => true),
		resolver: true,
		dismiss: onClose,
	});

	const [lastStateUpdate, setLastUpdate] = useState(Date.now());
	let spotlightState = useRef({});
	const setSpotlightState = (newValue) => {
		spotlightState.current = { ...spotlightState.current, ...newValue };
		setLastUpdate(Date.now());
	};
	const [searchTerm, setSearchTerm] = useState("");
	const [navigationValue, setNavigationValue] = useState(null);
	// const isGrid = page?.source?.layoutProps?.layout == "grid";
	// ["search", "source"].includes(page?.type)

	const pageContent =
		pagePendingView != true ? (
			<div className="py-4">{pagePendingView}</div>
		) : (
			Children.map(children, (child) => {
				if (!child?.type) return null;

				return cloneElement(child, {
					pageData,
				});
			})
		);

	return (
		<div
			className={clsx("fixed inset-0", {
				"opacity-0 pointer-events-none": !open,
			})}
		>
			<SpotlightPageProvider
				value={{
					page,
					setSpotlightState,
					spotlightState: spotlightState.current,
					lastStateUpdate,
					searchTerm,
					setSearchTerm,
					navigationValue,
					setNavigationValue,
				}}
			>
				{page.type != "search" ? (
					<DetailPage
						open={open}
						page={page}
						pageData={pageData}
						onPop={onPop}
						onPopAll={onPopAll}
						onClose={onClose}
					>
						{pageContent}
					</DetailPage>
				) : (
					<SearchPage
						open={open}
						page={page}
						pageData={pageData}
						onPop={onPop}
						onPopAll={onPopAll}
						onClose={onClose}
					>
						{pageContent}
					</SearchPage>
				)}
			</SpotlightPageProvider>
		</div>
	);
}
