import { useEffect, useRef, useState } from "react";

function SingleSwatch({ value, selectable, selected, onChange }) {
	const choiceSize = 28;
	const updateColor = (key, newColor) => {
		onChange({ ...value, [key]: newColor });
	};

	return (
		<div
			className={`${
				selected
					? "bg-gray "
					: selectable
					? "border-transparent pointer-events-none"
					: "border-transparent "
			} border-t border-b py-2 relative -mx-12px px-12px`}
		>
			<div className="flex flex-wrap items-center rounded-sm overflow-hidden border border-black divide-y">
				{Object.entries(value).map(([name, color]) => {
					return (
						<label
							key={name}
							title={
								selectable
									? null
									: isFinite(name)
									? "Color " + (Number(name) + 1)
									: name
							}
							className="relative cursor-pointer"
							style={{
								flex: 1,
								flexShrink: 0,
								backgroundColor: color,
							}}
						>
							<input
								type="color"
								defaultValue={color}
								className="absolute opacity-0"
								style={{ width: 0, height: 0 }}
								onChange={(e) =>
									updateColor(name, e.target.value)
								}
							/>

							<div
								style={{
									width: choiceSize,
									height: choiceSize,
								}}
							></div>
						</label>
					);
				})}
			</div>

			{selectable && selected && (
				<div className="mt-1 text-center text-sm flex flex-wrap items-center">
					{Object.entries(value).map(([name]) => {
						return (
							<span key={name} className="flex-1">
								{name.replace("Color", "")}
							</span>
						);
					})}
				</div>
			)}
		</div>
	);
}

export default function ColorSwatch({ themes, value, onChange }) {
	const [_themes, setThemes] = useState([]);
	const [theme, setTheme] = useState(value);
	const [themeIndex, setThemeIndex] = useState(-1);

	const themesRef = useRef();

	useEffect(() => {
		if (themesRef?.current == null) {
			themesRef.current = themes;
			setThemes(themes);

			if (themes?.length && value && Object.values(value)?.length) {
				setThemeIndex(
					themes.findIndex((theme) => {
						return (
							Object.values(theme).join(",") ==
							Object.values(value).join(",")
						);
					})
				);
			}
		}
	}, [value]);

	if (!themes) return <SingleSwatch value={value} onChange={onChange} />;

	return (
		<div
			className="flex flex-col"
			style={{
				marginTop: "-0.1rem",
			}}
		>
			{_themes.map((colors, index) => (
				<button
					style={{
						background: "transparent",
						border: "none",
						padding: 0,
						cursor: index != themeIndex ? "pointer" : "",
					}}
					key={index}
					onClick={() => {
						setTheme(theme);
						onChange(colors);
						setThemeIndex(index);
					}}
				>
					<SingleSwatch
						selectable
						selected={index == themeIndex}
						value={colors}
						onChange={(newColors) => {
							setThemes(
								_themes.map((theme, i) =>
									i == index ? newColors : theme
								)
							);
							setTheme(newColors);
							onChange(newColors);
						}}
					/>
				</button>
			))}
		</div>
	);
}
