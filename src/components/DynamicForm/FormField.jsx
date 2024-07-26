import { useState } from "react";
import Switch from "./Switch";
import {
	camelCaseToSentenceCase,
	dateToYMDString,
	fieldTypeMaps,
	objectField,
	useSourceGet,
} from "@/crotchet";
// import ReactTextareaAutosize from "react-textarea-autosize";
// import TextareaMarkdown from "textarea-markdown-editor";

const Select = ({ value, name, optional, choices: _choices, onChange }) => {
	const { data: choices } = useSourceGet(async () => {
		try {
			if (!_choices) return null;
			if (typeof _choices == "function") return await _choices();
			return _choices;
		} catch (e) {
			//
		}

		return null;
	});

	return (
		<div>
			<select
				onChange={onChange}
				value={value}
				name={name}
				required={!optional}
			>
				<option
					value=""
					disabled={!optional}
					// disabled={!optional && value?.toString().length}
				>
					Choose one
				</option>
				{choices?.map((choice, index) => {
					if (!choice) return null;

					const choiceLabel = objectField(choice, "name");
					const choiceValue = objectField(choice, "value");

					return (
						<option
							key={index}
							value={choiceValue}
							required={!optional}
						>
							{choiceLabel}
						</option>
					);
				})}
			</select>
		</div>
	);
};

const Field = ({ field, value, onChange }) => {
	const [focused, setFocused] = useState();

	switch (field.type) {
		case "boolean":
			return (
				<div>
					<label
						htmlFor={field.label}
						className="cursor-pointer inline-flex items-start gap-4"
						style={{
							...(field.meta?.rightAligned
								? {
										flexDirection: "row-reverse",
										justifyContent: "space-between",
								  }
								: {}),
						}}
					>
						<div className="mt-1.5">
							<Switch
								id={field.label}
								size="md"
								checked={value}
								onChange={onChange}
								name={field.name}
							/>
						</div>

						<span
							className="inline-block first-letter:capitalize"
							htmlFor={field.label}
						>
							{field.label}
						</span>
					</label>
				</div>
			);

		case "radio":
			return (
				<div
					className={`mt-1.5 flex items-center flex-wrap gap-3 ${
						typeof field.renderChoice == "function"
							? "gap-3s"
							: "gap-6s"
					}`}
				>
					{field.choices?.map((choice, index) => {
						if (!choice) return null;

						const choiceLabel = objectField(choice, "name");
						const choiceValue = objectField(choice, "value");
						const selected = choiceValue === value;
						const hasFocus = choiceValue === focused;
						const customRenderer =
							typeof field.renderChoice == "function";

						return (
							<label
								key={index}
								className={`
								hover:bg-content/10 cursor-pointer border border-content/20 pl-2 pr-3.5 pt-1.5 pb-0.5 rounded-full relative
							${
								selected
									? "bg-content/5 pointer-events-none"
									: hasFocus
									? "border-content/50 bg-content/10"
									: "text-content/70"
							}
							`}
							>
								<input
									className="pointer-events-none opacity-0 absolute"
									type="radio"
									name={field.name}
									value={choiceValue}
									checked={selected}
									required={field.required}
									onChange={() => onChange(choiceValue)}
									onFocus={() => setFocused(choiceValue)}
								/>

								{customRenderer ? (
									field.renderChoice(choiceValue, selected)
								) : (
									<div className="inline-flex items-center gap-2">
										<svg
											className={`w-4 h-4 ${
												selected
													? "text-primary"
													: "text-content/40"
											}`}
											fill="currentColor"
											viewBox="0 0 24 24"
										>
											<circle
												cx="12"
												cy="12"
												r="11"
												stroke="currentColor"
												fill={
													selected
														? "currentColor"
														: "none"
												}
												strokeWidth="2"
											/>

											{selected && (
												<path
													transform="translate(3 3) scale(0.7)"
													d="M4.5 12.75l6 6 9-13.5"
													stroke="white"
													fill="none"
													strokeWidth="3"
												/>
											)}
										</svg>
										<span className="text-base/none font-semibold">
											{camelCaseToSentenceCase(
												choiceLabel
											)}
										</span>
									</div>
								)}
							</label>
						);
					})}
				</div>
			);

		case "choice":
			return (
				<Select
					{...field}
					{...(field.meta || {})}
					value={value}
					onChange={onChange}
				/>
			);

		case "textarea":
			return (
				<textarea
					{...field}
					className="overflow-hidden resize-none"
					rows="1"
					required={field.required}
					style={{
						overflowWrap: "break-word",
						height: "150px",
					}}
				></textarea>
			);

		default: {
			let fieldType = field.type || "text";
			if (["image"].includes(fieldType)) fieldType = "text";

			return (
				<input
					{...(typeof field.show == "function"
						? { autoFocus: true }
						: {})}
					className="placeholder:text-content/20"
					id={field.label}
					placeholder={field.placeholder}
					type={fieldType}
					size="md"
					name={field.name}
					value={value}
					onChange={onChange}
					required={field.required}
					min={field.min_value}
					max={field.max_value}
					maxLength={field.maxLength}
				/>
			);
		}
	}
};

export default function FormField({
	className,
	__data,
	field,
	onChange = () => {},
}) {
	if (field.type == "future_date")
		field.min_value = dateToYMDString(new Date());
	if (field.type == "past_date")
		field.max_value = dateToYMDString(new Date());

	field.type = fieldTypeMaps[field.type] ?? field.type;

	const [value, setValue] = useState(field.value ?? field.defaultValue ?? "");
	const handleChange = (e) => {
		let value = e;
		if (e.target) {
			const el = e.target;
			value = ["checkbox", "radio"].includes(el.type)
				? el.checked
				: el.value;
		}

		// if (["fields", "filters"].includes(field.name))
		// 	console.log(field.name, value);

		setValue(value);
		onChange({ [field.name]: value });
	};

	if (field.type === "hidden")
		return <input type="hidden" name={field.name} defaultValue={value} />;

	return (
		<div className={`${className}`}>
			<div>
				{field.type !== "boolean" && !field.hideLabel && (
					<label
						className="inline-block first-letter:capitalize mb-1"
						htmlFor={field.label}
					>
						{field.label}
					</label>
				)}

				<Field
					__data={__data}
					field={field}
					value={value}
					onChange={handleChange}
				/>
			</div>

			{field.hint && field.hint.length && (
				<p className="text-sm">
					Hint: <span className="opacity-75">{field.hint}</span>
				</p>
			)}
		</div>
	);
}
