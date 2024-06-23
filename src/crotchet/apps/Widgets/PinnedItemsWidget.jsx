import { DataWidget, useAppContext } from "@/crotchet";

export default function PinnedItemsWidget() {
	const { dataSources } = useAppContext();

	return (
		<DataWidget
			layout="grid"
			columns={5}
			previewOnly
			limit={5}
			title={null}
			subtitle={null}
			source={dataSources.pinnedItems}
			widgetProps={{
				noScroll: true,
				icon: dataSources.pinnedItems.icon,
				title: "Pinned Items",
				actions: [
					{
						icon: "search",
						label: "search",
						url: "crotchet://search/pinnedItems",
					},
				],
			}}
		/>
	);
}
