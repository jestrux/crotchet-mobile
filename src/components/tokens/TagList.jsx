import { camelCaseToSentenceCase } from "@/utils";

function TagList({
	icon,
	choices = [],
	onChange,
	maxSelections = Infinity,
	multiple,
	...props
}) {
	let valueProp = props.value;
	let overridenValue;
	if (multiple && !Array.isArray(valueProp)) {
		let value = valueProp ?? choices[0];
		value = value?.value || value;
		const valueIndex = choices.indexOf(value);
		let otherChoice = choices[valueIndex - 1] ?? choices[valueIndex + 1];
		otherChoice = otherChoice?.value || otherChoice;

		overridenValue = [value, otherChoice];
	} else if (!multiple && Array.isArray(valueProp)) {
		overridenValue = valueProp.length ? valueProp[0] : "";
	}

	if (overridenValue) {
		setTimeout(() => {
			onChange(overridenValue);
		});

		valueProp = overridenValue;
	}

	return (
		<div
			className="flex flex-wrap mt-1 rounded-xs overflow-hidden"
			style={{ gap: "0.6rem" }}
		>
			{choices.map((choice, index) => {
				const isObject = typeof choice == "object";
				const label = isObject ? choice.label : choice;
				const value = isObject ? choice.value : choice;
				const selected = multiple
					? valueProp.includes(value)
					: valueProp == value;

				// return (
				// 	<Button
				// 		key={index}
				// 		size="m"
				// 		style={selected ? "fill" : "outline"}
				// 		variant={selected ? "accent" : "secondary"}
				// 		onClick={() => onChange(value, index)}
				// 	>
				// 		<small className="capitalize">
				// 			{camelCaseToSentenceCase(label).replace("-", " ")}
				// 		</small>
				// 	</Button>
				// );

				return (
					<button
						key={index}
						className={`flex items-center cursor-pointer py-1 border rounded-sm ${
							selected
								? "bg-dark-gray border-dark-gray text-white"
								: "bg-transparent text-darker-gray"
						}`}
						style={{
							gap: "0.35rem",
							fontSize: "13px",
							lineHeight: 1,
							padding: "0.35rem 0.55rem",
							borderColor: selected ? "" : "#c5c5c5",
						}}
						onClick={() => {
							let newValue = value;

							if (multiple) {
								if (selected && valueProp.length == 1) return;

								newValue = selected
									? valueProp.filter((v) => v != value)
									: valueProp.length == maxSelections
									? [value, ...valueProp].slice(
											0,
											maxSelections
									  )
									: [...valueProp, value];
							} else if (selected) return;

							onChange(newValue, index);
						}}
					>
						{typeof icon == "function" && (
							<div
								className="flex center-center"
								style={{
									marginLeft: "-2px",
									width: "10px",
								}}
							>
								{icon(value)}
							</div>
						)}
						{camelCaseToSentenceCase(label).replace("-", " ")}
					</button>
				);
			})}
		</div>
	);
}
export default TagList;
