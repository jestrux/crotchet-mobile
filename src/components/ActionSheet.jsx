import { useState } from "react";
import BottomNavAction from "./BottomNavAction";
import PreviewCard from "./PreviewCard";
import { objectExcept, randomId } from "@/utils";
import { Loader, useSourceGet } from "@/crotchet";
import clsx from "clsx";

export default function ActionSheet({
	dismiss,
	// preview: _preview,
	// mainActions = [],
	actions: _actions,
	onChange = () => {},
	payload = {},
}) {
	const [groupFilter, setGroupFilter] = useState();
	const [sheetProps, setSheetProps] = useState({
		...payload,
		actions: [],
		// preview: _preview,
	});

	const { loading } = useSourceGet(
		async () => {
			if (_.isFunction(_actions)) {
				return await _actions().then((actions) => {
					setSheetProps((oldProps) => {
						return {
							...oldProps,
							actions,
						};
					});
				});
			}

			setSheetProps((oldProps) => {
				return {
					...oldProps,
					actions: _actions,
				};
			});

			return _actions;
		},
		{ delayLoader: false }
	);

	onChange((props) => {
		setSheetProps((oldProps) => {
			return {
				...oldProps,
				...props,
			};
		});
	});

	const groupFilters = (groups) => {
		if (!groups.length) return null;

		return (
			<div className="flex items-center">
				{groups.map((group, index) => (
					<button
						key={index}
						className={clsx(
							"h-8 px-3 rounded-full border text-sm",
							groupFilter == group
								? "bg-content/[0.03] border-content/5"
								: "border-transparent opacity-50"
						)}
						onClick={(e) => {
							e.stopPropagation();
							setGroupFilter(group);
						}}
					>
						{group}
					</button>
				))}
			</div>
		);
	};

	const contentPreview = (preview, title, groups) => {
		if (!preview) {
			if (groups.length) return groupFilters(groups);

			if (title) {
				return (
					<h3 className="text-lg/none font-bold first-letter:uppercase">
						{title}
					</h3>
				);
			}

			return;
		}

		return <PreviewCard {...preview} />;
	};

	const actions = sheetProps.actions.map((action) => {
		action.__id = randomId();
		let handler = action.handler;

		if (_.isFunction(handler)) {
			action.handler = () =>
				handler(
					objectExcept(sheetProps, ["actions", "preview"]),
					__crotchet
				);
		}

		return action;
	});
	const mainActions = _.filter(actions, { main: true });
	const otherActions = actions.filter(({ main }) => !main);
	const groups = _.compact(_.keys(_.groupBy(otherActions, "group")));

	if (![undefined, "undefined"].includes(groups?.[0]) && !groupFilter)
		setGroupFilter(groups[0]);

	return (
		<div className="pt-5 pb-3 px-5">
			<div className="flex items-center justify-between gap-2">
				{contentPreview(
					sheetProps.preview,
					sheetProps.title,
					loading ? null : groups
				)}

				<button
					className="flex-shrink-0 ml-auto bg-content/5 border border-content/5 size-7 flex items-center justify-center rounded-full"
					onClick={dismiss}
				>
					<svg
						className="w-3.5"
						fill="none"
						viewBox="0 0 24 24"
						strokeWidth="1.5"
						stroke="currentColor"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M6 18 18 6M6 6l12 12"
						></path>
					</svg>
				</button>
			</div>

			{loading && (
				<div className="flex justify-center">
					<Loader size={40} />
				</div>
			)}

			{!loading && (
				<div className="mt-4 space-y-3" onClick={dismiss}>
					{mainActions?.length > 0 && (
						<div className="grid grid-cols-3 gap-3">
							{mainActions.map((action) => (
								<BottomNavAction
									key={action.__id}
									vertical
									className="bg-card shadow dark:border border-content/5 p-4 rounded-lg"
									action={action}
									inShareSheet
								/>
							))}
						</div>
					)}

					{sheetProps.preview && groups.length && (
						<div className="-mb-0.5">{groupFilters(groups)}</div>
					)}

					{otherActions.length > 0 && (
						<div className="mb-2 bg-card shadow dark:border border-content/5 rounded-lg overflow-hidden divide-y divide-content/5">
							{otherActions.map((action) => {
								if (groupFilter && action.group != groupFilter)
									return null;

								return (
									<BottomNavAction
										className="px-4"
										key={action.__id}
										action={action}
										inShareSheet
									/>
								);
							})}
						</div>
					)}
				</div>
			)}
		</div>
	);
}
