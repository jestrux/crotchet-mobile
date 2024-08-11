import DataFetcher from "@/providers/data/DataFetcher";
import DataWidget from "./DataWidget";
import { ActionGrid, openUrl, useAppContext } from "@/crotchet";
import { matchSorter } from "match-sorter";
import BottomNavAction from "./BottomNavAction";

export default function GlobalSearch({
	searchQuery = "",
	onSelectSource,
	onClose = () => {},
}) {
	const searching = searchQuery?.length > 0;
	const { globalActions } = useAppContext();
	const searchableDataSources = _.sortBy(
		_.filter(
			Object.values(window.__crotchet.dataSources),
			({ searchable }) => !searchable
		),
		"label"
	);

	let filteredActions = globalActions();

	if (searching) {
		filteredActions = matchSorter(filteredActions, searchQuery, {
			keys: ["label"],
		});
	}

	const handlerSourceClick = (source) => {
		if (_.isFunction(onSelectSource))
			onSelectSource(window.__crotchet.dataSources[source.name]);
		else openUrl(`crotchet://search/${source.name}`);
	};

	if (!searching) {
		return (
			<div className="space-y-6 pt-2 px-5">
				<ActionGrid
					type="inline"
					title="Search a data source"
					// color="#F97315"
					// colorDark="#FDBA74"
					data={searchableDataSources.map((source) => ({
						_id: source._id,
						label: source.label,
						handler: () => handlerSourceClick(source),
					}))}
					fallbackIcon={window.UI.svg(
						"M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125"
					)}
					onClose={onClose}
				/>
			</div>
		);
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

			{searchableDataSources.map((source) => (
				<DataFetcher
					key={source._id}
					source={source}
					limit={3}
					contentOnly
					searchQuery={searchQuery}
				>
					{({ ...props }) =>
						props.data?.length > 0 && (
							<div className="space-y-1 pt-4 px-5">
								<div className="flex items-center justify-between">
									<h3 className="text-content/50">
										{source.label}
									</h3>

									<button
										type="button"
										className="text-primary inline-flex items-center text-sm/none"
										onClick={() =>
											openUrl(
												`crotchet://search/${source.name}?query=${searchQuery}`
											)
										}
									>
										view all
										{/* <svg
												className="size-4"
												fill="none"
												viewBox="0 0 24 24"
												strokeWidth="1.5"
												stroke="currentColor"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													d="m8.25 4.5 7.5 7.5-7.5 7.5"
												/>
											</svg> */}
									</button>
								</div>

								<DataWidget
									{...props}
									{...(source.layoutProps || {})}
									widgetProps={{
										noPadding: true,
									}}
								/>
							</div>
						)
					}
				</DataFetcher>
			))}

			<div className="mt-4"></div>
		</div>
	);
}
