import { createContext, useContext, useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { useDataLoader, useEventListener } from "@/hooks";
import { someTime, randomId } from "@/utils";
import Page from "./Page";

const PageContext = createContext({
	scaffold: {
		nav: null,
	},
	isOpen: false,
	page: null,
	pageResolving: false,
	pageStatus: {
		status: "idle",
		message: null,
	},
	pageData: null,
	setPageData: () => {},
	formData: null,
	setFormData: () => {},
	title: () => {},
	nav: () => {},
	content: () => {},
	preview: () => {},
	setPreview: () => {},
	pageFilter: null,
	setPageFilter: () => {},
	filters: () => {},
	formFields: () => {},
	mainAction: () => {},
	setMainAction: () => {},
	secondaryAction: () => {},
	setSecondaryAction: () => {},
	actions: () => {},
	setActions: () => {},
	onOpen: () => {},
	onClose: () => {},
	onReady: () => {},
	onDataUpdated: () => {},
	onEscape: () => {},
	onClick: () => {},
	onMainActionClick: () => {},
	onOpenActionMenu: () => {},
	onChangeFilter: () => {},
	onFilterChanged: () => {},
	onSecondaryActionClick: () => {},
	onNavigateDown: () => {},
	onNavigateUp: () => {},
});

export function usePageContext() {
	return useContext(PageContext);
}

export default function PageProvider({
	isOpen,
	page,
	scaffold = {},
	onClose = () => {},
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
	const escapeHandler = useRef((payload) => onClose(payload));
	const onEscape = (callback) => (escapeHandler.current = callback);

	const openHandler = useRef(() => {});
	const onOpen = (callback) => (openHandler.current = callback);

	const navigateDownHandler = useRef(() => {});
	const onNavigateDown = (callback) => {
		navigateDownHandler.current = callback;
	};
	const navigateUpHandler = useRef(() => {});
	const onNavigateUp = (callback) => (navigateUpHandler.current = callback);

	const { refetch, loading } = useDataLoader({
		handler: async ({ fromRefetch }) => {
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
			if (!isOpen) return;

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
			id="pageWrapper"
			{...(isOpen ? { "data-current-page": true } : {})}
			className={clsx({
				none: !isOpen,
			})}
		>
			<PageContext.Provider
				value={{
					scaffold,
					isOpen,
					page,
					pageData,
					pageDataVersion,
					setPageData,
					formData,
					setFormData,
					pageResolving: loading,
					pageStatus,
					onOpen,
					onClose,
					onReady,
					onDataUpdated,
					onEscape,
					title: () => {
						const title = page?.title;
						return typeof title == "function"
							? title(contextInfo)
							: title;
					},
					nav: () => {
						const nav = page?.nav;
						return typeof nav == "function"
							? nav(contextInfo)
							: nav;
					},
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
				<Page />
			</PageContext.Provider>
		</div>
	);
}
