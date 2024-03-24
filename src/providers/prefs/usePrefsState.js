import { useRef, useState } from "react";
import { useOnInit } from "@/crotchet";
import { getPrefs } from "./pref-utils";

const defaultPreferences = {
	pinnedApps: [
		"youtubeClips",
		// "laCroix",
		"home",
		"reader",
	],
};

export default function usePrefsState(key, initialValue) {
	const [loading, setLoading] = useState(!window.__crotchet?.__prefs);
	const setValueRef = useRef();

	const [storedValue, setStoredValue] = useState(() => {
		if (key == undefined || key == null) return initialValue;

		const prefs = window.__crotchet?.__prefs;

		try {
			if (prefs?.[key]) return prefs[key] ?? initialValue;
		} catch (error) {
			//
		}

		return initialValue;
	});

	const setValue = (value) => {
		const valueToStore =
			typeof value == "function" ? value(storedValue) : value;

		setStoredValue(valueToStore);

		if (typeof setValueRef.current == "function")
			setValueRef.current(key, valueToStore);
	};

	useOnInit(() => {
		getPrefs("__crotchet", defaultPreferences).then(([value, setter]) => {
			setValueRef.current = setter;
			const val = value?.[key] ?? initialValue;
			if (val != storedValue) setStoredValue(val);
			setLoading(false);
		});
	});

	return [storedValue, setValue, loading];
}
