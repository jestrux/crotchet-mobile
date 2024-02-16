import ListWidget from "@/components/ListWidget";
import WidgetWrapper from "@/components/WidgetWrapper";
import ReaderWidget from "@/apps/Widgets/ReaderWidget";
import MusicWidget from "@/apps/Widgets/MusicWidget";
import TimerWidget from "@/apps/Widgets/TimerWidget";
import YtClipsWidget from "@/apps/Widgets/YtClipsWidget";
import RandomPhotoWidget from "@/apps/Widgets/RandomPhotoWidget";
import PingsWidget from "@/apps/Widgets/PingsWidget";
import RentersWidget from "@/apps/Widgets/RentersWidget";

export default function Widgets() {
	return (
		<div className="p-3 grid items-start grid-cols-2 gap-3">
			<WidgetWrapper aspectRatio={5 / 1} widget={PingsWidget} />

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
				aspectRatio={1 / 1}
				widget={ReaderWidget}
			/>

			<WidgetWrapper
				// columnSpan="1"
				aspectRatio={2 / 1}
				widget={MusicWidget}
			/>

			<WidgetWrapper aspectRatio={2 / 1} widget={RentersWidget} />

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
