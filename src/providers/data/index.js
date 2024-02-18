import { useAppContext } from "../app";
import { useMutation } from "@tanstack/react-query";
import { shuffle as doShuffle } from "@/utils";
import { useEffect, useRef, useState } from "react";
import { firebaseFetcher } from "./firebase/useFirebase";
import { webFetcher } from "./web/useWeb";
import { airtableFetcher } from "./airtable/useAirtable";
import CrotchetCrawler from "./crawler";
import CrotchetSQL from "./sql";
import unsplashFetcher from "./unsplash";

export const dataSource = {
	web: ({
		url,
		bearerToken,
		responseType = "json",
		responseField,
		searchParam = "q",
		params = {},
		headers,
		filters,
		search,
		...otherProps
	} = {}) => {
		return {
			provider: "web",
			url,
			bearerToken,
			responseType,
			responseField,
			searchParam,
			filters,
			headers,
			params,
			search,
			...(otherProps || {}),
		};
	},
	unsplash: (collection, { query, fieldMap, ...otherProps } = {}) => {
		return {
			provider: "unsplash",
			collection,
			query,
			fieldMap: {
				title: "alt_description",
				subtitle: "description",
				image: "urls.regular",
				action: "copy://urls.regular",
				...(fieldMap || {}),
			},
			...(otherProps || {}),
		};
	},
	airtable: ({
		table,
		filters,
		orderBy = "created_at|asc",
		search,
		...otherProps
	} = {}) => {
		return {
			provider: "airtable",
			table,
			filters,
			orderBy,
			search,
			...(otherProps || {}),
		};
	},
	firebase: ({ collection, orderBy, search, ...otherProps } = {}) => {
		return {
			provider: "firebase",
			collection,
			orderBy,
			search,
			...(otherProps || {}),
		};
	},
	sql: ({ dbUrl, query, search, ...otherProps } = {}) => {
		return {
			provider: "sql",
			dbUrl,
			query,
			search,
			...(otherProps || {}),
		};
	},
	crawler: ({
		url,
		match,
		searchable,
		searchableFields,
		search,
		...otherProps
	} = {}) => {
		return {
			provider: "crawler",
			url,
			match,
			searchable,
			searchableFields,
			search,
			...(otherProps || {}),
		};
	},
	crotchet: (name, { q, filters, search, ...otherProps } = {}) => {
		return {
			provider: "crotchet",
			name,
			q,
			filters,
			search,
			...(otherProps || {}),
		};
	},
};

export function dataSourceProviders(source, appContext = { user: {} }) {
	return {
		airtable: () => airtableFetcher({ ...source, appContext }),
		firebase: () => firebaseFetcher(source),
		unsplash: ({ query }) =>
			unsplashFetcher({ ...source, query: query || source.query }),
		web: () => webFetcher(source),
		sql: ({ query } = {}) =>
			new CrotchetSQL(source).exec(query || source.query),
		crawler: ({ match, query } = {}) =>
			new CrotchetCrawler(source).match(
				match || source.match,
				query || source.query
			),
	}[source.provider];
}

export function useDataFetch({
	inSearch,
	source,
	q,
	filters,
	limit = 100,
	first = false,
	shuffle: shuffleData,
	...props
}) {
	const appContext = useAppContext();
	const crotchetDataSource = appContext.dataSources?.[source?.name];
	const crotchetProvider = inSearch
		? crotchetDataSource?.searchHandler || crotchetDataSource?.handler
		: crotchetDataSource?.handler;
	const processedSource = {
		...(source?.provider == "crotchet" && crotchetDataSource
			? crotchetDataSource
			: {}),
		...source,
	};

	const sourceProviderRef = useRef(
		source?.provider == "crotchet"
			? crotchetProvider ?? (() => [])
			: dataSourceProviders(source, appContext)
	);
	const [data, setData] = useState(null);

	const query = useMutation({
		mutationKey: [],
		mutationFn: sourceProviderRef.current,
	});

	const handleFetch = async () => {
		let res = await query.mutateAsync({
			...processedSource,
			q,
			filters,
			...props,
		});

		if (res?.length && shuffleData) res = doShuffle(res);

		setData(res);
	};

	const processData = (data) => {
		if (!data?.length) return null;

		if (first) return data[0];

		return data.slice(0, limit);
	};

	useEffect(() => {
		handleFetch();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return {
		...query,
		fieldMap: processedSource.fieldMap,
		data: processData(data),
		isLoading: query.isLoading || query.isRefetching,
		shuffle: () => setData(doShuffle(doShuffle(data))),
		refetch: handleFetch,
	};
}
