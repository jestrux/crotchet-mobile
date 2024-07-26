import { firebaseUploadFile } from "@/providers/data/firebase/useFirebase";
import { readClipboard, showToast, toggleAppWindow } from "@/crotchet";
import RemoteApp from "@/crotchet/apps/Remote/RemoteApp";

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
	handler: async (_, { openBottomSheet }) =>
		openBottomSheet({
			content: <RemoteApp />,
		}),
};

export const share = {
	icon: (
		<svg viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z"
			/>
		</svg>
	),
	mobileOnly: true,
	handler: async (payload, { openShareSheet }) => openShareSheet(payload),
};

export const sendEmail = {
	global: true,
	icon: (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			strokeWidth={1.5}
			stroke="currentColor"
		>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
			/>
		</svg>
	),
	handler: async (
		payload,
		{ openForm, cleanObject, objectTake, withLoader }
	) => {
		const handler = async (res) => {
			if (
				Object.keys(
					cleanObject(objectTake(res, ["to", "message", "subject"]))
				).length != 3
			)
				throw "Some fields are missing";

			await fetch(
				"https://us-central1-letterplace-c103c.cloudfunctions.net/api/mailer",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						to: res.to,
						message: {
							subject: res.subject,
							text: res.message,
						},
					}),
				}
			);

			return res;
		};
		const successMessage = (res) => `Email sent to ${res.to}`;
		const errorMessage = (err) => err || "Email not sent";

		var res = await openForm({
			title: "Send Email",
			data: {
				subject: "Crotchet Mail",
				to: "wakyj07@gmail.com",
				message: "Howdy Partner!",
				...(payload || {}),
			},
			fields: {
				to: "email",
				subject: "text",
				message: "text",
			},
			// action: {
			// 	label: "Send Email",
			// 	handler: handler,
			// 	successMessage,
			// 	errorMessage,
			// },
		});

		if (!res) return;

		return withLoader(() => handler(res), {
			successMessage,
			errorMessage,
		});
	},
};

export const clipboard = {
	shortcut: "Shift+Alt+C",
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
	// mobileOnly: true,
	handler: async (_, { openShareSheet, utils, showToast }) => {
		try {
			await toggleAppWindow(true);
			if (utils.onDesktop()) await utils.someTime(200);
			const { type, value } = await readClipboard();
			const payload = utils.processShareData(value, type);

			if (!payload) return showToast("Nothing in clipboard");

			return openShareSheet(payload);
		} catch (error) {
			showToast("Error: " + error);
		}
	},
};

export const searchSimpleIcons = {
	// global: true,
	url: `crotchet://search/simpleIcons?layout=grid&columns=7`,
};

export const setHero = {
	global: true,
	handler: (_, { openUrl, moment }) => {
		const date = moment().startOf("iweek").subtract(7, "days");
		const iso = (d) => d.toISOString().split("T").shift();

		return openUrl(
			`https://www.upwork.com/nx/wm/workroom/31953978/timesheet?timesheetDate=
			${iso(date)}&workdiaryDate=${iso(date.add(2, "days"))}`
		);
	},
};

export const raycastTest = {
	global: true,
	url: `crotchet://socket/run?command=code /Users/waky/Documents/raycast/raycast-test/`,
};

export const kitTest = {
	url: `crotchet://socket/run?command=code /Users/waky/.kenv`,
};

export const tailwindCdn = {
	hideApp: true,
	url: 'crotchet://socket/copy-paste?arg=<script src="https://cdn.tailwindcss.com"></script>',
};

export const trimNewLines = {
	handler: async (_, { hideApp, readClipboard, socketEmit }) => {
		const value = (await readClipboard())?.value
			.toString()
			.split("\n")
			.map((s) => s.trim().replaceAll("\n", ""))
			.join(" ");
		hideApp();
		socketEmit("copy-paste", value);
	},
};
