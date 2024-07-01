import {
	registerApp,
	useAppContext,
	SearchPage,
	registerDataSource,
	registerAction,
	getShareUrl,
	registerActionSheet,
} from "@/crotchet";

const appIcon = (
	<svg
		fill="none"
		viewBox="0 0 24 24"
		strokeWidth={1.5}
		stroke="currentColor"
	>
		<path
			strokeLinecap="round"
			strokeLinejoin="round"
			d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z"
		/>
	</svg>
);

const formFields = {
	group: {
		type: "radio",
		choices: ["📺 Watch", "🧪 Learn", "🎧 Listen", "🌎 General"],
	},
	image: "text",
	title: "text",
	description: "text",
	url: "text",
};

registerDataSource("db", "reader", {
	table: "reader",
	orderBy: "_index,desc",
	filter: "group",
	mapEntry(item) {
		const isVideo =
			item.url?.toLowerCase().indexOf("videos") != -1 ||
			item.url?.toLowerCase().indexOf("youtube") != -1 ||
			item.group?.toLowerCase().indexOf("watch") != -1;

		return {
			...item,
			...(isVideo
				? { video: item.image || "placeholder" }
				: { image: item.image || "placeholder" }),
			title: item.title || "Untitled",
			subtitle: item.description,
			tags: [item.group],
			share: getShareUrl({
				scheme: "reader",
				state: item,
				url: item.url,
				preview: item.image,
				title: item.name,
				subtitle: item.description,
			}),
		};
	},
	layoutProps: {
		layout: "card",
	},
});

registerAction("editReadingListItem", {
	context: "share",
	icon: appIcon,
	scheme: "reader",
	match: ({ scheme, state }) => scheme == "reader" && state._id,
	handler: async (
		{ state, previewImage },
		{ showToast, openForm, dataSources }
	) => {
		if (!state.image && previewImage) state.image = previewImage;

		var res = await openForm({
			title: "Edit reading list item",
			data: state,
			fields: formFields,
		});

		if (!res) return;

		try {
			await dataSources.reader.updateRow(state._id, res);
			showToast(`${res.title || "Entry"} Updated `);
		} catch (error) {
			showToast(`Failed to update ${res.title}`);
			console.log(error);
		}
	},
});

registerAction("removeFromReadingList", {
	context: "share",
	icon: appIcon,
	scheme: "reader",
	match: ({ scheme, state }) => scheme == "reader" && state._id,
	handler: async (
		{ state },
		{ dataSources, showToast, confirmDangerousAction }
	) => {
		const confirmed = await confirmDangerousAction();

		if (!confirmed) return;

		try {
			await dataSources.reader.deleteRow(state._id);
			showToast(`${state.title || "Entry"} Deleted`);
		} catch (error) {
			showToast(`Failed to delete ${state.title}`);
			console.log(error);
		}
	},
});

registerAction("addToReadingList", {
	context: "share",
	icon: appIcon,
	match: ({ url }) => url?.toString().length,
	handler: async (
		{ previewImage, title, subtitle, url },
		{ utils, openUrl, showToast, openForm, dataSources }
	) => {
		var payload = await openUrl(
			`crotchet://action/crawlUrl?${utils.objectToQueryParams({
				preview: previewImage,
				title,
				subtitle,
				url,
				open: false,
			})}`
		);

		var res = await openForm({
			title: "Add to reading list",
			data: {
				// group: (await Preferences.get({ key: "groupFilter" })).value ?? "",
				group: "🌎 General",
				image: payload.image,
				title: payload.title,
				description: payload.description || payload.subtitle,
				url: payload.url,
			},
			fields: formFields,
		});

		if (!res) return;

		try {
			await dataSources.reader.insertRow(utils.cleanObject(res));
			showToast(`${res.title || "Entry"} Added `);
		} catch (error) {
			showToast(`Failed to add ${res.title}`);
			console.log(error);
		}
	},
});

registerActionSheet(
	"reader",
	[{ label: "Open reader", url: "crotchet://app/youtubeClips" }]
	// async (payload = {}) => {
	// 	console.log("Reader sheet: ");
	// }
);

registerApp("reader", () => {
	return {
		icon: (
			<svg
				fill="none"
				viewBox="0 0 24 24"
				strokeWidth={1.5}
				stroke="currentColor"
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z"
				/>
			</svg>
		),
		activeIcon: (
			<svg viewBox="0 0 24 24" fill="currentColor">
				<path
					fillRule="evenodd"
					d="M6.32 2.577a49.255 49.255 0 0 1 11.36 0c1.497.174 2.57 1.46 2.57 2.93V21a.75.75 0 0 1-1.085.67L12 18.089l-7.165 3.583A.75.75 0 0 1 3.75 21V5.507c0-1.47 1.073-2.756 2.57-2.93Z"
					clipRule="evenodd"
				/>
			</svg>
		),
		name: "Reader",
		main: function Reader() {
			const { dataSources } = useAppContext();
			return (
				<SearchPage
					background="linear-gradient(45deg, #d3ffff, #f2ddb0)"
					filterColor="white"
					title="Reader"
					autoFocus={false}
					source={dataSources.reader}
				/>
			);
		},
	};
});
