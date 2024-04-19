import { gradients } from "@/constants";
import { Clipboard } from "@capacitor/clipboard";
import { Toast } from "@capacitor/toast";
import { Share } from "@capacitor/share";

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
	return Object.fromEntries(
		Object.entries(obj || {}).filter(
			([, value]) =>
				(value ?? "").toString().length &&
				!["undefined", "false", "0", "null"].includes(value)
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

	return `crotchet://share-object/${encodeURIComponent(
		JSON.stringify(content)
	)}`;
};

export const crawlUrl = async (url) => {
	var res = await fetch(
		`https://us-central1-letterplace-c103c.cloudfunctions.net/api/crawl/${encodeURIComponent(
			url
		)}`
	).then((res) => res.json());

	if (res?.meta) {
		res.meta = cleanObject(res.meta);
		res.meta.subtitle = res.meta.description;
	}

	return res;
};

export const openUrl = async (path) => {
	// showToast("Open url: " + path);

	if (path.startsWith("crotchet://download/")) {
		console.log("Download:", path.replace("crotchet://download/", ""));
		// showToast("Download:", path.replace("crotchet://download/", ""));
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

		return sheet.handler(Object.fromEntries(url.searchParams.entries()));
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
		const url = new URL(
			path.replace("crotchet://action/", "https://crotchet.app/")
		);
		const scheme = url.pathname.substring(1).split("/")?.at(0);
		const params = Object.fromEntries(url.searchParams.entries());
		const paramValues = Object.values(params);
		let args;

		if (paramValues.length) {
			if (paramValues.length == 1 && params.param) args = paramValues[0];
			else args = params;
		}

		const action = window.__crotchet.actions[scheme];
		if (action?.handler) return await action.handler(args);

		return showToast(`Action ${scheme} not found`);
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

export const showToast = (text, { image, position = "bottom" } = {}) => {
	console.log(text);

	if (onDesktop()) return window.__crotchet.desktop.showToast(text, image);

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
		const label = objectField(choice, "label");
		const value = objectField(choice, "value");
		return {
			tempId: label,
			label,
			value,
			...(typeof choice == "object" ? choice : {}),
		};
	});

export const objectField = (object, field) => {
	return typeof object == "object" ? object?.[field] : object;
};

export const objectAsLabelValue = (object) => {
	return Object.entries(object).map(([label, value]) => ({ label, value }));
};

export const objectToQueryParams = (obj = {}) => {
	const url = new URL("https://crotchet.app/");
	Object.keys(obj).forEach((key) => url.searchParams.set(key, obj[key]));
	return url.searchParams.toString();
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
			label: label || name,
			type,
			choices,
			defaultValue: computedDefaultValue,
			value: computedDefaultValue,
			...fieldProps,
		};
	});
};
