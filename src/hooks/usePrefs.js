import { Preferences } from "@capacitor/preferences";
import onChange from "on-change";

export const savePrefs = (context = "__crotchet", value) => {
	Preferences.set({
		key: context,
		value: JSON.stringify(value),
	});
};

export const getPrefs = async (
	context = "__crotchet",
	defaultValue = {},
	callback
) => {
	if (window?.[context]?.__prefs) return window[context].__prefs;

	if (!window?.[context]?.__prefs) {
		if (!window?.[context]) window[context] = {};

		const prefs = await Preferences.get({ key: context }).then(
			({ value }) => {
				let prefs;

				try {
					prefs = JSON.parse(value ?? JSON.stringify(defaultValue));
				} catch (error) {
					prefs = defaultValue;
				}

				return prefs;
			}
		);

		window[context].__prefs = onChange(prefs, () => {
			savePrefs(context, window[context].__prefs);
			if (typeof callback == "function")
				callback(window[context].__prefs);
		});

		const setter = (key, value) => {
			window[context].__prefs[key] = value;
		};

		return [window[context].__prefs, setter];
	}
};
