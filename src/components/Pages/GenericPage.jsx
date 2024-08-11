import clsx from "clsx";
import DataWidget from "../DataWidget";
import WidgetWrapper from "../WidgetWrapper";
import ErrorBoundary from "@/components/ErrorBoundary";
import PreviewCard from "../PreviewCard";
import { cloneElement, isValidElement } from "react";
import { openUrl } from "@/utils";
import useLoadableView from "@/hooks/useLoadableView";
import DataPreviewer from "../DataPreviewer";
import Button from "../Button";
import { marked } from "marked";

export default function GenericPage({
	title,
	source,
	pageData,
	content,
	dismiss,
}) {
	let { data: contentData, pendingView } = useLoadableView({
		data: content,
		dismiss,
		pageData,
	});

	const renderContent = () => {
		if (pendingView != true) return pendingView;

		let content = _.isFunction(contentData)
			? contentData({ dismiss })
			: contentData;

		if (!content) return <div></div>;

		if (!_.isArray(content)) {
			content = [
				isValidElement(content)
					? {
							type: "custom",
							value: content,
					  }
					: _.isObject(content)
					? content
					: {
							type: "custom",
							value: (
								<div
									dangerouslySetInnerHTML={{
										__html: content,
									}}
								></div>
							),
					  },
			];
		}

		return content.map(
			// eslint-disable-next-line no-unused-vars
			({ type, title, subtitle, ...section }, index) => {
				const isImage = type == "image";
				const isVideo = type == "video";
				let content;
				const cropped = section.cropped ?? true;
				const aspectRatio = cropped || isVideo ? "16/9" : "";

				if (isImage || isVideo) {
					content = (
						<div
							className="relative bg-content/5 border-4 border-content/10 rounded-md overflow-hidden"
							style={{
								aspectRatio,
							}}
						>
							<img
								className={clsx(
									"object-cover rounded",
									cropped && "absolute inset-0 size-full"
								)}
								src={section.value}
								style={{
									aspectRatio,
								}}
							/>

							{isVideo && section.url && (
								<a
									onClick={() => openUrl(section.url)}
									className="absolute inset-0 bg-black/50 flex items-center justify-center"
								>
									<div className="relative w-12 h-12 flex items-center justify-center rounded-full overflow-hidden bg-card">
										<div className="absolute inset-0 bg-white text-black"></div>
										<svg
											className="w-7 ml-0.5 relative text-black"
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
								</a>
							)}
						</div>
					);
				} else if (type == "data") {
					content =
						section.wrapped ?? false ? (
							<WidgetWrapper>
								<DataWidget large {...section} />
							</WidgetWrapper>
						) : (
							<DataWidget
								large
								{...section}
								widgetProps={{
									noPadding: true,
								}}
							/>
						);
				} else if (["json", "jsonObject", "jsonArray"].includes(type)) {
					content = (
						<DataPreviewer type={type} data={section.value} />
					);
				} else if (type == "preview") {
					content = (
						<div className="relative p-1 bg-content/5 border border-content/10 rounded-md overflow-hidden">
							<PreviewCard {...section.value} />
						</div>
					);
				} else if (type == "markdown") {
					content = (
						<div
							className="prose"
							dangerouslySetInnerHTML={{
								__html: marked.parse(section.value),
							}}
						></div>
					);
				} else if (type == "action") {
					content = (
						// <div className="mt-4">
						<Button
							onClick={() => {
								let onClick =
									section.value?.handler || (() => {});
								onClick({ dismiss });
							}}
						>
							<span className="uppercase font-semibold">
								{section.value?.label || "Submit"}
							</span>
						</Button>
						// </div>
					);
				} else if (type == "custom") {
					content = cloneElement(section.value, {
						dismiss,
						onClose: dismiss,
					});
				} else {
					content = (
						<div className="text-base/loose">{section.value}</div>
					);
				}

				return (
					<div key={index}>
						{(title || subtitle) && (
							<div
								className={clsx(
									"space-y-1",
									["image", "video"].includes(type)
										? "mb-3"
										: "mb-1"
								)}
							>
								{title && (
									<h5 className="text-base font-bold first-letter:uppercase">
										{title}
									</h5>
								)}

								{subtitle && (
									<p className="text-sm text-content/80">
										{subtitle}
									</p>
								)}
							</div>
						)}

						<ErrorBoundary onReset={dismiss}>
							{content}
						</ErrorBoundary>
					</div>
				);
			}
		);
	};

	return (
		<>
			<div
				className={clsx("sticky top-0 z-50 bg-card border-b")}
				style={{ paddingTop: "env(safe-area-inset-top)" }}
			>
				<div className="h-14 flex items-center justify-between gap-2 px-6">
					<div className="flex-1 -translate-y-px">
						{title && (
							<h3 className="text-2xl font-bold first-letter:uppercase">
								{title}
							</h3>
						)}
					</div>

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
			</div>

			<div className="relative px-6 py-3 space-y-4">
				{source ? (
					<DataWidget
						large
						source={source}
						{...source}
						widgetProps={{ noPadding: true }}
					/>
				) : (
					renderContent()
				)}
			</div>
		</>
	);
}
