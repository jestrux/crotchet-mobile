import { createContext, useContext, useEffect, useRef, useState } from "react";
import {
	uploadDataUrl,
	dbInsert,
	queryDb,
	getDbTables,
	dbUpdate,
	dbDelete,
} from "@/providers/firebaseApp";
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
	objectFieldChoices,
	readClipboard,
	dispatch,
	onActionClick,
} from "@/crotchet";
import GenericPage from "@/components/Pages/GenericPage";
import SearchPage from "@/components/Pages/SearchPage";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebaseApp";
import { io } from "socket.io-client";
import ActionSheet from "@/components/ActionSheet";
import DesktopApp from "@/DesktopApp";
import BackgroundApp from "@/DesktopApp/BackgroundApp";
import DataPreviewer from "@/components/DataPreviewer";
import ErrorBoundary from "@/components/ErrorBoundary";
import AlertsWrapper from "@/components/Alerts";
import FormPage from "@/components/Pages/FormPage";
import useDataLoader from "../hooks/useDataLoader";
import { getPreference, getThemeProps } from "../utils";

const AppContext = createContext({
	dataSources: {},
	__crotchetApp: {
		name: "Crotchet",
		colors: {
			primary: "#84cc16",
			primaryDark: "#a3e635",
		},
		homePage: null,
	},
	apps: {},
	backgroundApps: {},
	backgroundActions: {},
	remoteApps: {},
	remoteActions: {},
	app: {},
	actions: {},
	automationActions: {},
	// eslint-disable-next-line no-unused-vars
	toggleAppWindow: (status) => {},
	// eslint-disable-next-line no-unused-vars
	openApp: (url) => {},
	closeApp: () => {},
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
	withLoader: (callback, { onChange } = {}) => {},
	// eslint-disable-next-line no-unused-vars
	openChoicePicker: ({ actions, ...payload } = {}) => {},
	// eslint-disable-next-line no-unused-vars
	openPage: ({ image, title, subtitle, content = [], source } = {}) => {},
	// eslint-disable-next-line no-unused-vars
	openSearchPage: ({ title, source, placeholder } = {}) => {},
	// eslint-disable-next-line no-unused-vars
	openForm: ({ title, subtitle, fields, onSubmit } = {}) => {},
	// eslint-disable-next-line no-unused-vars
	openDataPreviewer: ({ title, type, data } = {}) => {},
	// eslint-disable-next-line no-unused-vars
	toggleRemoteApp: (app) => {},
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
	showAlert: ({ title, message, okayText, cancelText, size } = {}) => {},
	// eslint-disable-next-line no-unused-vars
	confirmAction: ({ title, message, okayText, cancelText, size } = {}) => {},
	// eslint-disable-next-line no-unused-vars
	confirmDangerousAction: () => {},
	// eslint-disable-next-line no-unused-vars
	openActionDialog: ({ title, message, okayText, cancelText } = {}) => {},
	// eslint-disable-next-line no-unused-vars
	copyToClipboard: (content) => {},
	// eslint-disable-next-line no-unused-vars
	readClipboard: () => {},
	// eslint-disable-next-line no-unused-vars
	copyImage: (url) => {},
	// eslint-disable-next-line no-unused-vars
	openUrl: (path) => {},
	utils: {},
	// eslint-disable-next-line no-unused-vars
	uploadDataUrl: (content) => {},
	// eslint-disable-next-line no-unused-vars
	getDbTables: () => {},
	// eslint-disable-next-line no-unused-vars
	queryDb: (table, { orderBy, rowId } = {}) => {},
	// eslint-disable-next-line no-unused-vars
	dbInsert: (table, data, { rowId, merge = true }) => {},
	// eslint-disable-next-line no-unused-vars
	dbUpdate: (table, rowId, data, { merge = true }) => {},
	// eslint-disable-next-line no-unused-vars
	dbDelete: (table, rowId) => {},
	// eslint-disable-next-line no-unused-vars
	socketEmit: (event, data) => {},
	// eslint-disable-next-line no-unused-vars
	backgroundToast: (message) => {},
	// eslint-disable-next-line no-unused-vars
	toggleBackgroundApp: (app, value) => {},
	// eslint-disable-next-line no-unused-vars
	backgroundAction: (action, payload) => {},
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
	useDataLoader({
		handler: async () => {
			const theme = await getPreference("crotchet-app-theme", {
				colorScheme: "system",
			});
			const themeProps = getThemeProps(theme);
			window.__crotchet["crotchet-app-theme"] = themeProps;
			dispatch("crotchet-app-theme-set");
		},
		listenForUpdates: "crotchet-app-theme-updated",
	});

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

	const globalActions = ({ share = false, desktopShortcuts } = {}) => {
		return Object.entries(window.__crotchet.actions ?? {})
			.filter(([, action]) => {
				const { global, type, mobileOnly, context } = action;

				if (share) return context == "share";

				if (!global && !(desktopShortcuts && type == "search")) {
					return false;
				}

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
					globalActions({ desktopShortcuts: true }).map(
						({ name, label, shortcut }) => {
							return [name, { label: label.trim(), shortcut }];
						}
					)
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
		return new Promise((resolve) => {
			const _id = randomId();

			setBottomSheets((sheets) => [
				...sheets,
				{ ...sheet, content, minHeight, _id },
			]);

			window.__crotchet._promiseResolvers["bottomsheet-" + _id] = resolve;
		});
	};

	const openShareSheet = ({
		preview,
		title,
		subtitle,
		url,
		image,
		file,
		text,
		download,
		...props
	} = {}) =>
		__crotchet.actionSheets.share.handler({
			preview,
			title,
			subtitle,
			url,
			image,
			file,
			text,
			download,
			...props,
		});

	const openActionSheet = ({ actions, ...payload }, onChange) => {
		const content = (
			<ActionSheet
				noHeading={onDesktop()}
				actions={actions}
				payload={payload}
				onChange={onChange}
				{...(onDesktop()
					? { dismiss: window.__crotchet.desktop.closePage }
					: {})}
			/>
		);

		return onDesktop()
			? openPage({
					...payload,
					type: "list",
					actions,
					content,
			  })
			: openBottomSheet({
					content,
			  });
	};

	const openPage = ({
		background,
		image,
		title,
		content,
		source,
		dismissible,
		fullHeight = false,
		noScroll = false,
		type = "custom",
		...props
	}) => {
		if (onDesktop()) props.dismiss = window.__crotchet.desktop.closePage;

		if (type == "form")
			content = [{ type: "custom", value: <FormPage {...props} /> }];

		let page = (
			<GenericPage
				noHeading={onDesktop()}
				image={image}
				title={title}
				content={content}
				source={source}
				{...props}
			/>
		);

		if (type == "search") {
			if (onDesktop()) props.source = source;
			else {
				page = (
					<SearchPage
						inBottomSheet
						title={title}
						source={source}
						{...props}
					/>
				);
			}
		}

		if (onDesktop()) {
			const pageProps = {
				title,
				type,
				...props,
				background,
				fullHeight,
				noScroll,
				dismissible: dismissible ?? (!fullHeight || noScroll),
				content: page,

				// type: "search",
				// placeholder: source
				// 	? `Search ${camelCaseToSentenceCase(source)}...`
				// 	: "",
				// searchQuery: q ?? query,
				// ...allParams,
			};

			// dispatch("toggle-app", true);

			return window.__crotchet.desktop.openPage(pageProps);
		}

		return openBottomSheet({
			...props,
			background,
			image,
			fullHeight,
			noScroll,
			dismissible: dismissible ?? (!fullHeight || noScroll),
			content: page,
		});
	};

	const openSearchPage = (props) =>
		openPage({ ...props, fullHeight: true, type: "search" });

	const openForm = ({ fullHeight, ...props }) =>
		openPage({
			...props,
			type: "form",
			fullHeight: fullHeight ?? !props.field,
		});

	const openDataPreviewer = ({ title, type, data }) =>
		openPage({
			title,
			content: <DataPreviewer type={type} data={data} />,
		});

	const socketEmit = async (event, data) => {
		const _socket = await window.__crotchet.socket({
			retry: true,
			silent: true,
		});

		if (_socket) _socket.emit(event, data);
	};

	const appContextValue = {
		registerDataSource,
		bottomSheets,
		openBottomSheet,
		openShareSheet,
		openActionSheet,
		withLoader: async (action, props) => {
			const {
				successMessage = "Success!",
				errorMessage = "Unknown Error!",
				onChange = () => {},
			} = typeof props == "string"
				? { successMessage: props }
				: props || {};
			const handleChange = async (status, payload) => {
				let message = { success: successMessage, error: errorMessage }[
					status
				];

				if (typeof message == "function") message = message(payload);
				else if (status == "error" && typeof payload == "string")
					message = payload;

				const isMessageStatus = !["idle", "loading"].includes(status);

				if (onDesktop()) {
					if (isMessageStatus) {
						await window.__crotchet.someTime(20);
						if (!document.body.getAttribute("data-visible"))
							window.__crotchet.backgroundToast(message);
					}

					dispatch("with-loader-status-change", {
						status,
						message,
					});

					onChange(status, payload);
				} else if (isMessageStatus) window.showToast(message);
			};

			let resolve, reject;
			const promise = new Promise((res, rej) => {
				resolve = res;
				reject = rej;
			});

			let response;

			try {
				handleChange("loading");
				response = await onActionClick(action)();
				handleChange("success", response);
				resolve(response);
			} catch (error) {
				response = error?.message || error;
				handleChange("error", response);
				reject(response);
			}

			return promise;
		},
		openChoicePicker: ({ title, choices: _choices }) => {
			return new Promise((resolve) => {
				const actions = async () => {
					const choices = _.isFunction(_choices)
						? await _choices()
						: _choices;

					return objectFieldChoices(choices).map((choice) => {
						const label = utils.camelCaseToSentenceCase(
							choice.label
						);
						return { label, handler: () => resolve(choice.value) };
					});
				};

				openActionSheet({
					preview: { title },
					actions,
				}).then(() => resolve());
			});
		},
		openPage,
		openSearchPage,
		openForm,
		openDataPreviewer,
		toggleRemoteApp: (app) => dispatch("toggle-remote-app", app),
		user: {
			name: "Walter Kimaro",
			email: "wakyj07@gmail.com",
			preferences: {
				wallpaper: false,
				simpleGrid: false,
			},
		},
		showToast,
		showAlert: (...args) => window.showAlert(...args),
		confirmAction: (...args) => window.confirmAction(...args),
		confirmDangerousAction: (...args) =>
			window.confirmDangerousAction(...args),
		openActionDialog: (...args) => window.openActionDialog(...args),
		copyToClipboard,
		readClipboard,
		copyImage,
		openUrl,
		uploadDataUrl,
		getDbTables,
		queryDb,
		dbInsert,
		dbUpdate,
		dbDelete,
		utils,
		socket: ({ retry = false, silent = true } = {}) => {
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

						return null;
					});
			}

			return socket.current;
		},
		socketEmit,
		backgroundToast: (message) => {
			socketEmit("background-action", {
				_action: "toast",
				message,
			});
		},
		toggleBackgroundApp: (app, value) => {
			socketEmit("background-action", {
				_action: "toggle-app",
				app,
				value,
			});
		},
		backgroundAction: async (action, payload = {}) => {
			socketEmit("background-action", {
				_action: action,
				...payload,
			});
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

	Object.assign(
		window,
		_.pick(appContextValue, [
			"registerDataSource",
			"registerAction",
			"registerPage",
			"withLoader",
			"globalActions",
			"openUrl",
			"utils",
		]),
		utils,
		{ openForm: (props) => window.openAlertForm(props) }
	);

	let App;

	if (onDesktop()) {
		App = document.body.classList.contains("is-background-window")
			? BackgroundApp
			: DesktopApp;
	}

	const __crotchetApp = window.__crotchet.__crotchetApp;

	return (
		<AppContext.Provider
			value={{
				...appContextValue,
				__crotchetApp,
				apps: window.__crotchet.apps,
				visibleBackgroundApps: window.__crotchet.visibleBackgroundApps,
				backgroundApps: window.__crotchet.backgroundApps,
				backgroundActions: window.__crotchet.backgroundActions,
				remoteApps: window.__crotchet.remoteApps,
				remoteActions: window.__crotchet.remoteActions,
				actions: window.__crotchet.actions,
				automationActions: window.__crotchet.automationActions,
				dataSources: window.__crotchet.dataSources,
			}}
		>
			<style>
				{
					/*css*/ `
					:root {
						--primary-color: ${Object.values(
							utils
								.tinyColor(__crotchetApp.colors.primary)
								.toRgb()
						)
							.slice(0, 3)
							.join(" ")};
						--primary-dark-color: ${Object.values(
							utils
								.tinyColor(
									__crotchetApp.colors.primaryDark ||
										__crotchetApp.colors.primary
								)
								.toRgb()
						)
							.slice(0, 3)
							.join(" ")};
						--on-primary-color: ${
							utils
								.tinyColor(__crotchetApp.colors.primary)
								.isLight()
								? "0 0 0"
								: "255 255 255"
						};
						--on-primary-inverted-color: ${
							utils
								.tinyColor(__crotchetApp.colors.primary)
								.isLight()
								? "255 255 255"
								: "0 0 0"
						};
					}
				`
				}
			</style>

			<ErrorBoundary
				className="p-6"
				style={{ marginTop: "env(safe-area-inset-top)" }}
				onReset={() => window.location.reload()}
			>
				{App ? (
					<App {...(window.__crotchet.app?.props || {})} />
				) : (
					<>
						{children}

						{bottomSheets.map((sheet) => (
							<BottomSheet
								key={sheet._id}
								open
								{...sheet}
								onClose={() =>
									setTimeout(() => {
										setBottomSheets((sheets) =>
											sheets.filter(
												(s) => s._id != sheet._id
											)
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
					</>
				)}

				<AlertsWrapper />
			</ErrorBoundary>
		</AppContext.Provider>
	);
}
