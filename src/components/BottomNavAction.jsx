import { useState } from "react";
import Loader from "./Loader";

export default function BottomNavAction({ action }) {
	const [loading, setLoading] = useState(false);
	const handleClick = async () => {
		try {
			setLoading(true);
			await action.handler();
			setLoading(false);
		} catch (error) {
			setLoading(false);
			alert(`Error: ${error}`);
		}
	};

	return (
		<button
			key={action._id}
			disabled={loading}
			onClick={handleClick}
			className="w-full text-left outline:focus-none h-12 flex items-center gap-2 text-base leading-none disabled:opacity-50"
		>
			{
				<div className="w-5 flex-shrink-0">
					<svg
						className="mt-0.5 w-4 h-4 opacity-80"
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
				</div>
			}
			<div className="flex-1">{action.label}</div>

			{loading && <Loader className="opacity-50" size={25} />}
		</button>
	);
}
