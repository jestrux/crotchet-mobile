import { useAppContext } from "@/providers/app";
import { useRef, useState } from "react";
import { KeyMap } from "@/utils";
import clsx from "clsx";
import { SpeechRecognition } from "@capacitor-community/speech-recognition";
import MutliGestureButton from "@/components/MutliGestureButton";

export default function RemoteWidget() {
	const dictatedMessageTimeout = useRef(null);
	const trackpad = useRef(null);
	const { socketEmit, actions: appActions } = useAppContext();
	const [dictating, setDictating] = useState(false);
	const [modifiers, setModifiers] = useState({});
	const [dictatedMessage, _setDictatedMessage] = useState("");
	const [value, setValue] = useState("");

	const setDictatedMessage = (message, timeout) => {
		if (dictatedMessageTimeout.current) {
			clearTimeout(dictatedMessageTimeout.current);
			dictatedMessageTimeout.current = null;
		}

		_setDictatedMessage(message);

		if (timeout) {
			dictatedMessageTimeout.current = setTimeout(() => {
				setDictatedMessage("");
			}, timeout);
		}
	};

	const listen = async () => {
		setDictatedMessage("");
		setValue("");

		const available = SpeechRecognition.available();

		if (!available) {
			return alert("Not available");
		}

		const res = await SpeechRecognition.requestPermissions();
		if (res.speechRecognition != "granted") return alert("Perm failed!");

		try {
			SpeechRecognition.addListener("partialResults", (data) => {
				setDictatedMessage(data.matches[0]);
				setValue(data.matches[0]);
			});

			return SpeechRecognition.start({
				language: "en-US",
				maxResults: 1,
				// prompt: "Say something",
				partialResults: true,
				// popup: true,
			});
		} catch (error) {
			alert("Listen error: " + error);
		}
	};

	const checkCommandForAction = (command) => {
		command = command.toLowerCase().replaceAll(" ", "").trim();
		const action = Object.values(appActions).find(({ label }) => {
			return label.toLowerCase().replaceAll(" ", "").trim() == command;
		});

		if (action && action.context != "share") {
			setDictatedMessage(`running: ${action.label}...`, 2000);

			socketEmit("emit", {
				event: "runAction",
				payload: action.name,
			});

			return true;
		}

		return false;
	};

	const triggerSpeech = () => {
		if (dictating) {
			SpeechRecognition.removeAllListeners();
			SpeechRecognition.stop();
			setDictating(false);

			const clear = value.toLowerCase() == "clear";
			const paste = value.toLowerCase() == "paste";
			// const replace = value.toLowerCase() == "replace";
			// const selectAll = value.toLowerCase() == "select all";

			setDictatedMessage("");

			if (value.toLowerCase().includes("run")) {
				const actionName = value.toLowerCase().replace("run", "");
				if (
					!checkCommandForAction(
						value.toLowerCase().replace("run", "")
					)
				)
					setDictatedMessage(`action: ${actionName} not found`, 2000);

				return;
			}

			if (checkCommandForAction(value)) return;

			if (paste) return socketEmit("paste");

			if (clear) return socketEmit("type", { replace: clear });

			return socketEmit("type", { text: value });
		}

		listen();
		// then((res) => {
		// 	setDictating(false);
		// 	socketEmit("type", value);
		// 	// setTimeout(() => {
		// 	// 	alert(value);
		// 	// }, 300);
		// });

		setDictating(true);
	};

	const keys = [
		{ key: "Escape", label: "esc" },
		{ key: "Tab", label: "tab" },
		{
			key: "Enter",
			icon: (
				<svg className="size-6" fill="currentColor" viewBox="0 0 24 24">
					<path d="M19 7v4H5.83l3.58-3.59L8 6l-6 6 6 6 1.41-1.41L5.83 13H21V7z" />
				</svg>
			),
		},
		{
			key: "Space",
			icon: (
				<svg className="size-6" viewBox="0 0 24 24" fill="currentColor">
					<path d="M18 9v4H6V9H4v6h16V9z" />
				</svg>
			),
		},
		{ key: "Down", label: "👇" },
		{ key: "Up", label: "👆" },
		{
			icon: (
				<svg className="size-5" fill="currentColor" viewBox="0 0 24 24">
					<path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z" />
				</svg>
			),
			key: "shift",
			modifier: true,
		},
		{
			key: "cmd",
			modifier: true,
			icon: (
				<svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
					<path d="M17.5,3C15.57,3,14,4.57,14,6.5V8h-4V6.5C10,4.57,8.43,3,6.5,3S3,4.57,3,6.5S4.57,10,6.5,10H8v4H6.5 C4.57,14,3,15.57,3,17.5S4.57,21,6.5,21s3.5-1.57,3.5-3.5V16h4v1.5c0,1.93,1.57,3.5,3.5,3.5s3.5-1.57,3.5-3.5S19.43,14,17.5,14H16 v-4h1.5c1.93,0,3.5-1.57,3.5-3.5S19.43,3,17.5,3L17.5,3z M16,8V6.5C16,5.67,16.67,5,17.5,5S19,5.67,19,6.5S18.33,8,17.5,8H16L16,8 z M6.5,8C5.67,8,5,7.33,5,6.5S5.67,5,6.5,5S8,5.67,8,6.5V8H6.5L6.5,8z M10,14v-4h4v4H10L10,14z M17.5,19c-0.83,0-1.5-0.67-1.5-1.5 V16h1.5c0.83,0,1.5,0.67,1.5,1.5S18.33,19,17.5,19L17.5,19z M6.5,19C5.67,19,5,18.33,5,17.5S5.67,16,6.5,16H8v1.5 C8,18.33,7.33,19,6.5,19L6.5,19z" />
				</svg>
			),
		},
		{
			key: "alt",
			modifier: true,
			icon: (
				<svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
					<rect height="2" width="6" x="15" y="5" />
					<polygon points="9,5 3,5 3,7 7.85,7 14.77,19 21,19 21,17 15.93,17" />
				</svg>
			),
		},
		{
			label: "Raycast",
			key: "Slash",
			option: true,
			icon: (
				<svg width="18" viewBox="0 0 24 24">
					<path
						d="M5.25 8.25h15m-16.5 7.5h15m-1.8-13.5-3.9 19.5m-2.1-19.5-3.9 19.5"
						fill="none"
						stroke="currentColor"
						strokeWidth={2}
						strokeLinecap="round"
					/>
				</svg>
			),
			hold: {
				key: "Space",
			},
		},
		{ key: "Left", label: "👈" },
		{ key: "Right", label: "👉" },
	];

	const doClick = ({ modifier, key, ...props }) => {
		if (modifier) {
			setModifiers((m) => ({
				...m,
				[key]: !m[key],
			}));
		} else {
			socketEmit("keypress", {
				key: KeyMap[key],
				shift: modifiers.shift,
				cmd: modifiers.cmd,
				alt: modifiers.alt,
				option: modifiers.option,
				...props,
			});
		}
	};

	return (
		<div>
			<div className="rounded-t-2xl relative z-10 flex-shrink-0 h-10 flex items-center bg-content/5">
				<span className="ml-5 flex-1 uppercases tracking-tight text-sm font-semibold opacity-80">
					Control Desktop
				</span>

				<button
					className="relative h-10 w-10 flex items-center justify-center text-center"
					onClick={() =>
						socketEmit("background-action", {
							action: "confetti",
							effect: "Left Flowers Then Right Flowers",
						})
					}
				>
					<span className="text-xl/none">🎉</span>
				</button>

				<button
					className="relative h-10 w-14 flex items-center justify-center"
					onClick={triggerSpeech}
				>
					<div
						className={clsx(
							"rounded-l-full origin-right absolute inset-0 bg-content/5 transition duration-150",
							{ "opacity-0 scale-90 translate-x-1/3": !dictating }
						)}
					></div>

					<svg
						className={clsx(
							"relative size-5 transition-transform duration-300",
							dictating
								? "scale-125 text-rose-500 dark:text-rose-400"
								: "opacity-80"
						)}
						viewBox="0 0 24 24"
						fill="currentColor"
					>
						<path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z" />
					</svg>
				</button>
			</div>

			<div
				className="flex items-center justify-center text-center"
				ref={trackpad}
				style={{ height: "100px" }}
				onDoubleClick={() => socketEmit("doubleClick")}
				onClick={() => socketEmit("click")}
				// onPanEnd={(e, i) => {
				// 	socketEmit("mousemove", i.delta);
				// }}
			>
				<span>{dictatedMessage}</span>
			</div>
			{/* <motion.div
						className="size-6 rounded-full bg-content/20"
						drag
						dragConstraints={trackpad}
						onDragEnd={(e) => {
							const parent =
								trackpad.current.getBoundingClientRect();
							const el = e.target.getBoundingClientRect();
							console.log(
								(el.top + el.width / 2 - parent.top) /
									parent.height,
								(el.left + el.width / 2) / window.innerWidth
							);
						}}
					></motion.div> */}
			{/* </div> */}

			<div className="px-3 border-t border-content/20 mt-3 pt-4 grid grid-cols-12 gap-2">
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
								onClick={() =>
									doClick({ modifier, key, ...props })
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
		</div>
	);
}
