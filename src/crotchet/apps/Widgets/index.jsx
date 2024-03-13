import ListWidget from "@/components/ListWidget";
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

export default function Widgets() {
	return (
		<div className="max-w-3xl mx-auto p-3 flex flex-col sm:grid grid-cols-12 items-start gap-3">
			<div className="w-full col-span-6 grid grid-cols-2 gap-3">
				<WidgetWrapper aspectRatio="5.2/1">
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
				<WidgetWrapper aspectRatio="2/1" widget={MusicWidget} />

				<WidgetWrapper aspectRatio="2/1" widget={HeroIconsWidget} />

				<WidgetWrapper aspectRatio="2/1" widget={RentersWidget} />

				<WidgetWrapper aspectRatio="2/1">
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
		</div>
	);
}
