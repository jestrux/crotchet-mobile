import { useState } from "react";
import BottomNavAction from "./BottomNavAction";
import PreviewCard from "./PreviewCard";
import { objectExcept, randomId } from "@/utils";
import { Loader, useSourceGet } from "@/crotchet";

export default function ActionSheet({
	dismiss,
	// preview: _preview,
	// mainActions = [],
	actions: _actions,
	onChange = () => {},
	payload = {},
}) {
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

	const contentPreview = (preview) => {
		// console.log("Preview: ", preview);

		if (!preview) return <div>&nbsp;</div>;

		return (
			<div className="flex-1">
				<PreviewCard
					image={preview.image}
					title={preview.title}
					description={preview.description}
				/>
			</div>
		);
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

	// console.log(preview);

	return (
		<div className="pt-5 pb-3 px-5">
			<div className="flex items-start justify-between gap-2">
				{contentPreview(sheetProps.preview)}

				<button
					className="bg-content/5 border border-content/5 size-7 flex items-center justify-center rounded-full"
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

					{actions?.length > 0 && (
						<div className="mb-2 bg-card shadow dark:border border-content/5 rounded-lg overflow-hidden divide-y divide-content/5">
							{actions.map((action) => (
								<BottomNavAction
									className="px-4"
									key={action.__id}
									action={action}
									inShareSheet
								/>
							))}
						</div>
					)}
				</div>
			)}
		</div>
	);
}
