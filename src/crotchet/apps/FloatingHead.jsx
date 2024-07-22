import {
	registerBackgroundApp,
	registerBackgroundAction,
	registerRemoteAction,
	registerRemoteApp,
	useAppContext,
	useRemoteButtons,
	useRef,
	clsx,
	registerAction,
} from "@/crotchet";
import { useState } from "react";

const sizeButtonKeys = [
	{
		name: "size",
		key: "regular",
		modifier: true,
		label: "Regular",
		span: 2,
	},
	{
		name: "size",
		key: "large",
		modifier: true,
		label: "Large",
		span: 2,
	},
	{
		name: "size",
		key: "full",
		modifier: true,
		label: "Full",
		span: 2,
	},
];

const positionButtonKeys = [
	{
		name: "position",
		modifier: true,
		key: "Top Left",
		label: "↖️",
		span: 2,
	},
	{
		name: "position",
		modifier: true,
		key: "Top Center",
		label: "⬆️",
		span: 2,
	},
	{
		name: "position",
		modifier: true,
		key: "Top Right",
		label: "↗️",
		span: 2,
	},
	{
		name: "position",
		modifier: true,
		key: "Bottom Left",
		label: "↙️",
		span: 2,
	},
	{
		name: "position",
		modifier: true,
		key: "Bottom Center",
		label: "⬇️",
		span: 2,
	},
	{
		name: "position",
		modifier: true,
		key: "Bottom Right",
		label: "↘️",
		span: 2,
	},
];

const filters = [
	// "_1977",
	// "aden",
	// "brannan",
	// "brooklyn",
	// "clarendon",
	// "earlybird",
	// "gingham",
	// "hudson",
	// "inkwell",
	// "kelvin",
	// "lark",
	// "lofi",
	// "maven",
	// "mayfair",
	// "moon",
	// "nashville",
	// "perpetua",
	// "reyes",
	// "rise",
	// "slumber",
	// "stinson",
	// "toaster",
	// "valencia",
	// "walden",
	// "willow",
	// "xpro2",

	// Selected filters
	"_1977",
	"lofi",
	"aden",
	"brannan",
	"inkwell",
	"nashville",
	"reyes",
	"toaster",
	"walden",
];

registerBackgroundAction(
	"floatingHead",
	async (actionProps = {}, { toggleBackgroundApp }) => {
		const { action = "toggle", position, size, filter } = actionProps;

		if (!["show", "hide", "toggle"].includes(action)) {
			toggleBackgroundApp("floatingHead", true);
			window.toggleFloatingHead(true);
		}

		if (action == "resize") return window.resizeFloatingHead(size);
		if (action == "move") return window.moveFloatingHead(position);
		if (action == "hide") {
			window.resetFloatingHead();
			return toggleBackgroundApp("floatingHead", false);
		}
		if (action == "show") {
			toggleBackgroundApp("floatingHead", true);
			return window.toggleFloatingHead(true);
		}
		if (action == "filter") return window.setFloatingHeadFilter(filter);

		toggleBackgroundApp("floatingHead");
		window.toggleFloatingHead();
	}
);

registerAction("floatingHead", {
	icon: "🎥",
	shortcut: "Alt+F",
	global: true,
	handler: (_, { backgroundAction }) => {
		backgroundAction("floatingHead", {
			permisssions: {
				camera: true,
			},
		});
	},
	actions: [
		{
			label: "Toggle",
			handler: (_, { backgroundAction }) =>
				backgroundAction("floatingHead"),
		},
		...sizeButtonKeys
			.filter(({ key }) => key != "full")
			.map(({ key: size, label }) => {
				return {
					label,
					section: "Size",
					handler: (_, { backgroundAction }) =>
						backgroundAction("floatingHead", {
							action: "resize",
							size,
						}),
				};
			}),
		...positionButtonKeys.map(({ key: position }) => {
			return {
				label: position,
				section: "Position",
				handler: (_, { backgroundAction }) =>
					backgroundAction("floatingHead", {
						action: "move",
						position,
					}),
			};
		}),
		...filters.map((filter) => {
			return {
				label: filter,
				section: "Filter",
				handler: (_, { backgroundAction }) =>
					backgroundAction("floatingHead", {
						action: "filter",
						filter,
					}),
			};
		}),
	],
});

registerRemoteAction("floatingHead", {
	icon: "🎥",
	handler: (_, { backgroundAction, toggleRemoteApp }) => {
		backgroundAction("floatingHead", {
			action: "show",
			permisssions: {
				camera: true,
			},
		});
		toggleRemoteApp("floatingHead");
	},
});

registerRemoteApp("floatingHead", () => {
	return {
		icon: "🎥",
		onClose: ({ backgroundAction }) => {
			backgroundAction("floatingHead", { action: "hide" });
		},
		main: function Open() {
			const { backgroundAction } = useAppContext();
			const { buttons: sizeButtons } = useRemoteButtons({
				keys: sizeButtonKeys,
				modifiers: {
					size: "regular",
				},
				onModifiersChanged: (modifiers) => {
					backgroundAction("floatingHead", {
						action: "resize",
						size: modifiers.size,
					});
				},
			});
			const { buttons: positionButtons } = useRemoteButtons({
				keys: positionButtonKeys,
				modifiers: {
					position: "Top Right",
				},
				onModifiersChanged: (modifiers) => {
					backgroundAction("floatingHead", {
						action: "move",
						position: modifiers.position,
					});
				},
			});
			const { buttons: filterButtons } = useRemoteButtons({
				keys: filters.map((filter) => ({
					name: "filter",
					key: filter,
					modifier: true,
					label: filter,
					span: 2,
				})),
				onModifiersChanged: (modifiers) => {
					backgroundAction("floatingHead", {
						action: "filter",
						filter: modifiers.filter,
					});
				},
			});

			return (
				<div className="flex flex-col gap-2 mt-2">
					<div className="flex flex-col">
						<h3 className="-mb-1 mx-3 font-bold">Size</h3>
						{sizeButtons}
					</div>

					<div className="flex flex-col">
						<h3 className="-mb-1 mx-3 font-bold">Position</h3>
						{positionButtons}
					</div>

					<div className="flex flex-col">
						<h3 className="-mb-1 mx-3 font-bold">Filter</h3>
						{filterButtons}
					</div>
				</div>
			);
		},
	};
});

registerBackgroundApp("floatingHead", () => {
	return {
		name: "Floating Head",
		main: function FloatingHead() {
			const [filter, setFilter] = useState("");
			const video = useRef(null);
			const videoStream = useRef(null);
			const [ready, setReady] = useState(false);
			const [show, setShow] = useState(false);
			const [size, setSize] = useState("regular");
			const insetX = "3rem";
			const insetY = "3rem";
			const positionMap = {
				"Bottom Left": {
					top: "auto",
					bottom: insetY,
					left: insetX,
					right: "auto",
				},
				"Bottom Center": {
					top: "auto",
					bottom: insetY,
					left: 0,
					right: 0,
				},
				"Bottom Right": {
					top: "auto",
					bottom: insetY,
					left: "auto",
					right: insetX,
				},
				"Top Left": {
					top: insetY,
					bottom: "auto",
					left: insetX,
					right: "auto",
				},
				"Top Center": {
					top: insetY,
					bottom: "auto",
					left: 0,
					right: 0,
				},
				"Top Right": {
					top: insetY,
					bottom: "auto",
					left: "auto",
					right: insetX,
				},
			};
			const defaultPosition = positionMap["Top Right"];
			const [position, setPosition] = useState(defaultPosition);

			window.resetFloatingHead = () => {
				closeStream();
				setShow(false);
				setSize("regular");
				setPosition(defaultPosition);
			};

			window.toggleFloatingHead = (newValue) => {
				newValue = newValue == undefined ? !show : newValue;
				setShow(newValue);

				if (newValue) init();
				else closeStream();
			};

			window.moveFloatingHead = (position) =>
				setPosition(positionMap[position] || defaultPosition);

			window.resizeFloatingHead = (size) => setSize(size);

			window.setFloatingHeadFilter = (filter) => setFilter(filter);

			const handleSuccess = (stream) => {
				if (!window.processor) window.processor = {};

				videoStream.current = stream;
				video.current.srcObject = stream;
				video.current.play();

				setTimeout(() => {
					setReady(true);
				}, 200);
			};

			const handleError = (error) => {
				console.log(
					"navigator.MediaDevices.getUserMedia error: ",
					error.message,
					error.name
				);
			};

			const closeStream = () => {
				setReady(false);
				video.current.srcObject = null;
				videoStream.current.getTracks().forEach(function (track) {
					track.stop();
				});
			};

			const init = () => {
				navigator.mediaDevices
					.getUserMedia({
						audio: false,
						video: {
							width: { min: 1024, ideal: 1280, max: 1920 },
							height: { min: 576, ideal: 720, max: 1080 },
						},
					})
					.then(handleSuccess)
					.catch(handleError);
			};

			const full = size == "full";
			const large = size == "large";

			let styles = {
				position: "fixed",
				bottom: "10rem",
				left: "10rem",
				width: "180px",
				height: "180px",
				borderRadius: "999px",
				...(position || {}),
			};

			if (full) {
				styles = {
					...styles,
					top: 0,
					left: 0,
					right: 0,
					bottom: 0,
					borderRadius: 0,
					width: "100vw",
					height: "100vh",
				};
			}

			if (large) {
				styles = {
					...styles,
					width: "280px",
					height: "280px",
				};
			}

			return (
				<>
					<style>
						{
							/*css*/ `
								.aden{-webkit-filter:hue-rotate(-20deg) contrast(.9) saturate(.85) brightness(1.2);filter:hue-rotate(-20deg) contrast(.9) saturate(.85) brightness(1.2)}.aden::after{background:-webkit-linear-gradient(left,rgba(66,10,14,.2),transparent);background:linear-gradient(to right,rgba(66,10,14,.2),transparent);mix-blend-mode:darken}.perpetua::after,.reyes::after{mix-blend-mode:soft-light;opacity:.5}.inkwell{-webkit-filter:sepia(.3) contrast(1.1) brightness(1.1) grayscale(1);filter:sepia(.3) contrast(1.1) brightness(1.1) grayscale(1)}.perpetua::after{background:-webkit-linear-gradient(top,#005b9a,#e6c13d);background:linear-gradient(to bottom,#005b9a,#e6c13d)}.reyes{-webkit-filter:sepia(.22) brightness(1.1) contrast(.85) saturate(.75);filter:sepia(.22) brightness(1.1) contrast(.85) saturate(.75)}.reyes::after{background:#efcdad}.gingham{-webkit-filter:brightness(1.05) hue-rotate(-10deg);filter:brightness(1.05) hue-rotate(-10deg)}.gingham::after{background:-webkit-linear-gradient(left,rgba(66,10,14,.2),transparent);background:linear-gradient(to right,rgba(66,10,14,.2),transparent);mix-blend-mode:darken}.toaster{-webkit-filter:contrast(1.5) brightness(.9);filter:contrast(1.5) brightness(.9)}.toaster::after{background:-webkit-radial-gradient(circle,#804e0f,#3b003b);background:radial-gradient(circle,#804e0f,#3b003b);mix-blend-mode:screen}.walden{-webkit-filter:brightness(1.1) hue-rotate(-10deg) sepia(.3) saturate(1.6);filter:brightness(1.1) hue-rotate(-10deg) sepia(.3) saturate(1.6)}.walden::after{background:#04c;mix-blend-mode:screen;opacity:.3}.hudson{-webkit-filter:brightness(1.2) contrast(.9) saturate(1.1);filter:brightness(1.2) contrast(.9) saturate(1.1)}.hudson::after{background:-webkit-radial-gradient(circle,#a6b1ff 50%,#342134);background:radial-gradient(circle,#a6b1ff 50%,#342134);mix-blend-mode:multiply;opacity:.5}.earlybird{-webkit-filter:contrast(.9) sepia(.2);filter:contrast(.9) sepia(.2)}.earlybird::after{background:-webkit-radial-gradient(circle,#d0ba8e 20%,#360309 85%,#1d0210 100%);background:radial-gradient(circle,#d0ba8e 20%,#360309 85%,#1d0210 100%);mix-blend-mode:overlay}.mayfair{-webkit-filter:contrast(1.1) saturate(1.1);filter:contrast(1.1) saturate(1.1)}.mayfair::after{background:-webkit-radial-gradient(40% 40%,circle,rgba(255,255,255,.8),rgba(255,200,200,.6),#111 60%);background:radial-gradient(circle at 40% 40%,rgba(255,255,255,.8),rgba(255,200,200,.6),#111 60%);mix-blend-mode:overlay;opacity:.4}.lofi{-webkit-filter:saturate(1.1) contrast(1.5);filter:saturate(1.1) contrast(1.5)}.lofi::after{background:-webkit-radial-gradient(circle,transparent 70%,#222 150%);background:radial-gradient(circle,transparent 70%,#222 150%);mix-blend-mode:multiply}._1977{-webkit-filter:contrast(1.1) brightness(1.1) saturate(1.3);filter:contrast(1.1) brightness(1.1) saturate(1.3)}._1977:after{background:rgba(243,106,188,.3);mix-blend-mode:screen}.brooklyn{-webkit-filter:contrast(.9) brightness(1.1);filter:contrast(.9) brightness(1.1)}.brooklyn::after{background:-webkit-radial-gradient(circle,rgba(168,223,193,.4) 70%,#c4b7c8);background:radial-gradient(circle,rgba(168,223,193,.4) 70%,#c4b7c8);mix-blend-mode:overlay}.xpro2{-webkit-filter:sepia(.3);filter:sepia(.3)}.xpro2::after{background:-webkit-radial-gradient(circle,#e6e7e0 40%,rgba(43,42,161,.6) 110%);background:radial-gradient(circle,#e6e7e0 40%,rgba(43,42,161,.6) 110%);mix-blend-mode:color-burn}.nashville{-webkit-filter:sepia(.2) contrast(1.2) brightness(1.05) saturate(1.2);filter:sepia(.2) contrast(1.2) brightness(1.05) saturate(1.2)}.nashville::after{background:rgba(0,70,150,.4);mix-blend-mode:lighten}.nashville::before{background:rgba(247,176,153,.56);mix-blend-mode:darken}.lark{-webkit-filter:contrast(.9);filter:contrast(.9)}.lark::after{background:rgba(242,242,242,.8);mix-blend-mode:darken}.lark::before{background:#22253f;mix-blend-mode:color-dodge}.moon{-webkit-filter:grayscale(1) contrast(1.1) brightness(1.1);filter:grayscale(1) contrast(1.1) brightness(1.1)}.moon::before{background:#a0a0a0;mix-blend-mode:soft-light}.moon::after{background:#383838;mix-blend-mode:lighten}.clarendon{-webkit-filter:contrast(1.2) saturate(1.35);filter:contrast(1.2) saturate(1.35)}.clarendon:before{background:rgba(127,187,227,.2);mix-blend-mode:overlay}.willow{-webkit-filter:grayscale(.5) contrast(.95) brightness(.9);filter:grayscale(.5) contrast(.95) brightness(.9)}.willow::before{background-color:radial-gradient(40%,circle,#d4a9af 55%,#000 150%);mix-blend-mode:overlay}.willow::after{background-color:#d8cdcb;mix-blend-mode:color}.rise{-webkit-filter:brightness(1.05) sepia(.2) contrast(.9) saturate(.9);filter:brightness(1.05) sepia(.2) contrast(.9) saturate(.9)}.rise::after{background:-webkit-radial-gradient(circle,rgba(232,197,152,.8),transparent 90%);background:radial-gradient(circle,rgba(232,197,152,.8),transparent 90%);mix-blend-mode:overlay;opacity:.6}.rise::before{background:-webkit-radial-gradient(circle,rgba(236,205,169,.15) 55%,rgba(50,30,7,.4));background:radial-gradient(circle,rgba(236,205,169,.15) 55%,rgba(50,30,7,.4));mix-blend-mode:multiply}.slumber{-webkit-filter:saturate(.66) brightness(1.05);filter:saturate(.66) brightness(1.05)}.slumber::after{background:rgba(125,105,24,.5);mix-blend-mode:soft-light}.slumber::before{background:rgba(69,41,12,.4);mix-blend-mode:lighten}.brannan{-webkit-filter:sepia(.5) contrast(1.4);filter:sepia(.5) contrast(1.4)}.brannan::after{background-color:rgba(161,44,199,.31);mix-blend-mode:lighten}.valencia{-webkit-filter:contrast(1.08) brightness(1.08) sepia(.08);filter:contrast(1.08) brightness(1.08) sepia(.08)}.valencia::after{background:#3a0339;mix-blend-mode:exclusion;opacity:.5}._1977:after,._1977:before,.aden:after,.aden:before,.brannan:after,.brannan:before,.brooklyn:after,.brooklyn:before,.clarendon:after,.clarendon:before,.earlybird:after,.earlybird:before,.gingham:after,.gingham:before,.hudson:after,.hudson:before,.inkwell:after,.inkwell:before,.kelvin:after,.kelvin:before,.lark:after,.lark:before,.lofi:after,.lofi:before,.mayfair:after,.mayfair:before,.moon:after,.moon:before,.nashville:after,.nashville:before,.perpetua:after,.perpetua:before,.reyes:after,.reyes:before,.rise:after,.rise:before,.slumber:after,.slumber:before,.toaster:after,.toaster:before,.valencia:after,.valencia:before,.walden:after,.walden:before,.willow:after,.willow:before,.xpro2:after,.xpro2:before{content:'';display:block;height:100%;width:100%;top:0;left:0;position:absolute;pointer-events:none}._1977,.aden,.brannan,.brooklyn,.clarendon,.earlybird,.gingham,.hudson,.inkwell,.kelvin,.lark,.lofi,.mayfair,.moon,.nashville,.perpetua,.reyes,.rise,.slumber,.toaster,.valencia,.walden,.willow,.xpro2{position:relative}._1977 video,.aden video,.brannan video,.brooklyn video,.clarendon video,.earlybird video,.gingham video,.hudson video,.inkwell video,.kelvin video,.lark video,.lofi video,.mayfair video,.moon video,.nashville video,.perpetua video,.reyes video,.rise video,.slumber video,.toaster video,.valencia video,.walden video,.willow video,.xpro2 video{width:100%;z-index:1}._1977:before,.aden:before,.brannan:before,.brooklyn:before,.clarendon:before,.earlybird:before,.gingham:before,.hudson:before,.inkwell:before,.kelvin:before,.lark:before,.lofi:before,.mayfair:before,.moon:before,.nashville:before,.perpetua:before,.reyes:before,.rise:before,.slumber:before,.toaster:before,.valencia:before,.walden:before,.willow:before,.xpro2:before{z-index:2}._1977:after,.aden:after,.brannan:after,.brooklyn:after,.clarendon:after,.earlybird:after,.gingham:after,.hudson:after,.inkwell:after,.kelvin:after,.lark:after,.lofi:after,.mayfair:after,.moon:after,.nashville:after,.perpetua:after,.reyes:after,.rise:after,.slumber:after,.toaster:after,.valencia:after,.walden:after,.willow:after,.xpro2:after{z-index:3}.kelvin::after{background:#b77d21;mix-blend-mode:overlay}.kelvin::before{background:#382c34;mix-blend-mode:color-dodge}
							`
						}
					</style>

					<video
						className={clsx(
							"fixed mx-auto bg-black overflow-hidden object-cover",
							filter,
							{ hidden: !show || !ready }
						)}
						style={styles}
						ref={video}
					></video>
				</>
			);
		},
	};
});
