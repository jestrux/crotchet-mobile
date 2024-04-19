import { Loader, useActionClick } from "@/crotchet";
import clsx from "clsx";

const ActionListButton = ({ action, className }) => {
	const { loading, onClick } = useActionClick(action, {
		propagate: true,
	});

	return (
		<button
			disabled={loading}
			onClick={onClick}
			className={clsx(
				"h-14 relative w-full text-left outline:focus-none flex items-center gap-2 text-base leading-none disabled:opacity-50",
				className
			)}
		>
			<div className="flex-1">{action.label}</div>

			{action.icon && (
				<div className="flex-shrink-0 opacity-80 w-6 p-0.5">
					{action.icon}
				</div>
			)}

			{loading && <Loader className="opacity-50" size={25} />}

			{action.trailing && (
				<span className="opacity-40">{action.trailing}</span>
			)}
		</button>
	);
};

export default function ActionList({ actions = [] }) {
	return (
		<div className="bg-card shadow dark:border border-content/5 rounded-lg overflow-hidden divide-y divide-content/5">
			{actions.map((action, index) => {
				return (
					<ActionListButton
						className="px-4"
						key={index}
						action={action}
					/>
				);
			})}
		</div>
	);
}
