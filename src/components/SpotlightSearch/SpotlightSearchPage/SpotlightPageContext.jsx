import { createContext, useContext, useEffect, useRef } from "react";

const SpotlightPageContext = createContext({
	spotlightState: {},
	setSpotlightState: () => {},
	pageWrapperRef: null,
	navigationValue: null,
	page: null,
	lastStateUpdate: null,
	searchTerm: null,
	setSearchTerm: () => {},
	pageResolving: false,
	pageStatus: {
		status: "idle",
		message: null,
	},
	pageData: null,
	pageDataVersion: null,
	setPageData: () => {},
	formData: null,
	setFormData: () => {},
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
	open,
	onPop: () => {},
	onPopAll: () => {},
	onOpen: () => {},
	onReady: () => {},
	onDataUpdated: () => {},
	onEscape: () => {},
	onClose: () => {},
	onClick: () => {},
	onMainActionClick: () => {},
	onOpenActionMenu: () => {},
	onChangeFilter: () => {},
	onFilterChanged: () => {},
	onSecondaryActionClick: () => {},
	onNavigateDown: () => {},
	onNavigateUp: () => {},
});

export function SpotlightPageProvider({ value, children }) {
	return (
		<SpotlightPageContext.Provider value={value}>
			{children}
		</SpotlightPageContext.Provider>
	);
}

export function useSpotlightPageContext() {
	const context = useContext(SpotlightPageContext);
	const changeHandler = useRef();
	const onChange = (callback) => (changeHandler.current = callback);

	useEffect(() => {
		if (typeof changeHandler.current == "function")
			changeHandler.current(context.navigationValue);
	}, [context.navigationValue]);

	return {
		...context,
		onChange,
	};
}
