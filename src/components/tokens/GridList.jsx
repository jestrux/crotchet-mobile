import { camelCaseToSentenceCase } from "@/utils";

function GridList({
	choices = [],
	columns = 4,
	aspectRatio = "1",
	gap = "0.5rem",
	transparent,
	render,
	onChange,
	...props
}) {
	return (
		<div
			className="mt-1 grid"
			style={{
				gap,
				gridTemplateColumns: Array(columns)
					.fill(12)
					.map((_) => "1fr")
					.join(" "),
			}}
		>
			{choices.map((choice, index) => {
				const isObject = typeof choice == "object";
				const label = isObject ? choice.label : choice;
				const value = isObject ? choice.value : choice;
				const selected = props.value == value;

				return (
					<div
						key={index}
						className={`relative hoverables flex flex-col flex-wrap center-center border rounded-sm ${
							selected
								? "bg-black26 border-dark-gray"
								: "text-darker-gray"
						}`}
						style={{
							width: "100%",
							overflow: "hidden",
							borderColor: transparent
								? "transparent"
								: selected
								? ""
								: "#d5d5d5",
							aspectRatio,
						}}
						// onClick={() => onChange(value, index)}
					>
						{typeof render == "function" ? (
							render(value)
						) : (
							<span
								className="text-sm font-medium"
								style={{
									paddingLeft: "0.6rem",
									paddingRight: "0.6rem",
									fontSize: "12px",
									borderColor: selected ? "" : "#c5c5c5",
									width: "100%",
								}}
							>
								{camelCaseToSentenceCase(label).replace(
									"-",
									" "
								)}
							</span>
						)}
					</div>
				);
			})}
		</div>
	);
}
export default GridList;
