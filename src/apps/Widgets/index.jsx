import ListWidget from "@/components/ListWidget";
import WidgetWrapper from "@/components/WidgetWrapper";
import ReaderWidget from "../Reader";
import Widget from "@/components/Widget";
import { useAppContext } from "@/providers/app";
import { useAirtableFetch } from "@/providers/airtable/useAirtable";
import MusicWidget from "./MusicWidget";
import TimerWidget from "./TimerWidget";
import FirebaseListWidget from "@/providers/firebase/FirebaseListWidget";
import useWeb from "@/providers/web/useWeb";
import GenericListWidget from "@/components/ListWidget/GenericListWidget";
import useFirebase from "@/providers/firebase/useFirebase";
import { toHms } from "@/utils";

const PingsWidget = () => {
	const { user } = useAppContext();
	const { data } = useAirtableFetch({
		table: "pings",
		filters: {
			recepient_name: user.name,
		},
	});

	return (
		<Widget>
			<div className="h-full flex items-center">
				<div className="ml-1 mr-2 font-semibold">Recent pings</div>
				<div className="flex-1 flex justify-end items-center space-x-2">
					{data?.map(({ sender_image }, i) => {
						return (
							<div
								key={i}
								className="w-10 h-10 rounded-full bg-content/10 border border-content/10 relative"
								style={{ zIndex: data.length - i }}
							>
								<img
									className="rounded-full object-cover w-full h-full z-10"
									src={sender_image}
									alt=""
								/>

								<img
									className="scale-105 opacity-25 -bottom-1 blur absolute rounded-full object-cover w-full h-full"
									src={sender_image}
									alt=""
								/>
							</div>
						);
					})}
				</div>
			</div>
		</Widget>
	);
};

export default function Widgets() {
	const photoSearch = useWeb({
		url: "https://api.unsplash.com/search/photos",
		body: {
			client_id: import.meta.env.VITE_unsplashClientId,
			query: "girl",
			per_page: 24,
		},
		responseField: "results",
	});

	const videoList = useFirebase({
		collection: "videos",
		orderBy: "updatedAt,desc",
		image: "poster",
	});

	return (
		<div className="p-3 grid items-start grid-cols-2 gap-3">
			<WidgetWrapper aspectRatio={5 / 1} widget={PingsWidget} />

			<WidgetWrapper
				columnSpan="1"
				aspectRatio="1/1"
				widget={TimerWidget}
			/>

			<WidgetWrapper columnSpan="1" aspectRatio="1/1">
				<GenericListWidget
					{...photoSearch}
					title="alt_description"
					subtitle="description"
					image="urls.regular"
					action="urls.full"
					widgetProps={{
						icon: "image",
						title: "Image",
						actions: [
							{
								icon: "shuffle",
								onClick() {
									alert("Shuffle");
								},
							},
							// {
							// 	icon: "share",
							// 	onClick() {
							// 		alert("share now");
							// 	},
							// },
							{
								icon: "search",
								onClick() {
									alert("Search now");
								},
							},
						],
					}}
				/>
			</WidgetWrapper>

			<WidgetWrapper columnSpan="1" aspectRatio="1/1">
				<GenericListWidget
					{...videoList}
					widgetProps={{
						noPadding: true,
						// icon: "image",
						title: "Yt Clips",
						icon: (
							<svg
								className="w-3.5"
								viewBox="0 0 24 24"
								fill="currentColor"
							>
								<path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
								{/* <path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z"
								/> */}
							</svg>
						),
						actions: [
							{
								icon: "shuffle",
								onClick() {
									alert("Shuffle");
								},
							},
							{
								// icon: "play",
								icon: (
									<svg
										className="w-3.5"
										fill="none"
										viewBox="0 0 24 24"
										strokeWidth={1.5}
										stroke="currentColor"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
										/>
									</svg>
								),
								onClick() {
									alert("Play");
								},
							},
						],
					}}
				>
					{([video]) => (
						<a
							href={video.url}
							target="_blank"
							className="w-full h-full flex flex-col"
							rel="noreferrer"
						>
							<div className="flex-1 relative bg-black">
								<img
									className="flex-1 absolute inset-0 w-full h-full object-cover rounded"
									src={video.poster}
									alt=""
								/>

								<div className="absolute inset-0 bg-black/50 flex items-center justify-center">
									<div className="relative w-8 h-8 flex items-center justify-center rounded-full overflow-hidden bg-card">
										<div className="absolute inset-0 bg-content/60"></div>
										<svg
											className="w-4 ml-0.5 relative text-canvas"
											viewBox="0 0 24 24"
											fill="currentColor"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z"
											/>
										</svg>
									</div>
								</div>
							</div>

							<div className="flex flex-col gap-1.5 p-3 pt-2.5">
								<div className="truncate text-sm/none font-semibold">
									{video.name}
								</div>
								<div className="truncate text-xs/none opacity-70 flex items-center">
									{video.crop
										.map((s) => toHms(s))
										.join(" - ")}
									<span className="inline-block mx-2 w-1 h-1 bg-current rounded-full"></span>
									{toHms(video.duration)}
								</div>
							</div>
						</a>
					)}
				</GenericListWidget>
			</WidgetWrapper>

			<WidgetWrapper
				columnSpan="1"
				aspectRatio="1 / 1"
				widget={MusicWidget}
			/>

			<WidgetWrapper aspectRatio={2 / 1} widget={ReaderWidget} />

			<WidgetWrapper aspectRatio={2 / 1}>
				<ListWidget
					table="performance"
					image="user_image"
					title="user_name"
					subtitle="user_department::billed"
					progress="progress"
					filters={
						{
							// user_name: "!" + user.name,
						}
					}
					widgetProps={{
						title: "Perf",
						icon: (
							<svg
								fill="none"
								viewBox="0 0 24 24"
								strokeWidth="2"
								stroke="currentColor"
								className="w-3.5 h-3.5"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941"
								/>
							</svg>
						),
					}}
				/>
			</WidgetWrapper>
		</div>
	);
}
