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

	return (
		<div className="p-3 grid items-start grid-cols-2 gap-3">
			<WidgetWrapper aspectRatio={5 / 0.8} widget={PingsWidget} />

			<WidgetWrapper
				columnSpan="1"
				aspectRatio="1/0.8"
				widget={TimerWidget}
			/>

			<WidgetWrapper columnSpan="1" aspectRatio="1/0.8">
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
								icon: "share",
								onClick() {
									alert("share now");
								},
							},
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

			<WidgetWrapper columnSpan="1" aspectRatio="1/0.8">
				<FirebaseListWidget
					collection="videos"
					orderBy="updatedAt,desc"
					image="poster"
					title="name"
					subtitle="updatedAt|date"
					action="url"
					widgetProps={{
						// noPadding: true,
						// icon: "image",
						// title: "Image",
						icon: (
							<svg
								className="w-3.5"
								viewBox="0 0 24 24"
								fill="currentColor"
							>
								{/* <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /> */}
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z"
								/>
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
								icon: "play",
								onClick() {
									alert("Play");
								},
							},
						],
					}}
				/>
			</WidgetWrapper>

			<WidgetWrapper
				columnSpan="1"
				aspectRatio="1 / 0.8"
				widget={MusicWidget}
			/>

			<WidgetWrapper aspectRatio={2 / 0.8} widget={ReaderWidget} />

			<WidgetWrapper aspectRatio={2 / 0.8}>
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
