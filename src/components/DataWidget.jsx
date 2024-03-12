import Loader from "./Loader";
import Widget from "./Widget";
import ListItem from "./ListWidget/ListItem";
import DataFetcher from "@/providers/data/DataFetcher";
import { useEffect } from "react";

function DataWidgetContent({
	layout,
	columns = 2,
	large,
	searchQuery,
	data,
	isLoading,
	refetch = () => {},
	widgetProps,
	children,
	fieldMap = {},
	...props
}) {
	const grid = layout == "grid";
	const masonry = layout == "masonry";

	useEffect(() => {
		refetch({ searchQuery });
	}, [searchQuery]);

	let content = (
		<div className="relative h-8 min-w-full min-h-full flex items-center justify-center">
			<Loader scrimColor="transparent" size={25} />
		</div>
	);

	if (!isLoading) {
		if (!data) content = null;
		else {
			const items = data.map((entry, index) => (
				<ListItem
					color={entry.color}
					height={entry.height}
					width={entry.width}
					key={index}
					grid={grid}
					masonry={masonry}
					large={large}
					data={entry}
					{...fieldMap}
					{...props}
				/>
			));

			const gridStyles = {
				display: "grid",
				gap: "0.5rem",
				gridTemplateColumns: `repeat(${
					window.innerWidth <= 780 ? 2 : columns
				}, minmax(0, 1fr))`,
			};

			if (typeof children == "function") {
				content = children(data);
			} else if (masonry) {
				content = (
					<div className="pb-2" style={gridStyles}>
						{Array(parseInt(columns))
							.fill("")
							.map((_, index) => (
								<div className="w-full h-full" key={index}>
									{items
										.filter(
											(_, itemIndex) =>
												itemIndex % columns == index
										)
										.map((item) => item)}
								</div>
							))}
					</div>
				);
			} else if (grid) {
				content = (
					<div className="pb-2" style={gridStyles}>
						{items}
					</div>
				);
			} else content = items;
		}
	}

	return (
		<Widget {...widgetProps} refresh={refetch}>
			{content}
		</Widget>
	);
}

export default function DataWidget({ source, layout, columns, ...props }) {
	const content = (
		<DataWidgetContent layout={layout} columns={columns} {...props} />
	);

	if (source) {
		return (
			<DataFetcher source={source} {...props}>
				{content}
			</DataFetcher>
		);
	}
	return content;
}
