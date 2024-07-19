import {
	DataFetcher,
	Loader,
	onActionClick,
	randomId,
	showToast,
} from "@/crotchet";
import { useEffect } from "react";
import SpotlightListSection from "../SpotlightComponents/SpotlightListSection";
import SpotlightListItem from "../SpotlightComponents/SpotlightListItem";
import SpotlightGrid from "../SpotlightComponents/SpotlightGrid";

function SourcePageContent({
	searchQuery,
	source,
	data,
	isLoading,
	refetch = () => {},
	widgetProps,
	...props
}) {
	const {
		layout,
		columns: columnString = 3,
		aspectRatio = "1/1",
	} = {
		...(source?.layoutProps || {}),
		...props,
	};
	const columnMap = columnString
		.toString()
		.split(",")
		.reduce(
			(agg, col) => {
				const [columns, screen = "xs"] = col.split(":").reverse();

				return {
					...agg,
					[screen]: Number(columns),
				};
			},
			{ xs: 1 }
		);

	const columns =
		columnMap["2xl"] ||
		columnMap["xl"] ||
		columnMap["lg"] ||
		columnMap["md"] ||
		columnMap["sm"] ||
		columnMap["xs"];

	const grid = ["grid", "masonry"].includes(layout);

	useEffect(() => {
		refetch({ searchQuery });
	}, [searchQuery]);

	if (isLoading)
		return (
			<div className="relative h-8 min-w-full min-h-full flex items-center justify-center">
				<Loader scrimColor="transparent" size={25} />
			</div>
		);

	if (!data) return null;

	const content = data.map((entry) => ({
		...entry,
		_id: entry._id || randomId(),
		label: entry.title,
	}));

	if (grid) {
		return (
			<SpotlightGrid
				aspectRatio={aspectRatio}
				columns={columns}
				choices={content}
				// onChange={(gradient) =>
				// 	!gradient ? null : onChange(gradient)
				// }
				onSelect={(choice) => {
					// console.log("Item selected: " + choice?.label, choice);
					showToast("Item selected: " + choice?.label);
					onActionClick(choice);
				}}
			/>
		);
	}

	return (
		<SpotlightListSection {...widgetProps} refresh={refetch}>
			{content.map((entry) => (
				<SpotlightListItem
					className="w-full"
					key={entry._id}
					label={entry.title}
					value={entry._id}
					onSelect={(selectedId) => {
						const choice = content.find(
							({ _id }) => _id == selectedId
						);
						// console.log("Item selected: " + choice?.label, choice);
						showToast("Item selected: " + choice?.label);
						onActionClick(choice);
					}}
				/>
			))}
		</SpotlightListSection>
	);
}

export default function SourcePage({ page, searchQuery, ...props }) {
	return (
		<DataFetcher
			source={page.source}
			searchQuery={searchQuery}
			// filters={filters}
			// {...props}
		>
			<SourcePageContent source={page.source} {...props} />
		</DataFetcher>
	);
}
