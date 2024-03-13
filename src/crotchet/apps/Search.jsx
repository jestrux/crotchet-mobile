import { useAppContext } from "@/providers/app";
import { SearchPage, registerApp } from "..";

registerApp("search", () => {
	return {
		load(path, { showToast, onDesktop, openSearchPage, dataSources }) {
			const url = new URL("https://" + path);
			const source = url.pathname.split("/").filter((v) => v?.length);

			const {
				q,
				query,
				columns = 2,
				layout = "grid",
				live = true,
				width = 780,
				height = 800,
				// width = 360,
				// height = 540,
				...params
			} = Object.fromEntries(url.searchParams.entries());

			if (source && !dataSources[source])
				return showToast(`Invalid data source ${source}`);

			Object.entries({ q, query, columns, layout, ...params }).forEach(
				([key, value]) => {
					if (value != undefined) url.searchParams.set(key, value);
				}
			);

			if (onDesktop()) {
				url.searchParams.set("source", source);

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
				...params,
				query: q ?? query,
				source: dataSources[source],
				layout,
				columns,
				liveSearch: live,
				global: !source,
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

			return (
				<SearchPage
					{...params}
					query={q ?? query}
					layout={layout}
					columns={columns}
					source={dataSources[source]}
					liveSearch={live}
					global={!source}
				/>
			);
		},
	};
});
