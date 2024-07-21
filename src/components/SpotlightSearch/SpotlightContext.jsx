/* eslint-disable no-unused-vars */
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { dispatch, randomId } from "@/utils";
import useEventListener from "@/hooks/useEventListener";
import useKeyDetector from "@/hooks/useKeyDetector";
import { useOnInit } from "@/crotchet";

export const SpotlightContext = createContext({
	pierAppData: {},
	spotlightRef: randomId(),
	spotlightCommands: {},
	registerSpotlightCommand: (name, handler) => {},
	spotlightInnerPages: [],
	spotlightSearchVisible: false,
	showSpotlightSearch: () => {},
	hideSpotlightSearch: () => {},
	pushSpotlightPage: (page) => {},
	popCurrentSpotlightPage: (data) => {},
	replaceCurrentSpotlightPage: (page) => {},
	popSpotlightToRoot: () => {},
	addSection: (type) => {},
	editSection: (section) => {},
});

export function SpotlightProvider({ pages, open, children }) {
	const [spotlightRef, setSpotlightRef] = useState(randomId());
	const [pierAppData, setPierAppData] = useState({});
	const [spotlightSearchVisible, setSpotlightSearchVisible] = useState(open);
	const [spotlightInnerPages, setSpotlightInnerPages] = useState(pages || []);
	const spotlightCommands = useRef({});
	const registerSpotlightCommand = (name, handler) => {
		spotlightCommands.current[name] = handler;
	};

	const showSpotlightSearch = () => setSpotlightSearchVisible(true);

	const hideSpotlightSearch = () => {
		dispatch("toggle-app", false);
		window.__crotchet.desktop.visible = false;
	};

	const getNewPage = (page) => {
		let pageResolver;
		const promise = new Promise((resolve) => {
			pageResolver = resolve;
		});
		const id = randomId();

		return [
			{
				...page,
				resolver: pageResolver,
				type: page.type || "search",
				id,
				_id: id,
			},
			promise,
		];
	};

	const pushSpotlightPage = (page) => {
		const [newPage, resolver] = getNewPage(page);

		setSpotlightInnerPages([...spotlightInnerPages, newPage]);

		window.__crotchet.desktop.currentPageId = newPage._id;

		setTimeout(() => {
			dispatch(`open-${window.__crotchet.desktop.currentPageId}`);
		}, 200);

		return resolver;
	};

	window.__crotchet.desktop.openPage = (page) => pushSpotlightPage(page);

	useEventListener("open-page", (_, payload) => pushSpotlightPage(payload));

	useEventListener("close-page", (_, data) => {
		popCurrentSpotlightPage(data);
	});

	const popCurrentSpotlightPage = (data) => {
		const poppedPage = spotlightInnerPages.at(-1);

		if (typeof poppedPage.resolver == "function") poppedPage.resolver(data);

		setSpotlightInnerPages(() => {
			var newPages = spotlightInnerPages.filter(
				(p) => p.id != poppedPage.id
			);
			window.__crotchet.desktop.currentPageId =
				newPages.at(-1)?.id || "root";

			dispatch(`open-${newPages.at(-2)?.id || "root"}`);

			return newPages;
		});

		updateAppData();
	};

	const replaceCurrentSpotlightPage = (page) => {
		const currentPage = spotlightInnerPages.at(-1);
		const [newPage, resolver] = getNewPage(page);

		setSpotlightInnerPages(
			spotlightInnerPages.map((page) =>
				page.id == currentPage.id ? newPage : page
			)
		);

		return resolver;
	};

	const handlePierAppDataChanged = (e) => {
		window.pendingPierAppData = e.detail;
		if (!pierAppData?.app?.id) setPierAppData(e.detail);
	};

	const updateAppData = () => {
		setTimeout(() => {
			if (window.pendingPierAppData) {
				setPierAppData(window.pendingPierAppData);
				setSpotlightRef(randomId());
			}
		}, 200);
	};

	useEffect(() => {
		document.addEventListener(
			"pier:app-data-changed",
			handlePierAppDataChanged,
			false
		);

		return () =>
			document.removeEventListener(
				"pier:app-data-changed",
				handlePierAppDataChanged,
				false
			);
	}, []);

	useKeyDetector({
		key: "Escape",
		action: (e) =>
			dispatch(
				`escape-${window.__crotchet.desktop.currentPageId ?? "root"}`,
				{
					popAll: e.shiftKey,
				}
			),
	});

	useKeyDetector({
		key: "Enter",
		action: () =>
			dispatch(
				`enter-click-${
					window.__crotchet.desktop.currentPageId ?? "root"
				}`
			),
	});

	useKeyDetector({
		key: "Cmd + Enter",
		action: () =>
			dispatch(
				`cmd-enter-click-${
					window.__crotchet.desktop.currentPageId ?? "root"
				}`
			),
	});

	useKeyDetector({
		key: "Cmd + t",
		action: () =>
			dispatch(
				`secondary-action-${
					window.__crotchet.desktop.currentPageId ?? "root"
				}`
			),
	});

	useKeyDetector({
		key: "Cmd + k",
		action: () =>
			dispatch(
				`action-menu-${
					window.__crotchet.desktop.currentPageId ?? "root"
				}`
			),
	});

	useKeyDetector({
		key: "Cmd + P",
		action: () =>
			dispatch(
				`context-menu-${
					window.__crotchet.desktop.currentPageId ?? "root"
				}`
			),
	});

	useKeyDetector({
		key: "ArrowDown",
		action: () =>
			dispatch(
				`navigate-down-${
					window.__crotchet.desktop.currentPageId ?? "root"
				}`
			),
	});

	useKeyDetector({
		key: "ArrowUp",
		action: () =>
			dispatch(
				`navigate-up-${
					window.__crotchet.desktop.currentPageId ?? "root"
				}`
			),
	});

	useOnInit(() => {
		setTimeout(() => dispatch("open-root"), 300);
	});

	const value = {
		pierAppData,
		spotlightRef,
		spotlightCommands: spotlightCommands.current,
		registerSpotlightCommand,
		spotlightInnerPages,
		spotlightSearchVisible,
		showSpotlightSearch,
		hideSpotlightSearch,
		pushSpotlightPage,
		popCurrentSpotlightPage,
		replaceCurrentSpotlightPage,
		popSpotlightToRoot: () => {
			setSpotlightInnerPages([]);
			dispatch("open-root");
			window.__crotchet.desktop.currentPageId = "root";
		},
	};

	return (
		<SpotlightContext.Provider value={value}>
			{children}
		</SpotlightContext.Provider>
	);
}

export function useSpotlightContext() {
	return useContext(SpotlightContext);
}
