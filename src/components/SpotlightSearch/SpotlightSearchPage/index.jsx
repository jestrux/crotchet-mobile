import { Children, cloneElement, useRef, useState } from "react";
import { SpotlightPageProvider } from "./SpotlightPageContext";
import useLoadableView from "@/hooks/useLoadableView";
import SearchPage from "./SearchPage";
import DetailPage from "./DetailPage";
import clsx from "clsx";
import useEventListener from "@/hooks/useEventListener";

function PageLoader() {
	return (
		<div className="relative h-px">
			<style>
				{
					/*css*/ `
				.progress-bar-short,
				.progress-bar-long {
					animation-duration: 2.2s;
					animation-iteration-count: infinite;
					animation-delay: 200ms;
					will-change: left, right;
				}

				.progress-bar-short {
					left: 0%;
					right: 100%;
					top: 0;
					bottom: 0;
					position: absolute;
					animation-name: indeterminate-short-ltr;
				}

				.progress-bar-long {
					left: 0%;
					right: 100%;
					top: 0;
					bottom: 0;
					position: absolute;
					animation-name: indeterminate-ltr;
				}

				@keyframes indeterminate-ltr {
					0% {
						left: -90%;
						right: 100%;
					}
					60% {
						left: -90%;
						right: 100%;
					}
					100% {
						left: 100%;
						right: -35%;
					}
				}

				@keyframes indeterminate-short-ltr {
					0% {
						left: -200%;
						right: 100%;
					}
					60% {
						left: 107%;
						right: -8%;
					}
					100% {
						left: 107%;
						right: -8%;
					}
				}
			`
				}
			</style>

			<div>
				<div className="progress-bar-long bg-gradient-to-r from-transparent via-green-500 to-blue-500"></div>
				<div className="progress-bar-short bg-gradient-to-r from-transparent via-pink-500 to-green-500"></div>
			</div>
		</div>
	);
}

export default function SpotlightSearchPage({
	open,
	onClose,
	onPop,
	onPopAll,
	children,
	page,
}) {
	const pageWrapperRef = useRef(null);
	const [mainAction, setMainAction] = useState(page?.action);
	const [secondaryAction, setSecondaryAction] = useState(
		page?.secondaryAction
	);
	const [actions, setActions] = useState(page?.actions);
	const [contextMenuActions, setContextMenuActions] = useState(
		page?.contextMenuActions
	);

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
	const escapeHandler = useRef(({ popAll } = {}) => {
		if (popAll && typeof onPopAll == "function") return onPopAll();
		onPop();
	});
	const onEscape = (callback) => (escapeHandler.current = callback);

	const openHandler = useRef(() => {});
	const onOpen = (callback) => (openHandler.current = callback);

	const navigateDownHandler = useRef(() => {});
	const onNavigateDown = (callback) =>
		(navigateDownHandler.current = callback);
	const navigateUpHandler = useRef(() => {});
	const onNavigateUp = (callback) => (navigateUpHandler.current = callback);

	const {
		data: pageData,
		loading,
		pendingView: pagePendingView,
	} = useLoadableView({
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
		if (pagePendingView != true) {
			return loading ? (
				<PageLoader />
			) : (
				<div className="py-4">{pagePendingView}</div>
			);
		}

		return Children.map(children, (child) => {
			if (!child?.type) return null;

			return cloneElement(child, {
				pageData,
			});
		});
	};

	const pageInFocus = (callback, fallback = () => {}) => {
		return (...args) => {
			let fallbackTimeout;
			const pageWrapper = pageWrapperRef.current;

			if (fallbackTimeout) clearTimeout(fallbackTimeout);

			if (pageWrapper?.className.indexOf("menu-open-") != -1) {
				fallbackTimeout = setTimeout(() => {
					if (pageWrapper?.className.indexOf("menu-open-") == -1)
						fallback(...args);
				}, 10);
				return;
			}

			callback(...args);
		};
	};

	useEventListener("open-" + page?._id, openHandler.current);

	useEventListener(
		"escape-" + page?._id,
		pageInFocus(
			(_, payload) => escapeHandler.current(payload),
			openHandler.current
		)
	);

	useEventListener(
		"context-menu-" + page?._id,
		contextMenuClickHandler.current
	);

	useEventListener(
		"action-menu-" + page?._id,
		actionMenuClickHandler.current
	);

	useEventListener(
		"secondary-action-" + page?._id,
		pageInFocus(secondaryActionClickHandler.current)
	);

	useEventListener(
		"enter-click-" + page?._id,
		pageInFocus(() => {
			if (page.type != "form") mainActionClickHandler.current();
		})
	);

	useEventListener(
		"cmd-enter-click-" + page?._id,
		pageInFocus(() => {
			if (page.type == "form") mainActionClickHandler.current();
		})
	);

	useEventListener(
		"navigate-down-" + page?._id,
		pageInFocus(navigateDownHandler.current)
	);

	useEventListener(
		"navigate-up-" + page?._id,
		pageInFocus(navigateUpHandler.current)
	);

	return (
		<div
			ref={pageWrapperRef}
			id="spotlightSearchWrapper"
			className={clsx("fixed inset-0", {
				"opacity-0 pointer-events-none": !open,
			})}
		>
			<SpotlightPageProvider
				value={{
					page,
					pageData,
					pageLoading: loading,
					setSpotlightState,
					pageWrapperRef,
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
					mainAction: mainAction
						? {
								...mainAction,
								shortcut:
									page.type == "form"
										? "Cmd + Enter"
										: "Enter",
						  }
						: {},
					setMainAction,
					secondaryAction,
					setSecondaryAction,
					actions,
					setActions,
					contextMenuActions,
					setContextMenuActions,
					onActionMenuClick,
					onContextMenuClick,
					onSecondaryActionClick,
					onMainActionClick,
					onNavigateDown,
					onNavigateUp,
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
