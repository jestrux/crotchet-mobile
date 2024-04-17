import {
	PhotoIcon,
	MagnifyingGlassIcon,
	PlusCircleIcon,
	PlusIcon,
	ArrowPathIcon,
	ListBulletIcon,
} from "@heroicons/react/24/outline";
import { PlayIcon, ShareIcon, UserCircleIcon } from "@heroicons/react/24/solid";
import {
	Loader,
	getGradient,
	onActionClick,
	openUrl,
	useActionClick,
	useSourceGet,
} from "@/crotchet";
import clsx from "clsx";
import { useLongPress } from "@/hooks/useLongPress";
import { Haptics, ImpactStyle } from "@capacitor/haptics";

const WidgetIcons = {
	share: <ShareIcon className="w-3" />,
	shuffle: <ArrowPathIcon className="w-3.5" />,
	play: <PlayIcon className="w-3.5" />,
	image: <PhotoIcon className="w-3.5" />,
	add: <PlusIcon className="w-3.5" />,
	"add-circle": <PlusCircleIcon className="w-5" />,
	search: <MagnifyingGlassIcon className="w-3.5" />,
	user: <UserCircleIcon className="w-4" />,
	list: <ListBulletIcon className="w-4" />,
};

const ActionButton = ({ button, onClick }) => {
	if (!button) return null;

	const { styling, fixed = true, icon, label } = button || {};

	const handleClick = () => {
		onClick(button);
	};

	return (
		<>
			{fixed ? (
				<div className="-mx-1.5 -mb-0.5 p-3s sborder-t border-content/10">
					<button
						className={`${
							styling?.text === "primary" && "text-primary"
						} focus:outline-none h-[40px] flex items-center justify-center gap-2 text-content/50 hover:text-content/[0.65] transition-colors text-[11px] leading-none uppercase tracking-wider font-bold py-3.5 w-full text-center border border-content/5 hover:border-content/20 bg-content/5 roundeds`}
						onClick={handleClick}
					>
						{typeof icon == "string" ? WidgetIcons[icon] : icon}
						{label}
					</button>
				</div>
			) : (
				<div className="p-3 border-t border-content/10">
					<button
						className={`${
							button.styling?.text === "primary" && "text-primary"
						} focus:outline-none h-[38px] flex items-center justify-center gap-2 text-content/50 hover:text-content/[0.65] transition-colors text-xs leading-none uppercase tracking-wider font-bold py-3.5 w-full text-center border border-content/10 hover:border-content/20 bg-content/5 rounded`}
						onClick={handleClick}
					>
						{typeof icon == "string" ? WidgetIcons[icon] : icon}
						{label}
					</button>
				</div>
			)}
		</>
	);
};

const WidgetContent = ({ inset, content, loading, actionTypeMap }) => {
	const {
		backgroundImage,
		image,
		video,
		title,
		subtitle,
		button,
		share,
		url,
		onClick,
	} = content || {};

	const gestures = useLongPress(() => {
		if (share?.length) {
			Haptics.impact({ style: ImpactStyle.Medium });
			openUrl(share);
		}
	});

	const { loading: buttonLoading, onClick: handleButtonClick } =
		useActionClick(button, { actionTypeMap });

	const { loading: contentClickLoading, onClick: handleContentClick } =
		useActionClick(url || onClick, { actionTypeMap });

	const lineClamp = (text) => {
		const otherText = text == "title" ? subtitle : title;

		let length = text == "title" && !button && inset ? 2 : 1;

		if (inset) {
			if (!otherText?.length) length += 1;
			if (!button) length += 1;
			if (!image) length += 1;
		}

		return `line-clamp-${length}`;
	};

	return (
		<div className="relative w-full h-full">
			{backgroundImage?.length && (
				<div
					className="absolute inset-0 bg-cover bg-center"
					style={{
						backgroundImage: backgroundImage?.length
							? `url(${backgroundImage})`
							: "",
					}}
					{...gestures}
					onClick={handleContentClick}
				></div>
			)}

			{loading && <Loader fillParent />}

			{content && (
				<>
					{/* <div className="absolute -inset-5 bg-gradient-to-b from-transparent via-black/50 to-black/50"></div> */}

					<div className="relative w-full h-full flex flex-col pointer-events-none overflow-hidden">
						<div className="flex-1">
							{(image || video) && (
								<div
									className="relative overflow-hidden pointer-events-auto h-full bg-canvas"
									style={{
										// margin: "0.75rem 0.75rem 0 0.75rem",
										maxWidth: !inset
											? "100%"
											: title?.length && subtitle?.length
											? button
												? "60%"
												: "50%"
											: title?.length ||
											  subtitle?.length ||
											  button
											? "60%"
											: "",
										aspectRatio: "3/1",
										borderRadius: inset ? "5px" : 0,
									}}
									{...gestures}
									onClick={handleContentClick}
								>
									{(image || video) != "placeholder" && (
										<img
											className="flex-1 absolute inset-0 w-full h-full object-cover"
											src={image || video}
											alt=""
										/>
									)}

									{video && (
										<div className="absolute inset-0 flex items-center justify-center bg-black/30 dark:bg-black/50">
											<div className="relative w-8 h-8 bg-card flex items-center justify-center rounded-full overflow-hidden">
												<div className="absolute inset-0 bg-content/70"></div>
												<svg
													className="w-4 ml-0.5 relative text-canvas"
													viewBox="0 0 24 24"
													fill="currentColor"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z"
													/>
												</svg>
											</div>
										</div>
									)}
								</div>
							)}
						</div>

						<div
							className={clsx(
								"pt-2 pointer-events-auto flex-shrink-0",
								{ "px-3 pb-2": !inset }
							)}
							{...gestures}
							onClick={handleContentClick}
						>
							<div className="mb-1.5">
								{title?.length > 0 && (
									<div
										className={clsx(
											"text-sm/tight font-semibold drop-shadow-sm",
											lineClamp("title")
										)}
									>
										{title}
									</div>
								)}

								{subtitle?.length > 0 && (
									<div
										className={clsx(
											"text-xs/snug opacity-70 drop-shadow-sm",
											lineClamp("subtitle"),
											{ "mt-1": title?.length }
										)}
									>
										{subtitle}
									</div>
								)}
							</div>

							{button?.label?.length && (
								<button
									type="button"
									disabled={buttonLoading}
									className={clsx(
										"disabled:pointer-events-none flex-shrink-0 truncate text-xs/none ring-1 relative h-7 px-3 rounded-full",
										{ "mb-2": !inset },
										backgroundImage?.length
											? "bg-black text-white ring-white/10"
											: "bg-card text-canvas ring-white/[0.08]"
									)}
									onClick={handleButtonClick}
								>
									{!backgroundImage?.length && (
										<div className="absolute inset-0 bg-content/60"></div>
									)}

									<div className="relative h-full flex items-center justify-center gap-1">
										{buttonLoading && (
											<Loader
												className="-ml-1"
												size={20}
											/>
										)}
										{button.label}
									</div>
								</button>
							)}
						</div>
					</div>
				</>
			)}

			{contentClickLoading && <Loader fillParent />}
		</div>
	);
};

const Widget = ({
	noScroll = false,
	noPadding,
	title,
	icon,
	backgroundImage,
	color,
	actions: _actions,
	children,
	source,
	content: _content,
	actionButton,
	onClick,
}) => {
	noScroll = noScroll || _content;
	const { data, loading, refetch } = useSourceGet(source);
	const actionTypeMap = {
		shuffle: source ? refetch : null,
	};
	const getActions = ({ data = {}, loading } = {}) => {
		if (!_actions) return [];

		return typeof _actions == "function"
			? _actions({ data, loading }) ?? []
			: _actions;
	};

	const getContent = ({ data, loading } = {}) => {
		if (!_content) return null;
		if (typeof _content == "function")
			return _content({ data, loading }) ?? null;
		return _content ?? null;
	};

	const content = getContent({ data });
	const actions = getActions({ data });

	return (
		<div
			className="h-full flex flex-col relative text-content/60"
			{...(typeof onClick == "function" ? { onClick } : {})}
		>
			{(icon || title?.length > 0) && (
				<div className="rounded-t-2xl relative z-10 flex-shrink-0 h-10 flex items-center gap-1.5 px-3.5 bg-content/5">
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
				className="flex-1 overflow-hidden bg-cover bg-center"
				style={{
					backgroundImage: !backgroundImage?.length
						? ""
						: backgroundImage == "gradient"
						? getGradient(backgroundImage)
						: `url(${backgroundImage})`,
					color: color?.length ? color : "",
					// padding: noPadding ? 0 : "0.5rem 0.875rem",
					padding: noPadding ? 0 : "0.875rem",
					overflowY: !noScroll ? "auto" : "",
				}}
			>
				{content ? (
					<WidgetContent
						inset={!noPadding}
						data={data}
						loading={loading}
						actionTypeMap={actionTypeMap}
						content={content}
					/>
				) : (
					children
				)}
			</div>

			{actions?.length > 0 && (
				<div className="absolute right-2 top-2 z-10 flex items-center gap-2">
					<div
						className="flex items-center gap-2"
						style={{ color: color?.length ? color : "" }}
					>
						{actions.map((action, index) => {
							return (
								<button
									title={action.label}
									key={index}
									className={clsx(
										"relative focus:outline-none w-6 h-6 transition-colors rounded-full flex items-center justify-center",
										"ring-1 ring-white/5",
										{
											"bg-content/[0.08] dark:bg-content/15 border border-content/10":
												!color?.length,
										}
									)}
									onClick={onActionClick(action, {
										actionTypeMap,
									})}
									style={{
										color: !color?.length
											? ""
											: color == "white"
											? "black"
											: "white",
									}}
								>
									{color?.length && (
										<span
											className="absolute inset-0 border rounded-full"
											style={{
												borderColor:
													color == "white"
														? "rgba(255,255,255,0.1)"
														: "rgba(0,0,0,0.1)",
												background: color,
											}}
										></span>
									)}

									<span className="relative">
										{typeof action.icon == "string"
											? WidgetIcons[action.icon]
											: action.icon}
									</span>
								</button>
							);
						})}
					</div>
				</div>
			)}

			{actionButton && <ActionButton button={actionButton} />}
		</div>
	);
};

export default Widget;
