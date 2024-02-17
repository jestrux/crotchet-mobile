import Loader from "@/components/Loader";
import Widget from "@/components/Widget";
import { dataSource } from "@/providers/data";
import DataFetcher from "@/providers/data/DataFetcher";

export default function RandomPhotoWidget() {
	const widgetProps = () => ({
		noPadding: true,
		// icon: "image",
		// title: "Image",
		actions: [
			// {
			// 	icon: "shuffle",
			// 	onClick: shuffle,
			// },
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
	});

	return (
		<DataFetcher source={dataSource.crotchet("unsplash")} first shuffle>
			{({ data, isLoading, shuffle }) => {
				if (isLoading) {
					return (
						<div className="relative h-8 min-w-full min-h-full flex items-center justify-center">
							<Loader scrimColor="transparent" size={25} />
						</div>
					);
				}

				if (!data) return null;

				return (
					<Widget {...widgetProps({ shuffle })}>
						<div className="w-full h-full flex flex-col">
							<div className="flex-1 relative">
								<img
									className="flex-1 absolute inset-0 w-full h-full object-cover rounded"
									src={data.urls.regular}
									alt=""
								/>
							</div>

							<div className="absolute bottom-0 flex flex-col gap-1.5 p-3 pt-2.5">
								{/* <div className="truncate text-sm/none font-semibold first-letter:capitalize">
									{data.alt_description}
								</div>
								<div className="truncate text-xs/none opacity-70 flex items-center">
									{data.description}
								</div> */}

								<button
									className="self-start bg-black text-white relative h-8 text-xs px-4 flex items-center justify-center font-bold rounded-full"
									onClick={shuffle}
								>
									Shuffle
								</button>
							</div>
						</div>
					</Widget>
				);
			}}
		</DataFetcher>
	);
}
