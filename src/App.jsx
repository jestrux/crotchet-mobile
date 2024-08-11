import { SendIntent } from "send-intent";
import { useEffect } from "react";
import { Filesystem } from "@capacitor/filesystem";
import { App as CapacitorApp } from "@capacitor/app";
import {
	getLinksFromText,
	isValidUrl,
	objectIsEmpty,
	openUrl,
	useAppContext,
} from "@/crotchet";
import CrotchetHomePage from "./MobileApp/CrotchetHomePage";
import AppScaffold from "./MobileApp/AppScaffold";

const App = () => {
	const { __crotchetApp } = useAppContext();
	const handleShareIntent = async (result, fromOpen) => {
		if (window.shareTimeout) {
			clearTimeout(window.shareTimeout);
			window.shareTimeout = null;
		}

		try {
			if (!fromOpen) {
				result = await SendIntent.checkSendIntentReceived();

				if (!result.url?.length && !result.title?.length) {
					if (window.openTimeout) {
						clearTimeout(window.openTimeout);
						window.openTimeout = null;
					}

					return;
				}
			}

			let resultUrl = decodeURIComponent(result.url || result.title);
			let [, resultType] = decodeURIComponent(result.type).split("/");
			let payload = {
				incoming: true,
				type: resultType,
			};
			let preview = {
				image: null,
				title: null,
				subtitle: null,
			};

			if (resultType == "plain") {
				preview.subtitle = resultUrl;

				if (isValidUrl(resultUrl)) payload.url = resultUrl;
				else {
					payload.text = resultUrl;
					payload.url = getLinksFromText(resultUrl, true);
				}
			} else if (["jpg", "png"].includes(resultType)) {
				preview.title = resultUrl.split("/").at(-1).split(".").at(0);
				preview.subtitle = `image/${resultType}`;
				preview.type = `image/${resultType}`;
				var file = await Filesystem.readFile({
					path: resultUrl,
				}).then(
					async (content) =>
						`data:image/${resultType};base64,${content.data}`
				);
				payload.file = file;
				preview.image = file;
			} else if (["pdf"].includes(resultType)) {
				preview.title = resultUrl.split("/").at(-1).split(".").at(0);
				preview.subtitle = `document/${resultType}`;
				payload.type = `document/${resultType}`;
				payload.file = await Filesystem.readFile({
					path: resultUrl,
				}).then(
					async (content) =>
						`data:application/${resultType};base64,${content.data}`
				);
			}

			if (
				objectIsEmpty(_.pick(payload, ["text", "image", "url", "file"]))
			)
				return;

			setTimeout(() => {
				window.openActionSheet({
					inset: false,
					title: "Select an action",
					payload,
					preview: !objectIsEmpty(preview) ? preview : null,
				});
			}, 300);
		} catch (error) {
			// alert("Share error: " + error);
		}
	};

	// eslint-disable-next-line no-unused-vars
	const listenForOpen = () => {
		CapacitorApp.addListener("appUrlOpen", async (event) => {
			const result = await SendIntent.checkSendIntentReceived();

			if (
				result.url?.length ||
				result.title?.length ||
				result.description?.length
			) {
				handleShareIntent(result, true);
				return;
			}

			if (window.openTimeout) {
				clearTimeout(window.openTimeout);
				window.openTimeout = null;
			}

			try {
				window.openTimeout = setTimeout(async () => {
					openUrl(decodeURIComponent(event.url));
				}, 10);
			} catch (error) {
				// alert("Error: " + error);
			}
		});
	};

	useEffect(() => {
		listenForOpen();

		handleShareIntent();

		window.addEventListener("sendIntentReceived", handleShareIntent, false);

		return () => {
			window.removeEventListener(
				"sendIntentReceived",
				handleShareIntent,
				false
			);

			CapacitorApp.removeAllListeners();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	if (__crotchetApp.homePage)
		return <AppScaffold rootPage={__crotchetApp.homePage} />;

	return <CrotchetHomePage />;
};

export default App;
