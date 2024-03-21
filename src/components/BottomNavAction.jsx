import clsx from "clsx";
import Loader from "./Loader";
import { useActionClick } from "@/crotchet";

export default function BottomNavAction({ vertical, action, className }) {
	const { loading, onClick } = useActionClick(action, { propagate: true });

	return (
		<button
			key={action._id}
			disabled={loading}
			onClick={onClick}
			className={clsx(
				"w-full text-left outline:focus-none flex items-center gap-2 text-base leading-none disabled:opacity-50",
				vertical ? "flex-col gap-3" : "h-12",
				className
			)}
		>
			{
				<div
					className={clsx(
						"flex-shrink-0 opacity-80",
						vertical ? "w-6" : "w-5 p-0.5"
					)}
				>
					{action.icon ? (
						action.icon
					) : (
						<svg
							className={clsx(vertical ? "size-6" : "size-4")}
							fill="none"
							viewBox="0 0 24 24"
							strokeWidth={1.5}
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
							/>
						</svg>
					)}
				</div>
			}

			<div className="flex-1">{action.label}</div>

			{loading && <Loader className="opacity-50" size={25} />}
		</button>
	);
}
