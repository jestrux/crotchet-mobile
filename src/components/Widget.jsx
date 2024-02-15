import {
	PhotoIcon,
	MagnifyingGlassIcon,
	PlusCircleIcon,
	PlusIcon,
	ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { PlayIcon, ShareIcon } from "@heroicons/react/24/solid";
import { useAppContext } from "@/providers/app";

const WidgetIcons = {
	share: <ShareIcon className="w-3" />,
	shuffle: <ArrowPathIcon className="w-3.5" />,
	play: <PlayIcon className="w-3.5" />,
	image: <PhotoIcon className="w-3.5" />,
	add: <PlusIcon className="w-3.5" />,
	"add-circle": <PlusCircleIcon className="w-5" />,
	search: <MagnifyingGlassIcon className="w-3.5" />,
};

const Widget = ({
	noScroll = false,
	noPadding,
	title,
	icon,
	actions,
	actionButton,
	children,
	refresh = () => {},
}) => {
	const { openActionDialog } = useAppContext();
	const dynamicAction = (action) => {
		return () => {
			return openActionDialog({ ...action, title: action.label });
		};
	};

	const handleActionClick = async (action) => {
		const actionHandler = action.onClick ?? dynamicAction(action);
		const res = await Promise.resolve(actionHandler());

		if (res) refresh();
	};

	return (
		<div className="h-full flex flex-col relative text-content/60">
			{(icon || title?.length > 0) && (
				<div className="rounded-t-2xl relative z-30 flex-shrink-0 h-10 flex items-center gap-1.5 px-3.5 bg-content/5">
					{icon && (
						<span className="-ml-1.5 w-6 h-6 bg-content/10 rounded-full flex items-center justify-center">
							{typeof icon == "string" ? WidgetIcons[icon] : icon}
						</span>
					)}

					<span className="uppercase tracking-wide text-xs font-bold opacity-80">
						{title}
					</span>
				</div>
			)}

			<div
				className="flex-1 overflow-hidden"
				style={{
					padding: noPadding ? 0 : "0.5rem 0.875rem",
					overflowY: !noScroll ? "auto" : "",
				}}
			>
				{children}
			</div>

			{actions?.length > 0 && (
				<div className="absolute right-2 top-2 z-30 flex items-center gap-2">
					<div className="flex items-center gap-2">
						{actions &&
							actions.map((action, index) => {
								return (
									<button
										title={action.label}
										key={index}
										className="focus:outline-none w-6 h-6 border border-content/10 bg-content/10 dark:bg-content/15 transition-colors rounded-full flex items-center justify-center"
										onClick={() =>
											handleActionClick(action)
										}
									>
										{typeof action.icon == "string"
											? WidgetIcons[action.icon]
											: action.icon}
									</button>
								);
							})}
					</div>
				</div>
			)}

			{actionButton && (
				<>
					{actionButton.fixed ?? true ? (
						<div className="-mx-1.5 -mb-0.5 p-3s sborder-t border-content/10">
							<button
								className={`${
									actionButton.styling?.text === "primary" &&
									"text-primary"
								} focus:outline-none h-[40px] flex items-center justify-center gap-2 text-content/50 hover:text-content/[0.65] transition-colors text-[11px] leading-none uppercase tracking-wider font-bold py-3.5 w-full text-center border border-content/5 hover:border-content/20 bg-content/5 roundeds`}
								onClick={() => handleActionClick(actionButton)}
							>
								{typeof actionButton.icon == "string"
									? WidgetIcons[actionButton.icon]
									: actionButton.icon}
								{actionButton.label}
							</button>
						</div>
					) : (
						<div className="p-3 border-t border-content/10">
							<button
								className={`${
									actionButton.styling?.text === "primary" &&
									"text-primary"
								} focus:outline-none h-[38px] flex items-center justify-center gap-2 text-content/50 hover:text-content/[0.65] transition-colors text-xs leading-none uppercase tracking-wider font-bold py-3.5 w-full text-center border border-content/10 hover:border-content/20 bg-content/5 rounded`}
								onClick={() => handleActionClick(actionButton)}
							>
								{typeof actionButton.icon == "string"
									? WidgetIcons[actionButton.icon]
									: actionButton.icon}
								{actionButton.label}
							</button>
						</div>
					)}
				</>
			)}
		</div>
	);
};

export default Widget;
