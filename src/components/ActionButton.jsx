import clsx from "clsx";
import { useActionClick } from "@/crotchet";
// import Loader from "./Loader";

export default function ActionButton({
	action,
	className,
	children,
	propagate = true,
}) {
	const { loading, onClick } = useActionClick(action, {
		propagate,
	});

	return (
		<button
			// disabled={loading}
			onClick={onClick}
			className={clsx("relative", className)}
		>
			{children}

			{/* {loading && <Loader className="opacity-50" fillParent size={25} />} */}
		</button>
	);
}
