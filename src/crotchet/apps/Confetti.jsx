import confetti from "canvas-confetti";
import {
	registerBackgroundApp,
	registerBackgroundAction,
	useEffect,
	useRef,
	registerRemoteAction,
	registerRemoteApp,
	useAppContext,
	useRemoteButtons,
} from "@/crotchet";

registerBackgroundAction("confetti", async (actionProps) => {
	const { effect = "Center Flowers", options = {} } = actionProps;

	return window.playConfetti({
		effect,
		options,
	});
});

registerRemoteAction("confetti", {
	icon: "🎉",
	handler: ({ close }, { backgroundAction, toggleRemoteApp }) => {
		if (!close) {
			backgroundAction("confetti", {
				effect: "Left Flowers Then Right Flowers",
			});
		}

		toggleRemoteApp("confetti");
	},
});

registerRemoteApp("confetti", () => {
	return {
		icon: "🎉",
		main: function Open() {
			const { backgroundAction } = useAppContext();
			const keys = [
				{ key: "Center Flowers", label: "Center", span: 2 },
				{ key: "Left Flowers", label: "Left", span: 2 },
				{ key: "Right Flowers", label: "Left", span: 2 },
				{
					key: "Left And Right Flowers",
					label: "Left & Right",
					span: 2,
				},
				{
					key: "Left Flowers Then Right Flowers",
					label: "Left > Right",
					span: 2,
				},
				{ key: "Snow", label: "Snow", span: 2 },
				{ key: "Fireworks", label: "Fireworks", span: 2 },
				{ key: "Star Bust", label: "Star Bust", span: 2 },
			];
			const { buttons } = useRemoteButtons({
				keys,
				onKeypress: ({ key: effect }) => {
					return backgroundAction("confetti", {
						effect,
					});
				},
			});

			return (
				<>
					{/* <div
						className="flex items-center justify-center text-center"
						ref={trackpad}
						style={{ height: "100px" }}
					></div> */}

					{buttons}
				</>
			);
		},
	};
});

registerBackgroundApp("confetti", () => {
	return {
		zIndex: 999,
		name: "Confetti",
		main: function Confetti() {
			const canvasRef = useRef();
			const Confetiffects = {
				"Center Flowers": async (props) =>
					window.confettiGun({
						...props,
						origin: { y: 1.1 },
					}),
				"Left Flowers": async (props) =>
					window.confettiGun({
						...props,
						angle: 60,
						origin: { x: 0, y: 1.1 },
					}),
				"Right Flowers": async (props) =>
					window.confettiGun({
						...props,
						angle: 120,
						origin: { x: 1, y: 1.1 },
					}),
				"Left Flowers Then Right Flowers": async (props) => {
					Confetiffects["Left Flowers"]({ ...props });
					setTimeout(() => {
						Confetiffects["Right Flowers"]({ ...props });
					}, 580);
				},
				"Left And Right Flowers": async (props) => {
					Confetiffects["Left Flowers"]({
						...props,
						particleCount: 80,
					});
					Confetiffects["Right Flowers"]({
						...props,
						particleCount: 80,
					});
				},
				Snow: snow,
				Fireworks: fireworks,
				"Star Bust": starBust,
			};

			function randomInRange(min, max) {
				return Math.random() * (max - min) + min;
			}

			function snow() {
				var duration = 2 * 1000;
				var animationEnd = Date.now() + duration;
				var skew = 1;

				window.confettiLoop = () => {
					var timeLeft = animationEnd - Date.now();
					var ticks = Math.max(500, 500 * (timeLeft / duration));
					skew = Math.max(0.8, skew - 0.001);

					window.confettiGun({
						// ...window.confettiProps,
						particleCount: 1,
						startVelocity: 0,
						ticks: ticks,
						origin: {
							x: Math.random(),
							// since particles fall down, skew start toward the top
							y: Math.random() * skew - 0.2,
						},
						colors: ["#ffffff"],
						shapes: ["circle"],
						gravity: randomInRange(0.4, 0.6),
						scalar: randomInRange(0.4, 1),
						drift: randomInRange(-0.4, 0.4),
					});

					if (timeLeft > 0)
						requestAnimationFrame(window.confettiLoop);
				};

				window.confettiLoop();
			}

			function starBust() {
				var defaults = {
					spread: 360,
					ticks: 50,
					gravity: 0,
					decay: 0.94,
					startVelocity: 30,
					shapes: ["star"],
					colors: ["FFE400", "FFBD00", "E89400", "FFCA6C", "FDFFB8"],
				};

				function shoot() {
					window.confettiGun({
						...defaults,
						particleCount: 40,
						scalar: 1.2,
						shapes: ["star"],
						// shapes: window.confettiProps.shapes,
						colors: window.confettiProps.colors,
					});

					window.confettiGun({
						...defaults,
						particleCount: 10,
						scalar: 0.75,
						shapes: ["circle"],
						// shapes: window.confettiProps.shapes,
						colors: window.confettiProps.colors,
					});
				}

				setTimeout(shoot, 0);
				setTimeout(shoot, 100);
				setTimeout(shoot, 200);
			}

			function fireworks() {
				var duration = 5 * 1000;
				var animationEnd = Date.now() + duration;
				var defaults = {
					startVelocity: 30,
					spread: 360,
					ticks: 60,
					zIndex: 0,
				};

				window.confettiLoop = setInterval(function () {
					var timeLeft = animationEnd - Date.now();

					if (timeLeft <= 0)
						return clearInterval(window.confettiLoop);

					var particleCount = 50 * (timeLeft / duration);
					// since particles fall down, start a bit higher than random
					window.confettiGun(
						Object.assign({}, defaults, {
							particleCount,
							origin: {
								x: randomInRange(0.1, 0.3),
								y: Math.random() - 0.2,
							},
						})
					);
					window.confettiGun(
						Object.assign({}, defaults, {
							particleCount,
							origin: {
								x: randomInRange(0.7, 0.9),
								y: Math.random() - 0.2,
							},
						})
					);
				}, 250);
			}

			const Shapes = {
				ribbons: ["circle", "square"],
				circle: ["circle"],
				square: ["square"],
				star: ["star"],
			};

			const Colors = {
				confetti: [
					"#26ccff",
					"#a25afd",
					"#ff5e7e",
					"#88ff5a",
					"#fcff42",
					"#ffa62d",
					"#ff36ff",
				],
				gold: ["#FFE400", "#FFBD00", "#E89400", "#FFCA6C", "#FDFFB8"],
				christmas: ["#C30F16", "#FFFFFF"],
				olympics: ["#0081C8", "#FCB131", "#00A651", "#EE334E"],
				// snow: ["#FFFAFA"],
			};

			window.confettiProps = {
				spread: 120,
				startVelocity: 100,
				gravity: 1,
				particleCount: 350,
				origin: { y: 1.1 },
				color: "confetti",
				shape: "ribbons",
				scalar: 1.3,
				// decay: 0.92,
				// scalar: 1.2,
				// spread: 100,
			};

			const makePlayer = (options) => {
				window.confettiProps = {
					...(window.confettiProps || {}),
					...(options.props || {}),
				};

				const effect = options.effect || "Center Flowers";
				const colors = Colors[window.confettiProps.color || "confetti"];
				const shapes = Shapes[window.confettiProps.shape || "ribbons"];

				window.confettiProps = {
					...(window.confettiProps || {}),
					colors,
					shapes,
				};

				return () => Confetiffects[effect](window.confettiProps);
			};

			useEffect(() => {
				window.confettiCanvas = window.confettiCanvas || {};
				window.confettiGun = confetti.create(canvasRef.current, {
					resize: true,
				});
			});

			const replayAnimation = (props) => {
				try {
					window.confettiGun.reset();
					cancelAnimationFrame(window.confettiLoop);
					clearInterval(window.confettiLoop);
				} catch (error) {
					console.log("Error: ", error);
				}

				return makePlayer(props)();
			};

			window.playConfetti = ({ effect, options }) => {
				if (window.confettiTimeout) {
					clearTimeout(window.confettiTimeout);
					window.confettiTimeout = null;
				}

				let resolver;

				const promise = new Promise((resolve) => {
					resolver = resolve;
				});

				replayAnimation({
					effect: effect,
					props: {
						...(options || {}),
					},
				}).then(() => {
					window.confettiTimeout = setTimeout(() => {
						resolver();
					}, 4000);
				});

				return promise;
			};

			return (
				<canvas ref={canvasRef} className="w-screen h-screen"></canvas>
			);
		},
	};
});
