import { firebaseUploadFile } from "@/providers/data/firebase/useFirebase";
import {
	isValidUrl,
	readClipboard,
	showToast,
	WidgetWrapper,
} from "@/crotchet";
import DesktopWidget from "../apps/Widgets/DesktopWidget";

// export const uploadFile = async (_, { showToast }) => {
// 	await firebaseUploadFile();
// 	showToast("Uploaded");
// };

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
				d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25"
			/>
		</svg>
	),
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
				d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184"
			/>
		</svg>
	),
	global: true,
	mobileOnly: true,
	handler: async (_, { openShareSheet }) => {
		const { type, value } = await readClipboard();

		if (!value?.length) return showToast("Nothing in clipboard");

		let payload = {
			text: value,
		};

		if (type.includes("image"))
			payload = {
				image: value,
			};

		if (isValidUrl(value))
			payload = {
				url: value,
			};

		return openShareSheet(payload);
	},
};

export const searchSimpleIcons = {
	// global: true,
	url: `crotchet://search/simpleIcons?layout=grid&columns=7`,
};
