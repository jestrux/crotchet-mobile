import MutliGestureButton from "@/components/MutliGestureButton";
import { useOnInit, useState } from "@/crotchet";
import clsx from "clsx";

export default function useRemoteButtons({
	keys,
	onKeypress = () => {},
	onModifiersChanged = () => {},
	modifiers: _modifiers = {},
}) {
	const [modifiers, _setModifiers] = useState(_modifiers);
	const setModifier = ({ name, key, value }) => {
		_setModifiers((m) => {
			const field = name || key;
			const newValue = value != undefined ? value : name ? key : !m[key];
			const newModifiers = { ...m, [field]: newValue };
			onModifiersChanged(newModifiers);
			return newModifiers;
		});
	};

	const doClick = ({ modifier, name, key, ...props }) => {
		if (modifier) setModifier({ name, key });
		else {
			onKeypress({
				key,
				shift: modifiers.shift,
				cmd: modifiers.cmd,
				alt: modifiers.alt,
				option: modifiers.option,
				...props,
			});
		}
	};

	const buttons = (
		<div className="p-3 grid grid-cols-6 gap-2">
			{keys.map(
				(
					{
						key,
						label,
						icon,
						modifier,
						span,
						doubleClick,
						hold,
						name,
						...props
					},
					index
				) => {
					let selected = modifiers[name || key];
					if (name) selected = selected == key;

					return (
						<MutliGestureButton
							key={`${label || key} ${index}`}
							className={clsx(
								"border border-content/20 h-10 font-bold rounded-full flex items-center justify-center",
								modifier &&
									selected &&
									"bg-content/80 text-canvas"
							)}
							style={{
								...{
									gridColumn: `span ${span} / span ${span}`,
								},
								...(hold
									? {
											background:
												"linear-gradient(45deg, #d3ffff, #f2ddb0)",
											color: "#3E3215",
											borderColor: "transparent",
									  }
									: {}),
							}}
							{...(doubleClick
								? {
										onDoubleClick: () => {
											doClick({
												...props,
												...doubleClick,
											});
										},
								  }
								: {})}
							{...(hold
								? {
										onHold: () => {
											doClick({
												...props,
												...hold,
											});
										},
								  }
								: {})}
							onClick={() =>
								doClick({ modifier, key, name, ...props })
							}
						>
							<span className="font-bold">
								{icon || label || key}
							</span>
						</MutliGestureButton>
					);
				}
			)}
		</div>
	);

	useOnInit(() => {
		keys.forEach(({ name, key, modifier, defaultValue }) => {
			if (modifier && defaultValue)
				setModifier({ name, key, value: defaultValue });
		});
	});

	return {
		buttons,
		modifiers,
	};
}
