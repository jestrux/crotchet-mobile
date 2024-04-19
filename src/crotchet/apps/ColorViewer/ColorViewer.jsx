import {
	useState,
	tinyColor,
	ActionList,
	useRef,
	ColorPicker,
	SliderInput,
} from "@/crotchet";

export default function ColorViewer({ color: _color, dismiss }) {
	const colorRef = useRef(tinyColor(_color));
	const [alpha, _setAlpha] = useState(colorRef.current.getAlpha());
	const [color, setColor] = useState(colorRef.current);

	const toRgb = (color) => {
		const { r, g, b, a } = tinyColor(color).toRgb();
		return `rgba(${[r, g, b, a].join()})`;
	};

	const setAlpha = (value) => {
		colorRef.current.setAlpha(value / 100);
		_setAlpha(value / 100);
		setColor(colorRef.current);
	};

	const getActions = (_color, alpha) => {
		const color = tinyColor(_color);
		color.setAlpha(alpha);

		return [
			{
				label: "Copy HEX",
				url: `crotchet://copy/${color.toHexString()}`,
				trailing: color.toHex8String(),
			},
			{
				label: "Copy RGB",
				url: `crotchet://copy/${toRgb(color)}`,
				trailing: toRgb(color),
			},
			{
				label: "Copy HSL",
				url: `crotchet://copy/${color.toHslString()}`,
				trailing: color.toHslString(),
			},
		];
	};

	return (
		<div className="px-6 w-full">
			<div className="py-4 flex items-center gap-2.5">
				<div
					className="-mr-0.5 bg-content/5 border border-content/5 rounded-lg size-10 flex items-center justify-center"
					style={{
						background: color.toString(),
					}}
				/>

				<div className="flex-1">
					<h3 className="text-lg/none font-bold">
						{color.toString()}
					</h3>
					<p className="mt-1 text-sm/none text-content/80 line-clamp-3">
						{color.toString().startsWith("rgb")
							? color.toHex8String()
							: toRgb(color)}
					</p>
				</div>

				<button
					className="bg-content/5 border border-content/5 size-7 flex items-center justify-center rounded-full"
					onClick={dismiss}
				>
					<svg
						className="w-3.5"
						fill="none"
						viewBox="0 0 24 24"
						strokeWidth="1.5"
						stroke="currentColor"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M6 18 18 6M6 6l12 12"
						/>
					</svg>
				</button>
			</div>
			<div className="w-full mt-">
				<ColorPicker
					color={color.setAlpha(1).toHexString()}
					aspectRatio={2 / 5}
					onChange={(color) => {
						colorRef.current = tinyColor(color);
						colorRef.current.setAlpha(alpha);
						setColor(colorRef.current);
					}}
				/>
			</div>

			<div className="mt-5">
				<SliderInput value={alpha * 100} onChange={setAlpha} />

				<div className="mt-5">
					<ActionList actions={getActions(color, alpha)} />
				</div>
			</div>
		</div>
	);
}
