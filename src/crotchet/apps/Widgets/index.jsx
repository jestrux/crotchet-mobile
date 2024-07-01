import WidgetWrapper from "@/components/WidgetWrapper";
import ReaderWidget from "@/crotchet/apps/Widgets/ReaderWidget";
import MusicWidget from "@/crotchet/apps/Widgets/MusicWidget";
import TimerWidget from "@/crotchet/apps/Widgets/TimerWidget";
import YtClipsWidget from "@/crotchet/apps/Widgets/YtClipsWidget";
import RandomPhotoWidget from "@/crotchet/apps/Widgets/RandomPhotoWidget";
import PinnedItemsWidget from "@/crotchet/apps/Widgets/PinnedItemsWidget";
import RentersWidget from "@/crotchet/apps/Widgets/RentersWidget";
import HeroIconsWidget from "./HeroIconsWidget";
import QuickActionsWidget from "./QuickActionsWidget";
import PerformanceWidget from "./PerformanceWidget";
import ChartzWidget from "./ChartzWidget";
import { DataWidget, useAppContext } from "@/crotchet";

export default function Widgets() {
	const { dataSources } = useAppContext();

	return (
		<div className="max-w-4xl mx-auto p-3 flex flex-col sm:grid grid-cols-12 items-start gap-3">
			<div className="w-full col-span-6 grid grid-cols-2 gap-3">
				<WidgetWrapper aspectRatio="3.6/1">
					<PinnedItemsWidget />
				</WidgetWrapper>

				<WidgetWrapper
					className="hidden sm:block"
					widget={QuickActionsWidget}
				/>

				<WidgetWrapper
					columnSpan="1"
					aspectRatio="1/1"
					widget={TimerWidget}
				/>

				<WidgetWrapper
					columnSpan="1"
					aspectRatio="1/1"
					widget={RandomPhotoWidget}
				/>

				<WidgetWrapper
					columnSpan="1"
					aspectRatio="1/1"
					widget={YtClipsWidget}
				/>

				<WidgetWrapper
					columnSpan={1}
					aspectRatio="1/1"
					widget={ReaderWidget}
				/>
			</div>

			<div className="w-full col-span-6 grid items-start grid-cols-2 gap-3">
				<WidgetWrapper
					columnSpan={1}
					aspectRatio="1/1"
					widget={ChartzWidget}
				/>

				<WidgetWrapper
					columnSpan={1}
					aspectRatio="1/1"
					widget={MusicWidget}
				/>

				{/* <WidgetWrapper aspectRatio="2/1" widget={MusicWidget} /> */}

				<WidgetWrapper aspectRatio="2/1" widget={HeroIconsWidget} />

				<WidgetWrapper aspectRatio="2/1">
					<DataWidget
						layout="grid"
						columns={8}
						previewOnly
						source={dataSources.bootstrapIcons}
						widgetProps={{
							icon: (
								<svg
									className="w-3.5"
									viewBox="0 0 118 94"
									role="img"
								>
									<path
										d="M24.509 0c-6.733 0-11.715 5.893-11.492 12.284.214 6.14-.064 14.092-2.066 20.577C8.943 39.365 5.547 43.485 0 44.014v5.972c5.547.529 8.943 4.649 10.951 11.153 2.002 6.485 2.28 14.437 2.066 20.577C12.794 88.106 17.776 94 24.51 94H93.5c6.733 0 11.714-5.893 11.491-12.284-.214-6.14.064-14.092 2.066-20.577 2.009-6.504 5.396-10.624 10.943-11.153v-5.972c-5.547-.529-8.934-4.649-10.943-11.153-2.002-6.484-2.28-14.437-2.066-20.577C105.214 5.894 100.233 0 93.5 0H24.508zM80 57.863C80 66.663 73.436 72 62.543 72H44a2 2 0 01-2-2V24a2 2 0 012-2h18.437c9.083 0 15.044 4.92 15.044 12.474 0 5.302-4.01 10.049-9.119 10.88v.277C75.317 46.394 80 51.21 80 57.863zM60.521 28.34H49.948v14.934h8.905c6.884 0 10.68-2.772 10.68-7.727 0-4.643-3.264-7.207-9.012-7.207zM49.948 49.2v16.458H60.91c7.167 0 10.964-2.876 10.964-8.281 0-5.406-3.903-8.178-11.425-8.178H49.948z"
										fill="currentColor"
									/>
								</svg>
							),
							title: "Bootstrap Icons",
							actions: [
								{
									icon: "search",
									label: "search",
									url: "crotchet://search/bootstrapIcons",
								},
							],
						}}
					/>
				</WidgetWrapper>

				<WidgetWrapper aspectRatio="2/1" widget={RentersWidget} />

				<WidgetWrapper aspectRatio="2/1" widget={PerformanceWidget} />
			</div>
		</div>
	);
}
