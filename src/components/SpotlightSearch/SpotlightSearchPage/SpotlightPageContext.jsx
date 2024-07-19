import { createContext, useContext, useEffect, useRef } from "react";

const SpotlightPageContext = createContext({
	spotlightState: {},
	setSpotlightState: () => {},
	navigationValue: null,
	page: null,
	lastStateUpdate: null,
	searchTerm: null,
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
	const selectHandler = useRef();
	const onChange = (callback) => (changeHandler.current = callback);
	const onSelect = (callback) => (selectHandler.current = callback);

	const handleSelect = ({ detail }) => {
		const { page, value } = detail || {};
		if (page?.id != context.page?.id) return;

		if (typeof selectHandler.current == "function")
			selectHandler.current(value);
	};

	useEffect(() => {
		if (typeof changeHandler.current == "function")
			changeHandler.current(context.navigationValue);
	}, [context.navigationValue]);

	useEffect(() => {
		document.addEventListener(
			"spotlight-search-value-changed",
			handleSelect,
			false
		);

		return () => {
			document.removeEventListener(
				"spotlight-search-value-changed",
				handleSelect,
				false
			);
		};
	}, []);

	return {
		...context,
		onChange,
		onSelect,
	};
}
