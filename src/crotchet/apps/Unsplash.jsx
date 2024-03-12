import { registerAction, shuffle } from "@/crotchet";

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

registerAction("crotchet", "searchUnsplash", {
	// url: "crotchet://app/unsplash",
	handler: ({ openUrl }) =>
		openUrl(
			`crotchet://app/search?source=unsplash&q=${randomSearchQuery()}&layout=masonry&columns=4`
		),
	tags: ["image"],
});
