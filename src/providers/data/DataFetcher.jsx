import { Children, cloneElement } from "react";
import { useDataFetch } from ".";
import { useAppContext } from "../app";

export default function DataFetcher({
	children,
	source = {
		provider: "",
	},
	limit = 500,
	first,
	shuffle: shuffleData,
}) {
	const appContext = useAppContext();
	const crotchetDataSource = appContext.dataSources?.[source?.name];
	source = {
		...(source?.provider == "crotchet" && crotchetDataSource
			? crotchetDataSource
			: {}),
		...source,
	};

	const { isLoading, isPending, data, refetch, shuffle } = useDataFetch({
		source,
		limit,
		first,
		shuffle: shuffleData,
	});

	if (typeof children != "function") {
		const mappedChildren = Children.map(children, (child) => {
			if (!child?.type) return null;

			return cloneElement(child, {
				fieldMap: source.fieldMap,
				isLoading: isLoading || isPending,
				data,
				refetch,
				shuffle,
			});
		});

		return mappedChildren;
	}

	return children({
		fieldMap: source.fieldMap,
		isLoading: isLoading || isPending,
		data,
		refetch,
		shuffle,
	});
}
