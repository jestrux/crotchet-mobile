import { firebaseFetcher } from "./firebase/useFirebase";
import { webFetcher } from "./web/useWeb";
import { airtableFetcher } from "./airtable/useAirtable";
import CrotchetCrawler from "./crawler";
import CrotchetSQL from "./sql";
import unsplashFetcher from "./unsplash";

export default function dataSourceProviders(provider, props = {}) {
	return {
		airtable: () => airtableFetcher({ ...props, appContext: { user: {} } }),
		firebase: () => firebaseFetcher({ ...props }),
		unsplash: ({ searchQuery }) =>
			unsplashFetcher({
				...props,
				...(searchQuery ? { searchQuery } : {}),
			}),
		web: () => webFetcher({ ...props }),
		sql: ({ query } = {}) => {
			const data = {
				...props,
				...(query ? { query } : {}),
			};

			return new CrotchetSQL(data).exec(data.query);
		},
		crawler: ({ match, searchQuery } = {}) => {
			const data = {
				...props,
				...(match ? { match } : {}),
				...(searchQuery ? { searchQuery } : {}),
			};

			return new CrotchetCrawler(data).match(data.searchQuery);
		},
	}[provider];
}
