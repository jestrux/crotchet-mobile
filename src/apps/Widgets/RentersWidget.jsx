import { dataSource } from "@/providers/data";
import DataWidget from "../../components/DataWidget";

export default function RentersWidget() {
	return (
		<DataWidget
			source={dataSource.crotchet("renters")}
			widgetProps={{
				icon: "user",
				title: "Renters",
			}}
		/>
	);
}
