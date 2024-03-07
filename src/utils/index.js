import { gradients } from "@/constants";
import { Clipboard } from "@capacitor/clipboard";
import { Toast } from "@capacitor/toast";

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

export const showToast = (text) =>
	Toast.show({
		text,
	});

export const copyToClipboard = (content) => {
	return Clipboard.write({
		string: content,
		url: content,
	})
		.then(() => showToast("Copied"))
		.catch((e) => showToast(`Copy failed: ${e}`));
};

export const copyImage = async (url) => {
	const blob = await fetch(url).then((response) => response.blob());
	const reader = new FileReader();

	reader.onload = async () => {
		return Clipboard.write({
			image: reader.result,
		})
			.then(() => showToast("Image copied"))
			.catch((e) => showToast(`Image copy failed: ${e}`));
	};

	reader.readAsDataURL(blob);
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
		return {
			tempId: label,
			label: label,
			...(typeof choice == "object" ? choice : {}),
		};
	});

export const objectField = (object, field) => {
	return typeof object == "object" ? object?.[field] : object;
};

export const objectAsLabelValue = (object) => {
	return Object.entries(object).map(([label, value]) => ({ label, value }));
};

export const shuffle = (array) => {
	return [...array].sort(() => Math.random() - 0.5);
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
