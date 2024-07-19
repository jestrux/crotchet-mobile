import { useReducer, useRef } from "react";

export default function useFocusCapture() {
	const [, reRender] = useReducer((x) => x + 1, 0);
	const restoreFocus = useRef(() => {});
	const captureFocus = () => {
		const el = document.activeElement;
		restoreFocus.current = () => el.focus();
		reRender();
	};

	return {
		captureFocus,
		restoreFocus: restoreFocus.current,
	};
}
