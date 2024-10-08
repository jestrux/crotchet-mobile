import { useMutation } from "@tanstack/react-query";
import {
	cleanObject,
	shuffle as doShuffle,
	objectExcept,
	objectTake,
	randomId,
} from "@/utils";
import { useEffect, useRef, useState } from "react";
import { matchSorter } from "match-sorter";
import { useOnInit } from "@/crotchet";

export const getterFields = [
	"limit",
	"single",
	"first",
	"random",
	"fieldMap",
	"mapEntry",
	"orderBy",
	"searchable",
	"searchFields",
	"searchQuery",
];

export const sourceGet = async (source, props = {}) => {
	if (typeof source == "function") source = { handler: source };

	const payload = objectExcept(props, getterFields);
	let {
		limit,
		single,
		first,
		random,
		orderBy,
		mapEntry,
		searchable,
		searchFields = ["title", "subtitle", "tags"],
		searchQuery,
	} = objectTake({ ...source, ...props }, getterFields);

	let handler;

	if ([typeof source?.get, typeof source?.handler].includes("function")) {
		handler = typeof source.get == "function" ? source.get : source.handler;
		// random = random || source.random;
		// single = single || source.single;
		// first = first || source.first;
		// searchable = searchable || source.searchable;
		// searchFields = searchFields || source.searchFields;
		// searchQuery = searchQuery || source.searchQuery;
	}

	if (typeof handler != "function") return null;

	let res = await handler(payload);

	if (!Array.isArray(res)) return res;

	const validFilters = cleanObject(props?.filters || {});
	if (
		Object.values(validFilters).length > 0
		// && ![true, false].includes(source.filterable)
	) {
		console.log("Valid filters: ", validFilters);
		res = res.reduce((agg, entry) => {
			if (typeof mapEntry == "function")
				entry = { ...entry, ...mapEntry(entry) };

			const matches = Object.entries(validFilters).every(
				([key, value]) =>
					value?.toString().toLowerCase() ==
					entry[key]?.toString().toLowerCase()
			);

			return [...agg, ...(matches ? [entry] : [])];
		}, []);
	} else if (typeof mapEntry == "function") res = res.map(mapEntry);

	if (searchable !== false && res?.length && searchQuery?.length) {
		res = matchSorter(res, searchQuery, {
			keys: searchFields,
		});
	}

	if (orderBy) res = _.orderBy(res, ...orderBy.split(","));

	if (random == true) res = doShuffle(doShuffle(res));

	if (single || first) return res[0];

	if (limit) return res.slice(0, limit);

	return res;
};

export function useSourceGet(
	source,
	{ delayLoader = true, shuffle, single, ...props } = {}
) {
	const loadingRef = useRef();
	const [res, setRes] = useState({
		loading: false,
		data: null,
		error: null,
		refetch: () => doFetch(true),
	});

	const onChange = (newState) => {
		setRes((res) => ({
			...res,
			...newState,
		}));
	};

	const doFetch = async (fromRefetch) => {
		if (!source) return;

		// if (res.loading) return null;

		onChange({
			error: null,
			// data: null,
		});

		loadingRef.current = setTimeout(
			() => {
				onChange({
					loading: !fromRefetch,
				});
			},
			delayLoader ? 1500 : 0
		);

		try {
			const data = await sourceGet(source, {
				fromRefetch,
				single,
				shuffle,
				...props,
			});
			onChange({
				loading: false,
				data,
			});
		} catch (error) {
			// console.log("Fetch error: ", error);
			onChange({
				loading: false,
				error: error.toString(),
			});
		} finally {
			if (loadingRef.current) clearInterval(loadingRef.current);
		}
	};

	useOnInit(() => doFetch());

	return res;
}

export function useDataFetch({
	source,
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

	const cacheRef = useRef(randomId());
	const paramsRef = useRef(getParams({ _searchQuery, _filters }));
	const [searchQuery, setSearchQuery] = useState(_searchQuery);
	const [filters, setFilters] = useState(_filters);
	const [data, setData] = useState(null);
	const query = useMutation({
		mutationKey: [
			source?._id,
			getParams({ searchQuery, filters }),
			cacheRef.current,
		],
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

		if (source.orderBy)
			data = _.orderBy(data, ...source.orderBy.split(","));

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

		// return data.slice(0, limit);
		return data.slice(0, 50);
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
		cacheRef.current = randomId();

		// query.variables.
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
