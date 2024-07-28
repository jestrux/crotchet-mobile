import { useEffect, useRef, useState } from "react";
import { SpotlightPageProvider } from "./SpotlightPageContext";
import useLoadableView from "@/hooks/useLoadableView";
import SearchPage from "./SearchPage";
import DetailPage from "./DetailPage";
import clsx from "clsx";
import useEventListener from "@/hooks/useEventListener";
import PageActionBar from "./PageActionBar";
import { someTime } from "@/utils";
import { randomId } from "@/utils";

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
	page,
}) {
	const pageStatusResetTimeoutRef = useRef(null);
	const pageWrapperRef = useRef(null);
	const [pageDataVersion, setPageDataVersion] = useState(
		"data-" + randomId()
	);
	const [preview, setPreview] = useState();
	const [formData, setFormData] = useState(null);
	const filterRef = useRef(page?.filter?.defaultValue);
	const [pageFilter, _setPageFilter] = useState(filterRef.current);

	const [pageData, setPageData] = useState();
	const [pageStatus, _setPageStatus] = useState({ status: "idle" });
	const [mainAction, setMainAction] = useState();
	const [secondaryAction, setSecondaryAction] = useState();
	const [actions, setActions] = useState();

	const clickHandler = useRef(() => {});
	const onClick = (callback) => (clickHandler.current = callback);
	const mainActionClickHandler = useRef(() => {});
	const onMainActionClick = (callback) =>
		(mainActionClickHandler.current = callback);
	const secondaryActionClickHandler = useRef(() => {});
	const onSecondaryActionClick = (callback) =>
		(secondaryActionClickHandler.current = callback);
	const actionMenuClickHandler = useRef(() => {});
	const onOpenActionMenu = (callback) =>
		(actionMenuClickHandler.current = callback);
	const filterChangedHandler = useRef(() => {});
	const onFilterChanged = (callback) =>
		(filterChangedHandler.current = callback);
	const onChangeFilterHandler = useRef(() => {});
	const onChangeFilter = (callback) =>
		(onChangeFilterHandler.current = callback);
	const dataUpdatedHandler = useRef(() => {});
	const onDataUpdated = (callback) => (dataUpdatedHandler.current = callback);
	const readyHandler = useRef(() => {});
	const onReady = (callback) => (readyHandler.current = callback);
	const escapeHandler = useRef(({ popAll } = {}) => {
		if (popAll && typeof onPopAll == "function") return onPopAll();
		if (typeof onPop == "function") return onPop();
		if (typeof onClose == "function") onClose();
	});
	const onEscape = (callback) => (escapeHandler.current = callback);

	const openHandler = useRef(() => {});
	const onOpen = (callback) => (openHandler.current = callback);

	const navigateDownHandler = useRef(() => {});
	const onNavigateDown = (callback) => {
		navigateDownHandler.current = callback;
	};
	const navigateUpHandler = useRef(() => {});
	const onNavigateUp = (callback) => (navigateUpHandler.current = callback);

	const { refetch, loading } = useLoadableView({
		data: async ({ fromRefetch }) => {
			const filter = filterRef.current;
			await someTime(5);
			return typeof page?.resolve == "function"
				? page.resolve({
						fromRefetch,
						filters: page?.filter?.field
							? { [page.filter.field]: filter }
							: null,
				  })
				: true;
		},
		listenForUpdates: page.listenForUpdates,
		dismiss: onClose,
		onSuccess: (data) => {
			setPageData(data);
			setTimeout(() => readyHandler.current(data));
		},
		onUpdate: (data, oldData) => {
			setPageDataVersion("data-" + randomId());
			setPageData(data);
			setTimeout(() => dataUpdatedHandler.current(data, oldData));
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

	const setPageStatus = (payload) => {
		if (pageStatusResetTimeoutRef.current)
			clearTimeout(pageStatusResetTimeoutRef.current);

		if (["success", "error"].includes(payload?.status)) {
			pageStatusResetTimeoutRef.current = setTimeout(() => {
				_setPageStatus({ status: "idle" });
			}, 3000);
		}

		_setPageStatus(payload);
	};

	const hasClass = (cls) => {
		const pageWrapper = pageWrapperRef.current;
		return pageWrapper?.className.indexOf(cls) != -1;
	};

	const pageInFocus = (callback) => {
		return (...args) => {
			if (!open) return;

			if (hasClass("menu-open-") || hasClass("alert-open-")) return;

			callback(...args);
		};
	};

	useEffect(() => {
		let clearDataChangeWatcher;

		if (
			typeof page?.onDataChange == "function" &&
			typeof page?.resolve == "function"
		) {
			clearDataChangeWatcher = page?.onDataChange(() =>
				page.resolve().then((data) => {
					console.log("New data:", data);
				})
			);
		}

		return () => {
			if (typeof clearDataChangeWatcher == "function")
				clearDataChangeWatcher();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [page?.onDataChange]);

	useEventListener("click-" + page?._id, pageInFocus(clickHandler.current));

	useEventListener("open-" + page?._id, openHandler.current);

	useEventListener(
		"escape-" + page?._id,
		pageInFocus((_, payload) => {
			if (["error", "success"].includes(pageStatus?.status))
				setPageStatus({ status: "idle" });

			escapeHandler.current(payload);
		})
	);

	useEventListener(
		"menu-closed-" + page?._id,
		pageInFocus(openHandler.current)
	);

	useEventListener(
		"alert-closed-" + page?._id,
		pageInFocus(openHandler.current)
	);

	useEventListener(
		"change-filter-" + page?._id,
		pageInFocus(onChangeFilterHandler.current)
	);

	useEventListener(
		"filter-changed-" + page?._id,
		pageInFocus(filterChangedHandler.current)
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

	useEventListener("status-change-" + page?._id, (_, payload) =>
		setPageStatus(payload)
	);

	const contextInfo = {
		page,
		pageData,
		pageDataVersion,
		formData,
		pageFilter,
	};

	return (
		<div
			ref={pageWrapperRef}
			id="spotlightSearchWrapper"
			{...(open ? { "data-current-spotlight-page": true } : {})}
			className={clsx("fixed inset-0", {
				"opacity-0 pointer-events-none": !open,
			})}
		>
			<SpotlightPageProvider
				value={{
					page,
					pageData,
					pageDataVersion,
					setPageData,
					formData,
					setFormData,
					pageResolving: loading,
					pageStatus,
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
					onDataUpdated,
					onEscape,
					onClose,
					content: () => {
						const content = page?.content;
						return typeof content == "function"
							? content(contextInfo)
							: content;
					},
					preview: () => {
						let pagePreview = preview || page?.preview;
						return typeof pagePreview == "function"
							? pagePreview(contextInfo)
							: pagePreview;
					},
					setPreview,
					pageFilter,
					setPageFilter: (filter) => {
						filterRef.current = filter;
						_setPageFilter(filter);
						refetch();
					},
					filters: () => {
						const filters = page?.filters;
						return typeof filters == "function"
							? filters(contextInfo)
							: filters;
					},
					formFields: () => {
						let fields = page?.fields;
						fields =
							typeof fields == "function"
								? fields(contextInfo)
								: fields;
						let field = page?.field;
						field =
							typeof field == "function"
								? field(contextInfo)
								: field;

						return fields
							? fields
							: field
							? { formField: field }
							: {};
					},
					mainAction: () => {
						let action = mainAction || page?.action;
						action =
							typeof action == "function"
								? action(contextInfo)
								: action;

						return action
							? {
									...action,
									shortcut:
										page.type == "form"
											? "Cmd + Enter"
											: "Enter",
							  }
							: null;
					},
					setMainAction,
					secondaryAction: () => {
						let action = secondaryAction || page?.secondaryAction;
						action =
							typeof action == "function"
								? action(contextInfo)
								: action;

						return action
							? {
									...action,
									shortcut: "Cmd + T",
							  }
							: null;
					},
					setSecondaryAction,
					actions: () => {
						const pageActions = actions || page?.actions;
						return typeof pageActions == "function"
							? pageActions({ pageData })
							: pageActions;
					},
					setActions,
					onClick,
					onOpenActionMenu,
					onChangeFilter,
					onFilterChanged,
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
					/>
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
					/>
				)}

				{loading && (
					<div className="fixed top-14 inset-x-0 z-50 pointer-events-none">
						<PageLoader />
					</div>
				)}

				<PageActionBar />
			</SpotlightPageProvider>
		</div>
	);
}
