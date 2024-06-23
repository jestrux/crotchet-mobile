import { getShareUrl, registerAction, registerDataSource } from "@/crotchet";

const icon = (
	<svg viewBox="0 0 16 16" fill="currentColor">
		<path d="M9.828.722a.5.5 0 0 1 .354.146l4.95 4.95a.5.5 0 0 1 0 .707c-.48.48-1.072.588-1.503.588-.177 0-.335-.018-.46-.039l-3.134 3.134a6 6 0 0 1 .16 1.013c.046.702-.032 1.687-.72 2.375a.5.5 0 0 1-.707 0l-2.829-2.828-3.182 3.182c-.195.195-1.219.902-1.414.707s.512-1.22.707-1.414l3.182-3.182-2.828-2.829a.5.5 0 0 1 0-.707c.688-.688 1.673-.767 2.375-.72a6 6 0 0 1 1.013.16l3.134-3.133a3 3 0 0 1-.04-.461c0-.43.108-1.022.589-1.503a.5.5 0 0 1 .353-.146m.122 2.112v-.002zm0-.002v.002a.5.5 0 0 1-.122.51L6.293 6.878a.5.5 0 0 1-.511.12H5.78l-.014-.004a5 5 0 0 0-.288-.076 5 5 0 0 0-.765-.116c-.422-.028-.836.008-1.175.15l5.51 5.509c.141-.34.177-.753.149-1.175a5 5 0 0 0-.192-1.054l-.004-.013v-.001a.5.5 0 0 1 .12-.512l3.536-3.535a.5.5 0 0 1 .532-.115l.096.022c.087.017.208.034.344.034q.172.002.343-.04L9.927 2.028q-.042.172-.04.343a1.8 1.8 0 0 0 .062.46z" />
	</svg>
);

registerDataSource("db", "pinnedItems", {
	orderBy: "updatedAt,desc",
	mapEntry: (entry) => ({
		...entry,
		url: entry.url || "crotchet://copy/" + entry.title,
		image: entry.image || "placeholder",
		share: getShareUrl({
			scheme: "pinnedItems",
			state: entry,
		}),
	}),
});

registerAction("addToPinnedItems", {
	context: "share",
	icon,
	// match: ({ text, url, image, file } = {}) =>
	// 	Object.values(cleanObject({ text, url, image, file })).length,
	handler: async (
		{ image, file, previewImage, url, text, title, subtitle, description },
		{ showToast, uploadDataUrl, utils, dataSources }
	) => {
		let asset = file || image;

		try {
			if (asset && !asset.startsWith("http")) {
				url = await uploadDataUrl(asset);
				if (!file) image = url;
			}

			const payload = utils.cleanObject({
				image: previewImage || image,
				title: title || text,
				description: description || subtitle,
				url: url || image,
			});

			await dataSources.pinnedItems.insertRow(payload);
			showToast("Added to pinned items");
		} catch (error) {
			showToast("Failed to pin item");
			console.log(error);
		}
	},
});

registerAction("removePinnedItem", {
	context: "share",
	icon: (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
			<path d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
		</svg>
	),
	scheme: "pinnedItems",
	match: ({ state }) => state?._id,
	handler: async ({ state }, { dataSources, showToast }) => {
		// const confirmed = await confirmDangerousAction();
		// if (!confirmed) return;

		try {
			await dataSources.pinnedItems.deleteRow(state._id);
			showToast("Pinned item removed");
		} catch (error) {
			showToast("Failed to remove pinned item");
			console.log(error);
		}
	},
});
