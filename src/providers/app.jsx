import { Preferences } from "@capacitor/preferences";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import BottomSheet from "@/components/BottomSheet";
import {
	copyToClipboard,
	copyImage,
	randomId,
	showToast,
	onDesktop,
	openUrl,
	registerDataSource,
	socketEmit,
} from "@/crotchet";
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
	pinnedApps: [],
	actions: {},
	// eslint-disable-next-line no-unused-vars
	globalActions: () => {},
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
	openUrl: (path) => {},
	// eslint-disable-next-line no-unused-vars
	socketEmit: (event, data) => {},
	socketConnected: () => {},
	onDesktop: () => {},
});

export const useAppContext = () => {
	return useContext(AppContext);
};

const getSocket = () => {
	return new Promise((resolve, reject) => {
		try {
			getDoc(doc(db, "__crotchet", "desktop")).then((res) => {
				const url = res.data().socket;
				const _socket = io(url);
				const ackTimeout = setTimeout(() => {
					_socket.close();
					reject("Socket connection timed out");
				}, 2000);

				_socket.on("connect", () => {
					clearTimeout(ackTimeout);
					resolve(_socket);
				});
			});
		} catch (error) {
			console.log("Socket connect error: ", error);
			reject(error);
		}
	});
};

export default function AppProvider({ children }) {
	const socket = useRef();
	const [prefs, setPrefs] = useState();
	const [bottomSheets, setBottomSheets] = useState([]);

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
			if (!socket.current?.connected) {
				getSocket()
					.then((_socket) => {
						socket.current = _socket;
						console.log("Socket connected");
						showToast("Desktop connected");
						return _socket;
					})
					.catch((e) => {
						console.log(e);
					});
			}
		}
	};

	const globalActions = () => {
		return Object.entries(window.__crotchet.actions ?? {})
			.filter(
				([, { global, mobileOnly }]) =>
					![!global, mobileOnly && onDesktop()].includes(true)
			)
			.map(([, value]) => value);
	};

	const setupActions = () => {
		// if (!actionsRef.current) {
		if (onDesktop()) {
			socketEmit(
				"add-menu-items",
				Object.fromEntries(
					globalActions().map(({ name, label }) => {
						return [name, { label }];
					})
				)
			);
		}
		// }
	};

	useEffect(() => {
		try {
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
					<SearchPage
						inBottomSheet
						title={title}
						source={source}
						{...props}
					/>
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
		openUrl,
		socket: ({ retry = false } = {}) => {
			if (!socket.current?.connected && retry) {
				return getSocket()
					.then((_socket) => {
						socket.current = _socket;
						console.log("Connected");
						showToast("Desktop connected");
						return _socket;
					})
					.catch((e) => {
						console.log(e);
						showToast("Desktop connect failed");
					});
			}

			return socket.current;
		},
		socketEmit: async (event, data) => {
			const _socket = await socket({ retry: true });
			if (_socket) _socket.emit(event, data);
		},
		onDesktop,
		socketConnected: () => {
			return socket.current?.connected;
		},
		globalActions,
	};

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
						apps: window.__crotchet.apps,
						pinnedApps: window.__crotchet.pinnedApps,
						actions: window.__crotchet.actions,
						dataSources: window.__crotchet.dataSources,
					}}
				>
					<App {...(window.__crotchet.app.props || {})} />
				</AppContext.Provider>
			);
		}
	}

	return (
		<AppContext.Provider
			value={{
				...appContextValue,
				apps: window.__crotchet.apps,
				pinnedApps: window.__crotchet.pinnedApps,
				actions: window.__crotchet.actions,
				dataSources: window.__crotchet.dataSources,
			}}
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
