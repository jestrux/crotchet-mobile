import usePrefsState from "../providers/prefs/usePrefsState";

export default function useDataSchema(
	key,
	defaultValue,
	mainCallback = () => {}
) {
	const keySet =
		typeof key == "string" &&
		(defaultValue == undefined || typeof defaultValue == "function");
	if (!keySet) defaultValue = key;

	const [data, setData] = usePrefsState(
		keySet ? key : null,
		defaultValue || {}
	);
	const updateField = (field, newValue, callback) => {
		const keyValueUpdate = typeof field == "string";
		callback = (keyValueUpdate ? callback : newValue) || mainCallback;

		const updatedProps = keyValueUpdate ? { [field]: newValue } : field;
		const newData = { ...data, ...updatedProps };

		handleSetData(newData, callback);
	};

	const handleSetData = (data, callback = mainCallback) => {
		setData(data);
		callback(data);
	};

	return [data, updateField, handleSetData];
}
