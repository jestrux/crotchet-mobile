import { registerAction, registerDataSource, shuffle } from "@/crotchet";

const randomSearchQuery = () =>
	shuffle(
		shuffle([
			"spring",
			"wilderness",
			"serene",
			"beach",
			"mountains",
			"retro",
			"interior design",
			"concert",
		])
	)[0];

registerDataSource("unsplash", "unsplash", {
	fieldMap: {},
	mapEntry: (entry) => ({
		...entry,
		collection: entry.search,
		title: entry.alt_description,
		subtitle: entry.description,
		image: entry.urls.regular,
		share: `crotchet://share-image/${entry.urls.regular}`,
		url: `crotchet://copy-image/${entry.urls.regular}`,
	}),
	searchable: true,
});

registerAction("searchUnsplash", {
	global: true,
	url: `crotchet://search/unsplash?q=${randomSearchQuery()}&layout=masonry&columns=sm:2,2xl:3,4xl:4`,
	tags: ["image", "search"],
});

registerAction("getRandomPicture", {
	global: true,
	handler: async ({ copyImage, dataSources, showToast }) => {
		try {
			const image = await dataSources.unsplash.random();
			copyImage(image.urls.regular, { withToast: true });
		} catch (error) {
			console.log("Error: ", error);
			showToast(error);
		}
	},
});
