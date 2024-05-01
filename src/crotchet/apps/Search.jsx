import { useAppContext } from "@/providers/app";
import { SearchPage, registerApp } from "@/crotchet";

registerApp("search", () => {
	return {
		load(path, { showToast, openSearchPage, dataSources }) {
			const url = new URL("https://" + path);
			const source = url.pathname
				.split("/")
				.filter((v) => v?.length)
				.pop();

			const searchProps =
				source && dataSources[source]?.searchProps
					? dataSources[source]?.searchProps
					: {};

			const { q, query, debounce, ...params } = {
				...searchProps,
				...Object.fromEntries(url.searchParams.entries()),
			};

			if (source && !dataSources[source])
				return showToast(`Invalid data source ${source}`);

			Object.entries({
				q,
				query,
				debounce,
				...params,
			}).forEach(([key, value]) => {
				if (value != undefined) url.searchParams.set(key, value);
			});

			const actualSource = dataSources[source];
			const allParams = {
				...params,
				query: q ?? query,
				source: actualSource,
				debounce,
				global: !source,
			};

			openSearchPage(allParams);
		},
		open: function Open({ source, q, query, debounce, ...params }) {
			const { dataSources } = useAppContext();

			return (
				<SearchPage
					{...params}
					query={q ?? query}
					source={dataSources[source]}
					debounce={debounce}
					global={!source}
				/>
			);
		},
	};
});
