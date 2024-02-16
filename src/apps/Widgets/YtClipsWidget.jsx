import Loader from "@/components/Loader";
import Widget from "@/components/Widget";
import { dataSources } from "@/providers/data";
import DataFetcher from "@/providers/data/DataFetcher";
import { toHms } from "@/utils";

export default function YtClipsWidget() {
	const widgetProps = ({ shuffle }) => ({
		noPadding: true,
		// icon: "image",
		title: "Yt Clips",
		icon: (
			<svg className="w-3.5" viewBox="0 0 24 24" fill="currentColor">
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
				onClick: shuffle,
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
	});

	return (
		<DataFetcher
			source={dataSources.firebase({
				collection: "videos",
				orderBy: "updatedAt,desc",
			})}
			first
			shuffle
		>
			{({ data: video, isLoading, shuffle }) => {
				if (isLoading) {
					return (
						<div className="relative h-8 min-w-full min-h-full flex items-center justify-center">
							<Loader scrimColor="transparent" size={25} />
						</div>
					);
				}

				if (!video) return null;

				return (
					<Widget {...widgetProps({ shuffle })}>
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
					</Widget>
				);
			}}
		</DataFetcher>
	);
}
