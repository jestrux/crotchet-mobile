import { useCallback, useRef } from "react";

export function useLongPress(callback, duration = 500) {
	const timeout = useRef(null);

	const onPressStart = useCallback(
		(event) => {
			event.preventDefault();

			timeout.current = setTimeout(() => callback(event), duration);
		},
		[callback, duration]
	);

	const cancelTimeout = useCallback(() => clearTimeout(timeout.current), []);

	if (typeof callback != "function") return {};

	return {
		onMouseDown: onPressStart,
		onTouchStart: onPressStart,

		onMouseMove: cancelTimeout,
		onTouchMove: cancelTimeout,

		onMouseUp: cancelTimeout,
		onTouchEnd: cancelTimeout,
	};
}
