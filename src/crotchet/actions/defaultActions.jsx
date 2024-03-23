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

export const searchSimpleIcons = {
	global: true,
	url: `crotchet://search/simpleIcons?layout=grid&columns=7`,
};
