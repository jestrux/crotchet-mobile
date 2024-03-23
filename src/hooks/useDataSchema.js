import useLocalStorageState from "./useLocalStorageState";

export default function useDataSchema(
	key,
	defaultValue,
	mainCallback = () => {}
) {
	const keySet = typeof key == "string";
	if (!keySet) defaultValue = key;

	const [data, setData] = useLocalStorageState(
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
