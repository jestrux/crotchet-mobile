import { firebaseUploadFile } from "@/providers/data/firebase/useFirebase";
import {
	isValidUrl,
	openUrl,
	readClipboard,
	showToast,
	WidgetWrapper,
} from "@/crotchet";
import DesktopWidget from "../apps/Widgets/DesktopWidget";

export const uploadFile = async (_, { showToast }) => {
	await firebaseUploadFile();
	showToast("Uploaded");
};

// export const updateWhyLead = async (_, { showToast }) => {
// 	await firebaseUploadFile({
// 		name: "index.html",
// 		file: new Blob([(await readClipboard()).value], {
// 			type: "text/html",
// 		}),
// 	});

// 	showToast("WhyLead updated");

// 	return;
// };

export const remote = {
	global: true,
	mobileOnly: true,
	handler: async (_, { socket, openBottomSheet }) => {
		const _socket = await socket({ retry: true });

		if (_socket) {
			return openBottomSheet({
				content: (
					<div className="pb-8 px-3 pt-4">
						<WidgetWrapper widget={DesktopWidget} />
					</div>
				),
			});
		}

		showToast("Desktop not connected");
	},
};

export const clipboard = {
	global: true,
	mobileOnly: true,
	handler: async () => {
		const { type, value } = await readClipboard();

		if (!value?.length) return showToast("Nothing in clipboard");

		if (type.includes("image"))
			return openUrl(`crotchet://share-image/${value}`);

		if (isValidUrl(value)) return openUrl(`crotchet://share-url/${value}`);

		return openUrl(`crotchet://share/${value}`);
	},
};

export const addToPinnedItems = {
	context: "share",
	icon: (
		<svg viewBox="0 0 16 16" fill="currentColor">
			<path d="M9.828.722a.5.5 0 0 1 .354.146l4.95 4.95a.5.5 0 0 1 0 .707c-.48.48-1.072.588-1.503.588-.177 0-.335-.018-.46-.039l-3.134 3.134a6 6 0 0 1 .16 1.013c.046.702-.032 1.687-.72 2.375a.5.5 0 0 1-.707 0l-2.829-2.828-3.182 3.182c-.195.195-1.219.902-1.414.707s.512-1.22.707-1.414l3.182-3.182-2.828-2.829a.5.5 0 0 1 0-.707c.688-.688 1.673-.767 2.375-.72a6 6 0 0 1 1.013.16l3.134-3.133a3 3 0 0 1-.04-.461c0-.43.108-1.022.589-1.503a.5.5 0 0 1 .353-.146m.122 2.112v-.002zm0-.002v.002a.5.5 0 0 1-.122.51L6.293 6.878a.5.5 0 0 1-.511.12H5.78l-.014-.004a5 5 0 0 0-.288-.076 5 5 0 0 0-.765-.116c-.422-.028-.836.008-1.175.15l5.51 5.509c.141-.34.177-.753.149-1.175a5 5 0 0 0-.192-1.054l-.004-.013v-.001a.5.5 0 0 1 .12-.512l3.536-3.535a.5.5 0 0 1 .532-.115l.096.022c.087.017.208.034.344.034q.172.002.343-.04L9.927 2.028q-.042.172-.04.343a1.8 1.8 0 0 0 .062.46z" />
		</svg>
	),
	handler: async () => {
		showToast("Added to pinned items");
	},
};

export const editImage = {
	context: "share",
	shareType: "image",
	icon: (
		<svg viewBox="0 0 24 24" fill="currentColor">
			<path d="M7.5 5.6L10 7 8.6 4.5 10 2 7.5 3.4 5 2l1.4 2.5L5 7zm12 9.8L17 14l1.4 2.5L17 19l2.5-1.4L22 19l-1.4-2.5L22 14zM22 2l-2.5 1.4L17 2l1.4 2.5L17 7l2.5-1.4L22 7l-1.4-2.5zm-7.63 5.29c-.39-.39-1.02-.39-1.41 0L1.29 18.96c-.39.39-.39 1.02 0 1.41l2.34 2.34c.39.39 1.02.39 1.41 0L16.7 11.05c.39-.39.39-1.02 0-1.41l-2.33-2.35zm-1.03 5.49l-2.12-2.12 2.44-2.44 2.12 2.12-2.44 2.44z" />
		</svg>
	),
	handler: async () => {
		showToast("Edit image");
	},
};

export const getShareLink = {
	context: "share",
	shareType: "url",
	icon: (
		<svg fill="currentColor" viewBox="0 0 16 16">
			<path d="M4.715 6.542 3.343 7.914a3 3 0 1 0 4.243 4.243l1.828-1.829A3 3 0 0 0 8.586 5.5L8 6.086a1 1 0 0 0-.154.199 2 2 0 0 1 .861 3.337L6.88 11.45a2 2 0 1 1-2.83-2.83l.793-.792a4 4 0 0 1-.128-1.287z" />
			<path d="M6.586 4.672A3 3 0 0 0 7.414 9.5l.775-.776a2 2 0 0 1-.896-3.346L9.12 3.55a2 2 0 1 1 2.83 2.83l-.793.792c.112.42.155.855.128 1.287l1.372-1.372a3 3 0 1 0-4.243-4.243z" />
		</svg>
	),
	handler: async () => {
		showToast("Share link copied");
	},
};

export const searchSimpleIcons = {
	global: true,
	url: `crotchet://search/simpleIcons?layout=grid&columns=7`,
};
