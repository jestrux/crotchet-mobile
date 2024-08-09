import { useState } from "react";
import BottomNavAction from "./BottomNavAction";
import PreviewCard from "./PreviewCard";
import { objectExcept, randomId } from "@/utils";
import clsx from "clsx";
import useLoadableView from "@/hooks/useLoadableView";

export default function ActionSheet({
	noHeading,
	dismiss,
	preview: _preview,
	// mainActions = [],
	actions: _actions,
	onChange = () => {},
	payload = {},
}) {
	const [groupFilter, setGroupFilter] = useState();
	const [sheetProps, setSheetProps] = useState({
		preview: _preview,
		...payload,
		actions: [],
	});

	const { pendingView, loading } = useLoadableView({
		data: _actions,
		onSuccess: (actions) =>
			setSheetProps((oldProps) => {
				return {
					...oldProps,
					actions,
				};
			}),
		dismiss,
	});

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
	const groups = _.keys(_.groupBy(otherActions, "group")).filter(
		(group) => group && group != "undefined"
	);

	if (groups.length && !groupFilter) setGroupFilter(groups[0]);

	return (
		<div className={clsx(noHeading ? "px-3" : "pt-5 px-5")}>
			{!noHeading && (
				<div className="flex items-center justify-between gap-2 px-1">
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
			)}

			{pendingView !== true ? (
				pendingView
			) : (
				<div className="mt-3 space-y-3" onClick={dismiss}>
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

					{sheetProps.preview && groups.length > 0 && (
						<div className="-mb-0.5">{groupFilters(groups)}</div>
					)}

					{otherActions.length > 0 && (
						<div className="bg-card shadow dark:border border-content/5 rounded-lg overflow-hidden divide-y divide-content/5">
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
