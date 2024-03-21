import Widget from "@/components/Widget";
import { useAppContext } from "@/providers/app";

export default function ReaderWidget() {
	const { dataSources } = useAppContext();

	return (
		<Widget
			source={{
				...dataSources.reader,
				single: true,
				random: true,
			}}
			actions={(data = []) => [
				...(data
					? [
							{
								icon: "shuffle",
								type: "shuffle",
							},
					  ]
					: []),
				{
					icon: "search",
					url: "crotchet://search/reader?layout=card",
				},
			]}
			content={({ data = {} }) => ({
				...data,
				button: !data
					? {}
					: {
							label: data.video ? "Watch" : "Open",
							url: data.url,
					  },
			})}
		/>
	);

	// const widgetProps = ({ shuffle, entry, isVideo }) => ({
	// 	noPadding: true,
	// 	// title: "Reader",
	// 	// icon: (
	// 	// 	<svg
	// 	// 		className="w-3.5"
	// 	// 		fill="currentColor"
	// 	// 		viewBox="0 0 24 24"
	// 	// 		// strokeWidth={1.5}
	// 	// 		// stroke="currentColor"
	// 	// 	>
	// 	// 		<path
	// 	// 			strokeLinecap="round"
	// 	// 			strokeLinejoin="round"
	// 	// 			d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z"
	// 	// 		/>
	// 	// 	</svg>
	// 	// ),
	// 	actions: [
	// 		{
	// 			icon: "shuffle",
	// 			onClick: shuffle,
	// 		},
	// 		{
	// 			icon: "search",
	// 			url: "crotchet://search/reader?layout=card",
	// 			// icon: "list",
	// 			onClick() {
	// 				openPage({
	// 					// title: entry.title,
	// 					// subtitle: entry.description,
	// 					content: [
	// 						{
	// 							type: isVideo ? "video" : "image",
	// 							value: entry.image,
	// 							url: entry.url,
	// 						},
	// 						{
	// 							title: entry.title,
	// 							subtitle: entry.description,
	// 						},
	// 						{
	// 							type: "data",
	// 							title: "All entries",
	// 							wrapped: false,
	// 							source,
	// 						},
	// 					],
	// 				});
	// 			},
	// 		},
	// 	],
	// });

	// return (
	// 	<DataFetcher source={source} shuffle first>
	// 		{({ data: entry, isLoading, shuffle }) => {
	// 			if (isLoading) {
	// 				return (
	// 					<div className="relative h-8 min-w-full min-h-full flex items-center justify-center">
	// 						<Loader scrimColor="transparent" size={25} />
	// 					</div>
	// 				);
	// 			}

	// 			if (!entry) return null;

	// 			const isVideo =
	// 				entry.url.toLowerCase().indexOf("videos") != -1 ||
	// 				entry.url.toLowerCase().indexOf("youtube") != -1 ||
	// 				entry.group.toLowerCase().indexOf("watch") != -1;

	// 			return (
	// 				<Widget {...widgetProps({ shuffle, entry, isVideo })}>
	// 					<a
	// 						href={entry.url}
	// 						target="_blank"
	// 						className="w-full h-full flex flex-col"
	// 						rel="noreferrer"
	// 					>
	// 						<div
	// 							className="flex-1 relative bg-black overflow-hidden"
	// 							style={{
	// 								margin: "0.75rem 0.75rem 0 0.75rem",
	// 								width: "60%",
	// 								borderRadius: "5px",
	// 							}}
	// 						>
	// 							<img
	// 								className="flex-1 absolute inset-0 w-full h-full object-cover rounded"
	// 								src={entry.image}
	// 								alt=""
	// 							/>

	// 							{isVideo && (
	// 								<div className="absolute inset-0 bg-black/50 flex items-center justify-center">
	// 									<div className="relative w-8 h-8 flex items-center justify-center rounded-full overflow-hidden bg-card">
	// 										<div className="absolute inset-0 bg-content/60"></div>
	// 										<svg
	// 											className="w-4 ml-0.5 relative text-canvas"
	// 											viewBox="0 0 24 24"
	// 											fill="currentColor"
	// 										>
	// 											<path
	// 												strokeLinecap="round"
	// 												strokeLinejoin="round"
	// 												d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z"
	// 											/>
	// 										</svg>
	// 									</div>
	// 								</div>
	// 							)}
	// 						</div>

	// 						<div className="flex flex-col gap-1.5 p-3 pt-2.5">
	// 							<div className="truncate text-sm/none font-semibold">
	// 								{entry.title}
	// 							</div>

	// 							<div className="truncate text-xs/none opacity-70 flex items-center">
	// 								{entry.description}
	// 							</div>

	// 							<div className="mt-1 self-start bg-content/60 text-canvas relative h-7 text-xs/none pb-px px-4 flex items-center justify-center rounded-full">
	// 								{isVideo ? "Watch" : "Open"}
	// 							</div>
	// 						</div>
	// 					</a>
	// 				</Widget>
	// 			);
	// 		}}
	// 	</DataFetcher>
	// );
}
