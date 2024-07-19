import { Fragment, useEffect, useRef, useState } from "react";
import FormField from "./FormField";
import { parseFields } from "@/utils";
import Button from "../Button";

const fieldIsVisible = (field, data) => {
	if (!field) return false;

	const hiddenByData = field.show && !field.show(data);
	const invisibleField = field.type === "hidden";

	return !hiddenByData && !invisibleField;
};

export default function Form({
	onClose = () => {},
	submitButtonRef: _submitButtonRefProp,
	onSubmit,
	...props
}) {
	const allData = props.data
		? props.data
		: props.field && props.field.value
		? { formField: props.field.value }
		: {};
	const allFields = props.fields
		? props.fields
		: props.field
		? { formField: props.field }
		: {};
	// const {  } = useAppContext();
	const fields = parseFields(allFields, allData);
	const [data, setData] = useState(
		Object.entries(allFields).reduce(
			(agg, [key, { defaultValue, value }]) => ({
				...agg,
				[key]: value ?? defaultValue,
			}),
			allData || {}
		)
	);

	const formRef = useRef(null);
	const submitButtonRef = useRef();

	const handleSubmit = async (e) => {
		e.preventDefault();
		let newData = fields.reduce((agg, field) => {
			const formField = e.target[field.name];

			if (!formField || field.helper) return agg;

			let value = formField.value;

			if (field.type == "boolean") value = formField.checked;

			if (field.type === "authUser") value = [value];

			try {
				if (field.type === "keyvalue") value = JSON.parse(value);
			} catch (error) {
				//
			}

			agg = { ...agg, [field.name]: value };

			return agg;
		}, {});
		const fieldKeys = Object.keys(allFields);
		const mergedValues = Object.entries(allData || {}).reduce(
			(agg, [key, value]) => {
				if (!fieldKeys.includes(key)) agg[key] = value;

				return agg;
			},
			newData
		);

		Object.entries(mergedValues).forEach(([key, value]) => {
			if (value === undefined) delete mergedValues[key];
		});

		const savedValues =
			fieldKeys.length == 1 && fieldKeys[0] == "formField"
				? mergedValues.formField
				: mergedValues;

		if (typeof onSubmit == "function") onSubmit(savedValues);
		else onClose(savedValues);

		// 	// try {
		// 	// 	const res = await withToast(
		// 	// 		Promise.resolve(onSubmit(mergedValues)),
		// 	// 		pane.successMessage || "Success!"
		// 	// 	);
		// 	// 	onClose(res);
		// 	// } catch (error) {
		// 	// 	console.log("Save error: ", error);
		// 	// }
		// } else {
		// 	onClose(mergedValues);
		// }
	};

	useEffect(() => {
		const timeout = setTimeout(() => {
			const firstInput =
				formRef.current?.querySelector("input, textarea");
			if (firstInput) {
				firstInput.focus();
				if (Object.keys(allFields).length == 1) firstInput.select();
			}
		}, 20);

		return () => clearTimeout(timeout);
	}, []);

	const inSpotlight = !!_submitButtonRefProp;

	return (
		<form ref={formRef} id="theForm" onSubmit={handleSubmit}>
			<div
				className={`grid grid-cols-12 items-start ${
					inSpotlight ? "gap-6" : "gap-3"
				}`}
			>
				{fields.map((field, index) => {
					if (typeof field.show == "function" && !field.show(data))
						return null;

					const key =
						typeof field.key == "function" && field.key(data);

					let widthClass =
						{
							full: "col-span-12",
							half: "col-span-6",
							third: "col-span-4",
						}[field.width ?? "full"] || "col-span-12";

					return (
						<Fragment key={index}>
							{field?.group &&
								fields[index - 1]?.group !== field.group && (
									<div
										className={`col-span-12 flex items-center gap-3 -mx-5 mt-1 ${
											!field.noMargin &&
											!field.hideLabel &&
											"-mb-1.5"
										}`}
									>
										<span className="w-2 h-2 rounded-full bg-content/50"></span>

										<h5 className="text-content/50 py-1.5 pr-2 text-xs leading-none uppercase tracking-widest font-bold">
											{field.group}
										</h5>

										<span className="flex-1 border-t"></span>
									</div>
								)}
							<FormField
								horizontal={inSpotlight}
								{...(key ? { key } : {})}
								className={` ${widthClass} ${
									field.noMargin && "-mt-3"
								}`}
								field={field}
								__data={data}
								onChange={(newProps) =>
									setData({ ...data, ...newProps })
								}
							/>

							{field?.group &&
								!fields[index + 1]?.group &&
								fields[index + 1] &&
								fieldIsVisible(fields[index + 1], data) && (
									<hr className="col-span-12 mt-1 -mx-5" />
								)}
						</Fragment>
					);
				})}
			</div>

			<div className="mt-4">
				<Button
					ref={_submitButtonRefProp || submitButtonRef}
					className={_submitButtonRefProp ? "hidden" : ""}
					type="submit"
				>
					Submit
				</Button>
			</div>
		</form>
	);
}
