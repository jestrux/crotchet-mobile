import { useMutation } from "@tanstack/react-query";
import { shuffle as doShuffle } from "@/utils";
import { useEffect, useRef, useState } from "react";
import { matchSorter } from "match-sorter";

export function useDataFetch({
	source,
	filters,
	limit = 50,
	first = false,
	shuffle: shuffleData,
	searchQuery,
	...props
}) {
	// const crotchetDataSource = appContext.dataSources?.[source?.name];
	// const crotchetProvider = inSearch
	// 	? crotchetDataSource?.searchHandler || crotchetDataSource?.handler
	// 	: crotchetDataSource?.handler;
	// const processedSource = {
	// 	...(source?.provider == "crotchet" && crotchetDataSource
	// 		? crotchetDataSource
	// 		: {}),
	// 	...source,
	// };

	// const sourceProviderRef = useRef(
	// 	source?.provider == "crotchet"
	// 		? crotchetProvider ?? (() => [])
	// 		: dataSourceProviders(source.provider)
	// );

	if (typeof source.handler != "function")
		console.log("Unknown source: ", source);

	const sourceProviderRef = useRef(source.handler);
	const [data, setData] = useState(null);
	const query = useMutation({
		mutationKey: [source._id, ...(source.searchable ? [searchQuery] : [])],
		mutationFn: sourceProviderRef.current,
	});

	const handleFetch = async (newData) => {
		let res = await query.mutateAsync(
			newData
				? newData
				: {
						...source,
						...props,
						searchQuery,
						filters,
				  }
		);

		if (res?.length && shuffleData) res = doShuffle(res);

		setData(res);
	};

	const searchData = (results, query, searchFields) => {
		if (!query?.length || !results?.length) return results;

		if (typeof source.search == "function")
			return source.search(results, query);

		return matchSorter(results, query, {
			keys: searchFields,
		});
	};

	const processData = (data) => {
		if (!data?.length) return null;

		if (typeof source.mapEntry == "function")
			data = data.map(source.mapEntry);

		if (![true, false].includes(source.searchable) && searchQuery?.length) {
			const searchFields = source.searchFields || [
				"title",
				"subtitle",
				"tags",
			];

			const searchable = searchFields.some((r) =>
				Object.keys(data[0]).includes(r)
			);

			if (searchable) data = searchData(data, searchQuery, searchFields);
		}

		if (first) return data[0];

		return data.slice(0, limit);
	};

	useEffect(() => {
		handleFetch();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return {
		...query,
		fieldMap: source.fieldMap,
		data: processData(data),
		isLoading: query.isLoading || query.isRefetching,
		shuffle: () => setData(doShuffle(doShuffle(data))),
		refetch: handleFetch,
	};
}
