import Loader from "@/components/Loader";
import Widget from "@/components/Widget";

import ListItem from "@/components/ListWidget/ListItem";
import useFirebase from "./useFirebase";

const FirebaseListWidget = ({
	collection,
	orderBy,
	limit,
	widgetProps,
	children,
	noPadding = true,
	image,
	title,
	subtitle,
	...props
}) => {
	if (widgetProps === undefined) widgetProps = { noPadding };

	const { isLoading, refetch, data, error } = useFirebase({
		collection,
		orderBy,
		limit,
	});

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
};

export default FirebaseListWidget;
