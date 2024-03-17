import { Keyboard } from "@capacitor/keyboard";
import { useEffect, useState } from "react";

export default function useKeyboard() {
	const [keyboardHeight, setKeyboardHeight] = useState(0);

	useEffect(() => {
		try {
			Keyboard.setAccessoryBarVisible({
				isVisible: false,
			});

			Keyboard.setResizeMode({
				mode: "none",
			});

			Keyboard.addListener("keyboardDidShow", (info) => {
				setKeyboardHeight(Number(info.keyboardHeight));
			});

			Keyboard.addListener("keyboardDidHide", () => {
				setKeyboardHeight(0);
			});
		} catch (error) {
			//
		}

		return () => {
			Keyboard.removeAllListeners();
		};
	}, []);

	return { keyboardHeight };
}
