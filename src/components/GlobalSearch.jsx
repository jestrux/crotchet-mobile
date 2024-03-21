import DataFetcher from "@/providers/data/DataFetcher";
import DataWidget from "./DataWidget";
import { useAppContext } from "@/crotchet";
import { matchSorter } from "match-sorter";
import BottomNavAction from "./BottomNavAction";

export default function GlobalSearch({ searchQuery = "", onClose = () => {} }) {
	const { globalActions } = useAppContext();
	let filteredActions = globalActions();

	if (searchQuery.length > 0) {
		filteredActions = matchSorter(filteredActions, searchQuery, {
			keys: ["label"],
		});
	}

	return (
		<div className="flex flex-col gap-4 divide-y divide-content/5">
			{filteredActions.length > 0 && (
				<div className="pt-2 space-y-1 px-5" onClick={onClose}>
					<h3 className="text-content/50">Quick Actions</h3>

					<div>
						{filteredActions.map((action) => (
							<BottomNavAction key={action._id} action={action} />
						))}
					</div>
				</div>
			)}

			{searchQuery?.length > 0 &&
				Object.values(window.__crotchet.dataSources).map((source) => {
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
									<div className="space-y-1 pt-4 px-5">
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
