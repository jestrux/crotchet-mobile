import { Fragment, useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

import { useAirtableMutation } from "@/providers/data/airtable/useAirtable";
import { useAppContext } from "@/providers/app";
import { formatDate, openUrl, toHms, showToast } from "@/crotchet";
import clsx from "clsx";
import Loader from "../Loader";

export const _format = function (data, t) {
	try {
		t = t.trim();
		let [text, format] = t.split("|").map((t) => t.trim());
		text = _get(data, text);

		if (format === "date") return formatDate(text);

		if (format === "time") return toHms(text);

		if (format === "cleanString")
			return text.replaceAll("-", " ").replaceAll("_", " ");

		return text;
	} catch (error) {
		//
	}
};

export const _parse = function (text, data) {
	if (!text?.length) return "";

	let parsedText = text.split("::").map((t) => {
		return _format(data, t);
	});

	return parsedText;
};

export const _get = function (o, _s) {
	if (!o || !_s) return null;

	let s = _s.replace(/\[(\w+)\]/g, ".$1"); // convert indexes to properties
	s = s.replace(/^\./, ""); // strip a leading dot
	var a = s.split(".");
	var matched = false;
	for (var i = 0, n = a.length; i < n; ++i) {
		var k = a[i];
		if (k in o) {
			o = o[k];
			matched = true;
		} else {
			return;
		}
	}

	return matched ? o : _s;
};

const Status = ({ status }) => {
	const positive = [
		"verified",
		"approved",
		"completed",
		"complete",
		"done",
		"true",
		1,
		"1",
	].includes(status);

	const negative = ["blocked", "0", 0, false, "false"].includes(status);

	const pending = ["in progress", "pending"].includes(status);

	return (
		<div
			className={`
			${positive && "bg-green-500 text-white"}
			${pending && "bg-yellow-300 text-black"}
			${negative && "bg-red-500 text-white"}
			${
				![positive, pending, negative].includes(true)
					? "bg-content/5 dark:bg-content/10 border-content/10"
					: "border-transparent"
			}
			font-bold py-1.5 px-2 rounded-full border text-[8px] leading-none uppercase tracking-wide
		`}
		>
			{status}
		</div>
	);
};

const Checkbox = ({ table, row, field }) => {
	const { mutate } = useAirtableMutation({ table });
	const [status, setStatus] = useState(row[field]);

	const updateStatus = (status) => {
		setStatus(status);
		mutate({
			rowId: row._rowId,
			[field]: status,
		});
	};

	return (
		<label className="-translate-y-0.5  mr-2 cursor-pointer h-8 w-8 flex items-center justify-center rounded-full transition-colors duration-300 hover:bg-content/10">
			<input
				className="hidden"
				type="checkbox"
				value={status}
				checked={status}
				onChange={(e) => updateStatus(e.target.checked)}
			/>

			<svg
				className={`w-5 h-5 ${
					status ? "text-primary" : "text-content/40"
				}`}
				fill="currentColor"
				viewBox="0 0 24 24"
			>
				<circle
					cx="12"
					cy="12"
					r="11"
					stroke="currentColor"
					fill={status ? "currentColor" : "none"}
					strokeWidth="2"
				/>

				{status && (
					<path
						transform="translate(3 3) scale(0.7)"
						d="M4.5 12.75l6 6 9-13.5"
						stroke="white"
						fill="none"
						strokeWidth="3"
					/>
				)}
			</svg>
		</label>
	);
};

const Remover = ({ table, row, onSuccess = () => {} }) => {
	const { confirmAction, withToast } = useAppContext();
	const { mutateAsync } = useAirtableMutation({ table, action: "delete" });
	const removeRow = async () => {
		if (!(await confirmAction())) return;

		await withToast(mutateAsync(row._rowId), "Row removed");
		onSuccess();
	};

	return (
		<button
			className="focus:outline-none opacity-0 group-hover:opacity-100 absolute -right-1.5 -translate-y-0.5 cursor-pointer h-5 w-5 flex items-center justify-center rounded-full transition-colors duration-300 bg-content/10 hover:bg-content/20"
			onClick={removeRow}
		>
			<XMarkIcon className="w-3.5" strokeWidth={1.8} />
		</button>
	);
};

const Progress = ({ value }) => {
	return (
		<div className="relative">
			<svg
				className={`
					${value < 50 && "text-yellow-300"}
					${value >= 50 && value <= 85 && "text-purple-500"}
					${value > 85 && "text-green-400/60"}
				-rotate-90
				`}
				viewBox="0 0 120 120"
				strokeWidth="6"
			>
				<circle
					cx="60"
					cy="60"
					r="54"
					fill="none"
					stroke="currentColor"
					pathLength="100"
					strokeDasharray="100"
					strokeDashoffset={100 - value}
					strokeLinejoin="round"
					strokeLinecap="round"
				/>

				<circle
					className="text-content/10"
					cx="60"
					cy="60"
					r="54"
					fill="none"
					stroke="currentColor"
				/>
			</svg>

			<div className="absolute inset-0 flex items-center justify-center text-[7px] font-bold">
				{Number(value).toFixed(0)}%
			</div>
		</div>
	);
};

const GridListItem = ({
	masonry,
	icon,
	image,
	video,
	title,
	subtitle,
	trailing,
	color,
	width,
	height,
}) => {
	if (masonry) {
		return (
			<div className="w-full relative">
				{(image?.length || video?.length) && (
					<div
						className="relative flex-shrink-0 bg-content/10 border border-content/10 rounded overflow-hidden w-full"
						style={
							width && height
								? {
										aspectRatio: `${width}/${height}`,
										backgroundColor: color,
								  }
								: { backgroundColor: color }
						}
					>
						<img
							className="w-full"
							src={image?.length ? image : video}
							alt=""
						/>

						{video?.length && (
							<div className="absolute inset-0 bg-black/50 flex items-center justify-center">
								<div className="relative w-8 h-8 flex items-center justify-center rounded-full overflow-hidden bg-card">
									<div className="absolute inset-0 bg-content/60"></div>
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
		);
	}
	return (
		<div className="min-h-full w-full flex flex-col items-center gap-2">
			{icon?.length ? (
				<div
					className="flex items-center justify-center"
					dangerouslySetInnerHTML={{ __html: icon }}
				/>
			) : (
				(image?.length || video?.length) && (
					<div className="relative flex-shrink-0 bg-content/10 border border-content/10 rounded overflow-hidden w-full aspect-[16/9]">
						<img
							className={"absolute size-full object-cover"}
							src={image?.length ? image : video}
							alt=""
						/>

						{video?.length && (
							<div className="absolute inset-0 bg-black/50 flex items-center justify-center">
								<div className="relative w-8 h-8 flex items-center justify-center rounded-full overflow-hidden bg-card">
									<div className="absolute inset-0 bg-content/60"></div>
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
				)
			)}

			<div className="flex-1 min-w-0 space-y-1 text-center">
				{title?.length > 0 && (
					<h5 className="line-clamp-1 text-content text-sm/none font-medium first-letter:capitalize">
						{title}
					</h5>
				)}
				{subtitle?.length > 0 && (
					<p
						className={clsx(
							"line-clamp-1 text-xs/none",
							title?.length && "mt-1.5"
						)}
					>
						{subtitle.map((s, i) => {
							return (
								<Fragment key={i}>
									<span>
										{s.toString().charAt(0).toUpperCase()}
										{s.toString().substring(1)}
									</span>
									{i !== subtitle.length - 1 && (
										<span className="mx-2s mr-2 leading-none">
											{i !== 0 &&
											i === subtitle.length - 2 ? (
												<span className="font-light ml-2">
													&mdash;
												</span>
											) : (
												<span>,</span>
											)}
										</span>
									)}
								</Fragment>
							);
						})}
					</p>
				)}
			</div>

			<div className="self-stretch flex-shrink-0 ml-auto flex items-center gap-2">
				{trailing?.toString().length && (
					<span className="text-sm opacity-60">{trailing}</span>
				)}
			</div>
		</div>
	);
};

const ListItemRegular = ({
	table,
	icon,
	video,
	image,
	title,
	subtitle,
	data,
	status,
	// status = "status",
	trailing,
	action,
	progress,
	// progress = "progress",
	checkbox,
	removable,
	setRemoved,
}) => {
	return (
		<>
			{action?.length > 0 && (
				<div className="transition opacity-0 group-hover:opacity-100 absolute inset-0 -mx-5 bg-content/5"></div>
			)}

			{checkbox?.length && (
				<Checkbox table={table} row={data} field={checkbox} />
			)}

			{icon?.length ? (
				<div
					className="mr-2"
					dangerouslySetInnerHTML={{ __html: icon }}
				/>
			) : (
				(image?.length || video?.length) && (
					<div className="mr-2 size-8 relative flex-shrink-0 bg-content/10 border border-content/10 rounded-full overflow-hidden">
						<img
							className={"absolute size-full object-cover"}
							src={image?.length ? image : video}
							alt=""
						/>

						{video?.length && (
							<div className="absolute inset-0 bg-black/50 flex items-center justify-center">
								<div className="relative size-3 flex items-center justify-center rounded-full overflow-hidden bg-card">
									<div className="absolute inset-0 bg-content/60"></div>
									<svg
										className="size-3 ml-0.5 relative text-canvas"
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
				)
			)}

			<div className="flex-1 mr-3 min-w-0">
				{title?.length > 0 && (
					<h5 className="text-sm leading-none font-medium truncate first-letter:capitalize">
						{title}
					</h5>
				)}
				{subtitle?.length > 0 && (
					<p
						className={`${
							title?.length
								? "mt-1.5 text-xs opacity-60"
								: "text-sm"
						} leading-none truncate`}
					>
						{subtitle.map((s, i) => {
							return (
								<Fragment key={i}>
									<span>
										{s.toString().charAt(0).toUpperCase()}
										{s.toString().substring(1)}
									</span>
									{i !== subtitle.length - 1 && (
										<span className="mx-2s mr-2 leading-none">
											{i !== 0 &&
											i === subtitle.length - 2 ? (
												<span className="font-light ml-2">
													&mdash;
												</span>
											) : (
												<span>,</span>
											)}
										</span>
									)}
								</Fragment>
							);
						})}
					</p>
				)}
			</div>

			<div className="self-stretch flex-shrink-0 ml-auto flex items-center gap-2">
				{status?.toString().length && (
					<div className="self-start">
						<Status status={status} />
					</div>
				)}

				{progress?.toString().length && (
					<div className="self-start w-9">
						<Progress value={progress} />
					</div>
				)}

				{trailing?.toString().length && (
					<span className="text-sm opacity-60">{trailing}</span>
				)}

				{action?.toString().length > 0 &&
					(action.indexOf("whatsapp") !== -1 && !trailing ? (
						<svg
							fill="currentColor"
							className="w-4 h-4 opacity-30 group-hover:opacity-60 transition"
							viewBox="0 0 24 24"
						>
							<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
						</svg>
					) : (
						<svg
							fill="none"
							viewBox="0 0 24 24"
							strokeWidth="2"
							stroke="currentColor"
							className="w-4 h-4 opacity-30 group-hover:opacity-60 transition"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M8.25 4.5l7.5 7.5-7.5 7.5"
							/>
						</svg>
					))}
			</div>

			{removable && (
				<Remover
					table={table}
					row={data}
					onSuccess={() => setRemoved(true)}
				/>
			)}
		</>
	);
};

const ListItemLarge = ({ icon, image, video, title, subtitle, trailing }) => {
	return (
		<>
			{icon?.length ? (
				<div
					className="mr-2.5"
					dangerouslySetInnerHTML={{ __html: icon }}
				/>
			) : (
				(image?.length || video?.length) && (
					<div className="relative mr-2.5 flex-shrink-0 bg-content/10 border border-content/10 rounded overflow-hidden w-16 aspect-[2/1.5]">
						<img
							className={"absolute size-full object-cover"}
							src={image?.length ? image : video}
							alt=""
						/>

						{video?.length && (
							<div className="absolute inset-0 bg-black/50 flex items-center justify-center">
								<div className="relative w-8 h-8 flex items-center justify-center rounded-full overflow-hidden">
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
				)
			)}

			<div className="flex-1 mr-3 min-w-0 space-y-2">
				{title?.length > 0 && (
					<h5 className="text-content text-sm/none font-medium truncate first-letter:capitalize">
						{title}
					</h5>
				)}
				{subtitle?.length > 0 && (
					<p
						className={clsx(
							"text-xs/none truncate",
							title?.length && "mt-1.5"
						)}
					>
						{subtitle.map((s, i) => {
							return (
								<Fragment key={i}>
									<span>
										{s.toString().charAt(0).toUpperCase()}
										{s.toString().substring(1)}
									</span>
									{i !== subtitle.length - 1 && (
										<span className="mx-2s mr-2 leading-none">
											{i !== 0 &&
											i === subtitle.length - 2 ? (
												<span className="font-light ml-2">
													&mdash;
												</span>
											) : (
												<span>,</span>
											)}
										</span>
									)}
								</Fragment>
							);
						})}
					</p>
				)}
			</div>

			<div className="self-stretch flex-shrink-0 ml-auto flex items-center gap-2">
				{trailing?.toString().length && (
					<span className="text-sm opacity-60">{trailing}</span>
				)}
			</div>
		</>
	);
};

const ListItem = ({
	grid = false,
	masonry = false,
	large = false,
	table,
	data,
	icon = "icon",
	video = "video",
	image = "image",
	title = "title",
	color,
	width,
	height,
	subtitle,
	status,
	// status = "status",
	trailing,
	action: _action = "url",
	progress,
	// progress = "progress",
	checkbox,
	removable,
	onClick,
}) => {
	const [actionLoading, setActionLoading] = useState(false);

	const { copyToClipboard, copyImage } = useAppContext();
	const [removed, setRemoved] = useState(false);

	icon = _get(data, icon);
	video = _format(data, video);
	image = _format(data, image);
	title = _format(data, title);
	subtitle = (_parse(subtitle, data) || []).filter((s) => s ?? false);
	trailing = _format(data, trailing);
	status = _get(data, status);
	const action = _get(data, _action);
	progress = _get(data, progress);

	if (removed) return null;

	const clickHandlerSet = typeof onClick == "function";
	const actionIsCopy = _action && _action.indexOf("copy://") != -1;

	const handleClick = async () => {
		setActionLoading(true);

		try {
			if (clickHandlerSet || actionIsCopy) {
				if (clickHandlerSet) {
					await Promise.resolve(onClick());
					return setActionLoading(false);
				}

				const field = _action.replace("copy://", "");
				const value = _get(data, field);
				const isImage = value == image;

				isImage ? await copyImage(value) : await copyToClipboard(value);

				showToast(isImage ? "Image copied" : "Copied");

				return setActionLoading(false);
			}

			if (action) await Promise.resolve(openUrl(action));
		} catch (error) {
			//
		}

		setActionLoading(false);
	};

	return (
		<a
			onClick={handleClick}
			className={clsx(
				"lg:group w-full text-left flex items-center relative",
				!grid && "py-2"
			)}
		>
			{grid || masonry ? (
				<GridListItem
					{...{
						color,
						width,
						height,
						masonry,
						table,
						icon,
						video,
						image,
						title,
						subtitle,
						data,
						status,
						// status = "status",
						trailing,
						action,
						progress,
						// progress = "progress",
						checkbox,
						removable,
						setRemoved,
					}}
				/>
			) : large ? (
				<ListItemLarge
					{...{
						table,
						icon,
						image,
						video,
						title,
						subtitle,
						data,
						status,
						// status = "status",
						trailing,
						action,
						progress,
						// progress = "progress",
						checkbox,
						removable,
						setRemoved,
					}}
				/>
			) : (
				<ListItemRegular
					{...{
						table,
						icon,
						image,
						video,
						title,
						subtitle,
						data,
						status,
						// status = "status",
						trailing,
						action,
						progress,
						// progress = "progress",
						checkbox,
						removable,
						setRemoved,
					}}
				/>
			)}

			{actionLoading && (
				<div className="absolute right-0 inset-y-0 p-1 backdrop-blur-sm">
					<Loader className="opacity-50" size={20} />
				</div>
			)}
		</a>
	);
};

export default ListItem;
