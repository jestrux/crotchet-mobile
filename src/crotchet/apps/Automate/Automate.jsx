import DataPreviewer from "@/components/DataPreviewer";
import {
	ActionGrid,
	copyToClipboard,
	objectIsEmpty,
	objectToQueryParams,
	randomId,
	showToast,
	useAppContext,
	useSourceGet,
} from "@/crotchet";
import clsx from "clsx";
import { useRef, useState } from "react";

const AutomationRunner = ({
	action: _action,
	data,
	savedData,
	onSuccess,
	onCancel,
}) => {
	const actionRef = useRef(_action);
	const action = actionRef.current;

	const { loading, error } = useSourceGet(
		async () => {
			if (actionRef.current.data) {
				onSuccess(actionRef.current.data);
				return actionRef.current.data;
			}

			if (!_.isFunction(action?.handler))
				throw `Unknown action ${_action}`;

			const res = action?.automation
				? await action?.handler({ ...(data || {}), savedData })
				: await action?.handler({
						...(data?.data || {}),
						// ...(savedData || {}),
				  });

			if (!res) return onCancel();

			actionRef.current = {
				...actionRef.current,
				data: res,
			};

			onSuccess(res);
		},
		{ delayLoader: false }
	);

	if (!loading && !error) return null;

	return (
		<div className="flex flex-col items-center gap-4 bg-card shadow dark:bg-content/5 border border-content/5 rounded-md p-3">
			{loading && `running...${action.label}`}

			{error && (
				<div className="w-full" onClick={onCancel}>
					<p>Something went wrong:</p>
					<div className="w-full overflow-auto">
						<div style={{ color: "red" }}>
							{JSON.stringify(error)}
						</div>
					</div>
					<button type="button">Okay, go back</button>
				</div>
			)}
		</div>
	);
};

const AutomationFlow = ({
	flow: _flow,
	onSelect = () => {},
	onSuccess = () => {},
}) => {
	const { automationActions, actions: _actions } = useAppContext();
	const allActions = { ...automationActions, ..._actions };
	const [{ actions, data, selectedAction: _selectedAction }] =
		useState(_flow);
	const [savedData, setSavedData] = useState({});
	const [selectedAction, _setSelectedAction] = useState(
		_selectedAction ? allActions[_selectedAction] : null
	);

	const setSelectedAction = (action) => {
		if (action) {
			onSelect({
				action: action?.name,
				values: null,
			});
		}

		_setSelectedAction(action);
	};

	const handleSuccess = (res = {}) => {
		setSelectedAction(null);

		if (res.state?.form) {
			onSelect({
				action: selectedAction?.name,
				values: res.state.form,
			});
		}

		setSavedData((savedData) => {
			const { state } = res;
			return {
				...savedData,
				[selectedAction?.name]: state || {},
			};
		});

		onSuccess(res);
	};

	const getActions = (actions) => {
		return actions
			.map((action) => {
				const actualAction = allActions[action];

				if (!actualAction) return null;

				return {
					_id: randomId(),
					icon: actualAction.icon,
					label: actualAction.label,
					selected: action == selectedAction?.name,
					handler: () => setSelectedAction(actualAction),
				};
			})
			.filter((action) => action);
	};

	return (
		<div className="flex flex-col items-center gap-5 w-full">
			{data && <DataPreviewer mini {...data} />}

			<ActionGrid
				type="wrap"
				data={getActions(actions)}
				selected={selectedAction?.name}
			/>

			{selectedAction && (
				<AutomationRunner
					action={selectedAction}
					data={data}
					savedData={savedData[selectedAction?.name]}
					onSuccess={handleSuccess}
					onCancel={() => setSelectedAction(null)}
				/>
			)}
		</div>
	);
};

export default function Automate({ dismiss, maxHeight, action }) {
	const { automationActions, openChoicePicker, dbInsert, queryDb, openForm } =
		useAppContext();
	const stuck = false;
	const [flow, setFlow] = useState([
		{
			__id: randomId(),
			selectedAction: action ? action : null,
			actions: action ? [action] : [],
			runUrl: action ? `crotchet://automation-action/${action}` : null,
		},
	]);

	const handleSelect = (index, { action, values } = {}) => {
		setFlow((flow) => {
			let newFlow = [...flow];

			let params = "";

			if (values) {
				params = `?${objectToQueryParams(values)}`;
			}

			newFlow[index] = {
				...newFlow[index],
				runUrl: `crotchet://automation-action/${action}${params}`,
			};

			if (newFlow.length > index + 1)
				newFlow = newFlow.slice(0, index + 1);

			return newFlow;
		});
	};

	const updateFlow = (
		index,
		{ type, actions, data, meta, ...payload } = {}
	) => {
		setFlow((flow) => {
			let newFlow = [...flow];

			if (newFlow.length > index + 1)
				newFlow = newFlow.slice(0, index + 1);

			newFlow.push({
				__id: randomId(),
				...(data ? { data: { type, data, meta } } : {}),
				...payload,
				actions,
			});

			return newFlow;
		});
	};

	const saveAutomation = async (flow) => {
		const automations = await queryDb("automations");
		let rowId;

		if (automations?.length) {
			let choices = automations.map(({ _id, name }) => ({
				label: name,
				value: _id,
			}));

			rowId = await openChoicePicker({
				title: "Save to",
				choices: [
					...choices,
					{
						label: "New automation",
						value: null,
						icon: (
							<svg
								viewBox="0 0 24 24"
								strokeWidth={1.5}
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M12 4.5v15m7.5-7.5h-15"
								/>
							</svg>
						),
					},
				],
			});
		}

		const actions = _.compact(_.map(flow, "runUrl"));
		const url =
			"crotchet://action/runAutomation?" +
			objectToQueryParams({
				actions,
			});

		try {
			if (rowId) {
				await dbInsert(
					"automations",
					{
						actions,
						url,
					},
					{ rowId }
				);
			} else {
				const name =
					(await openForm({
						title: "Save automation ",
						field: {
							label: "Automation name",
							type: "text",
						},
					})) || "Untitled Automation";

				await dbInsert("automations", {
					name,
					actions,
					url,
				});
			}
		} catch (error) {
			console.log("Save error: ", error);
		}

		showToast("Automation saved!");
		dismiss();
	};

	if (!automationActions) return <h3>Loading...</h3>;

	return (
		<div style={{ height: maxHeight + "px" }}>
			<div
				className={clsx("px-4 pb-4 sticky top-0 z-10", {
					"bg-stone-100/90 dark:bg-card/90 backdrop-blur": stuck,
				})}
				style={{
					paddingTop: "env(safe-area-inset-top)",
				}}
			>
				<div className="relative h-14 w-full flex items-center gap-1 bg-content/5 rounded-full">
					<button
						type="button"
						className="absolute left-0 size-10 flex items-center justify-center"
						onClick={dismiss}
					>
						<svg
							className="size-7 opacity-40"
							fill="none"
							viewBox="0 0 24 24"
							strokeWidth="3"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M15.75 19.5 8.25 12l7.5-7.5"
							/>
						</svg>
					</button>

					<div className="flex-1 flex justify-center">
						<h3 className="text-lg/none font-bold first-letter:uppercase">
							Automation
						</h3>
					</div>
				</div>
			</div>
			<div className="px-6 py-4 flex flex-col items-center gap-8">
				{flow.map(({ __id, ...entry }, index) => {
					if (objectIsEmpty(entry) || !entry.actions) return null;

					return (
						<AutomationFlow
							key={__id}
							flow={entry}
							onSelect={(payload) => handleSelect(index, payload)}
							onSuccess={(payload) => updateFlow(index, payload)}
						/>
					);
				})}

				<div className="mb-12">
					{flow.length > 1 && (
						<ActionGrid
							key={_.compact(_.map(flow, "runUrl"))}
							type="wrap"
							color="#84cc16"
							colorDark="#bef264"
							fallbackIcon="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z"
							data={[
								{
									label: "Save automation",
									handler: () => saveAutomation(flow),
								},
								{
									label: "Copy automation link",
									handler: () => {
										copyToClipboard(
											"crotchet://action/runAutomation?" +
												objectToQueryParams({
													actions: _.compact(
														_.map(flow, "runUrl")
													),
												})
										);
									},
								},
							]}
						/>
					)}
				</div>
			</div>
		</div>
	);
}
