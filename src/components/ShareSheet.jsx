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
	const { globalActions } = useAppContext();

	const getShareActions = (content) => {
		const { image, url, text } = content;
		return [...globalActions({ share: true })]
			.filter((action) => {
				const shareType = action.shareType;

				if (typeof shareType == "function")
					return shareType({ image, url, text });

				if (["image", "url"].includes(shareType)) {
					return {
						image,
						url,
					}[shareType];
				}

				return true;
			})
			.map((action) => {
				return {
					...action,
					__id: randomId(),
					handler: () => action.handler(content),
				};
			});
	};

	const getMainActions = (content) => {
		const { image, url, download } = content;

		if (!image?.length && !url?.length && !download?.length) return [];

		const slug = `${
			image?.length
				? "image/" + image
				: "url/" + (download?.length ? download : url)
		}`;

		const actions = [
			{
				icon: (
					<svg fill="currentColor" viewBox="0 0 24 24">
						<path d="M16 5l-1.42 1.42-1.59-1.59V16h-1.98V4.83L9.42 6.42 8 5l4-4 4 4zm4 5v11c0 1.1-.9 2-2 2H6c-1.11 0-2-.9-2-2V10c0-1.11.89-2 2-2h3v2H6v11h12V10h-3V8h3c1.1 0 2 .89 2 2z" />
					</svg>
				),
				label: "Share",
				url: `crotchet://broadcast/${slug}`,
			},
			{
				icon: (
					<svg fill="currentColor" viewBox="0 0 24 24">
						<path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
					</svg>
				),
				label: "Copy" + (image?.length ? " image" : ""),
				url: `crotchet://copy-${slug}`,
			},
		];

		if (download?.length) {
			actions.push({
				icon: (
					<svg fill="currentColor" viewBox="0 0 16 16">
						<path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5" />
						<path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708z" />
					</svg>
				),
				label: "Download",
				url: `crotchet://download/${download}`,
			});
		} else if (url?.length) {
			actions.push({
				icon: (
					<svg fill="currentColor" viewBox="0 0 16 16">
						<path
							fillRule="evenodd"
							d="M8.636 3.5a.5.5 0 0 0-.5-.5H1.5A1.5 1.5 0 0 0 0 4.5v10A1.5 1.5 0 0 0 1.5 16h10a1.5 1.5 0 0 0 1.5-1.5V7.864a.5.5 0 0 0-1 0V14.5a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h6.636a.5.5 0 0 0 .5-.5"
						/>
						<path
							fillRule="evenodd"
							d="M16 .5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793L6.146 9.146a.5.5 0 1 0 .708.708L15 1.707V5.5a.5.5 0 0 0 1 0z"
						/>
					</svg>
				),
				label: "Open",
				url: `crotchet://open/${url}`,
			});
		}

		return actions.map((action) => {
			return {
				...action,
				__id: randomId(),
			};
		});
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

		setContent({
			subtitle: value,
		});
	};

	useOnInit(() => {
		processPreview();
	}, []);

	const contentPreview = () => {
		if (!content) return <div>&nbsp;</div>;

		// https://x.com/darcy/status/1770886347785433504?s=46&t=T0SD9uWNN2oE-Y69W0aNFw

		return (
			<div className="flex-1 flex items-center gap-3">
				{content.preview && (
					<div
						className="border border-content/10 flex-shrink-0 h-10 w-14 bg-content/5 rounded-md bg-cover bg-center"
						style={{
							backgroundImage: `url(${content.preview})`,
						}}
					></div>
				)}

				<div className="flex-1">
					{/* {content.title?.length > 0 && ( */}
					<h3 className="text-sm text-content line-clamp-1">
						{content.title}
					</h3>
					{/* )} */}

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

	const mainActions = getMainActions(content);
	const shareActions = getShareActions(content);

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

				{shareActions?.length > 0 && (
					<div className="mb-2 bg-card shadow dark:border border-content/5 rounded-lg overflow-hidden divide-y divide-content/5">
						{shareActions.map((action) => (
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
