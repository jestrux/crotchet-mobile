import { BottomNav } from "@/components/BottomNav";
import { useAppContext } from "@/providers/app";

import Widgets from "@/apps/Widgets";
import { SendIntent } from "send-intent";
import { useEffect } from "react";
import clsx from "clsx";

const App = () => {
	const { currentPage } = useAppContext();

	const listenForShare = async () => {
		try {
			const result = await SendIntent.checkSendIntentReceived();
			if (result?.title?.length) {
				// handleAddEntry({
				// 	url: decodeURIComponent(result.title),
				// 	fromShareSheet: true,
				// });
				alert(JSON.stringify(result));
			}
		} catch (error) {
			alert("Share process failed: ", error);
		}
	};

	useEffect(() => {
		listenForShare();

		window.addEventListener("sendIntentReceived", listenForShare, false);

		return () => {
			window.removeEventListener(
				"sendIntentReceived",
				listenForShare,
				false
			);
		};
	}, []);

	return (
		<div
			className="h-[100dvh] overflow-auto relative"
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

			<div className="relative">
				{/* {currentPage == "home" && <Widgets />} */}
				<div
					className={clsx({
						"opacity-0 pointer-events-none": currentPage != "home",
					})}
				>
					<Widgets />
				</div>
			</div>

			<BottomNav />
		</div>
	);
};

export default App;
