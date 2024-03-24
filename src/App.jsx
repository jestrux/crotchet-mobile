import { BottomNav } from "@/components/BottomNav";
import { SendIntent } from "send-intent";
import { useEffect, useState } from "react";
import clsx from "clsx";
import { Filesystem } from "@capacitor/filesystem";
import { App as CapacitorApp } from "@capacitor/app";
import { onDesktop, useAppContext, usePrefsState } from "@/crotchet";

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

	return <App />;
};

const App = () => {
	const { bottomSheets, openPage } = useAppContext();
	const [currentPage, setCurrentPage] = useState("home");
	const [pinnedApps] = usePrefsState("pinnedApps");

	const listenForShare = async () => {
		try {
			const result = await SendIntent.checkSendIntentReceived();
			if (result?.url) {
				let resultUrl = decodeURIComponent(result.url);
				Filesystem.readFile({ path: resultUrl })
					.then(async (content) => {
						if (
							result.type.includes("jpg") ||
							result.type.includes("png")
						) {
							const image = `data:${decodeURIComponent(
								result.type
							).replace("application", "image")};base64,${
								content.data
							}`;

							openPage({
								// image: "https://images.unsplash.com/photo-1707343848655-a196bfe88861?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxNjE2NXwxfDF8YWxsfDF8fHx8fHwyfHwxNzA4MjQ3MzYwfA&ixlib=rb-4.0.3&q=80&w=1080",
								image: "gradient",
								gradient: "Butterbeer",
								title: "Yo! Check this thing out 🔥",
								content: [
									{
										type: "text",
										value: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Accusantium, animi? Iusto sapiente voluptatibus enim non quis est ipsum impedit quia tempore",
									},
									{
										type: "image",
										// cropped: false,
										value: image,
									},
									{
										type: "text",
										value: "Quas dolorem dolor voluptate eveniet sequi, deserunt voluptates! Lorem ipsum dolor sit amet consectetur adipisicing elit. Accusantium, animi? Iusto sapiente voluptatibus enim non quis est ipsum impedit quia tempore consequatur?",
									},
								],
							});
						}
						// console.log(content.data);
					})
					.catch((err) => alert(JSON.stringify(err)));
			} else if (result?.title?.length) {
				// handleAddEntry({
				// 	url: decodeURIComponent(result.title),
				// 	fromShareSheet: true,
				// });
				// alert(JSON.stringify(result));
			}
		} catch (error) {
			// alert("Share process failed: ", error);
		}
	};

	const listenForOpen = () => {
		CapacitorApp.addListener("appUrlOpen", (event) => {
			const slug = event.url.split("/app").pop();
			if (slug) {
				// alert("App: " + slug);
				alert("App: " + JSON.stringify(new URL(slug)));
			}
		});
	};

	useEffect(() => {
		listenForOpen();

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
