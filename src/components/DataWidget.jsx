import Loader from "./Loader";
import Widget from "./Widget";
import ListItem from "./ListWidget/ListItem";
import DataFetcher from "@/providers/data/DataFetcher";

function DataWidgetContent({
	data,
	isLoading,
	refetch = () => {},
	widgetProps,
	children,
	fieldMap = {},
	...props
}) {
	let content = (
		<div className="relative h-8 min-w-full min-h-full flex items-center justify-center">
			<Loader scrimColor="transparent" size={25} />
		</div>
	);

	if (!isLoading) {
		if (!data) content = null;
		else {
			content =
				typeof children == "function" ? (
					children(data)
				) : (
					<div className="pb-2">
						{data.map((entry, index) => (
							<ListItem
								key={index}
								data={entry}
								{...fieldMap}
								{...props}
							/>
						))}
					</div>
				);
		}
	}

	return (
		<Widget {...widgetProps} refresh={refetch}>
			{content}
		</Widget>
	);
}

export default function DataWidget({ source, ...props }) {
	if (source) {
		return (
			<DataFetcher source={source} {...props}>
				<DataWidgetContent {...props} />
			</DataFetcher>
		);
	}
	return <DataWidgetContent {...props} />;
}
