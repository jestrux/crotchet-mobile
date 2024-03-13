import Loader from "./Loader";
import Widget from "./Widget";
import ListItem from "./ListWidget/ListItem";
import DataFetcher from "@/providers/data/DataFetcher";
import { useEffect, useRef } from "react";
import clsx from "clsx";

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
	const elRef = useRef(null);
	const grid = layout == "grid";
	const masonry = layout == "masonry";

	useEffect(() => {
		refetch({ searchQuery });
	}, [searchQuery]);

	let content = (
		<div
			ref={elRef}
			className="relative h-8 min-w-full min-h-full flex items-center justify-center"
		>
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

			if (typeof children == "function") {
				content = children(data);
			} else if (masonry || grid) {
				const columnClasses = Object.entries(
					columns
						.toString()
						.split(",")
						.reduce(
							(agg, col) => {
								const [columns, screen = "xs"] = col
									.split(":")
									.reverse();

								return {
									...agg,
									[screen]: columns,
								};
							},
							{ xs: 1 }
						)
				)
					.map(([screen, columns]) => {
						if (masonry) {
							return screen == "xs"
								? `@xs:columns-${columns}`
								: `@${screen}:columns-${columns}`;
						}

						return screen == "xs"
							? `@xs:grid-cols-${columns}`
							: `@${screen}:grid-cols-${columns}`;
					})
					.join(" ");

				content = (
					<div className="@container">
						<div
							className={clsx(
								"pb-2",
								{ "grid gap-2": grid },
								columnClasses
							)}
							style={{
								columnGap: "0.5rem",
							}}
						>
							{items}
						</div>
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
