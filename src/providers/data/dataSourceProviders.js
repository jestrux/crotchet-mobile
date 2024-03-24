import { firebaseFetcher } from "./firebase/useFirebase";
import { webFetcher } from "./web/useWeb";
import { airtableFetcher } from "./airtable/useAirtable";
import CrotchetCrawler from "./crawler";
import CrotchetSQL from "./sql";
import unsplashFetcher from "./unsplash";
import { objectExcept } from "@/utils";
import CrotchetLibSQL, { CrotchetLibSQLCache } from "./sql/lib-sql";

export const getCrotchetDataSourceProvider = (parent, name, props) => {
	const parentSource = window.__crotchet.dataSources?.[parent];

	if (!parentSource) {
		if (!window.__crotchet.pendingDataSources) {
			window.__crotchet.pendingDataSources = {
				[parent]: [],
			};
		}

		const pendingParent = window.__crotchet.pendingDataSources[parent];

		if (!pendingParent) window.__crotchet.pendingDataSources[parent] = [];

		window.__crotchet.pendingDataSources[parent] = [
			...pendingParent,
			[`crotchet://${parent}`, name, props],
		];

		return;
	}

	const parentProps = objectExcept(parentSource, ["label", "name"]);
	const _source = typeof props == "function" ? { handler: props } : props;
	return {
		...parentProps,
		..._source,
		handler: (payload = {}) =>
			parentProps.handler({ ...props, ...payload }),
	};
};

export default function dataSourceProviders(provider, props = {}) {
	return {
		airtable: (payload) =>
			airtableFetcher({ ...props, ...payload, appContext: { user: {} } }),
		firebase: (payload = {}) => firebaseFetcher({ ...props, ...payload }),
		unsplash: ({ searchQuery, ...payload }) =>
			unsplashFetcher({
				...props,
				...payload,
				...(searchQuery ? { searchQuery } : {}),
			}),
		web: (payload = {}) => webFetcher({ ...props, ...payload }),
		libSql: ({ query, ...payload } = {}) => {
			const { dbUrl, authToken } = props;
			const key = `${dbUrl}:${authToken}`;

			if (!CrotchetLibSQLCache[key]) {
				CrotchetLibSQLCache[key] = new CrotchetLibSQL({
					dbUrl,
					authToken,
				});
			}

			const instance = CrotchetLibSQLCache[key];

			const data = {
				...props,
				...payload,
				...(query ? { query } : {}),
			};

			return instance.exec(objectExcept(data, ["dbUrl", "authToken"]));
		},
		sql: ({ query, ...payload } = {}) => {
			const data = {
				...props,
				...payload,
				...(query ? { query } : {}),
			};

			return new CrotchetSQL(data).exec(data.query);
		},
		crawler: ({ match, searchQuery, ...payload } = {}) => {
			const data = {
				...props,
				...payload,
				...(match ? { match } : {}),
				...(searchQuery ? { searchQuery } : {}),
			};

			return new CrotchetCrawler(data).match(data.searchQuery);
		},
	}[provider];
}
