import { Loader, randomId } from "@/crotchet";
import DataFetcher from "@/providers/data/DataFetcher";
import clsx from "clsx";
import GridListItem from "./ListItem/GridListItem";

function GridListContent({ source, data, isLoading, ...props }) {
	const {
		columns = 2,
		gap = "0.5rem",
		aspectRatio,
		meta,
	} = {
		...(source?.layoutProps || props.layoutProps || {}),
		...props,
	};

	const { entryActions } = {
		...(source || {}),
		...props,
	};

	let content = isLoading ? (
		<div className="relative h-8 min-w-full min-h-full flex items-center justify-center">
			<Loader scrimColor="transparent" size={25} />
		</div>
	) : null;

	if (!isLoading && data) {
		const items = data.map((entry) => {
			const _id = entry._id || randomId();
			const entryProps = {
				_id,
				...entry,
				onHold:
					typeof entry.onHold == "function"
						? entry.onHold
						: typeof entryActions != "function"
						? null
						: () =>
								window.openActionSheet({
									actions: entryActions(entry),
									preview: _.pick(entry, [
										"icon",
										"image",
										"video",
										"title",
										"subtitle",
									]),
								}),
			};

			return (
				<GridListItem
					key={_id}
					{...entryProps}
					color={entry.color}
					aspectRatio={aspectRatio}
					meta={meta}
				/>
			);
		});

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
				return screen == "xs"
					? `@xs:grid-cols-${columns}`
					: `@${screen}:grid-cols-${columns}`;
			})
			.join(" ");

		content = (
			<div className="@container">
				<div
					className={clsx("pb-2 grid", columnClasses)}
					style={{
						gap,
					}}
				>
					{items}
				</div>
			</div>
		);
	}

	return (
		<div>
			{props.title && data?.length && (
				<div className="px-1 mb-1">
					<h2 className="text-xl font-semibold text-content">
						{props.title}
					</h2>
				</div>
			)}

			{content}
		</div>
	);
}

export default function GridList({ source, searchQuery, filters, ...props }) {
	const content = <GridListContent source={source} {...props} />;

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
