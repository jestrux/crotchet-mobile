import { createContext, useContext, useEffect, useRef, useState } from "react";
import BottomSheet from "@/components/BottomSheet";
import {
	copyToClipboard,
	copyImage,
	randomId,
	showToast,
	onDesktop,
	openUrl,
	utils,
	registerDataSource,
	socketEmit,
	getShareUrl,
} from "@/crotchet";
import GenericPage from "@/components/Pages/GenericPage";
import SearchPage from "@/components/Pages/SearchPage";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebaseApp";
import { io } from "socket.io-client";
import ActionSheet from "@/components/ActionSheet";

const AppContext = createContext({
	dataSources: {},
	apps: {},
	actions: {},
	// eslint-disable-next-line no-unused-vars
	globalActions: (filters = { share: false }) => {},
	bottomSheets: [],
	// eslint-disable-next-line no-unused-vars
	openBottomSheet: ({ title, subtitle, content, fullHeight } = {}) => {},
	// eslint-disable-next-line no-unused-vars
	openShareSheet: ({ text, image, url } = {}) => {},
	// eslint-disable-next-line no-unused-vars
	openActionSheet: ({ actions, ...payload } = {}) => {},
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
	utils: {},
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
						return _socket;
					})
					.catch((e) => {
						console.log(e);
					});
			}
		}
	};

	const globalActions = ({ share = false } = {}) => {
		return Object.entries(window.__crotchet.actions ?? {})
			.filter(([, action]) => {
				const { global, mobileOnly, context } = action;

				if (share) return context == "share";

				if (!global) return false;

				if (mobileOnly && onDesktop()) return false;

				return true;
			})
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
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const openBottomSheet = ({ minHeight = 250, content, ...sheet }) => {
		setBottomSheets((sheets) => [
			...sheets,
			{ ...sheet, content, minHeight, _id: randomId() },
		]);
	};

	const openShareSheet = ({
		preview,
		title,
		subtitle,
		url,
		image,
		text,
		download,
		...props
	} = {}) =>
		openUrl(
			getShareUrl({
				preview,
				title,
				subtitle,
				url,
				image,
				text,
				download,
				...props,
			})
		);

	const openActionSheet = ({ actions, ...payload }, onChange) =>
		openBottomSheet({
			content: (
				<ActionSheet
					actions={actions}
					payload={payload}
					onChange={onChange}
				/>
			),
		});

	const openPage = ({
		background,
		image,
		title,
		content,
		source,
		fullHeight = true,
		noScroll = false,
		type = "custom",
		...props
	}) => {
		openBottomSheet({
			...props,
			background,
			image,
			fullHeight,
			noScroll,
			dismissible: !fullHeight || noScroll,
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

	const appContextValue = {
		registerDataSource,
		bottomSheets,
		openBottomSheet,
		openShareSheet,
		openActionSheet,
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
		utils,
		socket: ({ retry = false, silent = false } = {}) => {
			if (!socket.current?.connected && retry) {
				return getSocket()
					.then((_socket) => {
						socket.current = _socket;

						console.log("Socket connected");

						if (!silent) showToast("Desktop connected");

						return _socket;
					})
					.catch((e) => {
						console.log(e);

						if (!silent) showToast("Desktop connect failed");
					});
			}

			return socket.current;
		},
		socketEmit: async (event, data) => {
			const _socket = await window.__crotchet.socket({
				retry: true,
				silent: true,
			});

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
