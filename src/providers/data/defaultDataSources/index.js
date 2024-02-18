import { dataSource } from "..";

export const heroicons = dataSource.crawler({
	url: "https://heroicons.com/",
	match: "main [role='tabpanel']:first-child .grid:first-child .group => name::div:last-child|icon::svg::outerHTML",
	fieldMap: {
		title: "name|cleanString",
		action: "copy://icon",
	},
	icon: `<svg viewBox="0 0 24 24" fill="currentColor">
			<path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
		</svg>`,
});

export const pier = dataSource.sql({
	dbUrl: "https://firebasestorage.googleapis.com/v0/b/letterplace-c103c.appspot.com/o/dev.db?alt=media&token=9493e08d-9b41-4760-8d86-20be77393280",
});

export const renters = dataSource.crotchet("pier", {
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
});
