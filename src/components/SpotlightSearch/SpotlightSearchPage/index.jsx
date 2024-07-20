import { Children, cloneElement, useRef, useState } from "react";
import { SpotlightPageProvider } from "./SpotlightPageContext";
import useLoadableView from "@/hooks/useLoadableView";
import SearchPage from "./SearchPage";
import DetailPage from "./DetailPage";
import clsx from "clsx";
import useEventListener from "@/hooks/useEventListener";

export default function SpotlightSearchPage({
	open,
	onClose,
	onPop,
	onPopAll,
	children,
	page,
}) {
	const mainActionClickHandler = useRef(() => {});
	const onMainActionClick = (callback) =>
		(mainActionClickHandler.current = callback);
	const secondaryActionClickHandler = useRef(() => {});
	const onSecondaryActionClick = (callback) =>
		(secondaryActionClickHandler.current = callback);
	const actionMenuClickHandler = useRef(() => {});
	const onActionMenuClick = (callback) =>
		(actionMenuClickHandler.current = callback);
	const contextMenuClickHandler = useRef(() => {});
	const onContextMenuClick = (callback) =>
		(contextMenuClickHandler.current = callback);
	const readyHandler = useRef(() => {});
	const onReady = (callback) => (readyHandler.current = callback);
	const openHandler = useRef(() => {});
	const escapeHandler = useRef(({ popAll }) => {
		if (popAll && typeof onPopAll == "function") return onPopAll();
		onPop();
	});
	const onEscape = (callback) => (escapeHandler.current = callback);
	const onOpen = (callback) => (openHandler.current = callback);
	const { data: pageData, pendingView: pagePendingView } = useLoadableView({
		data: page?.resolve || (() => true),
		resolver: true,
		dismiss: onClose,
		onSuccess: () => {
			setTimeout(() => {
				readyHandler.current();
			});
		},
	});

	const [lastStateUpdate, setLastUpdate] = useState(Date.now());
	let spotlightState = useRef({});
	const setSpotlightState = (newValue) => {
		spotlightState.current = { ...spotlightState.current, ...newValue };
		setLastUpdate(Date.now());
	};
	const [searchTerm, setSearchTerm] = useState("");
	const [navigationValue, setNavigationValue] = useState(null);

	const pageContent = () => {
		if (pagePendingView != true)
			return <div className="py-4">{pagePendingView}</div>;

		return Children.map(children, (child) => {
			if (!child?.type) return null;

			return cloneElement(child, {
				pageData,
			});
		});
	};

	useEventListener("escape-" + page?._id, (_, payload) => {
		escapeHandler.current(payload);
	});

	useEventListener("context-menu-" + page?._id, () => {
		contextMenuClickHandler.current();
	});

	useEventListener("action-menu-" + page?._id, () => {
		actionMenuClickHandler.current();
	});

	useEventListener("secondary-action-" + page?._id, () => {
		secondaryActionClickHandler.current();
	});

	useEventListener("main-action-" + page?._id, () => {
		mainActionClickHandler.current();
	});

	useEventListener("open-" + page?._id, () => {
		openHandler.current();
	});

	return (
		<div
			className={clsx("fixed inset-0", {
				"opacity-0 pointer-events-none": !open,
			})}
		>
			<SpotlightPageProvider
				value={{
					page,
					pageData,
					setSpotlightState,
					spotlightState: spotlightState.current,
					lastStateUpdate,
					searchTerm,
					setSearchTerm,
					navigationValue,
					setNavigationValue,
					open,
					onPop,
					onPopAll,
					onOpen,
					onReady,
					onEscape,
					onClose,
					onActionMenuClick,
					onContextMenuClick,
					onSecondaryActionClick,
					onMainActionClick,
				}}
			>
				{page.type != "search" ? (
					<DetailPage
						open={open}
						page={page}
						pageData={pageData}
						onPop={onPop}
						onPopAll={onPopAll}
						onOpen={onOpen}
						onReady={onReady}
						onEscape={onEscape}
						onClose={onClose}
					>
						{pageContent()}
					</DetailPage>
				) : (
					<SearchPage
						open={open}
						page={page}
						pageData={pageData}
						onPop={onPop}
						onPopAll={onPopAll}
						onOpen={onOpen}
						onReady={onReady}
						onEscape={onEscape}
						onClose={onClose}
					>
						{pageContent()}
					</SearchPage>
				)}
			</SpotlightPageProvider>
		</div>
	);
}
