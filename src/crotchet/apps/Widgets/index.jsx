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
import Widget from "@/components/Widget";
import { useAppContext } from "@/providers/app";
import ListItem from "@/components/ListWidget/ListItem";

export default function Widgets() {
	const { actions } = useAppContext();

	return (
		<div className="max-w-3xl mx-auto p-3 flex flex-col sm:grid grid-cols-12 items-start gap-3">
			<div className="w-full col-span-6 grid grid-cols-2 gap-3">
				<WidgetWrapper aspectRatio="5.2/1">
					<PinnedItemsWidget />
				</WidgetWrapper>

				<WidgetWrapper className="hidden sm:block">
					<Widget title="Quick Actions">
						{Object.values(actions ?? {}).map((action) => (
							<ListItem
								key={action._id}
								data={{
									icon:
										action.icon ||
										`<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true" data-slot="icon">
									<path stroke-linecap="round" stroke-linejoin="round" d="M5.25 8.25h15m-16.5 7.5h15m-1.8-13.5-3.9 19.5m-2.1-19.5-3.9 19.5"></path>
								  </svg>`,
									title: action.label,
									url: `crotchet://action/${action.name}`,
								}}
							/>
						))}
					</Widget>
				</WidgetWrapper>

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
