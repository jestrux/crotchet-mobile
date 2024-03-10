import dataSource from "@/providers/data/dataSource";
import DataWidget from "../../../components/DataWidget";
import { useAppContext } from "@/providers/app";

export default function RentersWidget() {
	const { actualSource, actions } = useAppContext();
	const source = actualSource(dataSource.crotchet("renters"));

	return (
		<DataWidget
			source={source}
			widgetProps={{
				icon: "user",
				title: "Renters",
				actions: [
					{
						icon: "list",
						onClick: actions["crotchet://rentersByStatus"].handler,
					},
				],
			}}
		/>
	);
}
