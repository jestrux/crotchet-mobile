import "./icons";

import { registerDataSource } from "..";

registerDataSource("firebase", "reader", {
	collection: "reader",
	orderBy: "index,desc",
	fieldMap: {
		// image: "image",
		// title: "title",
		subtitle: "description",
	},
	mapEntry(item) {
		const isVideo =
			item.url.toLowerCase().indexOf("videos") != -1 ||
			item.url.toLowerCase().indexOf("youtube") != -1 ||
			item.group.toLowerCase().indexOf("watch") != -1;

		return {
			...item,
			...(isVideo ? { video: item.image } : { image: item.image }),
			title: item.title || "Untitled",
			tags: [item.group],
		};
	},
});

registerDataSource("firebase", "ytClips", {
	collection: "videos",
	orderBy: "updatedAt,desc",
	fieldMap: {
		video: "poster",
		title: "name",
		subtitle: "crop.0|time::crop.1|time::duration|time",
	},
	mapEntry(item) {
		var url = "crotchet://app/yt-clips?";
		url += new URLSearchParams(item).toString();

		return {
			...item,
			url,
		};
	},
	searchFields: ["name"],
});

registerDataSource("sql", "pier", {
	dbUrl: "https://firebasestorage.googleapis.com/v0/b/letterplace-c103c.appspot.com/o/dev.db?alt=media&token=9493e08d-9b41-4760-8d86-20be77393280",
	query: /*sql*/ `
		SELECT r.image, r.name, r.due_date, (case when r.verified = 1 then 'verified' else 'pending' end) as verified, json_object('name', a.name, 'image', a.image) as apartment
		FROM renter as r
		LEFT JOIN apartment as a
		ON r.apartment = a._id;
	`,
	fieldMap: {
		title: "name",
		subtitle: "due_date|date",
		status: "verified",
	},
	searchFields: ["name"],
});

// registerDataSource("unsplash", "unsplashRandomPhotos", {
// 	fieldMap: {
// 		title: "alt_description",
// 		subtitle: "description",
// 		image: "urls.regular",
// 		action: "copy://urls.regular",
// 	},
// 	searchable: false,
// });

registerDataSource("unsplash", "unsplash", {
	fieldMap: {
		collection: "search",
		title: "alt_description",
		subtitle: "description",
		image: "urls.regular",
		action: "copy://urls.regular",
	},
	searchable: true,
});
