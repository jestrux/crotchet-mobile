import { DEFAULT_COLORS } from "@/constants";
import useDebounce from "@/hooks/useDebounce";
import { useEffect, useState } from "react";
import tinyColor from "@/utils/tinycolor";
// import staticImages from "../../staticImages";;

const ColorCard = ({
	fullWidth,
	height,
	color: colorProp,
	selected,
	showIndicator,
	onChange,
}) => {
	const [color, setColor] = useState(colorProp);
	const transparent = color == "transparent";
	const debouncedValue = useDebounce(color);

	useEffect(() => {
		onChange(debouncedValue);
	}, [debouncedValue]);

	return (
		<label
			className="color-label block relative cursor-pointer rounded-sm border-2"
			style={{
				minWidth: fullWidth ? "100%" : height + "px",
				height: height + "px",
				borderColor:
					transparent || tinyColor(color).getLuminance() > 0.95
						? selected
							? "#bbb"
							: "#e7e7e7"
						: color,
				...(transparent
					? {
							// background: `url(${staticImages.transparency})`,
							backgroundSize: height,
					  }
					: { backgroundColor: color }),
			}}
			onClick={() => setColor(color)}
		>
			{!transparent && (
				<input
					className="absolute opacity-0"
					style={{ width: 0, height: 0 }}
					type="color"
					defaultValue={color}
					onChange={(e) => setColor(e.target.value)}
				/>
			)}

			{showIndicator && (
				<div
					className="border-2 rounded-sm h-full aspect-square"
					style={{
						borderColor:
							selected && !transparent ? "white" : "transparent",
					}}
				></div>
			)}
		</label>
	);
};

const ColorList = ({
	centerColors = false,
	selectedColor,
	// small = false,
	choiceHeight: choiceSize = 30,
	// spacing = 0,
	// showCustomPicker = false,
	showTransparent,
	// showIndicator = true,
	fullWidth = false,
	onChange,
	singleChoice,
	...props
}) => {
	const [colors, setColors] = useState([
		...(showTransparent ? ["transparent"] : []),
		...(props.colors || DEFAULT_COLORS),
	]);

	const updateColor = (index, newColor) => {
		setColors(
			colors.map((color, i) => {
				if (i == index) return newColor;
				return color;
			})
		);

		onChange(newColor);
	};

	if (singleChoice)
		return (
			<ColorCard
				fullWidth={fullWidth}
				height={choiceSize}
				color={selectedColor}
				onChange={onChange}
			/>
		);

	return (
		<div
			className={`inline-flex flex-wrap gap-1 items-center rounded-sm overflow-hidden${
				centerColors && "justify-center"
			} `}
		>
			{colors.map((color, index) => {
				const selected = selectedColor == color;

				return (
					<ColorCard
						height={choiceSize}
						showIndicator={true}
						key={index}
						selected={selected}
						color={color}
						onChange={(color) => updateColor(index, color)}
					/>
				);
			})}
		</div>
	);
};

export default ColorList;
