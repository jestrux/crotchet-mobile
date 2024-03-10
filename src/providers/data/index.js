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

export function dataSourceProviders(source, appContext = { user: {} }) {
	return {
		airtable: () => airtableFetcher({ ...source, appContext }),
		firebase: () => firebaseFetcher(source),
		unsplash: ({ searchQuery }) =>
			unsplashFetcher({
				...source,
				query: searchQuery || source.searchQuery,
			}),
		web: () => webFetcher(source),
		sql: ({ query } = {}) =>
			new CrotchetSQL(source).exec(query || source.query),
		crawler: ({ match, searchQuery } = {}) =>
			new CrotchetCrawler(source).match(
				match || source.match,
				searchQuery || source.searchQuery
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

	const handleFetch = async (newData) => {
		let res = await query.mutateAsync(
			newData
				? newData
				: {
						...processedSource,
						q,
						filters,
						...props,
				  }
		);

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
