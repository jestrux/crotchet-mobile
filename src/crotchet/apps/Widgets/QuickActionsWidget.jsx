import { ListItem, Widget } from "@/crotchet";
import { useAppContext } from "@/providers/app";

export default function QuickActionsWidget() {
	const { globalActions } = useAppContext();

	return (
		<Widget title="Quick Actions">
			{globalActions().map((action) => (
				<ListItem
					key={action._id}
					icon={
						action.icon ||
						`<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true" data-slot="icon">
							<path stroke-linecap="round" stroke-linejoin="round" d="M5.25 8.25h15m-16.5 7.5h15m-1.8-13.5-3.9 19.5m-2.1-19.5-3.9 19.5"></path>
						</svg>`
					}
					title={action.label}
					url={`crotchet://action/${action.name}`}
				/>
			))}
		</Widget>
	);
}
