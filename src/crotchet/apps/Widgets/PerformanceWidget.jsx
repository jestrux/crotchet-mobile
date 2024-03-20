import DataWidget from "@/components/DataWidget";
import { registerDataSource } from "@/crotchet";
import { useAppContext } from "@/providers/app";

registerDataSource("airtable", "performance", {
	table: "performance",
	mapEntry: (entry) => ({
		image: entry.user_image,
		title: entry.user_name,
		subtitle: `${entry.user_department}, ${entry.billed}`,
		progress: entry.progress,
	}),
	filter: "user_department",
	searchFields: ["user_name"],
});

export default function PerformanceWidget() {
	const { dataSources } = useAppContext();
	const icon = (
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
	);

	return (
		<DataWidget
			source={dataSources.performance}
			widgetProps={{
				icon,
				title: "Perf",
				// actions: [
				// 	{
				// 		icon: "list",
				// 		url: "crotchet://action/rentersByStatus",
				// 	},
				// ],
			}}
		/>
	);
}
