import MutliGestureButton from "@/components/MutliGestureButton";
import { useOnInit, useState } from "@/crotchet";
import clsx from "clsx";

export default function useRemoteButtons({ keys, onKeypress }) {
	const [modifiers, setModifiers] = useState({});
	const doClick = ({ modifier, key, ...props }) => {
		if (modifier) {
			setModifiers((m) => ({
				...m,
				[key]: !m[key],
			}));
		} else {
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
		<div className="p-3 grid grid-cols-12 gap-2">
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
						...props
					},
					index
				) => {
					return (
						<MutliGestureButton
							key={`${label || key} ${index}`}
							className={clsx(
								"border border-content/20 h-10 font-bold rounded-full flex items-center justify-center",
								span ? "col-span-4" : "col-span-2",
								modifier &&
									modifiers[key] &&
									"bg-content/80 text-canvas"
							)}
							style={
								hold
									? {
											background:
												"linear-gradient(45deg, #d3ffff, #f2ddb0)",
											color: "#3E3215",
											borderColor: "transparent",
									  }
									: {}
							}
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
							onClick={() => doClick({ modifier, key, ...props })}
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
		keys.forEach(({ key, modifier, defaultValue }) => {
			if (modifier && defaultValue) {
				setModifiers((m) => ({
					...m,
					[key]: defaultValue,
				}));
			}
		});
	});

	return {
		buttons,
		modifiers,
	};
}
