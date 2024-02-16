import { Children, cloneElement } from "react";
import useDataFetch from ".";

export default function DataFetcher({
	children,
	source = {
		provider: "",
	},
	limit = 500,
	first,
	shuffle: shuffleData,
}) {
	const { isLoading, isPending, data, refetch, shuffle } = useDataFetch({
		source,
		limit,
		first,
		shuffle: shuffleData,
	});

	if (typeof children != "function") {
		const mappedChildren = Children.map(children, (child) =>
			cloneElement(child, {
				isLoading: isLoading || isPending,
				data,
				refetch,
				shuffle,
			})
		);

		return mappedChildren;
	}

	return children({
		isLoading: isLoading || isPending,
		data,
		refetch,
		shuffle,
	});
}
