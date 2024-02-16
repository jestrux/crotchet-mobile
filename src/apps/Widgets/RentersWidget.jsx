import { dataSources } from "@/providers/data";
import DataFetcher from "@/providers/data/DataFetcher";
import GenericListWidget from "../../components/ListWidget/GenericListWidget";

export default function RentersWidget() {
	return (
		<DataFetcher
			source={dataSources.sql({
				query: "SELECT * from renter",
			})}
		>
			<GenericListWidget
				title="name"
				subtitle="due_date|date"
				widgetProps={{
					icon: "user",
					title: "Renters",
				}}
			/>
		</DataFetcher>
	);
}
