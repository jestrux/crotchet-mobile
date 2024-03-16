import DataFetcher from "@/providers/data/DataFetcher";
import DataWidget from "./DataWidget";

export default function GlobalSearch({ searchQuery }) {
	if (!searchQuery?.length) return null;

	return (
		<div className="flex flex-col gap-4 divide-y divide-content/5">
			{Object.values(window.__crotchet.dataSources).map((source) => {
				if (source.searchable === false) return null;

				return (
					<DataFetcher
						key={source._id}
						source={source}
						limit={2}
						contentOnly
						searchQuery={searchQuery}
					>
						{({ ...props }) =>
							props.data?.length > 0 && (
								<div className="flex-col gap-2 pt-4 px-5">
									<h3 className="text-content/50">
										{source.label}
									</h3>

									<DataWidget
										{...props}
										widgetProps={{
											noPadding: true,
										}}
									/>
								</div>
							)
						}
					</DataFetcher>
				);
			})}
		</div>
	);
}
