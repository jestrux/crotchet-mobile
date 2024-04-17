import DataFetcher from "@/providers/data/DataFetcher";
import DataWidget from "./DataWidget";
import { openUrl, useAppContext } from "@/crotchet";
import { matchSorter } from "match-sorter";
import BottomNavAction from "./BottomNavAction";
import ActionButton from "./ActionButton";
import clsx from "clsx";

const Icon = ({ icon, fallback }) => {
	if (icon && typeof icon == "string") {
		icon = <div dangerouslySetInnerHTML={{ __html: icon }}></div>;
	}

	return icon ?? fallback;
};

const ActionGrid = ({
	title,
	type,
	data,
	fallbackIcon,
	color: _color,
	colorDark: _colorDark,
	onClose = () => {},
}) => {
	const typeInline = type == "inline";
	const typeWrap = type == "wrap";

	const ActionItem = ({ action }) => {
		const color = action.color ?? _color;
		const colorDark = action.colorDark ?? _colorDark;

		action.icon = action.icon || (
			<svg
				fill="none"
				viewBox="0 0 24 24"
				strokeWidth={1.5}
				stroke="currentColor"
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					d={fallbackIcon}
				/>
			</svg>
		);

		const colorClasses = [
			color
				? `bg-[${color}]/10 text-[${color}] border-[${color}]/5`
				: "bg-content/5 border-stroke",
			colorDark
				? `dark:bg-[${colorDark}]/10 dark:text-[${colorDark}] dark:border-[${colorDark}]/5`
				: "dark:bg-content/5 dark:text-content dark:border-content/10",
		];

		if (typeInline)
			return (
				<ActionButton
					action={action}
					className="w-full flex items-center gap-1.5 px-2.5"
				>
					<div
						className={clsx(
							"my-2 size-7 rounded-full flex items-center justify-center border",
							...colorClasses
						)}
					>
						<div className="size-3.5">
							<Icon icon={action.icon} />
						</div>
					</div>

					<div className="text-sm/none">{action.label}</div>

					<svg
						className="ml-auto size-4 opacity-30"
						fill="none"
						viewBox="0 0 24 24"
						strokeWidth={1.5}
						stroke="currentColor"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="m8.25 4.5 7.5 7.5-7.5 7.5"
						/>
					</svg>
				</ActionButton>
			);

		if (typeWrap) {
			return (
				<ActionButton
					action={action}
					className="inline-flex items-center gap-1.5 bg-card dark:bg-content/5 shadow dark:border border-stroke rounded-full"
				>
					<div
						className={clsx(
							"ml-2 my-2 size-9 rounded-full flex items-center justify-center border",
							...colorClasses
						)}
					>
						<div className="size-4">
							<Icon icon={action.icon} />
						</div>
					</div>

					<div className="mr-5 text-xs/none">{action.label}</div>
				</ActionButton>
			);
		}

		return (
			<ActionButton
				key={action._id}
				action={action}
				className="flex flex-col gap-2 bg-card dark:bg-content/5 shadow dark:border border-stroke p-4 rounded-lg"
			>
				<div
					className={clsx(
						"size-9 rounded-full flex items-center justify-center border",
						...colorClasses
					)}
				>
					<div className="size-3.5">
						<Icon icon={action.icon} />
					</div>
				</div>
				<div className="w-full">
					<div className="text-left text-xs/none truncate">
						{action.label}
					</div>
				</div>
			</ActionButton>
		);
	};

	if (!data?.length) return null;

	return (
		<div className="space-y-1.5" onClick={onClose}>
			<h3 className="text-sm/none text-content/50">{title}</h3>

			<div
				className={
					typeWrap
						? "flex gap-x-1.5 gap-y-2 flex-wrap justify-start"
						: typeInline
						? "bg-card dark:bg-content/5 shadow dark:border border-content/5 rounded-lg overflow-hidden divide-y divide-content/5"
						: "grid grid-cols-3 gap-2"
				}
			>
				{data.map((action) => (
					<ActionItem key={action._id} action={action} />
				))}
			</div>
		</div>
	);
};

export default function GlobalSearch({ searchQuery = "", onClose = () => {} }) {
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

	const automationActions = Object.values(__crotchet.automationActions);

	if (!searching) {
		return (
			<div className="space-y-6 pt-2 px-5">
				<ActionGrid
					// type="inline"
					color="#F97315"
					colorDark="#FDBA74"
					title="Quick Actions"
					data={filteredActions}
					fallbackIcon="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
					onClose={onClose}
				/>

				<ActionGrid
					type="wrap"
					title="Start an Automation"
					data={automationActions}
					color="#1e3a8a"
					colorDark="#93c5fd"
					fallbackIcon="m6.75 7.5 3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0 0 21 18V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v12a2.25 2.25 0 0 0 2.25 2.25Z"
					onClose={onClose}
				/>

				<ActionGrid
					type="inline"
					title="Search Data"
					// color="#F97315"
					// colorDark="#FDBA74"
					data={searchableDataSources.map((source) => ({
						_id: source._id,
						label: source.label,
						url: `crotchet://search/${source.name}`,
					}))}
					fallbackIcon="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125"
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
