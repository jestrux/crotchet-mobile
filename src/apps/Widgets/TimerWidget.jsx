import { useRef, useState } from "react";
import Widget from "@/components/Widget";
import { useIntervalWithPercent } from "@/hooks/useInterval";
import { toHms } from "@/utils";

// https://developer.mozilla.org/en-US/play
const Toner = () => {
	const tones = {
		A0: 27.5,
		"A#0": 29.13523509488062,
		B0: 30.867706328507754,
		C1: 32.70319566257483,
		"C#1": 34.64782887210901,
		D1: 36.70809598967595,
		"D#1": 38.890872965260115,
		E1: 41.20344461410874,
		F1: 43.653528929125486,
		"F#1": 46.2493028389543,
		G1: 48.99942949771866,
		"G#1": 51.91308719749314,
		A1: 55,
		"A#1": 58.27047018976124,
		B1: 61.735412657015516,
		C2: 65.40639132514966,
		"C#2": 69.29565774421802,
		D2: 73.4161919793519,
		"D#2": 77.78174593052023,
		E2: 82.40688922821748,
		F2: 87.30705785825097,
		"F#2": 92.4986056779086,
		G2: 97.99885899543732,
		"G#2": 103.82617439498628,
		A2: 110,
		"A#2": 116.54094037952248,
		B2: 123.47082531403103,
		C3: 130.8127826502993,
		"C#3": 138.59131548843604,
		D3: 146.8323839587038,
		"D#3": 155.56349186104046,
		E3: 164.81377845643496,
		F3: 174.61411571650194,
		"F#3": 184.9972113558172,
		G3: 195.99771799087463,
		"G#3": 207.65234878997256,
		A3: 220,
		"A#3": 233.08188075904496,
		B3: 246.94165062806206,
		C4: 261.6255653005986,
		"C#4": 277.1826309768721,
		D4: 293.6647679174076,
		"D#4": 311.1269837220809,
		E4: 329.6275569128699,
		F4: 349.2282314330039,
		"F#4": 369.9944227116344,
		G4: 391.99543598174927,
		"G#4": 415.3046975799451,
		A4: 440,
		"A#4": 466.1637615180899,
		B4: 493.8833012561241,
		C5: 523.2511306011972,
		"C#5": 554.3652619537442,
		D5: 587.3295358348151,
		"D#5": 622.2539674441618,
		E5: 659.2551138257398,
		F5: 698.4564628660078,
		"F#5": 739.9888454232688,
		G5: 783.9908719634985,
		"G#5": 830.6093951598903,
		A5: 880,
		"A#5": 932.3275230361799,
		B5: 987.7666025122483,
		C6: 1046.5022612023945,
		"C#6": 1108.7305239074883,
		D6: 1174.6590716696303,
		"D#6": 1244.5079348883237,
		E6: 1318.5102276514797,
		F6: 1396.9129257320155,
		"F#6": 1479.9776908465376,
		G6: 1567.981743926997,
		"G#6": 1661.2187903197805,
		A6: 1760,
		"A#6": 1864.6550460723597,
		B6: 1975.5332050244965,
		C7: 2093.004522404789,
		"C#7": 2217.4610478149766,
		D7: 2349.3181433392606,
		"D#7": 2489.0158697766474,
		E7: 2637.0204553029594,
		F7: 2793.825851464031,
		"F#7": 2959.955381693075,
		G7: 3135.963487853994,
		"G#7": 3322.437580639561,
		A7: 3520,
		"A#7": 3729.3100921447194,
		B7: 3951.066410048993,
		C8: 4186.009044809578,
	};
	const audioContext = new AudioContext();
	let mainGainNode = audioContext.createGain();
	mainGainNode.connect(audioContext.destination);
	mainGainNode.gain.value = 0.2;

	const sineTerms = new Float32Array([0, 0, 1, 0, 1]);
	const cosineTerms = new Float32Array(sineTerms.length);
	const customWaveform = audioContext.createPeriodicWave(
		cosineTerms,
		sineTerms
	);

	const playTone = (freq) => {
		const osc = audioContext.createOscillator();
		osc.connect(mainGainNode);
		// osc.type = "triangle";
		osc.setPeriodicWave(customWaveform);

		osc.frequency.value = freq;
		osc.start();

		return new Promise((res) => {
			setTimeout(() => {
				osc.stop();
				res();
			}, 100);
		});
	};

	return {
		play: async (notes) => {
			for (const note of notes) {
				await playTone(tones[note]);
			}
			// tones.forEach(element => {

			// });
		},
	};
};

const TimerWidget = ({ widget }) => {
	const introTone = ["F4", "G4", "A4", "B4", "C5"];
	const outroTone = ["G2", "A2", "B2", "C3"].reverse();

	const handleReset = (reset) => {
		reset();
		playTone(outroTone);
	};

	const {
		current: { play: playTone },
	} = useRef(Toner());
	const [duration, setDuration] = useState(15);
	const { progress, value, runInterval, cancelInterval, reset } =
		useIntervalWithPercent(
			() => {
				handleReset(reset);
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
					onClick: () => {
						playTone(introTone);
						runInterval();
					},
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
					onClick: () => handleReset(reset),
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
					{[15, 30, 60, 300, 600, 900, 1800].map((dur) => {
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
