import { firebaseUploadFile } from "@/providers/data/firebase/useFirebase";
import RemoteApp from "@/crotchet/apps/Remote/RemoteApp";
import { readNetworkFile, dispatch } from "@/utils";
import { dbUpdate, uploadStringAsFile } from "@/providers/firebaseApp";

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

const defaultThemes = {
	"System Default": { colorScheme: "system" },
	"Default Dark": { colorScheme: "dark" },
	"Default Light": { colorScheme: "light" },
	"Make Lemonade": { colorScheme: "dark", tintColor: "#4d7c0f" },
	"Kingsley Shacklebolt": { colorScheme: "dark", tintColor: "#7e22ce" },
	"Oceanic View": { colorScheme: "dark", tintColor: "#0e7490" },
	"Orange Brat": { colorScheme: "dark", tintColor: "#c2410c" },
	"Roses are Red": { colorScheme: "dark", tintColor: "#be123c" },
};

export const appTheme = {
	icon: (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			strokeWidth={1.5}
			stroke="currentColor"
			className="size-6"
		>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				d="M4.098 19.902a3.75 3.75 0 0 0 5.304 0l6.401-6.402M6.75 21A3.75 3.75 0 0 1 3 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 0 0 3.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008Z"
			/>
		</svg>
	),
	global: true,
	handler: async (_, { openPage, savePreference }) => {
		await openPage({
			title: "Set App Theme",
			placeholder: "Type to search themes",
			type: "search",
			filter: {
				field: "type",
				defaultValue: "",
			},
			filters: [{ label: "All", value: "" }, "Dark", "Light", "System"],
			resolve: ({ filters }) => {
				const filter = filters?.type?.toLowerCase();

				const themes = Object.keys(defaultThemes).reduce(
					(agg, name) => {
						const themeProps = defaultThemes[name];
						themeProps.name = name;
						let { colorScheme } = themeProps;
						colorScheme = colorScheme?.toLowerCase();

						const theme = {
							label: name,
							value: name,
							action: () => ({
								label: "Select Theme",
								handler: async () => {
									await savePreference(
										"crotchet-app-theme",
										themeProps
									);
									window.__crotchet["crotchet-app-theme"] =
										themeProps;
									dispatch("crotchet-app-theme-updated");
									dispatch("with-loader-status-change", {
										status: "success",
										message: `Theme set to ${name}`,
									});
								},
							}),
						};

						if (!filter || filter == colorScheme) agg.push(theme);

						return agg;
					},
					[]
				);

				return themes;
			},
		});
	},
};

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
	handler: async () => {
		try {
			await window.toggleAppWindow(true);
			if (window.onDesktop()) await window.someTime(200);
			const { type, value } = await window.readClipboard();
			const { payload, preview } = window.processShareData(value, type, {
				fromClipboard: true,
			});

			if (!payload) return window.showToast("Nothing in clipboard");

			return window.openActionSheet({ inset: false, payload, preview });
		} catch (error) {
			window.showToast("Error: " + error);
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

export const crotchetAppData = {
	url: `crotchet://socket/run?command=open /Users/waky/Library/Application\\ Support/Electron/Crotchet`,
};

export const crotchetDevtools = {
	handler: async (_, { getWriteableFile }) => {
		const file = await getWriteableFile(
			"/Users/waky/Documents/web/crotchet/electron/index.js"
		);
		const code = file.contents;
		const inDev = code.indexOf("//const openDevTools = false;") == -1;
		file.save(
			inDev
				? file.contents.replace(
						"const openDevTools = false;",
						"//const openDevTools = false;"
				  )
				: file.contents.replace(
						"//const openDevTools = false;",
						"const openDevTools = false;"
				  )
		);
	},
};

export const tailwindCdn = {
	hideApp: true,
	url: 'crotchet://socket/copy-paste?arg=<script src="https://cdn.tailwindcss.com"></script>',
};

export const pierDesktop = {
	hideApp: true,
	url: `crotchet://socket/run?cwd=/Users/waky/Documents/web/pier-desktop&command=yarn dev`,
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

export const openCrotchetFlutterBuild = {
	url: `crotchet://socket/run?command=open /Users/waky/Documents/flutter/crotchet-flutter/build/ios/iphoneos`,
};

export const editCrotchetExtension = {
	global: true,
	handler: async (_, { openPage, queryDb, dispatch }) => {
		const choice = await openPage({
			type: "search",
			resolve: () =>
				queryDb("__crotchetExtensions").then((res) =>
					res.map((e) => ({
						value: e._id,
						label: e.name,
						action: {
							label: "Select",
							handler: () => dispatch("close-page", e),
						},
					}))
				),
		});

		if (!choice) return;

		return openPage({
			title: `Edit ${choice.name}`,
			type: "form",
			noPadding: true,
			fullWidth: true,
			field: {
				label: "",
				type: "contentEditable",
				value: choice.contents,
			},
			action: {
				label: "Save Changes",
				handler: async (contents) => {
					dbUpdate("__crotchetExtensions", choice._rowId, {
						contents,
					});
				},
			},
		});
	},
};

export const editIpfApp = {
	global: true,
	handler: async (_, { openPage }) => {
		// const realUrl = "https://firebasestorage.googleapis.com/v0/b/ipfos-91775.appspot.com/o/crotchet-uploads%2Ffile-ipf-os-app.json?alt=media&token=cb53771e-73a7-4c9f-bf45-bd48c39a6102";
		const url =
			"https://firebasestorage.googleapis.com/v0/b/letterplace-c103c.appspot.com/o/crotchet-uploads%2Ffile-ipf-os-app.json?alt=media&token=5670f9c6-417f-4c1a-a3cd-471815050659";
		return openPage({
			title: "Edit iPF App",
			type: "form",
			resolve: () =>
				readNetworkFile(url).then((res) =>
					JSON.stringify(JSON.parse(res), null, 4)
				),
			noPadding: true,
			fullWidth: true,
			field: ({ pageData }) => {
				if (!pageData) return null;

				return {
					label: "",
					type: "contentEditable",
					value: pageData,
					// meta: {
					// 	mode: "text/json"
					// },
				};
			},
			// resolve: () =>
			// 	readNetworkFile(url, { json: true }).then((res) =>
			// 		JSON.parse(res)
			// 	),
			// fields: ({ pageData }) => {
			// 	if (!pageData) return null;

			// 	return {
			// 		name: { value: pageData.name },
			// 		color: { type: "color", value: pageData.color },
			// 	};
			// },
			action: {
				label: "Save App",
				handler: async (data) =>
					uploadStringAsFile(data, {
						type: "application/json",
						name: "ipf-os-app.json",
					}),
			},
		});
		// window.uploadRawString(JSON.stringify(dt), {
		// 	type: "application/json",
		// 	name: "ipf-os-app.json",
		// });
	},
};
