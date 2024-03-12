import DataFetcher from "@/providers/data/DataFetcher";
import DataWidget from "./DataWidget";

export default function GlobalSearch({ searchQuery }) {
	if (!searchQuery?.length) return null;

	return (
		<>
			{Object.values(window.__crotchet.dataSources).map((source) => {
				if (source.searchable === false) return null;

				return (
					<DataFetcher
						key={source._id}
						source={source}
						limit={2}
						contentOnly
						searchQuery={searchQuery}
						className="flex-col gap-1"
					>
						{({ ...props }) =>
							props.data?.length > 0 && (
								<div className="flex-col gap-1">
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
		</>
	);
}
