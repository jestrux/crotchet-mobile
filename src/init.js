if (!window.__crotchet) window.__crotchet = {};

Object.assign(window.__crotchet, {
	__crotchetApp: {
		name: "Crotchet",
		colors: {
			primary: "#84cc16",
			primaryDark: "#a3e635",
		},
		// name: "iPF Softwares",
		// colors: {
		// 	primary: "#197AE4",
		// }
	},
	apps: {},
	backgroundApps: {},
	visibleBackgroundApps: [],
	backgroundActions: {},
	remoteApps: {},
	remoteActions: {},
	automationActions: {},
	actions: {},
	dataSources: {},
	pinnedApps: [
		"youtubeClips",
		// "laCroix",
		"home",
		"reader",
	],
	actionSheets: {},
	_promiseResolvers: {},
	desktop: {},
});
