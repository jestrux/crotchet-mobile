import { Loader, ListItem, Widget, randomId } from "@/crotchet";
import DataFetcher from "@/providers/data/DataFetcher";
import { useEffect } from "react";
import clsx from "clsx";
import CardListItem from "./ListItem/CardListItem";
import GridListItem from "./ListItem/GridListItem";
import DragDropList from "./DragDropList";

function DataWidgetContent({
	layout,
	columns,
	iconOnly,
	searchQuery,
	source,
	data,
	isLoading,
	refetch = () => {},
	widgetProps,
	children,
	onReorder = () => {},
}) {
	layout = layout || source?.layout;
	columns = columns || source?.columns || 2;

	const card = layout == "card";
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
		else if (card) {
			const items = data.map((entry) => ({
				_id: entry._id || randomId(),
				icon: entry.icon,
				image: entry.image,
				video: entry.video,
				title: entry.title,
				subtitle: entry.subtitle,
				trailing: entry.trailing,
				progress: entry.progress,
				status: entry.status,
				url: entry.url,
			}));

			content = (
				<DragDropList items={items} onChange={onReorder}>
					{({ item }) => (
						<div key={item._id} className="pb-2 w-full">
							<CardListItem {...item} />
						</div>
					)}
				</DragDropList>
			);
		} else {
			const items = data.map((entry) => {
				const _id = entry._id || randomId();
				const entryProps = {
					_id,
					iconOnly,
					icon: entry.icon,
					image: entry.image,
					video: entry.video,
					title: entry.title,
					subtitle: entry.subtitle,
					trailing: entry.trailing,
					progress: entry.progress,
					status: entry.status,
					url: entry.url,
				};

				if (grid || masonry) {
					return (
						<GridListItem
							key={_id}
							{...entryProps}
							grid={grid}
							masonry={masonry}
							color={entry.color}
							height={entry.height}
							width={entry.width}
						/>
					);
				}

				return <ListItem key={_id} {...entryProps} />;
			});

			if (masonry || grid) {
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
								{ "grid gap-4": grid },
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

		if (typeof children == "function") return children({ data, content });
	}

	return (
		<Widget {...widgetProps} refresh={refetch}>
			{content}
		</Widget>
	);
}

export default function DataWidget({
	source,
	searchQuery,
	filters,
	layout,
	columns,
	...props
}) {
	const content = (
		<DataWidgetContent
			source={source}
			layout={layout}
			columns={columns}
			{...props}
		/>
	);

	if (source) {
		return (
			<DataFetcher
				source={source}
				searchQuery={searchQuery}
				filters={filters}
				{...props}
			>
				{content}
			</DataFetcher>
		);
	}
	return content;
}
