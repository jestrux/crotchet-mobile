import { onActionClick, randomId } from "@/crotchet";
import SpotlightListSection from "../SpotlightComponents/SpotlightListSection";
import SpotlightListItem from "../SpotlightComponents/SpotlightListItem";
import SpotlightGrid from "../SpotlightComponents/SpotlightGrid";

export default function DataPage({ page, pageData }) {
	const {
		layout,
		columns: columnString = 3,
		aspectRatio = "1/1",
	} = {
		...(page?.layoutProps || {}),
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

	if (!pageData) return null;

	const content = pageData.map((entry) => ({
		...entry,
		_id: entry._id || randomId(),
		value: entry.value || entry.title || entry.subtitle,
	}));

	if (grid) {
		return (
			<SpotlightGrid
				aspectRatio={aspectRatio}
				columns={columns}
				choices={content}
				onSelect={(selectedValue) => {
					const choice = content.find(
						({ value }) => value == selectedValue
					);
					onActionClick(choice)();
				}}
			/>
		);
	}

	return (
		<SpotlightListSection>
			{content.map((entry) => (
				<SpotlightListItem
					className="w-full"
					key={entry._id}
					label={entry.title}
					value={entry.value}
					onSelect={(selectedValue) => {
						const choice = content.find(
							({ value }) => value == selectedValue
						);
						onActionClick(choice)();
					}}
				/>
			))}
		</SpotlightListSection>
	);
}
