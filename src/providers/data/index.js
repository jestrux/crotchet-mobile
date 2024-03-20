import { useMutation } from "@tanstack/react-query";
import { shuffle as doShuffle } from "@/utils";
import { useEffect, useRef, useState } from "react";
import { matchSorter } from "match-sorter";

export function useDataFetch({
	source,
	limit = 3000,
	first = false,
	shuffle: shuffleData,
	searchQuery: _searchQuery,
	filters: _filters,
	// ...props
}) {
	if (typeof source.handler != "function")
		console.log("Unknown source: ", source);

	const getParams = ({ searchQuery, filters }) => {
		const validFilters =
			!Object.values(filters || {}).filter(
				(v) => v?.toString().length > 0
			).length > 0;

		return new URLSearchParams(
			Object.fromEntries(
				Object.entries({
					...(source.filterable != true || !validFilters
						? {}
						: { filters }),
					...(source.searchable !== true || !searchQuery?.length
						? {}
						: {
								searchQuery,
						  }),
				}).filter(([, value]) => value != undefined)
			)
		).toString();
	};

	const paramsRef = useRef(getParams({ _searchQuery, _filters }));
	const [searchQuery, setSearchQuery] = useState(_searchQuery);
	const [filters, setFilters] = useState(_filters);
	const [data, setData] = useState(null);
	const query = useMutation({
		mutationKey: [source?._id, getParams({ searchQuery, filters })],
		mutationFn: source?.handler ?? (() => {}),
	});

	const searchData = (results, query, searchFields) => {
		if (!query?.length || !results?.length) return results;

		if (typeof source.search == "function")
			return source.search({ results, searchQuery: query, searchFields });

		return matchSorter(results, query, {
			keys: searchFields,
		});
	};

	const processData = (data) => {
		if (!data?.length) return null;

		if (
			Object.values(filters || {}).filter((v) => v?.toString().length > 0)
				.length > 0 &&
			![true, false].includes(source.filterable)
		) {
			data = data.reduce((agg, entry) => {
				if (typeof source.mapEntry == "function")
					entry = { ...entry, ...source.mapEntry(entry) };

				const matches = Object.entries(filters).every(
					([key, value]) =>
						value?.toString().toLowerCase() ==
						entry[key]?.toString().toLowerCase()
				);

				return [...agg, ...(matches ? [entry] : [])];
			}, []);
		} else if (typeof source.mapEntry == "function") {
			data = data.map((entry) => ({
				...entry,
				...source.mapEntry(entry),
			}));
		}

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

	const handleFetch = async ({ searchQuery } = {}, paramsChanged = true) => {
		let res =
			!paramsChanged && data
				? data
				: await query.mutateAsync({
						source,
						...(source.searchable !== true || !searchQuery?.length
							? {}
							: {
									searchQuery,
							  }),
				  });

		if (res?.length && shuffleData) res = doShuffle(doShuffle(res));

		setData(res);

		return res;
	};

	const handleRefetch = (newProps) => {
		if (newProps) {
			if (newProps.searchQuery != undefined)
				setSearchQuery(newProps.searchQuery);

			if (newProps.filters != undefined) setFilters(newProps.filters);
		}

		handleFetch(
			{ searchQuery, filters, ...(newProps || {}) },
			getParams({ searchQuery, filters }) != paramsRef.current
		);
	};

	useEffect(() => {
		handleFetch({ searchQuery, filters });
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return {
		// ...query,
		error: query.error,
		data: processData(data),
		isLoading: query.isLoading || query.isRefetching,
		fieldMap: source.fieldMap,
		shuffle: () => setData(doShuffle(doShuffle(data))),
		refetch: handleRefetch,
	};
}
