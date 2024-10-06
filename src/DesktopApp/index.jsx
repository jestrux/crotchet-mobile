import { useRef, useState } from "react";
import { dispatch, urlQueryParamsAsObject, useAppContext } from "@/crotchet";
import useEventListener from "../hooks/useEventListener";
import clsx from "clsx";
import useKeyDetector from "@/hooks/useKeyDetector";
import SpotlightSearch from "@/components/SpotlightSearch";
import ThemeBg from "@/components/ThemeBg";

export default function DesktopApp() {
	const toastTimerRef = useRef();
	const [toast, setToast] = useState(null);
	const [app, _setApp] = useState(null);
	const { apps, actions, openUrl } = useAppContext();

	const setApp = (app) => {
		window.__crotchet.desktop.app = app;
		_setApp(app);
	};

	window.__crotchet.desktop.showToast = (message) => {
		if (toastTimerRef.current) clearTimeout(toastTimerRef.current);

		setToast(message);

		toastTimerRef.current = setTimeout(() => {
			setToast(null);
		}, 2000);
	};

	window.__crotchet.desktop.openApp = ({ scheme, url }) => {
		const props = urlQueryParamsAsObject(url);

		setApp({
			scheme,
			url,
			props,
		});
	};

	const hideAppWindow = () => {
		dispatch("toggle-app", false);
		window.__crotchet.desktop.visible = false;
	};

	const closeApp = () => {
		if (window.__crotchet.desktop.app) {
			setApp(null);
			dispatch("restore");
		}
	};

	const handleMouseMove = () => {
		if (app) return;
	};

	const handleHideApp = () => {
		if (localStorage.openDevTools) return;
		if (document.body.className.indexOf("get-file-") != -1) return;
		if (window.hideAppTimeout) clearTimeout(window.hideAppTimeout);
		if (!app) window.hideAppTimeout = setTimeout(hideAppWindow, 10);
	};

	useEventListener("focus", () => {
		window.__crotchet.desktop.visible = true;
		if (window.hideAppTimeout) clearTimeout(window.hideAppTimeout);

		document.body.className
			.split(" ")
			.filter((cls) => cls.startsWith("get-file"))
			.forEach((cls) => document.body.classList.remove(cls));
	});

	useEventListener("blur", () => {
		handleHideApp();
	});

	useEventListener("socket", (_, { event, payload } = {}) => {
		if (event == "run-action") {
			try {
				const action = actions[payload];

				if (
					typeof action?.handler == "function" ||
					action?.handler instanceof Promise
				) {
					actions[payload].handler();

					return;
				}
			} catch (error) {
				//
			}

			return;
		}

		if (event == "open-url") {
			try {
				setTimeout(() => {
					openUrl(payload);
				}, 20);
			} catch (error) {
				//
			}

			return;
		}

		if (event == "open-page") return dispatch("open-page", payload);
	});

	useKeyDetector({
		key: "Escape",
		action: () => {
			closeApp();
		},
	});

	const AppScreen = () => {
		const scheme = app?.scheme;
		const props = app?.props;
		const App = apps?.[app?.scheme]?.open;

		if (!App) {
			return (
				<div className="h-screen flex items-center justify-center">
					Unkown app {scheme}
				</div>
			);
		}

		return <App {...(props || {})} />;
	};

	const appTheme = Object.entries(
		_.omit(window.__crotchet["crotchet-app-theme"] || {}, [
			"name",
			"colorScheme",
			"tintColor",
		])
	)
		.map(([key, value]) => `${key}: ${value}`)
		.join("; ");

	return (
		<div
			className="h-screen w-screen text-content pointer-events-auto"
			onMouseMove={handleMouseMove}
		>
			<style>
				{
					/*css*/ `
					:root {
						${appTheme}
					}
				`
				}
			</style>

			<div
				className={clsx("relative h-full", {
					"opacity-0": app?.scheme,
				})}
			>
				<ThemeBg
					className="size-full overflow-hidden"
					onMouseMove={handleMouseMove}
				>
					<SpotlightSearch open={!app?.scheme} />

					<div className="border border-transparent dark:border-content/30 rounded-xl fixed inset-0 pointer-events-none z-50"></div>
				</ThemeBg>
			</div>

			{app?.scheme && (
				<div className="group fixed inset-0 z-10 bg-canvas flex items-center justify-center overflow-hidden">
					<div className="fixed top-0 inset-x-0 z-10 h-14 window-drag-handle flex items-center">
						<button
							className="window-no-drag opacity-0 group-hover:opacity-100 transition-opacity ml-auto mr-3 bg-white text-black shadow border border-content/5 size-7 flex items-center justify-center rounded-full"
							style={{ display: "none" }}
							onClick={() => closeApp()}
						>
							<svg
								className="size-5"
								fill="none"
								viewBox="0 0 24 24"
								strokeWidth="1.5"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M6 18 18 6M6 6l12 12"
								></path>
							</svg>
						</button>
					</div>

					<div className="relative size-full overflow-auto">
						<AppScreen />
					</div>
				</div>
			)}

			{toast && (
				<div className="fixed inline-flex items-center bottom-14 h-7 px-3 z-50 bg-content/85 text-on-content text-xs drop-shadow-sm rounded-full -translate-x-1/2 left-1/2">
					{toast}
				</div>
			)}
		</div>
	);
}
