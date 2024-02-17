import { dataSource } from "..";

export const heroicons = dataSource.crawler({
	url: "https://heroicons.com/",
	query: "main [role='tabpanel']:first-child .grid:first-child .group => name::div:last-child|icon::svg::outerHTML",
	icon: `<svg viewBox="0 0 24 24" fill="currentColor">
			<path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
		</svg>`,
});

export const pier = dataSource.sql({
	dbUrl: "https://firebasestorage.googleapis.com/v0/b/letterplace-c103c.appspot.com/o/dev.db?alt=media&token=9493e08d-9b41-4760-8d86-20be77393280",
});

export const renters = dataSource.crotchet("pier", {
	query: "SELECT * from renter",
	fieldMap: {
		title: "name",
		subtitle: "due_date|date",
	},
});

export const unsplash = dataSource.web({
	url: "https://api.unsplash.com/photos/random",
	params: {
		client_id: import.meta.env.VITE_unsplashClientId,
		count: 24,
	},
	fieldMap: {
		title: "alt_description",
		image: "urls.regular",
	},
	icon: `<svg viewBox="0 0 24 24" fill="currentColor">
			<path d="M7.5 6.75V0h9v6.75h-9zm9 3.75H24V24H0V10.5h7.5v6.75h9V10.5z" />
		</svg>`,
	search: dataSource.web({
		url: "https://api.unsplash.com/search/photos",
		searchParam: "query",
		params: {
			client_id: import.meta.env.VITE_unsplashClientId,
			per_page: 24,
		},
		responseField: "results",
	}),
});
