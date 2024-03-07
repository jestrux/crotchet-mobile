import { useAppContext } from "@/providers/app";
import Widget from "@/components/Widget";
import { useRef, useState } from "react";
import { KeyMap } from "@/utils";
import clsx from "clsx";

export default function DesktopWidget() {
	const trackpad = useRef(null);
	const { socketEmit } = useAppContext();
	const [shift, setShift] = useState(false);
	const keys = ["Escape", "Tab", "Enter", "Left", "Space", "Right"];
	const actions = [
		{
			icon: (
				<div
					className={clsx(
						"rounded-full flex items-center justify-center",
						{ "size-6 bg-content/80 text-canvas": shift }
					)}
				>
					<svg
						className="size-4"
						fill="none"
						viewBox="0 0 24 24"
						strokeWidth={1.5}
						stroke="currentColor"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d={
								"M9.348 14.652a3.75 3.75 0 0 1 0-5.304m5.304 0a3.75 3.75 0 0 1 0 5.304m-7.425 2.121a6.75 6.75 0 0 1 0-9.546m9.546 0a6.75 6.75 0 0 1 0 9.546M5.106 18.894c-3.808-3.807-3.808-9.98 0-13.788m13.788 0c3.808 3.807 3.808 9.98 0 13.788M12 12h.008v.008H12V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
							}
						/>
					</svg>
				</div>
			),
			onClick: () => setShift(!shift),
		},
	];

	return (
		<Widget noPadding title="Desktop" actions={actions}>
			<div id="timerWidgetContent" className="h-full overflow-y-auto">
				<div
					ref={trackpad}
					style={{ height: "100px" }}
					onDoubleClick={() => socketEmit("doubleClick")}
					onClick={() => socketEmit("click")}
					// onPanEnd={(e, i) => {
					// 	socketEmit("mousemove", i.delta);
					// }}
				/>
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

				<div className="mb-3 px-3 border-t border-content/20 mt-3 pt-4 grid grid-cols-3 gap-3">
					{keys.map((key) => {
						return (
							<button
								key={key}
								className="border border-content/20 py-3 font-bold rounded-full"
								onClick={() =>
									socketEmit("keypress", {
										key: KeyMap[key],
										shift,
									})
								}
							>
								{key}
							</button>
						);
					})}
				</div>
			</div>
		</Widget>
	);
}
