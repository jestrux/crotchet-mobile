import useDoubleClick from "@/hooks/useDoubleClick";
import { useLongPress } from "@/hooks/useLongPress";
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import { useRef } from "react";

export default function MutliGestureButton({
	onClick = () => {},
	onDoubleClick,
	onHold,
	children,
	...props
}) {
	const recentlyHeld = useRef(false);
	const { handleClick, handleDoubleClick } = useDoubleClick({
		onClick,
		onDoubleClick,
	});
	const gestures = useLongPress(
		!_.isFunction(onHold)
			? null
			: () => {
					recentlyHeld.current = true;

					Haptics.impact({ style: ImpactStyle.Medium });

					onHold();
			  }
	);

	return (
		<button
			{...gestures}
			onClick={() => {
				if (recentlyHeld.current) return (recentlyHeld.current = false);

				if (!_.isFunction(onDoubleClick)) return onClick();

				handleClick();
			}}
			onDoubleClick={handleDoubleClick}
			{...props}
		>
			{children}
		</button>
	);
}
