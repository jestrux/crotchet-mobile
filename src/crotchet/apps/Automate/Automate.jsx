import {
	ActionGrid,
	DataWidget,
	objectIsEmpty,
	randomId,
	useAppContext,
	useSourceGet,
} from "@/crotchet";
import clsx from "clsx";
import { useRef, useState } from "react";

const AutomationPreview = ({ data, meta = {}, type }) => {
	if (!data) return;

	if (type == "jsonArray") data = data[0];

	if (type == "viewData") data = data.slice(0, 4);

	const content = () => {
		if (type == "viewData")
			return (
				<DataWidget large data={data} {...(meta?.layoutProps || {})} />
			);

		return (
			<div className="bg-content/5 m-2 p-2 h-16 overflow-hidden">
				{JSON.stringify(data, null, 4)}
			</div>
		);
	};

	return (
		<div className="w-full rounded-md bg-card shadow dark:bg-content/5 border border-content/5">
			{content()}
		</div>
	);
};

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
				console.log("Already fetched!");
				onSuccess(actionRef.current.data);
				return actionRef.current.data;
			}

			if (!_.isFunction(action?.handler))
				throw `Unknown action ${_action}`;

			const res = await action?.handler({ ...(data || {}), savedData });

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

const AutomationFlow = ({ flow: _flow, onSuccess = () => {} }) => {
	const { automationActions } = useAppContext();
	const [{ actions, data, selectedAction: _selectedAction }] =
		useState(_flow);
	const [savedData, setSavedData] = useState({});
	const [selectedAction, setSelectedAction] = useState(
		_selectedAction ? automationActions[_selectedAction] : null
	);

	const handleSuccess = (res = {}) => {
		setSelectedAction(null);

		setSavedData((actionData) => {
			const { data, meta } = res;
			return {
				...actionData,
				[selectedAction?.name]: { data, meta },
			};
		});

		onSuccess(res);
	};

	const getActions = (actions) => {
		return actions
			.map((action) => {
				const actualAction = automationActions[action];

				if (!actualAction) {
					console.log("Action not found: ", action);
					return null;
				}

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
			{data && <AutomationPreview {...data} />}

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
	const { automationActions } = useAppContext();
	const stuck = false;
	const [flow, setFlow] = useState([
		{
			__id: randomId(),
			selectedAction: action ? action : null,
			actions: action ? [action] : [],
		},
	]);

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
				{flow.map(({ __id, ...flow }, index) => {
					if (objectIsEmpty(flow))
						return <div key={__id}>End of flow...</div>;

					return (
						<AutomationFlow
							key={__id}
							flow={flow}
							onSuccess={(payload) => updateFlow(index, payload)}
						/>
					);
				})}
			</div>
		</div>
	);
}
