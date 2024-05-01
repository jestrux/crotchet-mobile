import { useRef, useState } from "react";
import {
	DataWidget,
	Input,
	camelCaseToSentenceCase,
	cleanObject,
	dispatch,
	objectIsEmpty,
	randomId,
	showToast,
	useAppContext,
} from "@/crotchet";
import useEventListener from "../hooks/useEventListener";
import clsx from "clsx";
import GlobalSearch from "../components/GlobalSearch";

const AppPage = ({ page: _page, focused, onClose }) => {
	const pageContent = useRef(null);
	const [inputCache, setInputCache] = useState(randomId());

	const focusInput = () => {
		if (searchbar.current) {
			searchbar.current.classList.add("manual-focus");
			searchbar.current.focus();
		}
	};

	const handleMouseMove = () => {
		focusInput();
	};

	const searchbar = useRef();

	const { apps } = useAppContext();

	const Home = apps.home.main;

	const [page, setPage] = useState(_page);

	const updatePage = (newProps) => {
		setPage((page) => ({
			...page,
			...newProps,
		}));
	};

	const setSearchQuery = (searchQuery) => {
		pageContent.current.scrollTop = 0;
		updatePage({ searchQuery });
	};

	const handleEscape = () => {
		if (page.searchQuery) {
			setInputCache(randomId());
			return setSearchQuery("");
		}

		return onClose();
	};

	return (
		<div
			className="relative border border-transparent dark:border-content/30 rounded-xl bg-canvas/[0.985] size-full overflow-hidden flex flex-col"
			onMouseMove={handleMouseMove}
		>
			<div className="pointer-events-none fixed inset-0 bg-purple-500 opacity-[0.03]"></div>

			<div
				className={
					"window-drag-handle h-14 px-5 flex items-center z-10 relative border-b border-content/10"
				}
			>
				{!page.root && (
					<button
						type="button"
						className="window-no-drag flex-shrink-0 -ml-1.5 mr-2.5 bg-content/10 rounded flex items-center justify-center w-7 h-7"
						onClick={onClose}
					>
						<svg
							className="w-3"
							fill="none"
							viewBox="0 0 24 24"
							strokeWidth={3}
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
							/>
						</svg>
					</button>
				)}

				{page?.type != "search" && page?.title && (
					<span className="w-full text-base font-bold">
						{page?.title || "Create Quicklink"}
					</span>
				)}

				{focused && (
					<Input
						key={inputCache}
						ref={searchbar}
						autoFocus
						className={clsx(
							"command-prompt-input bg-transparent backdrop-blur-sm size-full text-lg outline-none placeholder:text-content/25",
							page?.type != "search" && "opacity-0"
						)}
						type="text"
						placeholder={page.placeholder || "Type to search..."}
						value={page.searchQuery}
						onChange={setSearchQuery}
						debounce={page.debounce}
						onEscape={handleEscape}
						onFocus={(e) => {
							const el = e.target;

							if (
								_page.searchQuery &&
								!el.classList.contains("initial-render")
							)
								return el.classList.add("initial-render");

							if (el.classList.contains("manual-focus"))
								return el.classList.remove("manual-focus");

							if (page.searchQuery) el.select();
						}}
					/>
				)}
			</div>

			<div ref={pageContent} className="flex-1 overflow-auto">
				{page?.root && (
					<>
						<div
							className={
								page.searchQuery
									? "absolute opacity-0 pointer-events-none"
									: ""
							}
						>
							<Home />
						</div>

						{page.searchQuery && (
							<GlobalSearch searchQuery={page.searchQuery} />
						)}
					</>
				)}

				{!page?.root &&
					(page?.source ? (
						<div className="p-4">
							<DataWidget
								{...page}
								searchQuery={page.searchQuery}
								widgetProps={{ noPadding: true }}
							/>
						</div>
					) : (
						page.content
					))}
			</div>
		</div>
	);
};

export default function DesktopApp() {
	const rootPage = {
		_id: randomId(),
		root: true,
		liveSearch: true,
		type: "search",
		title: "",
		placeholder: "Search for apps, commands and automations...",
		searchQuery: "",
	};

	const toastTimerRef = useRef();
	const [toast, setToast] = useState(null);
	const [pages, setPages] = useState([rootPage]);
	const page = pages.at(-1);
	const [app, _setApp] = useState(null);
	const { apps, actions, dataSources, openUrl } = useAppContext();

	const setApp = (app) => {
		window.__crotchet.desktop.app;

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
		const { searchParams } = new URL(`crotchet://app${url}`);

		setApp({
			scheme,
			url,
			props: Object.fromEntries(searchParams.entries()),
		});
	};

	window.__crotchet.desktop.openPage = (props) => {
		props._id = randomId();

		if (objectIsEmpty(props)) return;

		if (app) closeApp();

		setPages((pages) => [...pages, cleanObject(props)]);
	};

	const closePage = () => {
		if (page.root) {
			if (!app) hideAppWindow();

			return;
		}

		setPages((pages) => pages.filter((p, i) => i != pages.length - 1));
	};

	window.__crotchet.desktop.closePage = () => dispatch("close-page");

	const popToRoot = () => {
		setPages((pages) => [pages[0]]);
	};

	const hideAppWindow = () => {
		if (app) closeApp();

		dispatch("toggle-app", false);
	};

	const closeApp = () => {
		setApp(null);
		dispatch("restore");
	};

	const handleMouseMove = () => {
		if (app) return;
	};

	useEventListener("focus", () => {
		if (window.hideAppTimeout) clearTimeout(window.hideAppTimeout);

		// setTimeout(() => {
		// 	if (!app) dispatch("restore");
		// }, 500);
	});

	useEventListener("close-page", () => {
		closePage();
	});

	useEventListener("blur", () => {
		if (window.hideAppTimeout) clearTimeout(window.hideAppTimeout);

		if (!app) window.hideAppTimeout = setTimeout(hideAppWindow, 10);
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
				// showToast("Open: " + payload.substring(0, 25) + "...");
				setTimeout(() => {
					openUrl(payload);
				}, 20);
			} catch (error) {
				//
			}

			return;
		}

		if (event == "open-page") {
			const { page, ...pageProps } = payload || {};

			if (page == "search") {
				const { q, query, source } = pageProps;
				const actualSource = dataSources[source];

				if (!actualSource) {
					console.log(payload, dataSources);
					return showToast(`Invalid data source ${source}`);
				}

				const searchProps = actualSource.searchProps
					? actualSource.searchProps
					: {};

				window.__crotchet.desktop.openPage({
					type: "search",
					...searchProps,
					placeholder: source
						? `Search ${camelCaseToSentenceCase(source)}...`
						: "",
					searchQuery: q ?? query,
					...payload,
					source: actualSource,
				});

				return;
			}
		}
	});

	useEventListener("keydown:Escape", (e) => {
		if (app) closeApp();
		else if (e.shiftKey) {
			if (!page.root) popToRoot();
		}
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

	return (
		<div
			className="h-screen w-screen text-content pointer-events-auto"
			onMouseMove={handleMouseMove}
		>
			<div
				className={clsx("relative h-full", {
					"opacity-0": app?.scheme,
				})}
			>
				{pages.map((page) => {
					const focused = page._id == pages.at(-1)._id;

					return (
						<div
							key={page._id}
							className={clsx("absolute inset-0", {
								"opacity-0 pointer-events-none": !focused,
							})}
						>
							<AppPage
								page={page}
								focused={focused && !app}
								onClose={closePage}
							/>
						</div>
					);
				})}
			</div>

			{app?.scheme && (
				<div className="group fixed inset-0 z-10 bg-canvas flex items-center justify-center overflow-hidden">
					<div className="fixed top-0 inset-x-0 z-10 h-14 window-drag-handle flex items-center">
						<button
							className="window-no-drag opacity-0 group-hover:opacity-100 transition-opacity ml-auto mr-3 bg-white text-black shadow border border-content/5 size-7 flex items-center justify-center rounded-full"
							style={{ display: "none" }}
							onClick={closeApp}
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
				<div className="fixed inline-flex items-center bottom-12 h-8 px-3.5 z-50 bg-content/80 text-canvas text-sm drop-shadow-sm rounded-full -translate-x-1/2 left-1/2">
					{toast}
				</div>
			)}
		</div>
	);
}
