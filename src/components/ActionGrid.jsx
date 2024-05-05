import { useSourceGet } from "@/crotchet";
import ActionButton from "./ActionButton";
import clsx from "clsx";

const Icon = ({ icon, fallback }) => {
	if (icon && typeof icon == "string")
		icon = <div dangerouslySetInnerHTML={{ __html: icon }}></div>;

	return icon ?? fallback;
};

export default function ActionGrid({
	title,
	type,
	data,
	fallbackIcon,
	color: _color,
	maxLines,
	colorDark: _colorDark,
	onClose = () => {},
}) {
	const { loading, data: actions } = useSourceGet(() => {
		if (_.isFunction(data)) return data();

		return data;
	});

	const typeInline = type == "inline";
	const typeWrap = type == "wrap";

	const ActionItem = ({ action }) => {
		const color = action.color ?? _color;
		const colorDark = action.colorDark ?? _colorDark;

		action.icon = action.icon || (
			<svg
				fill="none"
				viewBox="0 0 24 24"
				strokeWidth={1.5}
				stroke="currentColor"
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					d={fallbackIcon}
				/>
			</svg>
		);

		const colorClasses = [
			color
				? `bg-[${color}]/10 text-[${color}] border-[${color}]/5`
				: "bg-content/5 border-stroke",
			colorDark
				? `dark:bg-[${colorDark}]/10 dark:text-[${colorDark}] dark:border-[${colorDark}]/5`
				: "dark:bg-content/5 dark:text-content dark:border-content/10",
		];

		if (typeInline)
			return (
				<ActionButton
					action={action}
					className="w-full h-12 flex items-center gap-3 pl-4 pr-2.5"
				>
					<div className="size-5 opacity-60">
						<Icon icon={action.icon} />
					</div>

					<div className="">{action.label}</div>

					<svg
						className="ml-auto size-5 opacity-30"
						fill="none"
						viewBox="0 0 24 24"
						strokeWidth={1.5}
						stroke="currentColor"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="m8.25 4.5 7.5 7.5-7.5 7.5"
						/>
					</svg>
				</ActionButton>
			);

		if (typeWrap) {
			return (
				<ActionButton
					action={action}
					className="inline-flex items-center gap-1.5 bg-card dark:bg-content/5 shadow dark:border border-stroke rounded-full"
				>
					<div
						className={clsx(
							"ml-2 my-2 size-9 rounded-full flex items-center justify-center border",
							...colorClasses
						)}
					>
						<div className="size-4">
							<Icon icon={action.icon} />
						</div>
					</div>

					<div className="mr-5 text-xs/none">{action.label}</div>
				</ActionButton>
			);
		}

		return (
			<ActionButton
				key={action._id}
				action={action}
				className="flex flex-col gap-2 bg-card dark:bg-content/5 shadow dark:border border-stroke p-4 rounded-lg"
			>
				<div
					className={clsx(
						"size-9 rounded-full flex items-center justify-center border",
						...colorClasses
					)}
				>
					<div className="size-3.5">
						<Icon icon={action.icon} />
					</div>
				</div>
				<div className="w-full">
					<div className="text-left text-xs/none truncate">
						{action.label}
					</div>
				</div>
			</ActionButton>
		);
	};

	if (loading) return null;

	if (!actions?.length) return null;

	return (
		<div className="space-y-1.5" onClick={onClose}>
			<h3 className="text-sm/none text-content/50">{title}</h3>

			{typeWrap && maxLines ? (
				<div className="-mx-4 px-4 space-y-1.5 overflow-x-auto">
					{_.chunk(
						actions,
						Math.ceil(actions.length / maxLines)
					).map((actions, index) => (
						<div
							key={index}
							className="flex gap-x-1.5 gap-y-2 justify-start"
						>
							{actions.map((action, index) => {
								return (
									<div
										key={action._id + index}
										className="flex-shrink-0"
									>
										<ActionItem
											key={action._id}
											action={action}
										/>
									</div>
								);
							})}
						</div>
					))}
				</div>
			) : (
				<div
					className={
						typeWrap
							? "flex gap-x-1.5 gap-y-2 flex-wrap justify-start"
							: typeInline
							? "bg-card dark:bg-content/5 shadow dark:border border-content/5 rounded-lg overflow-hidden divide-y divide-content/5"
							: "grid grid-cols-3 gap-2"
					}
				>
					{actions.map((action) => (
						<ActionItem key={action._id} action={action} />
					))}
				</div>
			)}
		</div>
	);
}
