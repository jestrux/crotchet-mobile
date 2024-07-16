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
	layoutProps: {
		layout: "grid",
		columns: "xs:3,md:5",
	},
	// fieldMap: {
	// 	// subtitle: "name|cleanString",
	// 	action: "copy://image",
	// },
	// icon: `<svg viewBox="0 0 24 24" fill="currentColor">
	// 		<path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
	// 	</svg>`,
});

registerDataSource("crawler", "bootstrapIcons", {
	url: "https://icons.getbootstrap.com/",
	matcher: "#icons-list li => name::$this::data-name|tags::$this::data-tags",
	limit: 5,
	mapEntry: (entry) => {
		const icon = `
			<div class="size-7 flex items-center justify-center bg-white/50 rounded-full">
				<img class="size-5" src="https://raw.githubusercontent.com/twbs/icons/main/icons/${entry.name}.svg" />
			</div>
		`;

		return {
			...entry,
			icon,
			subtitle: entry.name?.replaceAll("-", " ").replaceAll("_", " "),
			tags: entry.tags.split(" "),
			url: `crotchet://copy/bi-${entry.name}`,
		};
	},
	layoutProps: {
		layout: "grid",
		columns: "xs:3,md:5",
	},
	icon: `<svg viewBox="0 0 24 24" fill="currentColor">
			<path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
		</svg>`,
});
