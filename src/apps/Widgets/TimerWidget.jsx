import { useState } from "react";
import Widget from "@/components/Widget";
import { useIntervalWithPercent } from "@/hooks/useInterval";

const toHms = (number) => {
	const sec_num = parseInt(number, 10); // don't forget the second param
	let hrs = Math.floor(sec_num / 3600);
	let mins = Math.floor((sec_num - hrs * 3600) / 60);
	let secs = sec_num - hrs * 3600 - mins * 60;

	return [
		...(hrs > 0 ? [hrs.toString().padStart(2, "0")] : []),
		mins.toString().padStart(2, "0"),
		secs.toString().padStart(2, "0"),
	].join(":");
};

const TimerWidget = ({ widget }) => {
	const [duration, setDuration] = useState(30);
	const { progress, value, runInterval, cancelInterval, reset } =
		useIntervalWithPercent(
			() => {
				reset();
			},
			{ delay: duration * 1000, autoStart: false }
		);

	const icon = (
		// <svg
		// 	xmlns="http://www.w3.org/2000/svg"
		// 	fill="none"
		// 	viewBox="0 0 24 24"
		// 	strokeWidth={1.8}
		// 	stroke="currentColor"
		// 	className="w-3.5"
		// >
		// 	<path
		// 		strokeLinecap="round"
		// 		strokeLinejoin="round"
		// 		d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
		// 	/>
		// </svg>

		<svg className="w-4" viewBox="0 0 24 24" fill="currentColor">
			{/* <path d="M22 5.72l-4.6-3.86-1.29 1.53 4.6 3.86L22 5.72zM7.88 3.39L6.6 1.86 2 5.71l1.29 1.53 4.59-3.85zM12 4c-4.97 0-9 4.03-9 9s4.02 9 9 9c4.97 0 9-4.03 9-9s-4.03-9-9-9zm0 16c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7zm-1.46-5.47L8.41 12.4l-1.06 1.06 3.18 3.18 6-6-1.06-1.06-4.93 4.95z" /> */}
			{/* <path d="M12,2C6.5,2,2,6.5,2,12s4.5,10,10,10s10-4.5,10-10S17.5,2,12,2z M16.2,16.2L11,13V7h1.5v5.2l4.5,2.7L16.2,16.2z"/> */}
			<rect height="2" width="6" x="9" y="1" />
			<path d="M19.03,7.39l1.42-1.42c-0.43-0.51-0.9-0.99-1.41-1.41l-1.42,1.42C16.07,4.74,14.12,4,12,4c-4.97,0-9,4.03-9,9 c0,4.97,4.02,9,9,9s9-4.03,9-9C21,10.88,20.26,8.93,19.03,7.39z M13,14h-2V8h2V14z" />
		</svg>
	);

	const actions = [
		progress == 0 || progress == 100
			? {
					icon: (
						<svg
							viewBox="0 0 24 24"
							fill="currentColor"
							className="pl-0.5 w-3.5 h-3.5"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z"
							/>
						</svg>
					),
					label: "Start timer",
					// fixed: false,
					onClick: runInterval,
			  }
			: {
					icon: (
						<svg
							viewBox="0 0 24 24"
							fill="currentColor"
							className="w-3.5 h-3.5"
						>
							<path
								fillRule="evenodd"
								d="M4.5 7.5a3 3 0 013-3h9a3 3 0 013 3v9a3 3 0 01-3 3h-9a3 3 0 01-3-3v-9z"
								clipRule="evenodd"
							/>
						</svg>
					),
					label: "Stop timer",
					// fixed: false,
					onClick: reset,
			  },
	];

	const handleSetDuration = (dur) => {
		reset();
		setDuration(dur);
		document
			.querySelector("#timerWidgetContent")
			.scrollTo({ top: 0, behavior: "smooth" });
	};

	return (
		<Widget noPadding title="Timer" icon={icon} actions={actions}>
			<div id="timerWidgetContent" className="h-full overflow-y-auto">
				<div
					className={`${
						progress > 0 && "pb-6 h-full"
					} pt-2 flex items-center justify-center`}
				>
					<span className="text-5xl leading-none font-black pr-0.5">
						{progress > 0
							? toHms((duration * 1000 - value) / 1000)
							: toHms(duration)}
					</span>
				</div>

				<div className="mb-3 px-5 border-t border-content/20 mt-3 pt-4 grid grid-cols-2 gap-2">
					{[30, 60, 300, 600, 900, 1800].map((dur) => {
						return (
							<button
								key={dur}
								className={`
								${dur == duration ? "text-canvas bg-content/60" : ""}
								border border-content/20 py-1 font-bold rounded-full
								`}
								onClick={() => handleSetDuration(dur)}
							>
								{toHms(dur)}
							</button>
						);
					})}
				</div>
			</div>
		</Widget>
	);
};

export default TimerWidget;
