/* eslint-disable no-unused-vars */
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { dispatch, randomId } from "@/utils";
import useEventListener from "@/hooks/useEventListener";

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

		return [
			{
				...page,
				resolver: pageResolver,
				type: page.type || "search",
				id: randomId(),
			},
			promise,
		];
	};

	const pushSpotlightPage = (page) => {
		const [newPage, resolver] = getNewPage(page);

		setSpotlightInnerPages([...spotlightInnerPages, newPage]);

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

		setSpotlightInnerPages(
			spotlightInnerPages.filter((p) => p.id != poppedPage.id)
		);

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
			updateAppData();
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
