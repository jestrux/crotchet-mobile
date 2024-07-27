import { gradients } from "@/constants";
import { Clipboard } from "@capacitor/clipboard";
import { Toast } from "@capacitor/toast";
import { Share } from "@capacitor/share";
import { Directory, Encoding, Filesystem } from "@capacitor/filesystem";
import { matchSorter } from "match-sorter";

export { default as tinyColor } from "./tinycolor";
export { default as getColorName } from "./get-color-name";

export const KeyMap = {
	Escape: 0,
	F1: 1,
	F2: 2,
	F3: 3,
	F4: 4,
	F5: 5,
	F6: 6,
	F7: 7,
	F8: 8,
	F9: 9,
	F10: 10,
	F11: 11,
	F12: 12,
	F13: 13,
	F14: 14,
	F15: 15,
	F16: 16,
	F17: 17,
	F18: 18,
	F19: 19,
	F20: 20,
	F21: 21,
	F22: 22,
	F23: 23,
	F24: 24,
	Print: 25,
	ScrollLock: 26,
	Pause: 27,
	Grave: 28,
	Num1: 29,
	Num2: 30,
	Num3: 31,
	Num4: 32,
	Num5: 33,
	Num6: 34,
	Num7: 35,
	Num8: 36,
	Num9: 37,
	Num0: 38,
	Minus: 39,
	Equal: 40,
	Backspace: 41,
	Insert: 42,
	Home: 43,
	PageUp: 44,
	NumLock: 45,
	Divide: 46,
	Multiply: 47,
	Subtract: 48,
	Tab: 49,
	Q: 50,
	W: 51,
	E: 52,
	R: 53,
	T: 54,
	Y: 55,
	U: 56,
	I: 57,
	O: 58,
	P: 59,
	LeftBracket: 60,
	RightBracket: 61,
	Backslash: 62,
	Delete: 63,
	End: 64,
	PageDown: 65,
	NumPad7: 66,
	NumPad8: 67,
	NumPad9: 68,
	Add: 69,
	CapsLock: 70,
	A: 71,
	S: 72,
	D: 73,
	F: 74,
	G: 75,
	H: 76,
	J: 77,
	K: 78,
	L: 79,
	Semicolon: 80,
	Quote: 81,
	Return: 82,
	NumPad4: 83,
	NumPad5: 84,
	NumPad6: 85,
	LeftShift: 86,
	Z: 87,
	X: 88,
	C: 89,
	V: 90,
	B: 91,
	N: 92,
	M: 93,
	Comma: 94,
	Period: 95,
	Slash: 96,
	RightShift: 97,
	Up: 98,
	NumPad1: 99,
	NumPad2: 100,
	NumPad3: 101,
	Enter: 102,
	LeftControl: 103,
	LeftSuper: 104,
	LeftWin: 105,
	LeftCmd: 106,
	LeftAlt: 107,
	Space: 108,
	RightAlt: 109,
	RightSuper: 110,
	RightWin: 111,
	RightCmd: 112,
	Menu: 113,
	RightControl: 114,
	Fn: 115,
	Left: 116,
	Down: 117,
	Right: 118,
	NumPad0: 119,
	Decimal: 120,
	Clear: 121,
	AudioMute: 122,
	AudioVolDown: 123,
	AudioVolUp: 124,
	AudioPlay: 125,
	AudioStop: 126,
	AudioPause: 127,
	AudioPrev: 128,
	AudioNext: 129,
	AudioRewind: 130,
	AudioForward: 131,
	AudioRepeat: 132,
	AudioRandom: 133,
};

export const appendScript = (filepath) => {
	return new Promise((resolve) => {
		if (document.querySelector('head script[src="' + filepath + '"]'))
			return resolve();

		const script = document.createElement("script");
		script.setAttribute("type", "text/javascript");
		script.setAttribute("src", filepath);
		document.querySelector("head").appendChild(script);

		script.onload = resolve();
	});
};

export const exportContent = async function (
	content,
	fileName = "download",
	type = "txt"
) {
	if (onDesktop())
		return saveFile(`${fileName}.${type}`, content, {
			folder: "downloads",
			open: true,
		});

	return clickToDownload(
		encodeURI(`data:text/${type};charset=utf-8,${content}`)
	);
};

export const clickToDownload = async function (url, fileName = "download") {
	let newUrl;

	try {
		newUrl = await fetch(url)
			.then((response) => response.blob())
			.then((blob) => URL.createObjectURL(blob));
	} catch (error) {
		console.log("Failed to blob: ", error);
		newUrl = url;
	}

	var link = document.createElement("a");
	link.setAttribute("download", fileName);
	link.setAttribute("href", newUrl);
	link.setAttribute("target", "_blank");
	link.click();
	link.remove();
};

export const objectExcept = (obj = {}, excludedFields = []) => {
	return Object.fromEntries(
		Object.entries(obj).filter(([key]) => !excludedFields.includes(key))
	);
};

export const objectTake = (obj = {}, excludedFields = []) => {
	return Object.fromEntries(
		Object.entries(obj).filter(([key]) => excludedFields.includes(key))
	);
};

export const cleanObject = (obj = {}) => {
	const isValid = (value) =>
		(value ?? "").toString().length &&
		!["undefined", "false", "0", "null"].includes((value ?? "").toString());

	return Object.fromEntries(
		Object.entries(obj || {}).filter(
			([key, value]) => isValid(key) && isValid(value)
		)
	);
};

export const objectIsEmpty = (obj = {}) => {
	return !Object.keys(cleanObject(obj ?? {})).length;
};

export const isValidUrl = (urlString) => {
	const urlPattern = new RegExp(
		"^(https?:\\/\\/)?" + // validate protocol
			"((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // validate domain name
			"((\\d{1,3}\\.){3}\\d{1,3}))" + // validate OR ip (v4) address
			"(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // validate port and path
			"(\\?[;&a-z\\d%_.~+=-]*)?" + // validate query string
			"(\\#[-a-z\\d_]*)?$",
		"i"
	); // validate fragment locator

	return !!urlPattern.test(urlString);
};

export const isValidEmail = (email) =>
	email && email.length < 256 && /^[^@]+@[^@]{2,}\.[^@]{2,}$/.test(email);

export const isValidAction = (action) => {
	if (!action) return false;

	if (typeof action.handler == "function") return true;
	else if (typeof action.onClick == "function") return true;
	else if (action.url) return true;
	else if (typeof action == "function") return true;

	return false;
};

export const socketEmit = (event, payload) =>
	dispatch("socket-emit", {
		event,
		payload,
	});

export const dispatch = (event, payload) => {
	window.dispatchEvent(
		new CustomEvent(event, {
			detail: payload,
		})
	);
};

export const onDesktop = () => document.body.classList.contains("on-electron");

export const getShareUrl = (content, type = "text") => {
	if (!content) return "";

	if (type != "object" && !_.isObject(content)) {
		if (!content?.length) return "";

		if (type == "text") return `crotchet://share-url/${content}`;

		return `crotchet://share-${type}/${content}`;
	}

	if (content.sheet) {
		return `crotchet://action-sheet/${content.sheet}/?${objectToQueryParams(
			{
				...content,
				previewImage: content.preview || content.video,
				preview: {
					video: content.video,
					image: content.preview,
					title: content.title,
					description: content.subtitle || content.url,
				},
			}
		)}`;
	}

	return `crotchet://share-object/${encodeURIComponent(
		JSON.stringify(content)
	)}`;
};

export const crawlUrl = async (url, name) => {
	var res = await withCache(
		name || new URL(url).hostname,
		fetch(
			`https://us-central1-letterplace-c103c.cloudfunctions.net/api/crawl/${encodeURIComponent(
				url
			)}`
		).then((res) => res.json())
	);

	if (res?.meta) {
		res.meta = cleanObject(res.meta);
		res.meta.subtitle = res.meta.description;
	}

	return res;
};

export const someTime = async (duration = 200) => {
	return await { then: (res) => setTimeout(res, duration) };
};

export const toggleAppWindow = async (status, duration) => {
	const changing = onDesktop() && window.__crotchet.desktop.visible != status;
	dispatch("toggle-app", status);
	if (changing) return await someTime(duration);
};

export const hideApp = async () => dispatch("toggle-app", false);

const processSchemeUrl = (schemeName, path) => {
	const url = new URL(
		path.replace(`crotchet://${schemeName}/`, "https://crotchet.app/")
	);
	const scheme = url.pathname.substring(1).split("/")?.at(0);
	const params = urlQueryParamsAsObject(path);
	const paramValues = Object.values(params);
	let args;

	if (paramValues.length) {
		if (paramValues.length == 1 && (params.param || params.arg))
			args = paramValues[0];
		else args = params;
	}

	return [scheme, args];
};

export const openUrl = async (path) => {
	if (onDesktop()) dispatch("toggle-app", true);

	// showToast("Open url: " + path);
	if (path.startsWith("crotchet://download/")) {
		return clickToDownload(path.replace("crotchet://download/", ""));
	}

	if (path.startsWith("crotchet://open/")) {
		return openUrl(path.replace("crotchet://open/", ""));
	}

	if (path.startsWith("crotchet://copy")) {
		if (path.startsWith("crotchet://copy-image/")) {
			return copyImage(path.replace("crotchet://copy-image/", ""));
		}

		if (path.startsWith("crotchet://copy-url/")) {
			return copyFromUrl(path.replace("crotchet://copy-url/", ""));
		}

		return copyToClipboard(path.replace("crotchet://copy/", ""));
	}

	if (path.startsWith("crotchet://broadcast/")) {
		if (path.startsWith("crotchet://broadcast/image/")) {
			const image = await fetchImage(
				encodeURI(path.replace("crotchet://broadcast/image/", ""))
			);
			Share.share({
				files: [image],
			});
			return;
		}

		if (path.startsWith("crotchet://broadcast/url/")) {
			Share.share({
				url: encodeURI(path.replace("crotchet://broadcast/url/", "")),
			});
			return;
		}

		Share.share({
			text: encodeURI(path.replace("crotchet://broadcast/url/", "")),
		});

		return;
	}

	if (path.startsWith("crotchet://action-sheet/")) {
		const url = new URL(
			path.replace("crotchet://action-sheet/", "https://crotchet.app/")
		);
		const scheme = url.pathname.substring(1).split("/")?.at(0);

		const sheet = __crotchet.actionSheets[scheme];

		if (!sheet?.handler) return showToast(`Sheet ${scheme} not found!`);

		return sheet.handler(
			urlQueryParamsAsObject(path.replace("crotchet://action-sheet/", ""))
		);
	}

	if (path.startsWith("crotchet://data-source/")) {
		const url = new URL(
			path.replace("crotchet://data-source/", "https://crotchet.app/")
		);
		const [name, slug = "get"] = [
			...url.pathname.substring(1).split("/"),
			null,
			null,
		];
		const actualSource = __crotchet.dataSources[name];

		if (typeof actualSource?.[slug] != "function")
			return showToast(`Data source ${name} not found!`);

		return actualSource?.[slug]();
	}

	if (path.startsWith("crotchet://share")) {
		const share = (payload) => {
			return __crotchet.actionSheets.share.handler(payload);
		};

		if (path.startsWith("crotchet://share-object/")) {
			share(
				cleanObject(
					JSON.parse(
						decodeURIComponent(
							path.replace("crotchet://share-object/", "")
						)
					)
				)
			);
		} else if (path.startsWith("crotchet://share-image/")) {
			share({
				image: path.replace("crotchet://share-image/", ""),
			});
		} else if (path.startsWith("crotchet://share-url/")) {
			share({
				url: path.replace("crotchet://share-url/", ""),
			});
		} else
			share({
				text: path.replace("crotchet://share/", ""),
			});

		return;
	}

	if (path.startsWith("crotchet://search")) {
		return openUrl(
			path.replace("crotchet://search", "crotchet://app/search")
		);
	}

	if (path.startsWith("crotchet://action/")) {
		const [scheme, args] = processSchemeUrl("action", path);
		const action = window.__crotchet.actions[scheme];
		if (action?.handler) return await action.handler(args);

		return showToast(`Action ${scheme} not found`);
	}

	if (path.startsWith("crotchet://socket/"))
		return socketEmit(...processSchemeUrl("socket", path));

	if (path.startsWith("crotchet://automation-action/")) {
		path = path.replace(
			"crotchet://automation-action/",
			"https://crotchet.app/"
		);
		const url = new URL(path);
		const scheme = url.pathname.substring(1).split("/")?.at(0);
		const params = urlQueryParamsAsObject(path);
		const { automationActions, actions } = window.__crotchet;
		const action = { ...automationActions, ...actions }[scheme];

		if (action?.handler) {
			return await action.handler(
				action.automation ? params : params?.data
			);
		}

		return showToast(`Automation action ${scheme} not found`);
	}

	if (path.startsWith("crotchet://app/")) {
		const scheme = new URL(
			path.replace("crotchet://app/", "https://crotchet.app/")
		).pathname
			.substring(1)
			.split("/")
			?.at(0);
		const app = window.__crotchet.apps[scheme];
		const url = new URL(path);

		if (app) {
			return app.load(
				url.href.replace("crotchet://app", ""),
				window.__crotchet
			);
		}

		return showToast("Unkown app: " + scheme);
	}

	if (onDesktop()) {
		const url = new URL(path);
		return window.dispatchEvent(
			new CustomEvent("open-url", {
				detail: url.href,
			})
		);
	}

	window.open(path, "_blank");
};

export const randomId = () => Math.random().toString(36).slice(2);

export const isEmptyObj = (obj) => Object.keys(obj).length === 0;

export const getMarkdownTable = (rows) => {
	const fields = Object.keys(rows[0]);
	return [
		"| ",
		fields.map((field) => `${field}`).join(" | "),
		" |\n|",
		fields.map(() => `:--|`).join(""),
		"\n| ",
		rows
			.map((row) => fields.map((field) => row[field]).join(" | "))
			.join("|\n"),
		" |",
	].join("");
};

export const getGradient = (name = "Butterbeer") => {
	name = name == true ? "Butterbeer" : name;
	const gradient = gradients[name] || shuffle(Object.values(gradients))[0];
	const gradientString = gradient
		.map((color, idx) => {
			return `${color} ${(idx * 100) / (gradient.length - 1)}%`;
		})
		.join(", ");

	return `linear-gradient(90deg, ${gradientString})`;
};

export const dateFromString = (date) => {
	const parsed = Date.parse(date);
	if (!isNaN(parsed)) {
		return parsed;
	}

	return Date.parse(date.replace(/-/g, "/").replace(/[a-z]+/gi, " "));
};

export const formatDate = (
	value,
	formatting = { month: "short", day: "numeric", year: "numeric" }
) => {
	if (!value) return value;

	try {
		var date =
			typeof value == "string"
				? new Date(dateFromString(value))
				: value?.seconds
				? value.seconds * 1000
				: "";

		value = new Intl.DateTimeFormat("en-US", formatting).format(date);
	} catch (error) {
		console.log("Date error: ", error, value, typeof value);
		value = "";
	}

	return value;
};

export const showToast = (...toast) => {
	const {
		text,
		image,
		position = "bottom",
	} = typeof toast?.[0] == "object"
		? toast[0]
		: {
				text: [...toast].join(" "),
		  };

	console.log(text);

	if (onDesktop()) {
		return window.__crotchet.desktop.showToast(text, image);

		// const backgroundToast = window.__crotchet.backgroundToast;
		// if (typeof backgroundToast == "function") return backgroundToast(text);

		// return window.__crotchet.desktop.showToast(text, image);
	}

	Toast.show({
		text,
		position,
	});
};

export const readClipboard = async () => {
	// if (onDesktop()) {
	// 	socketEmit("read-clipboard");
	// 	showToast("Image copied");
	// 	return;
	// }

	try {
		return await Clipboard.read();
	} catch (error) {
		console.log("Error copying text: ", error);
		throw "Failed to copy!";
	}
};

export const copyToClipboard = (
	content,
	{ withToast = true, message } = {}
) => {
	if (!content?.length) return console.log("Nothing to copy: ", content);

	message = message || (content.length < 10 ? `${content} copied` : "Copied");

	if (onDesktop()) {
		socketEmit("copy", content);
		if (withToast) showToast(message);
		return;
	}

	return Clipboard.write({
		string: content,
		url: content,
	})
		.then(() => {
			if (withToast) showToast(message);
		})
		.catch((e) => showToast(`Copy failed: ${e}`));
};

export const copyFromUrl = async (url, { withToast = true } = {}) => {
	return copyToClipboard(
		await fetch(url).then((response) => response.text()),
		{ withToast }
	);
};

export const fetchImage = async (url) => {
	const blob = await fetch(url).then((response) => response.blob());

	return new Promise((resolve) => {
		const reader = new FileReader();

		reader.onload = () => resolve(reader.result);

		reader.readAsDataURL(blob);
	});
};

export const copyImage = async (url, { withToast = true } = {}) => {
	const image = await fetchImage(url);
	if (onDesktop()) {
		socketEmit("copy-image", image);

		if (withToast) showToast("Image copied!", { image });

		return image;
	}

	return Clipboard.write({
		image,
	})
		.then(() => {
			if (withToast) showToast("Image copied!");
			return image;
		})
		.catch((e) => showToast(`Image copy failed: ${e}`));
};

export const toHms = (number) => {
	const sec_num = parseInt(number, 10); // don't forget the second param
	let hrs = Math.floor(sec_num / 3600);
	let mins = Math.floor((sec_num - hrs * 3600) / 60);
	let secs = sec_num - hrs * 3600 - mins * 60;

	return [
		...(hrs > 0 ? [hrs.toString().padStart(2, "0")] : []),
		mins.toString().padStart(2, "0"),
		secs.toString().padStart(2, "0"),
	].join(":");
};

export const simulateClick = (cb) => {
	const btn = document.createElement("button");
	btn.innerText = "Button";
	btn.style.display = "none";
	document.body.appendChild(btn);

	btn.addEventListener("click", cb);

	btn.click();

	setTimeout(() => {
		btn.remove();
	}, 200);
};

export const objectFieldChoices = (choices) =>
	choices.map((choice) => {
		let label =
			objectField(choice, "label") ||
			objectField(choice, "title") ||
			objectField(choice, "subtitle");
		let value = objectField(choice, "value");

		if (!value && label) value = label;
		else if (!label && value) label = value;

		return {
			__id: randomId(),
			tempId: label,
			label,
			value,
			...(typeof choice == "object" ? choice : {}),
		};
	});

export const objectField = (object, field) => {
	return typeof object == "object" ? object?.[field] : object;
};

export const sectionedChoices = (choices, query, { valuesOnly } = {}) => {
	if (!choices) return null;

	let formattedChoices = objectFieldChoices(choices).map((choice) => {
		if (choice.section)
			choice.sectionTag = `${choice.section} ${choice.value}`;
		return choice;
	});

	formattedChoices = !query?.length
		? formattedChoices
		: matchSorter(formattedChoices, query, {
				keys: ["label", "sectionTag"],
		  });

	formattedChoices = Object.entries(
		_.groupBy(_.orderBy(formattedChoices, "pinned", "desc"), "section")
	).filter(([, choices]) => choices.length);

	return valuesOnly
		? formattedChoices.map(([, values]) => values).flat()
		: formattedChoices;
};

export const objectAsLabelValue = (object) => {
	return Object.entries(object).map(([label, value]) => ({ label, value }));
};

export const objectToQueryParams = (obj = {}) => {
	const url = new URL("https://crotchet.app/");

	Object.keys(obj).forEach((key) => {
		let value = obj[key];

		if (_.isObject(value) && !_.isArray(value))
			value = JSON.stringify(value);

		if (_.isArray(value)) value = value.map(encodeURIComponent).join("<!>");

		if (!_.isArray(value)) value = encodeURIComponent(value);

		url.searchParams.set(key, value);
	});

	return url.searchParams.toString();
};

export const urlQueryParamsAsObject = (path) => {
	const url = new URL(
		"https://crotchet.app/" + path.replace("crotchet://", "")
	);

	const mapper = (value) => {
		if (isNaN(value)) {
			try {
				value = decodeURIComponent(value);
			} catch (error) {
				//
			}

			try {
				value = JSON.parse(value);
			} catch (error) {
				//
			}
		} else {
			value = Number(value);
		}

		return value;
	};

	const params = Array.from(url.searchParams.entries()).map(
		([key, value]) => {
			value = mapper(value);

			try {
				if (value.indexOf("<!>") != -1)
					value = value.split("<!>").map(mapper);
			} catch (error) {
				//
			}

			return [key, value];
		}
	);

	return Object.fromEntries(params);
};

export const getLinksFromText = (text, first) => {
	if (!text) return null;

	const links = text.split(/\s+/).filter(isValidUrl);

	if (!links.length) return null;

	if (first) return links?.[0];

	return links;
};

export const processShareData = (value, type = "text") => {
	if (!value?.trim()?.length) return null;

	let payload = {
		fromClipboard: true,
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
	else payload.url = getLinksFromText(value, true);

	return payload;
};

export const getShareActions = (
	content = {},
	actions,
	mainActionNames = []
) => {
	const {
		image,
		file,
		url,
		text,
		download,
		incoming,
		fromClipboard,
		scheme,
		sheet,
		state = {},
	} = content;

	return Object.entries((actions || window.__crotchet.actions) ?? {}).reduce(
		(agg, [name, action]) => {
			if (
				name == "share" ||
				action.context != "share" ||
				(action.mobileOnly && onDesktop())
			)
				return agg;

			if (
				scheme?.length &&
				![action.scheme, action.sheet].includes(scheme)
			)
				return agg;

			let matches =
				!objectIsEmpty({ image, url, file, text }) ||
				(scheme?.length && !objectIsEmpty(state));

			const match = action.match;

			if (_.isFunction(match)) {
				matches = match({
					image,
					file,
					url,
					text,
					download,
					scheme,
					sheet,
					state,
					fromClipboard,
				});
			} else if (
				["image", "file", "url", "text", "download"].includes(match)
			) {
				matches = {
					image,
					file,
					url,
					text,
					download,
				}[match]?.length;
			}

			if (!matches) return agg;

			const isMain = mainActionNames.includes(name);

			if (isMain && incoming) return agg;

			return [
				...agg,
				{
					name,
					...action,
					main: isMain,
				},
			];
		},
		[]
	);
};

export const shuffle = (array) => {
	return [...array].sort(() => Math.random() - 0.5);
};

export const random = (array) => {
	return shuffle(shuffle(array))[0];
};

export const camelCaseToSentenceCase = (text) => {
	if (!text || !text.length) return "";
	const result = text.replace(/([A-Z]{1,})/g, " $1");
	return result.charAt(0).toUpperCase() + result.slice(1);
};

export const parseFields = (fields, data) => {
	if (!fields) return;

	return Object.entries(fields).map(([name, value]) => {
		let { type, label, choices, defaultValue, ...fieldProps } =
			typeof value == "object" ? value : { type: value };

		let dataValue = data?.[name];

		const computedDefaultValue = dataValue ?? defaultValue;

		if (
			choices &&
			Array.isArray(choices) &&
			!choices.includes(computedDefaultValue)
		)
			choices.push(computedDefaultValue);

		return {
			__id: "id" + randomId(),
			name,
			label: label ?? name,
			type,
			choices,
			defaultValue: computedDefaultValue,
			value: computedDefaultValue,
			...fieldProps,
		};
	});
};

export const getWriteableFile = async (path) => {
	const key = "getFile" + randomId();
	if (onDesktop()) {
		if (path) {
			return readFile({ path }).then((contents) => {
				if (!contents) return;

				return {
					path,
					contents,
					save: (contents, { open = false } = {}) =>
						saveFile({ path }, contents, {
							open,
						}),
				};
			});
		}

		return new Promise((res) => {
			var handler = async (e) => {
				window.removeEventListener(`get-file-${key}`, handler);
				const file = e.detail;

				if (!file?.path) return res(null);
				res({
					...file,
					save: (contents, { open = false } = {}) =>
						saveFile({ path: file.path }, contents, {
							open,
						}),
				});
			};

			window.addEventListener(`get-file-${key}`, handler);

			dispatch("get-file", [
				key,
				{
					properties: ["openFile"],
					read: true,
				},
			]);
		});
	}

	return;

	// try {
	// 	var res = await Filesystem.readFile({
	// 		path: fileName,
	// 		directory: Directory.Documents,
	// 		encoding: Encoding.UTF8,
	// 	});

	// 	if (res) return res?.data;
	// } catch (error) {
	// 	//
	// }
};

export const saveFile = async (props = {}, contents, { folder, open } = {}) => {
	contents =
		typeof contents == "object"
			? JSON.stringify(contents, null, 4)
			: contents;

	if (onDesktop()) {
		return dispatch("write-file", {
			name: props.name,
			path: props.path,
			contents,
			folder,
			open,
		});
	}

	return await Filesystem.writeFile({
		path: props.path || props.name,
		data: contents,
		directory: Directory.Documents,
		encoding: Encoding.UTF8,
	});
};

const readFile = async (props) => {
	const key = "getFile" + randomId();

	if (onDesktop()) {
		return new Promise((res) => {
			var handler = async (e) => {
				window.removeEventListener(`read-file-${key}`, handler);
				let file = e.detail;

				if (file?.length) {
					try {
						file = JSON.parse(file);
					} catch (_) {
						//
					}
				}

				res(file);
			};

			window.addEventListener(`read-file-${key}`, handler);

			dispatch("read-file", { key, ...props });
		});
	}

	try {
		var res = await Filesystem.readFile({
			path: props.name || props.path,
			directory: Directory.Documents,
			encoding: Encoding.UTF8,
		});

		if (res) return res?.data;
	} catch (error) {
		//
	}
};

export const getToken = async (key) => {
	let token = await getPreference(`token-${key}`);

	if (!token?.value) {
		token = await window.__crotchet.openForm({
			title: "Enter Token",
			field: {
				label: key,
			},
		});

		if (token) token = await saveToken(key, token);
	}

	return token;
};

export const saveToken = async (key, value, expiresAt) => {
	return await savePreference(`token-${key}`, { value, expiresAt });
};

export const withCache = async (name, promise, { invalidateAfter } = {}) => {
	let value = await getFromCache(name);
	const cacheAndReturn = () =>
		promise.then((res) => {
			if (res) cache(name, res);
			return res;
		});

	if (!value) value = await cacheAndReturn();
	else if (invalidateAfter) cacheAndReturn();

	await someTime();
	return value;
};

export const getFromCache = async (key) => {
	return await readFile({ name: `__cache/${key}` });
};

export const cache = async (key, value) => {
	if (!value) return value;
	await saveFile({ name: `__cache/${key}` }, value);
	return value;
};

const getUserPreferences = async (fromSave) => {
	let res = await readFile({ name: "__crotchetPreferences.json" });

	if (!res) {
		res = {};
		if (!fromSave)
			await saveFile({ name: "__crotchetPreferences.json" }, {});
	}

	return res;
};

export const getPreference = async (key, defaultValue = null) => {
	let res = await getUserPreferences();

	if (key) res = res?.[key] ?? defaultValue;

	return res;
};

export const savePreference = async (key, value) => {
	const prefs = await getUserPreferences(true);

	if (key) prefs[key] = value;

	await saveFile({ name: "__crotchetPreferences.json" }, prefs);

	return key ? value : prefs;
};

export const loadExternalAsset = async (url, { name, type } = {}) => {
	if (!url?.length) return null;

	type = type || url.split(".").at(-1);

	name = name || url.split("/").at(-1);

	if (!document.querySelector(`[data-external-asset="${name}"]`)) {
		const contents = await withCache(
			name,
			new Promise((resolve) =>
				fetch(url)
					.then((res) => res.text())
					.then(resolve)
			)
		);

		const asset = document.createElement(
			type == "css" ? "style" : "script"
		);
		asset.innerHTML = contents;
		asset.setAttribute("data-external-asset", name);
		document.querySelector("head").appendChild(asset);
	}

	return;
};

export const getPromise = () => {
	let resolve, reject;
	const promise = new Promise((res, rej) => {
		resolve = res;
		reject = rej;
	});

	return [promise, resolve, reject];
};

export const networkRequest = async (
	url,
	{
		bearerToken,
		secretToken,
		responseType = "json",
		responseField,
		searchParam = "q",
		q,
		filters = {},
		headers = {},
		params = {},
	} = {}
) => {
	const fetchHeaders = {
		Accept: "application/json",
		"Content-Type": "application/json",
		Authorization: `Bearer ${bearerToken}`,
		...headers,
	};

	const handler = async () => {
		if (secretToken) {
			const token = await getToken(secretToken);
			if (!token?.value?.length) return null;

			fetchHeaders[secretToken] = token.value;
		}

		let fullUrl = new URL(url);

		Object.entries({ ...params, [searchParam]: q, ...filters }).forEach(
			([key, value]) => {
				if (value != undefined) fullUrl.searchParams.append(key, value);
			}
		);

		return fetch(fullUrl.href, {
			headers: fetchHeaders,
		})
			.then((response) => response[responseType]())
			.then((res) => res?.[responseField] || res);
	};

	return window.__crotchet.withLoader(handler);
};
