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
	pageData: null,
	pageResolving: false,
	setPageData: () => {},
	pageStatus: {
		status: "idle",
		message: null,
	},
	open,
	onPop: () => {},
	onPopAll: () => {},
	onOpen: () => {},
	onReady: () => {},
	onEscape: () => {},
	onClose: () => {},
	preview: () => {},
	setPreview: () => {},
	mainAction: () => {},
	setMainAction: () => {},
	secondaryAction: () => {},
	setSecondaryAction: () => {},
	actions: () => {},
	setActions: () => {},
	contextMenuActions: null,
	setContextMenuActions: () => {},
	onMainActionClick: () => {},
	onActionMenuClick: () => {},
	onContextMenuClick: () => {},
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

export function useSpotlightPageState(key, defaultValue) {
	const { spotlightState, setSpotlightState } = useSpotlightPageContext();
	const value = spotlightState[key] ?? defaultValue;
	const setValue = (newValue) => {
		setSpotlightState({ [key + "Old"]: value, [key]: newValue });
	};
	const oldValue = spotlightState[key + "Old"];

	useEffect(() => {
		if (defaultValue == undefined || value != undefined) return;
		setValue(defaultValue);
	}, []);

	return [value, setValue, oldValue];
}

export function useSpotlightPageActions(actions, defaultValue) {
	const { spotlightState, setSpotlightState } = useSpotlightPageContext();
	const setValue = (spotlightSearchActionsValue) => {
		setSpotlightState({ spotlightSearchActionsValue });
	};

	useEffect(() => {
		if (actions) {
			setSpotlightState({
				spotlightSearchActions: actions,
				spotlightSearchActionsValue: defaultValue,
			});
		}
	}, []);

	return {
		actions: spotlightState.spotlightSearchActions,
		value: spotlightState.spotlightSearchActionsValue,
		setValue,
	};
}

export function useSpotlightPageEffect(callback, key) {
	const [value, setValue, oldValue] = useSpotlightPageState(key);
	useEffect(() => {
		if (!value || value == oldValue) return;

		callback();
		setValue(value);
	}, [value]);
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
