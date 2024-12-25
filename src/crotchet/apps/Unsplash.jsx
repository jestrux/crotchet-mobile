import { getShareUrl, random, registerAction, registerDataSource } from "@/crotchet";

const unsplashIcon = (
	<svg viewBox="0 0 24 24" fill="currentColor">
		<path d="M7.5 6.75V0h9v6.75h-9zm9 3.75H24V24H0V10.5h7.5v6.75h9V10.5z" />
	</svg>
);

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

registerDataSource("crotchet://unsplash", "themeWallpapers", {
	collection: "wallpaper",
});

registerAction("UnsplashImage", {
	context: "share",
	icon: unsplashIcon,
	match: ({ url }) =>
		url?.toString().length &&
		url.startsWith("https://images.unsplash.com/"),
	preview: (image) => <img src={image} className="w-full" />,
	handler: ({ url } = {}, { openUrl }) => openUrl(url),
});

export const searchUnsplash = async (searchQuery) => {
	const clientId = import.meta.env.VITE_unsplashClientId;
	const page = random([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
	let url = `https://api.unsplash.com/photos?client_id=${clientId}&page=${page}&per_page=30`;

	if (searchQuery)
		url = `https://api.unsplash.com/search/photos?query=${searchQuery}&client_id=${clientId}`;

	let data = await fetch(url).then((res) => res.json());

	return (data.results || data).map((entry) => ({
		...entry,
		collection: entry.search,
		title: entry.alt_description,
		subtitle: entry.description,
		image: entry.urls.regular,
		url: `crotchet://copy/${entry.urls.regular}`,
	}));
};

registerAction("unsplash", {
	icon: unsplashIcon,
	label: "Unsplash",
	type: "search",
	global: true,
	action: {
		label: "Search",
	},
	actions: () => {
		return [
			{
				label: "Random Image",
				handler: async (_, { copyToClipboard, withLoader }) => {
					withLoader(async () => {
						const images = await searchUnsplash();
						copyToClipboard(
							random(images).urls.regular.replace(
								"w=1080",
								"w=600"
							)
						);
					}, "Image copied");
				},
			},
			{
				label: "Random Face",
				handler: async (_, { copyToClipboard, withLoader }) => {
					withLoader(async () => {
						const images = await searchUnsplash("face");
						copyToClipboard(
							random(images).urls.regular.replace(
								"w=1080",
								"w=90"
							)
						);
					}, "Face copied");
				},
			},
		];
	},
	handler: async (_, { openPage }) => {
		await openPage({
			title: "Pisatch",
			placeholder: "Type to search images",
			type: "search",
			layoutProps: {
				layout: "masonry",
				columns: "sm:2,2xl:3,4xl:4",
			},
			entryAction: (item) => ({
				label: "Copy Image",
				url: `crotchet://copy-image/${item.urls.full}`,
			}),
			entryActions: (item) => {
				return [
					{
						label: "Copy Image",
						url: `crotchet://copy-image/${item.urls.full}`,
					},
					{
						label: "Copy Image Url",
						url: `crotchet://copy/${item.urls.full}`,
					},
					{
						label: "Copy Small Image Url",
						url: `crotchet://copy/${item.urls.small}`,
					},
				];
			},
			filter: {
				field: "type",
				defaultValue: "",
			},
			filters: [
				{ label: "Random", value: "" },
				"girl",
				"face",
				"spring",
				"wilderness",
				"serene",
				"beach",
				"mountains",
				"retro",
				"interior design",
				"concert",
			],
			resolve: async ({ filters }) => searchUnsplash(filters.type),
		});
	},
	tags: ["image", "search"],
});
