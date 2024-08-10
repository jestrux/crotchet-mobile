import clsx from "clsx";
import { useActionClick } from "@/crotchet";
import MutliGestureButton from "./MutliGestureButton";
// import Loader from "./Loader";

export default function ActionButton({
	action,
	className,
	children,
	propagate = true,
	onHold,
}) {
	const { loading, onClick } = useActionClick(action, {
		propagate,
	});

	return (
		<MutliGestureButton
			// disabled={loading}
			onClick={onClick}
			onHold={onHold}
			className={clsx("relative", className)}
		>
			{children}

			{/* {loading && <Loader className="opacity-50" fillParent size={25} />} */}
		</MutliGestureButton>
	);
}
