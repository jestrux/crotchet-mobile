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
			content =
				typeof children == "function" ? (
					children(data)
				) : (
					<div
						className="pb-2"
						style={
							!grid
								? {}
								: {
										display: "grid",
										gap: "0.5rem",
										gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
								  }
						}
					>
						{data.map((entry, index) => (
							<ListItem
								key={index}
								grid={grid}
								large={large}
								data={entry}
								{...fieldMap}
								{...props}
							/>
						))}
					</div>
				);
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
