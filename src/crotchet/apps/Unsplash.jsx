import {
	getShareUrl,
	registerAction,
	registerDataSource,
	shuffle,
} from "@/crotchet";

const unsplashIcon = (
	<svg viewBox="0 0 24 24" fill="currentColor">
		<path d="M7.5 6.75V0h9v6.75h-9zm9 3.75H24V24H0V10.5h7.5v6.75h9V10.5z" />
	</svg>
);

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

registerDataSource("crotchet://unsplash", "themeWallpapers", {
	collection: "wallpaper",
});

registerDataSource("unsplash", "unsplash", {
	mapEntry: (entry) => ({
		...entry,
		collection: entry.search,
		title: entry.alt_description,
		subtitle: entry.description,
		image: entry.urls.regular,
		share: getShareUrl(
			{
				preview: entry.urls.regular,
				title: entry.alt_description,
				url: entry.links.html,
				download: entry.urls.full,
				image: entry.urls.full,
			},
			"object"
		),
		url: `crotchet://copy-image/${entry.urls.regular}`,
	}),
	searchable: true,
	layoutProps: {
		layout: "masonry",
		columns: "sm:2,2xl:3,4xl:4",
	},
	searchProps: {
		debounce: 500,
	},
});

registerAction("searchUnsplash", {
	type: "search",
	url: `crotchet://search/unsplash?q=${randomSearchQuery()}`,
	tags: ["image", "search"],
});

registerAction("getRandomPicture", {
	label: "Random Pic",
	icon: unsplashIcon,
	global: true,
	handler: async (_, { copyImage, dataSources, showToast }) => {
		try {
			const image = await dataSources.unsplash.random();
			copyImage(image.urls.regular, { withToast: true });
		} catch (error) {
			console.log("Error: ", error);
			showToast(error);
		}
	},
});
