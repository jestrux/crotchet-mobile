import {
	registerApp,
	useAppContext,
	SearchPage,
	registerDataSource,
	registerAction,
	getShareUrl,
	onDesktop,
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
		defaultValue: "🌎 General",
	},
	image: "image",
	title: "text",
	description: "text",
	url: "text",
};

const addItem = async (item) =>
	window.openForm({
		title: "Add to reading list",
		data: item
			? {
					// group: (await Preferences.get({ key: "groupFilter" })).value ?? "",
					group: item.group || "🌎 General",
					image: item.image,
					title: item.title,
					description: item.description || item.subtitle,
					url: item.url,
			  }
			: null,
		fields: formFields,
		action: {
			label: "Save",
			handler: (data) =>
				window.withLoader(
					window.dataSources.reader.insertRow(data),
					"Added to reading list"
				),
		},
	});

registerDataSource("db", "reader", {
	table: "reader",
	orderBy: "_index,desc",
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
			title: item.title || "Untitled" + (" " + item.group),
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
	filterBy: "group",
	filter: {
		field: "group",
		defaultValue: "",
	},
	filters: [
		{ label: "All", value: "" },
		"📺 Watch",
		"🧪 Learn",
		"🎧 Listen",
		"🌎 General",
	],
	actions: [
		{
			label: "Add New Entry",
			handler: (_, crotchet) => addItem(null, crotchet),
		},
	],
	entryActions: (item) => {
		return [
			{
				label: "Edit",
				handler: async () => {
					const res = await window.openForm({
						title: "Edit reading list item",
						data: item,
						fields: formFields,
					});

					if (!res) return;

					window.withLoader(
						window.dataSources.reader.updateRow(item._id, res),
						"Changes saved"
					);
				},
			},
			{
				label: "Remove from reading list",
				destructive: true,
				handler: async () => {
					const confirmed = await window.confirmDangerousAction();

					if (!confirmed) return;

					window.withLoader(
						window.dataSources.reader.deleteRow(item._id),
						"Removed from reading list"
					);
				},
			},
			...(!onDesktop()
				? []
				: [
						{
							label: "Add New Entry",
							handler: (_, crotchet) => addItem(null, crotchet),
						},
				  ]),
		];
	},
});

registerAction("addToReadingList", {
	context: "share",
	icon: appIcon,
	match: "url",
	handler: async ({ preview, url }) =>
		addItem(
			{
				...(preview?.image ? preview : await window.crawlUrl(url)),
				url,
				group: "🧪 Learn",
			},
			window
		),
});

registerAction("addToWatchList", {
	context: "share",
	icon: appIcon,
	match: "url",
	handler: async ({ preview, url }) =>
		addItem(
			{
				...(preview?.image ? preview : await window.crawlUrl(url)),
				url,
				group: "📺 Watch",
			},
			window
		),
});

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
					background="linear-gradient(45deg, #D6D821, #F2B0D3)"
					filterColor="white"
					title="Reader"
					autoFocus={false}
					source={dataSources.reader}
				/>
			);
		},
	};
});
