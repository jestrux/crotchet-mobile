import { useEffect, useState } from "react";
import useElementSize from "@/hooks/useElementSize";
import { Saturation, ColorWrap, Hue } from "react-color/lib/components/common";
import PhotoshopPointerCircle from "react-color/lib/components/photoshop/PhotoshopPointerCircle";
import { toState } from "react-color/lib/helpers/color";

const Picker = () => {
	return (
		<div
			style={{
				width: "18px",
				height: "18px",
				borderRadius: "50%",
				transform: "translate(-9px, 0.5px)",
				backgroundColor: "rgb(248, 248, 248)",
				boxShadow: "0 1px 4px 0 rgba(0, 0, 0, 0.37)",
			}}
		>
			&nbsp;
		</div>
	);
};

let ColorPickerComponent = ({ aspectRatio = 14 / 16, ...props }) => {
	const [pickerRef, { width }] = useElementSize();

	const handleChange = ({ h }, e) => {
		props.onChange(toState({ ...props.hsl, h }), e);
	};

	return (
		<div ref={pickerRef} className="w-full flex flex-col gap-5">
			<div
				style={{
					// width: width + "px",
					height: width * aspectRatio + "px",
					position: "relative",
					overflow: "hidden",
				}}
			>
				<Saturation
					{...props}
					radius={8}
					color={{ hsl: props.hsl }}
					pointer={PhotoshopPointerCircle}
				/>
			</div>

			<div
				style={{
					height: 20,
					// width,
					position: "relative",
					borderRadius: 12,
				}}
			>
				<Hue
					radius={6}
					pointer={Picker}
					hsl={props.hsl}
					onChange={handleChange}
				/>
			</div>
		</div>
	);
};

ColorPickerComponent = ColorWrap(ColorPickerComponent);

export default function ColorPicker({
	color: _color = "#ff0000",
	onChange = () => {},
	aspectRatio,
}) {
	const [color, setColor] = useState({ hex: _color });

	useEffect(() => {
		if (_color != color.hex) setColor({ hex: _color });
	}, [_color]);

	const handleChange = (color) => {
		setColor(color);
		onChange(color.hex);
	};

	return (
		<ColorPickerComponent
			aspectRatio={aspectRatio}
			color={color}
			onChange={handleChange}
		/>
	);
}
