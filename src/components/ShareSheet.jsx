import { useAppContext } from "@/crotchet";
import BottomNavAction from "./BottomNavAction";
import clsx from "clsx";

export default function ShareSheet({ dismiss, title, text, image, url }) {
	const { globalActions } = useAppContext();
	let actions = [
		...globalActions((action) => {
			return action.share;
		}),
	];

	let mainActions = [
		{
			icon: (
				<svg fill="currentColor" viewBox="0 0 24 24">
					<path d="M16 5l-1.42 1.42-1.59-1.59V16h-1.98V4.83L9.42 6.42 8 5l4-4 4 4zm4 5v11c0 1.1-.9 2-2 2H6c-1.11 0-2-.9-2-2V10c0-1.11.89-2 2-2h3v2H6v11h12V10h-3V8h3c1.1 0 2 .89 2 2z" />
				</svg>
			),
			label: "Share",
			url: `crotchet://broadcast/${
				image?.length
					? "image/" + image
					: url?.length
					? "url/" + url
					: "/" + text
			}`,
		},
		{
			icon: (
				<svg fill="currentColor" viewBox="0 0 24 24">
					<path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
				</svg>
			),
			label: "Copy",
			url: `crotchet://copy-${
				image?.length
					? "image/" + image
					: url?.length
					? "url/" + url
					: "/" + text
			}`,
		},
		{
			icon: (
				<svg
					fill="none"
					viewBox="0 0 24 24"
					strokeWidth={1.5}
					stroke="currentColor"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
					/>
				</svg>
			),
			label: "Open",
			url: `crotchet://open/${
				image?.length ? image : url?.length ? url : text
			}`,
		},
	];

	const preview = () => {
		return image?.length ? image : null;
	};

	return (
		<div className="pt-3">
			<div className="pt-2 px-5">
				<div className="flex items-start justify-between gap-2">
					<div className="flex-1 flex items-center gap-3">
						{preview() && (
							<div
								className="border border-content/10 flex-shrink-0 h-10 w-14 bg-content/5 rounded-md bg-cover bg-center"
								style={{
									backgroundImage: `url(${preview()})`,
								}}
							></div>
						)}

						<div className="flex-1">
							{title && (
								<h3 className="text-sm text-content line-clamp-1">
									{title}
								</h3>
							)}
							<h3
								className={clsx(
									"text-content/50",
									title?.length
										? "text-xs line-clamp-1"
										: "text-xs/relaxed line-clamp-2"
								)}
							>
								{preview()}
							</h3>
						</div>
					</div>

					<button
						className="bg-content/5 shadow-md dark:shadow-none dark:border border-content/5 size-7 flex items-center justify-center rounded-full"
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

				<div className="mt-4 space-y-2" onClick={dismiss}>
					<div className="grid grid-cols-3 gap-2">
						{mainActions.map((action, index) => (
							<BottomNavAction
								key={index}
								vertical
								className="bg-content/[0.03] shadow-md dark:shadow-none dark:border border-content/5 p-4 rounded-md"
								action={action}
							/>
						))}
					</div>

					{actions?.length > 0 && (
						<div className="mb-2 bg-content/[0.03] shadow-md dark:shadow-none dark:border border-content/5 rounded-md overflow-hidden divide-y divide-content/5">
							{actions.map((action, index) => (
								<BottomNavAction
									className="px-4"
									key={action._id + index}
									action={action}
								/>
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
