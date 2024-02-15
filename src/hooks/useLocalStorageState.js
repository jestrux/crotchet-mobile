import { useState } from "react";
import { useAppContext } from "@/providers/app";

// Borrowed from https://usehooks.com/useLocalStorage/
function useLocalStorageState(key, initialValue) {
	const { prefs, setPref } = useAppContext();
	const [storedValue, setStoredValue] = useState(() => {
		if (key == undefined || key == null) return initialValue;

		try {
			return prefs[key] ?? initialValue;
		} catch (error) {
			return initialValue;
		}
	});

	const setValue = (value) => {
		try {
			const valueToStore =
				value instanceof Function ? value(storedValue) : value;

			setStoredValue(valueToStore);

			if (key == undefined || key == null) return;

			setPref(key, valueToStore);
		} catch (error) {
			// A more advanced implementation would handle the error case
			console.log(error);
		}
	};

	return [storedValue, setValue];
}

export default useLocalStorageState;
