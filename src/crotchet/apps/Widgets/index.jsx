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

export default function Widgets() {
	return (
		<div className="max-w-4xl mx-auto p-3 flex flex-col sm:grid grid-cols-12 items-start gap-3">
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
				<WidgetWrapper
					columnSpan={1}
					aspectRatio="1/1"
					// widget={MusicWidget}
				/>

				<WidgetWrapper
					columnSpan={1}
					aspectRatio="1/1"
					widget={MusicWidget}
				/>

				{/* <WidgetWrapper aspectRatio="2/1" widget={MusicWidget} /> */}

				<WidgetWrapper aspectRatio="2/1" widget={HeroIconsWidget} />

				<WidgetWrapper aspectRatio="2/1" widget={RentersWidget} />

				<WidgetWrapper aspectRatio="2/1" widget={PerformanceWidget} />
			</div>
		</div>
	);
}
