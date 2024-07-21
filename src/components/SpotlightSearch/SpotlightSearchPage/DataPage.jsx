import { onActionClick, randomId } from "@/crotchet";
import SpotlightListSection from "../SpotlightComponents/SpotlightListSection";
import SpotlightListItem from "../SpotlightComponents/SpotlightListItem";
import SpotlightGrid from "../SpotlightComponents/SpotlightGrid";
import { useSpotlightPageContext } from "../SpotlightSearchPage/SpotlightPageContext";

export default function DataPage({ page, pageData }) {
	const { setMainAction } = useSpotlightPageContext();
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
				onItemFocused={(item) =>
					setMainAction({
						label: "Select",
						handler: onActionClick(item),
					})
				}
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
					onFocus={() =>
						setMainAction({
							label: "Select",
							handler: onActionClick(entry),
						})
					}
				/>
			))}
		</SpotlightListSection>
	);
}
