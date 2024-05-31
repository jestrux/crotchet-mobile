import {
	registerBackgroundApp,
	registerBackgroundAction,
	registerRemoteAction,
	registerRemoteApp,
	useAppContext,
	useRemoteButtons,
} from "@/crotchet";
import { useState } from "react";

registerBackgroundAction(
	"floatingHead",
	async (actionProps = {}, { toggleBackgroundApp }) => {
		const { action = "toggle", position, size } = actionProps;

		if (action == "resize") return window.resizeFloatingHead(size);
		if (action == "move") return window.moveFloatingHead(position);
		if (action == "hide") {
			window.resetFloatingHead();
			return toggleBackgroundApp("floatingHead", false);
		}

		toggleBackgroundApp("floatingHead");
		window.toggleFloatingHead();
	}
);

registerRemoteAction("floatingHead", {
	icon: "🎥",
	handler: (_, { backgroundAction, toggleRemoteApp }) => {
		backgroundAction("floatingHead");
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
			const keys = [
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
			const { buttons } = useRemoteButtons({
				keys,
				modifiers: {
					size: "regular",
					position: "Bottom Left",
				},
				onModifiersChanged: (modifiers) => {
					backgroundAction("floatingHead", {
						action: "resize",
						size: modifiers.size,
					});

					backgroundAction("floatingHead", {
						action: "move",
						position: modifiers.position,
					});
				},
			});

			return buttons;
		},
	};
});

registerBackgroundApp("floatingHead", () => {
	return {
		name: "Floating Head",
		main: function FloatingHead() {
			const [show, setShow] = useState(false);
			const [size, setSize] = useState("regular");
			const insetX = "3rem";
			const insetY = "3rem";
			const [position, setPosition] = useState({
				top: "auto",
				bottom: "5rem",
				left: insetX,
				right: "auto",
			});
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

			window.resetFloatingHead = () => {
				setShow(false);
				setSize("regular");
				setPosition({
					top: "auto",
					bottom: "5rem",
					left: insetX,
					right: "auto",
				});
			};

			window.toggleFloatingHead = (newValue) => {
				setShow(newValue == undefined ? !show : newValue);
			};

			window.moveFloatingHead = (position) => {
				var newPosition = positionMap[position] || {
					bottom: "10rem",
					left: "10rem",
				};
				setPosition(newPosition);
			};

			window.resizeFloatingHead = (size) => {
				setSize(size);
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
					{show && (
						<div
							className="fixed mx-auto bg-black"
							style={styles}
						></div>
					)}
				</>
			);
		},
	};
});
