import { BottomNav } from "@/components/BottomNav";
import { SendIntent } from "send-intent";
import { useEffect, useState } from "react";
import clsx from "clsx";
import { Filesystem } from "@capacitor/filesystem";
import { App as CapacitorApp } from "@capacitor/app";
import {
	getLinksFromText,
	objectIsEmpty,
	objectTake,
	onDesktop,
	useAppContext,
	usePrefsState,
} from "@/crotchet";

const AppScreen = ({ scheme }) => {
	const { apps } = useAppContext();
	const App = apps?.[scheme]?.main;

	if (!App) {
		return (
			<div className="h-screen flex items-center justify-center">
				Unkown app {scheme}
			</div>
		);
	}

	// return (
	// 	<div
	// 		style={{
	// 			paddingTop: "env(safe-area-inset-top)",
	// 			paddingBottom: "env(safe-area-inset-bottom)",
	// 		}}
	// 	>
	// 		<GlobalSearch />
	// 	</div>
	// );

	return <App />;
};

const App = () => {
	const { bottomSheets, openShareSheet } = useAppContext();
	const [currentPage, setCurrentPage] = useState("home");
	const [pinnedApps] = usePrefsState("pinnedApps");

	const listenForShare = async () => {
		try {
			const result = await SendIntent.checkSendIntentReceived();

			if (!result.url && !result.title) return;

			let resultUrl = decodeURIComponent(result.url || result.title);
			let [, resultType] = decodeURIComponent(result.type).split("/");
			let payload = {
				incoming: true,
			};

			if (resultType == "plain") {
				if (result.url) payload.url = result.url;
				else {
					payload.text = resultUrl;
					payload.url = getLinksFromText(resultUrl, true);
				}
			} else if (["jpg", "png"].includes(resultType)) {
				payload.title = resultUrl.split("/").at(-1).split(".").at(0);
				payload.subtitle = `image/${resultType}`;
				payload.image = await Filesystem.readFile({
					path: resultUrl,
				}).then(
					async (content) =>
						`data:image/${resultType};base64,${content.data}`
				);
			} else if (["pdf"].includes(resultType)) {
				payload.title = resultUrl.split("/").at(-1).split(".").at(0);
				payload.subtitle = `document/${resultType}`;
				payload.file = await Filesystem.readFile({
					path: resultUrl,
				}).then(
					async (content) =>
						`data:application/${resultType};base64,${content.data}`
				);
			}

			if (
				objectIsEmpty(
					objectTake(payload, ["text", "image", "url", "file"])
				)
			)
				return;

			openShareSheet(payload);
		} catch (error) {
			// alert("Share error: " + error);
		}
	};

	// eslint-disable-next-line no-unused-vars
	const listenForOpen = () => {
		CapacitorApp.addListener("appUrlOpen", (event) => {
			const slug = event.url.split("/app").pop();
			if (slug) {
				alert(
					"App: " +
						JSON.stringify(
							Object.fromEntries(
								new URL(slug).searchParams.entries()
							)
						)
				);
			}
		});
	};

	useEffect(() => {
		// listenForOpen();

		listenForShare();

		window.addEventListener("sendIntentReceived", listenForShare, false);

		return () => {
			window.removeEventListener(
				"sendIntentReceived",
				listenForShare,
				false
			);

			CapacitorApp.removeAllListeners();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const BottomNavPlaceholder = () => {
		return <div style={{ height: 60 }}>&nbsp;</div>;
	};

	return (
		<div
			id="crotchetAppWrapper"
			className="h-screen overflow-hidden"
			style={{
				paddingTop: "env(safe-area-inset-top)",
				paddingBottom: "env(safe-area-inset-bottom)",
			}}
		>
			<div className="pointer-events-none">
				<div
					className="dark:hidden bg-cover fixed inset-0 blur-xl"
					style={{
						"--tw-blur": "blur(380px)",
						backgroundImage: `url(img/light-wallpaper.jpg)`,
					}}
				></div>

				<div
					className="hidden dark:block bg-cover fixed inset-0 blur-xl"
					style={{
						"--tw-blur": "blur(150px)",
						backgroundImage: `url(img/dark-wallpaper.jpg)`,
					}}
				></div>

				<div
					className="fixed z-50 bg-canvas/5 inset-x-0 top-0 backdrop-blur-sm"
					style={{
						"--tw-backdrop-blur": "blur(1px)",
						height: "env(safe-area-inset-top)",
					}}
				></div>
			</div>

			{(pinnedApps || ["", "home", ""]).map((app, index) => (
				<div
					key={app + index}
					className={clsx("fixed inset-0 overflow-auto", {
						"opacity-0 pointer-events-none": currentPage != app,
					})}
				>
					<AppScreen scheme={app} />
					<BottomNavPlaceholder />
				</div>
			))}

			<div className="lg:hidden">
				{!onDesktop() && (
					<BottomNav
						{...{
							pinnedApps,
							currentPage,
							setCurrentPage,
						}}
						hidden={bottomSheets.length}
					/>
				)}
			</div>
		</div>
	);
};

export default App;
