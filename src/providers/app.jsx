import { Preferences } from "@capacitor/preferences";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import * as defaultDataSources from "./data/defaultDataSources";
import BottomSheet from "@/components/BottomSheet";
import {
	copyToClipboard,
	copyImage,
	randomId,
	showToast,
	onDesktop,
	openUrl,
	shuffle,
	socketEmit,
} from "@/crotchet";
import { dataSourceProviders } from "./data";
import GenericPage from "@/components/Pages/GenericPage";
import SearchPage from "@/components/Pages/SearchPage";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebaseApp";
import { io } from "socket.io-client";

const STORE_KEY = "crotchet-app";

const AppContext = createContext({
	prefs: {},
	currentPage: "home",
	// eslint-disable-next-line no-unused-vars
	setCurrentPage: (page) => {},
	// eslint-disable-next-line no-unused-vars
	setPref: (key, value) => {},
	dataSources: {},
	apps: {},
	actions: {},
	bottomSheets: [],
	// eslint-disable-next-line no-unused-vars
	openBottomSheet: ({ title, subtitle, content, fullHeight } = {}) => {},
	// eslint-disable-next-line no-unused-vars
	openPage: ({ image, title, subtitle, content = [], source } = {}) => {},
	// eslint-disable-next-line no-unused-vars
	openSearchPage: ({ title, source, placeholder } = {}) => {},
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
	// eslint-disable-next-line no-unused-vars
	showToast: (message) => {},
	// eslint-disable-next-line no-unused-vars
	copyToClipboard: (content) => {},
	// eslint-disable-next-line no-unused-vars
	copyImage: (url) => {},
	// eslint-disable-next-line no-unused-vars
	actualSource: (source) => {},
	// eslint-disable-next-line no-unused-vars
	openUrl: (path) => {},
	// eslint-disable-next-line no-unused-vars
	socketEmit: (event, data) => {},
});

export const useAppContext = () => {
	return useContext(AppContext);
};

const registerSingleSource = (sources, { fieldMap, ...source }) => {
	return {
		...(source.provider == "crotchet" ? sources[source.name] : {}),
		...source,
		fieldMap,
		handler:
			source.provider == "crotchet"
				? sources[source.name]?.handler
				: dataSourceProviders(source),
	};
};

const getDefaultDataSources = () => {
	const sources = {};
	const pending = {};

	const processSource = ([name, { ...source }]) => {
		const handlerNotSet =
			source.provider == "crotchet" && !sources[source.name];

		if (handlerNotSet) {
			if (!pending[source.name]) pending[source.name] = [];
			pending[source.name].push({ name, source });

			return;
		}

		const _source = registerSingleSource(sources, source);

		const get = async () => _source.handler();
		const random = () => get().then((res) => shuffle(shuffle(res))[0]);

		sources[name] = {
			..._source,
			get,
			random,
		};

		while (pending[name]?.length) {
			processSource(pending[name].pop());
		}
	};

	Object.entries(defaultDataSources).forEach(processSource);

	return sources;
};

export default function AppProvider({ children }) {
	const socket = useRef();
	const [prefs, setPrefs] = useState();
	const [bottomSheets, setBottomSheets] = useState([]);
	const dataSourcesRef = useRef(getDefaultDataSources());
	const dataSources = dataSourcesRef.current ?? {};
	const actionsRef = useRef();
	const appsRef = useRef();

	const registerDataSource = (name, source) => {
		dataSourcesRef.current[name] = registerSingleSource(
			dataSourcesRef.current,
			source
		);
	};

	const setupSocket = () => {
		if (onDesktop()) {
			setDoc(
				doc(db, "__crotchet", "desktop"),
				{ socket: document.body.getAttribute("data-socket-url") },
				{ merge: true }
			);

			socket.current = {
				connected: true,
				emit: socketEmit,
			};
		} else {
			if (!socket.current) {
				getDoc(doc(db, "__crotchet", "desktop")).then((res) => {
					socket.current = io(res.data().socket);
					setTimeout(() => {
						copyToClipboard(res.data().socket);
						showToast("Socket: " + socket.current.connected);
					}, 3000);
				});
			}
		}
	};

	const setupApps = () => {
		if (!appsRef.current) {
			appsRef.current = window.__crotchet.apps;
		}
	};

	const setupActions = () => {
		// if (!actionsRef.current) {
		actionsRef.current = window.__crotchet.actions;

		if (onDesktop()) {
			socketEmit(
				"add-menu-items",
				Object.fromEntries(
					Object.entries(window.__crotchet.actions).map(
						([key, { label }]) => {
							return [key, { label }];
						}
					)
				)
			);
		}
		// }
	};

	useEffect(() => {
		try {
			setupApps();
			setupActions();
			setupSocket();
		} catch (error) {
			console.log("Socket error: ", error);
		}

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

	const openBottomSheet = ({ minHeight = 250, ...sheet }) => {
		setBottomSheets((sheets) => [
			...sheets,
			{ ...sheet, minHeight, _id: randomId() },
		]);
	};

	const openPage = ({
		image,
		title,
		content,
		source,
		fullHeight = true,
		type = "custom",
		...props
	}) => {
		openBottomSheet({
			...props,
			image,
			fullHeight,
			dismissible: !fullHeight,
			content:
				type == "search" ? (
					<SearchPage title={title} source={source} {...props} />
				) : (
					<GenericPage
						image={image}
						title={title}
						content={content}
						source={source}
						{...props}
					/>
				),
		});
	};

	const openSearchPage = (props) => openPage({ ...props, type: "search" });

	if (!prefs) return null;

	const appContextValue = {
		prefs,
		setPref,
		currentPage: prefs.currentPage ?? "home",
		setCurrentPage: (page) => setPref("currentPage", page),
		dataSources,
		registerDataSource,
		bottomSheets,
		openBottomSheet,
		openPage,
		openSearchPage,
		user: {
			name: "Walter Kimaro",
			email: "wakyj07@gmail.com",
			preferences: {
				wallpaper: false,
				simpleGrid: false,
			},
		},
		showToast,
		copyToClipboard,
		copyImage,
		socket: () => socket.current,
		openUrl,
		socketEmit: (event, data) => {
			if (socket.current) socket.current.emit(event, data);
		},
	};

	if (!appContextValue.actualSource) {
		appContextValue.actualSource = (source) => {
			const crotchetDataSource = dataSources?.[source?.name];
			return source?.provider == "crotchet" && crotchetDataSource
				? crotchetDataSource
				: source;
		};
	}

	Object.assign(window.__crotchet, {
		...appContextValue,
	});

	if (window.__crotchet?.app?.scheme) {
		const App =
			window.__crotchet.apps?.[window.__crotchet.app.scheme]?.open;

		if (App) {
			return (
				<AppContext.Provider
					value={{
						...appContextValue,
						apps: appsRef.current,
						actions: actionsRef.current,
					}}
				>
					<App {...(window.__crotchet.app.props || {})} />
				</AppContext.Provider>
			);
		}
	}

	return (
		<AppContext.Provider
			value={{ ...appContextValue, actions: actionsRef.current }}
		>
			{children}

			{bottomSheets.map((sheet) => (
				<BottomSheet
					key={sheet._id}
					open
					{...sheet}
					peekSize={40}
					onClose={() =>
						setTimeout(() => {
							setBottomSheets((sheets) =>
								sheets.filter((s) => s._id != sheet._id)
							);
						}, 50)
					}
				>
					{sheet.content}
					{/* {({ maxHeight, collapse, ...props }) => (
						<div
							style={{
								minHeight: sheet.fullHeight
									? maxHeight
									: maxHeight * 0.5 + "px",
								overflow: "auto",
							}}
						>
							{Children.map(sheet.content, (child) => {
								if (!child?.type) return null;

								return cloneElement(child, {
									maxHeight,
									collapse,
									...props,
								});
							})}
						</div>
					)} */}
				</BottomSheet>
			))}
		</AppContext.Provider>
	);
}
