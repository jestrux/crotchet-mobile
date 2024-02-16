import { useAppContext } from "../app";
import { useMutation } from "@tanstack/react-query";
import { shuffle as doShuffle } from "@/utils";
import { useEffect, useRef, useState } from "react";
import { firebaseFetcher } from "./firebase/useFirebase";
import { webFetcher } from "./web/useWeb";
import { airtableFetcher } from "./airtable/useAirtable";
import { loadDb, sqlFetcher } from "./sql";

export const dataSources = {
	web: ({
		url,
		body = {},
		bearerToken,
		responseType = "json",
		responseField,
	} = {}) => {
		return {
			provider: "web",
			url,
			body,
			bearerToken,
			responseType,
			responseField,
		};
	},
	airtable: ({ table, filters, orderBy = "created_at|asc" } = {}) => {
		return {
			provider: "airtable",
			table,
			filters,
			orderBy,
		};
	},
	firebase: ({ collection, orderBy } = {}) => {
		return {
			provider: "firebase",
			collection,
			orderBy,
		};
	},
	sql: ({
		dbUrl = "https://firebasestorage.googleapis.com/v0/b/letterplace-c103c.appspot.com/o/dev.db?alt=media&token=9493e08d-9b41-4760-8d86-20be77393280",
		query,
	} = {}) => {
		return {
			provider: "sql",
			dbUrl,
			query,
		};
	},
};

export default function useDataFetch({
	source,
	limit = 100,
	first = false,
	shuffle: shuffleData,
}) {
	const dbRef = useRef();
	const [data, setData] = useState(null);
	const appContext = useAppContext();
	const processors = {
		airtable: () => airtableFetcher({ ...source, appContext }),
		firebase: () => firebaseFetcher(source),
		web: () => webFetcher(source),
		sql: async () => {
			let db = dbRef.current;
			if (!db) {
				const res = await loadDb(source.dbUrl);
				dbRef.current = res;
				db = res;
			}

			return sqlFetcher({ ...source, db });
		},
	};

	const query = useMutation({
		mutationKey: [],
		mutationFn: processors[source.provider],
	});

	const handleFetch = async () => {
		let res = await query.mutateAsync();

		if (res?.length && shuffleData) res = doShuffle(res);

		setData(res);
	};

	const processData = (data) => {
		if (!data?.length) return data;

		if (first) return data[0];

		return data.slice(0, limit);
	};

	useEffect(() => {
		handleFetch();
	}, []);

	return {
		...query,
		data: processData(data),
		isLoading: query.isLoading || query.isRefetching,
		shuffle: () => setData(doShuffle(doShuffle(data))),
		refetch: handleFetch,
	};
}
