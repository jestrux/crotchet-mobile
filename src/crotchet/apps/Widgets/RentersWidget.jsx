import { DataWidget } from "@/crotchet";
import { useAppContext } from "@/providers/app";

export default function RentersWidget() {
	const { dataSources } = useAppContext();

	return (
		<DataWidget
			source={dataSources.renters}
			widgetProps={{
				icon: "user",
				title: "Renters",
				actions: [
					{
						icon: "search",
						url: "crotchet://search/apartments",
					},
					{
						icon: "list",
						url: "crotchet://action/rentersByStatus",
					},
				],
			}}
		/>
	);
}
