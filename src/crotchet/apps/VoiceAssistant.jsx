import { SpeechRecognition } from "@capacitor-community/speech-recognition";
import {
	registerRemoteAction,
	useRef,
	useState,
	useAppContext,
	registerRemoteApp,
} from "@/crotchet";
import clsx from "clsx";

registerRemoteAction("voiceAssistant", {
	icon: (
		<svg
			className="relative size-5 transition-transform duration-300"
			viewBox="0 0 24 24"
			fill="currentColor"
		>
			<path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z" />
		</svg>
	),
	handler: (_, { toggleRemoteApp }) => toggleRemoteApp("voiceAssistant"),
});

registerRemoteApp("voiceAssistant", () => {
	return {
		main: function Open() {
			const { socketEmit, actions: appActions } = useAppContext();
			const dictatedMessageTimeout = useRef(null);
			const [dictating, setDictating] = useState(false);
			const [dictatedMessage, _setDictatedMessage] = useState("");
			const [value, setValue] = useState("");
			const filters = [
				"Type",
				"Run Action",
				// "automation"
			];
			const [filter, setFilter] = useState("Run Action");

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
				if (res.speechRecognition != "granted")
					return alert("Perm failed!");

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
					return (
						label.toLowerCase().replaceAll(" ", "").trim() ==
						command
					);
				});

				if (action && action.context != "share") {
					setDictatedMessage(`running: ${action.label}...`, 2000);

					socketEmit("emit", {
						event: "run-action",
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

					setDictatedMessage("");

					if (filter == "Run Action") {
						const actionName = value.toLowerCase();

						if (!checkCommandForAction(value.toLowerCase()))
							setDictatedMessage(
								`action: ${actionName} not found`,
								2000
							);

						return;
					}

					if (filter == "Type") {
						const clear = value.toLowerCase() == "clear";
						const paste = value.toLowerCase() == "paste";
						// const replace = value.toLowerCase() == "replace";
						// const selectAll = value.toLowerCase() == "select all";

						if (paste) return socketEmit("paste");

						if (clear)
							return socketEmit("type", { replace: clear });

						return socketEmit("type", { text: value });
					}
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

			return (
				<>
					<div className="mt-2 p-3 flex gap-2">
						{filters.map((action) => (
							<button
								key={action}
								className={clsx(
									"flex-1 flex-shrink-0 border border-content/20 h-10 font-bold rounded-full flex items-center justify-center",
									{
										"bg-content/80 text-canvas":
											filter == action,
									}
								)}
								onClick={() => setFilter(action)}
							>
								{action}
							</button>
						))}
					</div>

					<div
						className="flex flex-col gap-4 py-10 items-center justify-center text-center"
						style={{ height: "150px" }}
						onClick={triggerSpeech}
					>
						<div className="relative text-rose-500 dark:text-rose-400">
							<svg
								className="size-10 "
								viewBox="0 0 24 24"
								fill="currentColor"
							>
								<path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z" />
							</svg>

							{dictating && dictatedMessage && (
								<span className="animate-ping absolute inset-1 rounded-full bg-current opacity-75"></span>
							)}
						</div>

						<span className="text-lg/none opacity-40">
							{dictating
								? dictatedMessage
									? dictatedMessage
									: "Listening..."
								: "Click to start..."}
						</span>
					</div>
				</>
			);
		},
	};
});
