import { cleanObject } from "@/crotchet";
import UseImage from "../apps/UseImage";

const shareSheetSlug = ({ url, image, text }) =>
	image?.length
		? "image/" + image
		: url?.length
		? "url/" + url
		: text?.length
		? text
		: "";

export const addToPinnedItems = {
	context: "share",
	icon: (
		<svg viewBox="0 0 16 16" fill="currentColor">
			<path d="M9.828.722a.5.5 0 0 1 .354.146l4.95 4.95a.5.5 0 0 1 0 .707c-.48.48-1.072.588-1.503.588-.177 0-.335-.018-.46-.039l-3.134 3.134a6 6 0 0 1 .16 1.013c.046.702-.032 1.687-.72 2.375a.5.5 0 0 1-.707 0l-2.829-2.828-3.182 3.182c-.195.195-1.219.902-1.414.707s.512-1.22.707-1.414l3.182-3.182-2.828-2.829a.5.5 0 0 1 0-.707c.688-.688 1.673-.767 2.375-.72a6 6 0 0 1 1.013.16l3.134-3.133a3 3 0 0 1-.04-.461c0-.43.108-1.022.589-1.503a.5.5 0 0 1 .353-.146m.122 2.112v-.002zm0-.002v.002a.5.5 0 0 1-.122.51L6.293 6.878a.5.5 0 0 1-.511.12H5.78l-.014-.004a5 5 0 0 0-.288-.076 5 5 0 0 0-.765-.116c-.422-.028-.836.008-1.175.15l5.51 5.509c.141-.34.177-.753.149-1.175a5 5 0 0 0-.192-1.054l-.004-.013v-.001a.5.5 0 0 1 .12-.512l3.536-3.535a.5.5 0 0 1 .532-.115l.096.022c.087.017.208.034.344.034q.172.002.343-.04L9.927 2.028q-.042.172-.04.343a1.8 1.8 0 0 0 .062.46z" />
		</svg>
	),
	handler: async (_, { showToast }) => showToast("Added to pinned items"),
};

export const editImage = {
	icon: (
		<svg viewBox="0 0 24 24" fill="currentColor">
			<path d="M7.5 5.6L10 7 8.6 4.5 10 2 7.5 3.4 5 2l1.4 2.5L5 7zm12 9.8L17 14l1.4 2.5L17 19l2.5-1.4L22 19l-1.4-2.5L22 14zM22 2l-2.5 1.4L17 2l1.4 2.5L17 7l2.5-1.4L22 7l-1.4-2.5zm-7.63 5.29c-.39-.39-1.02-.39-1.41 0L1.29 18.96c-.39.39-.39 1.02 0 1.41l2.34 2.34c.39.39 1.02.39 1.41 0L16.7 11.05c.39-.39.39-1.02 0-1.41l-2.33-2.35zm-1.03 5.49l-2.12-2.12 2.44-2.44 2.12 2.12-2.44 2.44z" />
		</svg>
	),
	context: "share",
	match: "image",
	handler: async (_, { showToast }) => showToast("Edit image"),
};

export const getShareLink = {
	icon: (
		<svg fill="currentColor" viewBox="0 0 16 16">
			<path d="M4.715 6.542 3.343 7.914a3 3 0 1 0 4.243 4.243l1.828-1.829A3 3 0 0 0 8.586 5.5L8 6.086a1 1 0 0 0-.154.199 2 2 0 0 1 .861 3.337L6.88 11.45a2 2 0 1 1-2.83-2.83l.793-.792a4 4 0 0 1-.128-1.287z" />
			<path d="M6.586 4.672A3 3 0 0 0 7.414 9.5l.775-.776a2 2 0 0 1-.896-3.346L9.12 3.55a2 2 0 1 1 2.83 2.83l-.793.792c.112.42.155.855.128 1.287l1.372-1.372a3 3 0 1 0-4.243-4.243z" />
		</svg>
	),
	context: "share",
	match: "url",
	handler: async (_, { showToast }) => showToast("Share link copied"),
};

export const share = {
	icon: (
		<svg fill="currentColor" viewBox="0 0 24 24">
			<path d="M16 5l-1.42 1.42-1.59-1.59V16h-1.98V4.83L9.42 6.42 8 5l4-4 4 4zm4 5v11c0 1.1-.9 2-2 2H6c-1.11 0-2-.9-2-2V10c0-1.11.89-2 2-2h3v2H6v11h12V10h-3V8h3c1.1 0 2 .89 2 2z" />
		</svg>
	),
	context: "share",
	handler: ({ url, image, text }, { openUrl }) =>
		openUrl(`crotchet://broadcast/${shareSheetSlug({ url, image, text })}`),
};

export const copy = {
	icon: (
		<svg fill="currentColor" viewBox="0 0 24 24">
			<path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
		</svg>
	),
	context: "share",
	match: ({ url, image, text } = {}) =>
		Object.keys(cleanObject({ url, text })).length > 0 && !image,
	handler: ({ url, text } = {}, { openUrl }) =>
		openUrl(`crotchet://copy-${shareSheetSlug({ url, text })}`),
};

export const copyImage = {
	icon: (
		<svg fill="currentColor" viewBox="0 0 24 24">
			<path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
		</svg>
	),
	context: "share",
	match: "image",
	handler: ({ image } = {}, { openUrl }) =>
		openUrl(`crotchet://copy-image/${image}`),
};

export const useImage = {
	icon: (
		<svg fill="currentColor" viewBox="0 0 24 24">
			<path d="M2 6H0v5h.01L0 20c0 1.1.9 2 2 2h18v-2H2V6zm20-2h-8l-2-2H6c-1.1 0-1.99.9-1.99 2L4 16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zM7 15l4.5-6 3.5 4.51 2.5-3.01L21 15H7z" />
		</svg>
	),
	context: "share",
	match: "image",
	handler: ({ image } = {}, { openPage }) => {
		openPage({
			fullHeight: false,
			content: [
				{
					type: "image",
					value: image,
				},
				{
					type: "custom",
					value: <UseImage image={image} />,
				},
			],
		});
	},
};

export const download = {
	icon: (
		<svg fill="currentColor" viewBox="0 0 16 16">
			<path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5" />
			<path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708z" />
		</svg>
	),
	context: "share",
	match: "download",
	handler: ({ download } = {}, { openUrl }) =>
		openUrl(`crotchet://download/${download}`),
};

export const crawlUrl = {
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
				d="M12 12.75c1.148 0 2.278.08 3.383.237 1.037.146 1.866.966 1.866 2.013 0 3.728-2.35 6.75-5.25 6.75S6.75 18.728 6.75 15c0-1.046.83-1.867 1.866-2.013A24.204 24.204 0 0 1 12 12.75Zm0 0c2.883 0 5.647.508 8.207 1.44a23.91 23.91 0 0 1-1.152 6.06M12 12.75c-2.883 0-5.647.508-8.208 1.44.125 2.104.52 4.136 1.153 6.06M12 12.75a2.25 2.25 0 0 0 2.248-2.354M12 12.75a2.25 2.25 0 0 1-2.248-2.354M12 8.25c.995 0 1.971-.08 2.922-.236.403-.066.74-.358.795-.762a3.778 3.778 0 0 0-.399-2.25M12 8.25c-.995 0-1.97-.08-2.922-.236-.402-.066-.74-.358-.795-.762a3.734 3.734 0 0 1 .4-2.253M12 8.25a2.25 2.25 0 0 0-2.248 2.146M12 8.25a2.25 2.25 0 0 1 2.248 2.146M8.683 5a6.032 6.032 0 0 1-1.155-1.002c.07-.63.27-1.222.574-1.747m.581 2.749A3.75 3.75 0 0 1 15.318 5m0 0c.427-.283.815-.62 1.155-.999a4.471 4.471 0 0 0-.575-1.752M4.921 6a24.048 24.048 0 0 0-.392 3.314c1.668.546 3.416.914 5.223 1.082M19.08 6c.205 1.08.337 2.187.392 3.314a23.882 23.882 0 0 1-5.223 1.082"
			/>
		</svg>
	),
	context: "share",
	match: "url",
	handler: async (
		{ open = true, ...data },
		{ utils, openPage, showToast }
	) => {
		try {
			const {
				url,
				title,
				subtitle,
				description,
				preview,
				data: responseData,
			} = cleanObject(data);

			let payload = {
				url,
				image: preview,
				title,
				subtitle,
				description: description || subtitle,
				data: responseData,
			};

			if (!title?.length && !subtitle?.length && !preview?.length) {
				let res = await utils.crawlUrl(url);

				if (!res?.meta) return showToast("Failed to crawl: " + url);

				payload = {
					...payload,
					...res.meta,
					data: res.data,
				};
			}

			if (!open || open == "false") return payload;

			console.log("Data: ", payload);

			return openPage({
				title: "Crawl Url",
				subtitle: url,
				fullHeight: false,
				content: [
					{ type: "preview", value: payload },
					{
						type: "custom",
						value: (
							<div
								className="bg-red-500 min-h-40"
								dangerouslySetInnerHTML={{
									__html: payload.data,
								}}
							></div>
						),
					},
				],
			});
		} catch (error) {
			console.log("Crawl error: ", error);
		}
	},
};

export const open = {
	icon: (
		<svg fill="currentColor" viewBox="0 0 16 16">
			<path
				fillRule="evenodd"
				d="M8.636 3.5a.5.5 0 0 0-.5-.5H1.5A1.5 1.5 0 0 0 0 4.5v10A1.5 1.5 0 0 0 1.5 16h10a1.5 1.5 0 0 0 1.5-1.5V7.864a.5.5 0 0 0-1 0V14.5a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h6.636a.5.5 0 0 0 .5-.5"
			/>
			<path
				fillRule="evenodd"
				d="M16 .5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793L6.146 9.146a.5.5 0 1 0 .708.708L15 1.707V5.5a.5.5 0 0 0 1 0z"
			/>
		</svg>
	),
	context: "share",
	match: ({ url, download } = {}) => url?.length && !download?.length,
	handler: ({ url } = {}, { openUrl }) => openUrl(`crotchet://open/${url}`),
};
