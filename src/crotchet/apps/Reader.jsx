import {
	registerApp,
	useAppContext,
	SearchPage,
	registerDataSource,
	registerAction,
	getShareUrl,
	registerActionSheet,
} from "@/crotchet";
import { db } from "@/providers/data/firebase";
import { addDoc, collection, getDocs } from "firebase/firestore";

registerDataSource("firebase", "reader", {
	collection: "reader",
	orderBy: "index,desc",
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

registerAction("addToReadingList", {
	context: "share",
	match: "url",
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
	handler: async (
		{ preview, title, subtitle, url },
		{ utils, openUrl, showToast }
	) => {
		var payload = await openUrl(
			`crotchet://action/crawlUrl?${utils.objectToQueryParams({
				preview,
				title,
				subtitle,
				url,
				open: false,
			})}`
		);

		if (!payload?.title) return showToast("Nothing to add");

		try {
			const collectionRef = collection(db, "reader");
			const entries = (await getDocs(collectionRef)).docs;

			await addDoc(collectionRef, {
				...(payload ?? {}),
				index: (entries?.length ?? 0) + 1,
				group: "🌎 General",
				createdAt: new Date(),
			});

			showToast(`${payload.title || "Entry"} Added `);
		} catch (error) {
			showToast(`Failed to add ${payload.title}`);
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
