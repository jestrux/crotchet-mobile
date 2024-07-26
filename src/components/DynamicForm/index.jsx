import { useRef, useState } from "react";
import Button from "@/components/Button";
import { parseFields } from "@/utils";
import FormField from "./FormField";

export default function DynamicForm({
	fields: _fields,
	data: _data,
	horizontalLayout = false,
	formId,
	onChange = () => {},
	onSubmit = () => {},
}) {
	const formRef = useRef(null);
	const { current: fields } = useRef(parseFields(_fields, _data));
	const [data, setData] = useState(
		Object.entries(_fields).reduce(
			(agg, [key, { defaultValue, value }]) => ({
				...agg,
				[key]: value ?? defaultValue,
			}),
			_data || {}
		)
	);

	const processFormValues = () => {
		const form = formRef.current;
		if (!form) return null;

		const formattedFields = fields.reduce((agg, field) => {
			return [
				...agg,
				...(field.type == "group" ? field.children : [field]),
			];
		}, []);

		return formattedFields.reduce((agg, field) => {
			const formField = form[field.name];

			if (!formField || field.helper) return agg;

			let value =
				field.type === "boolean"
					? formField?.checked
					: formField?.value;

			// if (field.type === "authUser") value = [value];
			// agg = { ...agg, [field.name]: value };

			return {
				...agg,
				[field.name]: value,
			};
		}, {});
	};

	const handleChange = (newProps) => {
		setData({ ...data, ...newProps });

		if (typeof onChange == "function") {
			setTimeout(() => {
				onChange(processFormValues());
			}, 20);
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		const savedValues = processFormValues();
		if (typeof onSubmit == "function") onSubmit(savedValues);
	};

	return (
		<form ref={formRef} id={formId} onSubmit={handleSubmit}>
			<div className="flex flex-col gap-3">
				{fields.map((field) => {
					if (typeof field.show == "function" && !field.show(data)) {
						if (data[field.name] != undefined)
							onChange({ [field.name]: undefined });

						return null;
					}

					let widthClass =
						{
							full: "col-span-12",
							half: "col-span-6",
							third: "col-span-4",
						}[field.width ?? "full"] || "col-span-12";

					return (
						<FormField
							key={field.__id}
							horizontal={horizontalLayout}
							className={` ${widthClass} ${
								field.noMargin && "-mt-3"
							}`}
							field={field}
							__data={data}
							onChange={handleChange}
						/>
					);
				})}
			</div>

			<div className={formId ? "hidden" : "mt-4"}>
				<Button type="submit">Submit</Button>
			</div>
		</form>
	);
}
