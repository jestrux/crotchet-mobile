import * as Slider from "@radix-ui/react-slider";
import { useState } from "react";

function SliderInput({ value: _value = 50, onChange }) {
	const [value, setValue] = useState(_value);

	return (
		<div className="flex items-center gap-4">
			<div className="flex-1 mt-1">
				<Slider.Root
					className="relative flex w-full touch-none select-none items-center"
					defaultValue={[_value]}
					max={100}
					step={1}
					onValueChange={setValue}
					onValueCommit={onChange}
				>
					<Slider.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-content/10">
						<Slider.Range className="absolute h-full bg-primary" />
					</Slider.Track>
					<Slider.Thumb
						className="block h-5 w-5 rounded-full border-2 border-primary bg-canvas ring-offset-canvas transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
						aria-label="Volume"
					/>
				</Slider.Root>
			</div>

			<div className="flex-shrink-0">
				<div
					type="number"
					className="w-14 h-11 flex items-center justify-center border-2 border-content/10 rounded-md tracking-wide font-semibold"
				>
					{value / 100}
				</div>
			</div>
		</div>
	);
}

export default SliderInput;
