import { useAppContext } from "@/providers/app";
import { SearchPage, registerApp } from "..";
import dataSource from "@/providers/data/dataSource";

const getSearchSource = ({ source, dataSources, ...params }) => {
	const [_source, provider = "crotchet"] = source.split("://").reverse();
	return provider == "crotchet"
		? dataSources?.[_source]
		: typeof dataSource[provider] == "function"
		? dataSource[provider]({ ...params })
		: null;
};

registerApp("search", () => {
	return {
		load(path, { showToast, onDesktop, openSearchPage, dataSources }) {
			const url = new URL("https://" + path);
			const {
				source,
				q,
				query,
				columns = 2,
				layout = "grid",
				live = false,
				width = 360,
				height = 540,
				...params
			} = Object.fromEntries(url.searchParams.entries());

			const theSource = getSearchSource({
				source,
				dataSources,
				...params,
			});

			if (!source || !theSource)
				return showToast(`Invalid data source ${source}`);

			Object.entries({ q, query, columns, layout, ...params }).forEach(
				([key, value]) => {
					if (value != undefined) url.searchParams.set(key, value);
				}
			);

			if (onDesktop()) {
				return window.__crotchet.socketEmit("app", {
					scheme: "search",
					url: url.href.replace("https://", ""),
					window: {
						width,
						height,
						backgroundColor: "#000000",
						titleBarStyle: "hiddenInset",
						darkTheme: true,
					},
				});
			}

			openSearchPage({
				query: q ?? query,
				source: theSource,
				layout,
				columns,
				liveSearch: live,
			});
		},
		open: function Open({
			source,
			q,
			query,
			columns,
			layout,
			live,
			...params
		}) {
			const { dataSources } = useAppContext();
			const theSource = getSearchSource({
				source,
				dataSources,
				...params,
			});

			return (
				<SearchPage
					query={q ?? query}
					layout={layout}
					columns={columns}
					source={theSource}
					liveSearch={live}
				/>
			);
		},
	};
});
