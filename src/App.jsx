import { BottomNav } from "@/components/BottomNav";
import { useAppContext } from "@/providers/app";

import Widgets from "@/apps/Widgets";
import { SendIntent } from "send-intent";
import { useEffect } from "react";
import clsx from "clsx";
import { Filesystem } from "@capacitor/filesystem";

const App = () => {
	const { currentPage, bottomSheets, openPage } = useAppContext();
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
										cropped: false,
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
			id="crotchetAppWrapper"
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

			<BottomNav hidden={bottomSheets.length} />
		</div>
	);
};

export default App;
