import { Preferences } from "@capacitor/preferences";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import * as defaultDataSources from "./data/defaultDataSources";
import { dataSourceProviders } from "./data";

const STORE_KEY = "crotchet-app";

const AppContext = createContext({
	prefs: {},
	currentPage: "home",
	// eslint-disable-next-line no-unused-vars
	setCurrentPage: (page) => {},
	// eslint-disable-next-line no-unused-vars
	setPref: (key, value) => {},
	dataSources: {},
	// eslint-disable-next-line no-unused-vars
	registerDataSource: (name, source, version) => {},
	user: {
		name: "Walter Kimaro",
		email: "wakyj07@gmail.com",
		preferences: {
			wallpaper: false,
			simpleGrid: true,
		},
	},
});

export const useAppContext = () => {
	return useContext(AppContext);
};

const registerSingleSource = (sources, { search, fieldMap, ...source }) => {
	return {
		...(source.provider == "crotchet" ? sources[source.name] : {}),
		...source,
		fieldMap,
		handler:
			source.provider == "crotchet"
				? sources[source.name]?.handler
				: dataSourceProviders(source),
		...(!search
			? {}
			: {
					...(search.provider == "crotchet"
						? sources[search.name]
						: {}),
					searchFieldMap: search.fieldMap || fieldMap,
					searchHandler:
						search.provider == "crotchet"
							? sources[search.name].handler
							: dataSourceProviders(search),
			  }),
	};
};

const getDefaultDataSources = () => {
	const sources = {};
	const pending = {};

	const processSource = ([name, { search, ...source }]) => {
		const handlerNotSet =
			source.provider == "crotchet" && !sources[source.name];
		const searchHandlerNotSet =
			search?.provider == "crotchet" && !sources[search?.name];

		if (handlerNotSet || searchHandlerNotSet) {
			if (handlerNotSet) {
				if (!pending[source.name]) pending[source.name] = [];
				pending[source.name].push({ name, search, source });
			}

			if (searchHandlerNotSet) {
				if (!pending[search.name]) pending[search.name] = [];
				pending[source.name].push({ name, search, source });
			}

			return;
		}

		sources[name] = registerSingleSource(sources, { search, ...source });

		while (pending[name]?.length) {
			processSource(pending[name].pop());
		}
	};

	Object.entries(defaultDataSources).forEach(processSource);

	return sources;
};

export default function AppProvider({ children }) {
	const [prefs, setPrefs] = useState();
	const dataSourcesRef = useRef(getDefaultDataSources());
	const dataSources = dataSourcesRef.current ?? {};
	const registerDataSource = (name, source) => {
		dataSourcesRef.current[name] = registerSingleSource(
			dataSourcesRef.current,
			source
		);
	};

	useEffect(() => {
		if (!prefs) {
			Preferences.get({ key: "app" }).then(({ value }) => {
				try {
					setPrefs(JSON.parse(value ?? "{}"));
				} catch (error) {
					setPrefs({});
				}
			});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const setPref = (key, value) => {
		setPrefs((prefs) => {
			const newPrefs = { ...prefs, [key]: value };
			Preferences.set({
				key: STORE_KEY,
				value: JSON.stringify(newPrefs),
			});
			return newPrefs;
		});
	};

	if (!prefs) return null;

	return (
		<AppContext.Provider
			value={{
				prefs,
				setPref,
				currentPage: prefs.currentPage ?? "home",
				setCurrentPage: (page) => setPref("currentPage", page),
				dataSources,
				registerDataSource,
				user: {
					name: "Walter Kimaro",
					email: "wakyj07@gmail.com",
					preferences: {
						wallpaper: false,
						simpleGrid: false,
					},
				},
			}}
		>
			{children}
		</AppContext.Provider>
	);
}
