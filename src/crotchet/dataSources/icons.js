import { registerDataSource } from "..";

registerDataSource("crawler", "simpleIcons", {
	url: "https://simpleicons.org",
	matcher:
		".grid .grid-item => name::.grid-item__title|color::.grid-item__color",
	mapEntry(entry) {
		const image = `https://simpleicons.org/icons/${entry.name
			?.toLowerCase()
			.replace(".svg", "")
			.replaceAll("/", "")
			.replaceAll("-", "")
			.replaceAll(" ", "")
			.replace(".", "dot")}.svg`;
		return {
			color: entry.color,
			icon: `<div class="size-8 rounded-full bg-white flex items-center justify-center"><img class="w-4 h-4" src='${image}' /></div>`,
			title: entry.name?.replace(".svg", ""),
			url: `crotchet://copy-url/${image}`,
		};
	},
	// fieldMap: {
	// 	// subtitle: "name|cleanString",
	// 	action: "copy://image",
	// },
	// icon: `<svg viewBox="0 0 24 24" fill="currentColor">
	// 		<path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
	// 	</svg>`,
});
