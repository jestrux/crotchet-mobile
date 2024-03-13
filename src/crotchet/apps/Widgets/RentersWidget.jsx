import DataWidget from "../../../components/DataWidget";
import { useAppContext } from "@/providers/app";

export default function RentersWidget() {
	const { dataSources } = useAppContext();
	const source = dataSources.pier;

	return (
		<DataWidget
			source={source}
			widgetProps={{
				icon: "user",
				title: "Renters",
				actions: [
					{
						icon: "list",
						url: "crotchet://action/rentersByStatus",
					},
				],
			}}
		/>
	);
}
