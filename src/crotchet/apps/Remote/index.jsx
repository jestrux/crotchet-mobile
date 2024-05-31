import { KeyMap } from "@/utils";
import {
	useRef,
	useAppContext,
	registerRemoteApp,
	useRemoteButtons,
} from "@/crotchet";

registerRemoteApp("defaultRemoteApp", () => {
	return {
		name: "Control Desktop",
		main: function Open() {
			const trackpad = useRef(null);
			const { socketEmit } = useAppContext();
			const keys = [
				{ key: "Escape", label: "esc" },
				{ key: "Tab", label: "tab" },
				{
					key: "Enter",
					icon: (
						<svg
							className="size-6"
							fill="currentColor"
							viewBox="0 0 24 24"
						>
							<path d="M19 7v4H5.83l3.58-3.59L8 6l-6 6 6 6 1.41-1.41L5.83 13H21V7z" />
						</svg>
					),
				},
				{
					key: "Space",
					icon: (
						<svg
							className="size-6"
							viewBox="0 0 24 24"
							fill="currentColor"
						>
							<path d="M18 9v4H6V9H4v6h16V9z" />
						</svg>
					),
				},
				{ key: "Down", label: "👇" },
				{ key: "Up", label: "👆" },
				{
					icon: (
						<svg
							className="size-5"
							fill="currentColor"
							viewBox="0 0 24 24"
						>
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
						<svg
							className="size-4"
							viewBox="0 0 24 24"
							fill="currentColor"
						>
							<path d="M17.5,3C15.57,3,14,4.57,14,6.5V8h-4V6.5C10,4.57,8.43,3,6.5,3S3,4.57,3,6.5S4.57,10,6.5,10H8v4H6.5 C4.57,14,3,15.57,3,17.5S4.57,21,6.5,21s3.5-1.57,3.5-3.5V16h4v1.5c0,1.93,1.57,3.5,3.5,3.5s3.5-1.57,3.5-3.5S19.43,14,17.5,14H16 v-4h1.5c1.93,0,3.5-1.57,3.5-3.5S19.43,3,17.5,3L17.5,3z M16,8V6.5C16,5.67,16.67,5,17.5,5S19,5.67,19,6.5S18.33,8,17.5,8H16L16,8 z M6.5,8C5.67,8,5,7.33,5,6.5S5.67,5,6.5,5S8,5.67,8,6.5V8H6.5L6.5,8z M10,14v-4h4v4H10L10,14z M17.5,19c-0.83,0-1.5-0.67-1.5-1.5 V16h1.5c0.83,0,1.5,0.67,1.5,1.5S18.33,19,17.5,19L17.5,19z M6.5,19C5.67,19,5,18.33,5,17.5S5.67,16,6.5,16H8v1.5 C8,18.33,7.33,19,6.5,19L6.5,19z" />
						</svg>
					),
				},
				{
					key: "alt",
					modifier: true,
					icon: (
						<svg
							className="size-4"
							viewBox="0 0 24 24"
							fill="currentColor"
						>
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
			const { buttons } = useRemoteButtons({
				keys,
				onKeypress: (props) =>
					socketEmit("keypress", {
						...props,
						key: KeyMap[props.key],
					}),
			});

			return (
				<>
					<div
						className="flex items-center justify-center text-center"
						ref={trackpad}
						style={{ height: "100px" }}
						onDoubleClick={() => socketEmit("doubleClick")}
						onClick={() => socketEmit("click")}
						// onPanEnd={(e, i) => {
						// 	socketEmit("mousemove", i.delta);
						// }}
					></div>
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

					<div className="border-t border-content/20 mt-3 pt-1">
						{buttons}
					</div>
				</>
			);
		},
	};
});
