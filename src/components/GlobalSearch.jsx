import DataFetcher from "@/providers/data/DataFetcher";
import DataWidget from "./DataWidget";
import { useAppContext } from "@/crotchet";
import { matchSorter } from "match-sorter";
import BottomNavAction from "./BottomNavAction";
import ActionButton from "./ActionButton";

export default function GlobalSearch({ searchQuery = "", onClose = () => {} }) {
	const searching = searchQuery?.length > 0;
	const { globalActions } = useAppContext();
	let filteredActions = globalActions();

	if (searching) {
		filteredActions = matchSorter(filteredActions, searchQuery, {
			keys: ["label"],
		});
	}

	const automationActions = Object.values(__crotchet.automationActions);

	if (!searching) {
		return (
			<div className="space-y-6 pt-2 px-5">
				{filteredActions.length > 0 && (
					<div className="space-y-1.5" onClick={onClose}>
						<h3 className="text-sm/none text-content/50">
							Quick Actions
						</h3>

						<div className="grid grid-cols-3 gap-2">
							{filteredActions.map((action) => (
								<ActionButton
									key={action._id}
									action={action}
									className="flex flex-col gap-2 bg-card shadow dark:border border-stroke p-4 rounded-lg"
								>
									<div className="size-9 rounded-full flex items-center justify-center bg-content/5 border border-stroke dark:border-content/10">
										<div className="size-3.5">
											{action.icon}
										</div>
									</div>
									<div className="text-xs/none truncate">
										{action.label}
									</div>
								</ActionButton>
							))}
						</div>
					</div>
				)}

				{automationActions.length > 0 && (
					<div className="space-y-1.5" onClick={onClose}>
						<h3 className="text-sm/none text-content/50">
							Start an Automation
						</h3>

						<div className="flex gap-x-1.5 gap-y-2 flex-wrap justify-start">
							{automationActions.map((action) => (
								<div key={action._id}>
									<ActionButton
										action={action}
										className="inline-flex items-center gap-1.5 bg-card shadow dark:border border-stroke rounded-full"
									>
										<div className="ml-2 my-2 size-9 rounded-full flex items-center justify-center bg-blue-50 text-blue-900 border border-blue-900/5 dark:bg-content/5 dark:text-content dark:border-content/10">
											<div className="size-4">
												{action.icon ? (
													action.icon
												) : (
													<svg
														fill="none"
														viewBox="0 0 24 24"
														strokeWidth={1.5}
														stroke="currentColor"
													>
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															d="m6.75 7.5 3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0 0 21 18V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v12a2.25 2.25 0 0 0 2.25 2.25Z"
														/>
													</svg>
												)}
											</div>
										</div>

										<div className="mr-5 text-xs/none">
											{action.label}
										</div>
									</ActionButton>
								</div>
							))}
						</div>
					</div>
				)}
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
