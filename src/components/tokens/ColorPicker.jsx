import React from "react";
import ColorList from "./ColorList";
import Toggle from "./Toggle";
import { DEFAULT_COLORS } from "@/constants";

const ColorPicker = ({
	colors = DEFAULT_COLORS,
	label = "COLOR",
	value,
	showToggle = true,
	compact = false,
	onChange = () => {},
}) => {
	const [selectedColor, setSelectedColor] = React.useState("");

	React.useEffect(() => {
		if (value && value != selectedColor) setSelectedColor(value);
	}, [value]);

	React.useEffect(() => {
		if (selectedColor != value) onChange(selectedColor);
	}, [selectedColor]);

	function toggleColorList() {
		const color = selectedColor.length ? "" : colors[0];
		setSelectedColor(color);
	}

	return (
		<div className={`${!compact && "py-2"}`}>
			{!compact && ((label && label.length > 0) || showToggle) && (
				<div className="flex items-center justify-between mb-2">
					<label className="text-md">{label}</label>

					{showToggle && (
						<Toggle
							checked={selectedColor.length}
							onChange={toggleColorList}
						/>
					)}
				</div>
			)}

			{selectedColor.length > 0 && (
				<ColorList
					colors={colors}
					selectedColor={selectedColor}
					onChange={setSelectedColor}
				/>
			)}
		</div>
	);
};

export default ColorPicker;
