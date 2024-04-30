import DataWidget from "@/components/DataWidget";
import clsx from "clsx";
import useLoadableView from "@/hooks/useLoadableView";
import { ListItem } from "@/crotchet";

export default function DataPreviewer({
	dismiss,
	mini = false,
	data: _data,
	meta = {},
	type,
}) {
	let { data, pendingView } = useLoadableView({
		data: _data,
		dismiss,
	});

	if (pendingView !== true) return pendingView;

	if (data && type == "jsonArray") data = data[0];

	const content = () => {
		if (type == "viewData") {
			if (_.isArray(data)) {
				return (
					<DataWidget
						large
						data={data.slice(0, 4)}
						{...(meta?.layoutProps || {})}
					/>
				);
			}

			if (_.isObject(data))
				return (
					<div className="py-1 px-2">
						<ListItem large {...data} />
					</div>
				);
		}

		return (
			<div
				className={clsx("bg-content/5 m-2 p-2 overflow-hidden", {
					"h-16": mini,
				})}
			>
				{JSON.stringify(data, null, 4)}
			</div>
		);
	};

	return (
		<div className="w-full rounded-md bg-card shadow dark:bg-content/5 border border-content/5">
			{content()}
		</div>
	);
}
