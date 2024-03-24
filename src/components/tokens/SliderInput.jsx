import { useEffect, useRef, useState } from "react";
import { NumberField, Slider } from "@adobe/react-spectrum";
import useDebounce from "@/hooks/useDebounce";

function SliderInput({
	min = 0,
	max = 100,
	step = 2,
	label = "Range",
	value = 100,
	onChange = () => {},
}) {
	const [_value, setValue] = useState(useRef(value).current);
	const percent = (Math.min(max, Math.max(min, _value)) - min) / (max - min);
	const tempPercent = useRef(percent);
	const debouncedValue = useDebounce(_value);

	useEffect(() => {
		onChange(debouncedValue);
	}, [debouncedValue]);

	return (
		<div className="flex items-center gap-3">
			<div className="flex-1 mt-1">
				<Slider
					isFilled
					width="100%"
					minWidth={0}
					aria-label={label}
					minValue={min}
					maxValue={max}
					step={step}
					value={_value}
					onChange={setValue}
				/>
			</div>

			<div className="flex-shrink-0">
				<NumberField
					key={percent}
					aria-label={label + " percent"}
					height="32px"
					width="65px"
					formatOptions={{ style: "percent" }}
					hideStepper
					minValue={0}
					maxValue={1}
					defaultValue={percent}
					onBlur={() =>
						setValue(min + tempPercent.current * (max - min))
					}
					onKeyUp={(e) => (e.key == "Enter" ? e.target.blur() : null)}
					onChange={(percent) => (tempPercent.current = percent)}
				/>
			</div>
		</div>
	);
}

export default SliderInput;
