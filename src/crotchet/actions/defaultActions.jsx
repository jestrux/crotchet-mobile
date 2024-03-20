import { firebaseUploadFile } from "@/providers/data/firebase/useFirebase";
import { readClipboard, showToast, WidgetWrapper } from "@/crotchet";
import DesktopWidget from "../apps/Widgets/DesktopWidget";

export const uploadFile = async ({ showToast }) => {
	await firebaseUploadFile();
	showToast("Uploaded");
};

// export const updateWhyLead = async ({ showToast }) => {
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
	handler: async ({ socket, openBottomSheet }) => {
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

export const searchSimpleIcons = {
	global: true,
	url: `crotchet://search/simpleIcons?layout=grid&columns=7`,
};
