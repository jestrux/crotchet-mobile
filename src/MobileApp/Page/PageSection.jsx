import GridList from "@/components/GridList";
import { ActionGrid, randomId, sourceGet } from "@/crotchet";
import useDataLoader from "@/hooks/useDataLoader";
import { useState } from "react";

export default function PageSection({
	title,
	type,
	data: _data,
	source,
	meta,
	onSectionLoaded = () => {},
}) {
	const [dataRef, setDataRef] = useState();
	const { data } = useDataLoader({
		handler: () => (source ? sourceGet(source, meta) : _data),
		listenForUpdates: source?.listenForUpdates,
		onUpdate: () => {
			setDataRef(randomId());
		},
		onSuccess: onSectionLoaded,
	});
	const sourceProps = _.pick(source, ["entryActions", "layoutProps"]);

	if (!data?.length) return null;

	if (type == "actions") {
		return (
			<ActionGrid
				{...sourceProps}
				{...meta}
				title={title}
				type={meta?.inline ? "inline" : "grid"}
				data={data}
				key={dataRef}
			/>
		);
	}

	if (type == "grid") {
		return (
			<GridList
				{...sourceProps}
				{...meta}
				title={title}
				data={data}
				key={dataRef}
			/>
		);
	}

	return null;
}
