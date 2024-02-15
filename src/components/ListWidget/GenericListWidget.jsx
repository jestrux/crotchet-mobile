import Loader from "../Loader";
import Widget from "../Widget";
import ListItem from "./ListItem";

export default function GenericListWidget({
	data,
	isLoading,
	refetch = () => {},
	widgetProps,
	children,
	image,
	title,
	subtitle,
	...props
}) {
	return (
		<Widget {...widgetProps} refresh={refetch}>
			{!data && isLoading ? (
				<div className="relative h-8">
					<Loader scrimColor="transparent" size={25} />
				</div>
			) : (
				<div className="pb-2">
					{data &&
						(typeof children == "function"
							? children(data)
							: data.map((entry, index) => (
									<ListItem
										key={index}
										data={entry}
										{...{
											image,
											title,
											subtitle,
											...props,
										}}
									/>
							  )))}
				</div>
			)}
		</Widget>
	);
}
