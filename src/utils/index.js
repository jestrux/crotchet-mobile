import { gradients } from "@/constants";
import { Clipboard } from "@capacitor/clipboard";
import { Toast } from "@capacitor/toast";

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
