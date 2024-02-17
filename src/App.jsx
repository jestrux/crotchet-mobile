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

				{/* <div className="grid grid-cols-2 gap-4 p-4˝">
					<WidgetWrapper columnSpan={1}>
						<Widget title="Airtable | Pings">
							<DataFetcher
								source={dataSource.airtable({
									table: "pings",
									filters: {
										recepient_name: user.name,
									},
								})}
								first
							>
								{({ shuffle, ...res }) => {
									return (
										<div className="flex flex-col gap-3">
											{res.isLoading && "Loading..."}
											{res?.data?.sender_name}
											<img
												className="w-16 aspect-square rounded-full object-cover"
												src={res?.data?.sender_image}
												alt=""
											/>
											<button onClick={shuffle}>
												Shuffle
											</button>
										</div>
									);
								}}
							</DataFetcher>
						</Widget>
					</WidgetWrapper>

					<WidgetWrapper columnSpan={1}>
						<Widget title="Firebase - YT Clips">
							<DataFetcher
								source={dataSource.firebase({
									collection: "videos",
									orderBy: "updatedAt,desc",
								})}
								first
							>
								{({ shuffle, ...res }) => {
									return (
										<div className="flex flex-col gap-3">
											{res.isLoading && "Loading..."}
											{res?.data?.name}
											<img
												className="w-full aspect-video object-cover"
												src={res?.data?.poster}
												alt=""
											/>

											<button onClick={shuffle}>
												Shuffle
											</button>
										</div>
									);
								}}
							</DataFetcher>
						</Widget>
					</WidgetWrapper>

					<WidgetWrapper columnSpan={1}>
						<Widget title="Web - Unsplash">
							<DataFetcher
								source={dataSource.web({
									// url: "https://api.unsplash.com/search/photos",
									url: "https://api.unsplash.com/photos/random",
									body: {
										client_id: import.meta.env
											.VITE_unsplashClientId,
										count: 24,
										// query: "girl",
										// per_page: 24,
									},
									// responseField: "results",
								})}
								first
							>
								{({ shuffle, ...res }) => {
									return (
										<div className="flex flex-col gap-3">
											{res.isLoading && "Loading..."}
											{res?.data?.alt_description}
											<img
												className="w-full aspect-video object-cover"
												src={res?.data?.urls?.regular}
												alt=""
											/>
											<button onClick={shuffle}>
												Shuffle
											</button>
										</div>
									);
								}}
							</DataFetcher>
						</Widget>
					</WidgetWrapper>

					<WidgetWrapper columnSpan={1}>
						<Widget title="SQL - Renters">
							<DataFetcher
								source={dataSource.sql({
									query: "SELECT * from renter",
								})}
								first
							>
								{({ shuffle, ...res }) => {
									return (
										<div className="flex flex-col gap-3">
											{res.isLoading && "Loading..."}
											{res.data?.name}
											<img
												className="w-full aspect-video object-cover"
												src={res?.data?.image}
												alt=""
											/>
											<button onClick={shuffle}>
												Shuffle
											</button>
										</div>
									);
								}}
							</DataFetcher>
						</Widget>
					</WidgetWrapper>
				</div> */}
			</div>

			<BottomNav />
		</div>
	);
};

export default App;
