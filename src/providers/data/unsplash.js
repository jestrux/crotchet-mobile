import { webFetcher } from "./web/useWeb";

const CrotchetUnsplashCache = {};

export default async function unsplashFetcher({
	searchQuery,
	collection,
} = {}) {
	const darkMode =
		window.matchMedia &&
		window.matchMedia("(prefers-color-scheme: dark)").matches;
	collection = collection || darkMode ? "darkWallpaper" : "lightWallpaper";

	if (searchQuery) {
		return webFetcher({
			url: "https://api.unsplash.com/search/photos",
			params: {
				query: searchQuery,
				client_id: import.meta.env.VITE_unsplashClientId,
				per_page: 24,
			},
			responseField: "results",
		});
	}

	const random = "https://api.unsplash.com/photos/random";
	const collectionMaps = {
		random,
		"": random,
		true: random,
		undefined: random,
		null: random,
		darkWallpaper:
			"https://api.unsplash.com/collections/UI2FFD9lkxs/photos",
		lightWallpaper:
			"https://api.unsplash.com/collections/GcNdiOM1Cd4/photos",
	};

	const collectionUrl =
		collectionMaps[collection] ||
		`https://api.unsplash.com/collections/${collection}/photos`;

	if (CrotchetUnsplashCache[collectionUrl]?.data)
		return CrotchetUnsplashCache[collectionUrl].data;

	const res = await webFetcher({
		url: collectionUrl,
		params: {
			client_id: import.meta.env.VITE_unsplashClientId,
			count: 24,
		},
	});

	CrotchetUnsplashCache[collectionUrl] = { data: res, cachedOn: Date.now() };

	return res;
}
