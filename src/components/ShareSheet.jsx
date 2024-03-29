import {
	cleanObject,
	isValidUrl,
	randomId,
	useAppContext,
	useOnInit,
} from "@/crotchet";
import BottomNavAction from "./BottomNavAction";
import clsx from "clsx";
import { useState } from "react";

export default function ShareSheet({
	dismiss,
	preview,
	title,
	subtitle,
	image,
	url,
	text,
	download,
}) {
	const { actions, onDesktop } = useAppContext();
	const mainActionNames = ["share", "copy", "copyImage", "download", "open"];
	const getShareActions = (content) => {
		const { image, url, text, download } = content;
		return Object.entries(actions).reduce(
			(agg, [name, action]) => {
				if (
					action.context != "share" ||
					(action.mobileOnly && onDesktop())
				)
					return agg;

				let matches = true;

				const match = action.match;

				if (typeof match == "function")
					matches = match({ image, url, text, download });
				if (["image", "url", "text", "download"].includes(match)) {
					matches = {
						image,
						url,
						text,
						download,
					}[match]?.length;
				}

				if (!matches) return agg;

				const fullAction = {
					...action,
					__id: randomId(),
					handler: () => action.handler(content),
				};

				if (mainActionNames.includes(name)) agg.main.push(fullAction);
				else agg.other.push(fullAction);

				return agg;
			},
			{
				main: [],
				other: [],
			}
		);
	};

	const [content, _setContent] = useState({
		preview,
		title,
		subtitle,
		image,
		url,
		text,
		download,
	});

	const setContent = (newValues) =>
		_setContent((content) => ({
			...content,
			...newValues,
		}));

	const processPreview = async () => {
		if (image?.length) {
			return setContent({
				preview: image,
				subtitle: subtitle || image,
			});
		}

		const value = url?.length ? url : text?.length ? text : null;

		if (!value) return;

		if (isValidUrl(value)) {
			if (preview && (title || subtitle)) return;

			fetch(
				`https://us-central1-letterplace-c103c.cloudfunctions.net/api/crawl/${encodeURIComponent(
					value
				)}`
			)
				.then((res) => res.json())
				.then((res) => {
					const { image, title, description } = res.meta || {};
					const values = cleanObject({
						preview: content?.preview || image,
						title: content?.title || title,
						subtitle: description,
					});

					setContent(values);
				})
				.catch(() => {});

			return setContent({
				url: value,
			});
		}

		if (!subtitle) {
			setContent({
				subtitle: value,
			});
		}
	};

	useOnInit(() => {
		processPreview();
	}, []);

	const contentPreview = () => {
		if (!content) return <div>&nbsp;</div>;

		return (
			<div className="flex-1 flex items-center gap-3">
				{content.preview?.length > 0 && (
					<div
						className="border border-content/10 flex-shrink-0 h-10 w-14 bg-content/5 rounded-md bg-cover bg-center"
						style={{
							backgroundImage: `url(${content.preview})`,
						}}
					></div>
				)}

				<div className="flex-1">
					{content.title?.length > 0 && (
						<h3 className="text-sm text-content line-clamp-1">
							{content.title}
						</h3>
					)}

					<p
						className={clsx(
							"text-content/50",
							content.title?.length > 0
								? "text-xs line-clamp-1"
								: "text-xs/relaxed line-clamp-2"
						)}
					>
						{content.subtitle || content.url}
					</p>
				</div>
			</div>
		);
	};

	const shareActions = getShareActions(content);
	const mainActions = shareActions.main;
	const otherActions = shareActions.other;

	return (
		<div className="pt-5 pb-3 px-5">
			<div className="flex items-start justify-between gap-2">
				{contentPreview()}

				<button
					className="bg-content/5 border border-content/5 size-7 flex items-center justify-center rounded-full"
					onClick={dismiss}
				>
					<svg
						className="w-3.5"
						fill="none"
						viewBox="0 0 24 24"
						strokeWidth="1.5"
						stroke="currentColor"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M6 18 18 6M6 6l12 12"
						></path>
					</svg>
				</button>
			</div>

			<div className="mt-4 space-y-3" onClick={dismiss}>
				{mainActions?.length > 0 && (
					<div className="grid grid-cols-3 gap-3">
						{mainActions.map((action) => (
							<BottomNavAction
								key={action.__id}
								vertical
								className="bg-card shadow dark:border border-content/5 p-4 rounded-lg"
								action={action}
								inShareSheet
							/>
						))}
					</div>
				)}

				{otherActions?.length > 0 && (
					<div className="mb-2 bg-card shadow dark:border border-content/5 rounded-lg overflow-hidden divide-y divide-content/5">
						{otherActions.map((action) => (
							<BottomNavAction
								className="px-4"
								key={action.__id}
								action={action}
								inShareSheet
							/>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
