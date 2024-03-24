function ButtonGroup({ choices = [], onChange, ...props }) {
	return (
		<div
			className="inline-flex border rounded-sm overflow-hidden"
			style={{ padding: "0.1rem", borderColor: "#ccc" }}
		>
			{choices.map((choice, index) => {
				const isObject = typeof choice == "object";
				const label = isObject ? choice.label : choice;
				const value = isObject ? choice.value : choice;
				const selected = props.value == value;

				return (
					<button
						key={index}
						className={`capitalize cursor-pointer ${
							index < choices.length - 1
								? "border-r"
								: "border border-transparent"
						} ${
							selected
								? "rounded-xs bg-dark-gray text-white"
								: "bg-transparent text-darker-gray"
						}`}
						style={{
							fontSize: "12px",
							padding: "0.25rem 0.5rem",
						}}
						onClick={() => onChange(value, index)}
					>
						{label.toString()}
					</button>
				);
			})}
		</div>
	);
}
export default ButtonGroup;
