import { webFetcher } from "./web/useWeb";
import { random as randomItem } from "@/utils";

const CrotchetUnsplashCache = {};

export default async function unsplashFetcher({
	searchQuery,
	collection,
} = {}) {
	if (searchQuery) {
		return webFetcher({
			url: "https://api.unsplash.com/search/photos",
			params: {
				query: searchQuery,
				client_id: import.meta.env.VITE_unsplashClientId,
				per_page: 30,
			},
			responseField: "results",
		});
	}

	if (!collection?.length) return [];

	const darkMode =
		window.matchMedia &&
		window.matchMedia("(prefers-color-scheme: dark)").matches;

	collection =
		collection == "wallpaper"
			? darkMode
				? "darkWallpaper"
				: "lightWallpaper"
			: collection;

	const random = "https://api.unsplash.com/photos/random";
	const collectionMaps = {
		random,
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
			page: randomItem([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]),
			per_page: 30,
		},
	});

	CrotchetUnsplashCache[collectionUrl] = { data: res, cachedOn: Date.now() };

	return res;
}
