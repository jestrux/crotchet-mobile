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

	return (
		<DataWidget
			source={dataSources.performance}
			widgetProps={{
				icon: "user",
				title: "Renters",
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
