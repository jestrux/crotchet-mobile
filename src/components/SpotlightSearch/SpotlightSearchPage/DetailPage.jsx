import { useRef } from "react";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import SpotlightPageFilters from "./SpotlightPageFilters";
import { useSpotlightPageContext } from "./SpotlightPageContext";
import ActionPage from "./ActionPage";
import FormPage from "./FormPage";

export default function DetailPage({
	page = { type: "detail" },
	onOpen,
	onPop,
}) {
	const {
		pageResolving,
		content: _content,
		title,
	} = useSpotlightPageContext();
	const popoverTitleRef = useRef(null);
	const containerRef = useRef(null);

	onOpen(() => {
		setTimeout(() => {
			if (page?.type == "form") {
				const firstInput = document.querySelector(
					"#popoverContent input, #popoverContent textarea"
				);
				if (firstInput) firstInput.focus();
			}
		}, 20);
	});

	const renderPage = () => {
		const pageHasFields =
			[typeof page.fields, typeof page.field].includes("function") ||
			Object.keys(page.fields ?? {}).length > 0 ||
			page.field;
		let content = _content();

		if (pageHasFields) content = <FormPage page={page} />;

		return <ActionPage page={page}>{content}</ActionPage>;
	};

	return (
		<>
			<div
				ref={popoverTitleRef}
				id="popoverTitle"
				className="h-14 px-4 flex items-center border-b border-content/10 z-10 relative"
			>
				{typeof onPop == "function" && (
					<button
						type="button"
						className="flex-shrink-0 -ml-1.5 mr-2.5 bg-content/10 rounded flex items-center justify-center w-7 h-7"
						onClick={() => onPop()}
					>
						<ArrowLeftIcon width={13} strokeWidth={3} />
					</button>
				)}

				<span className="w-full text-base font-bold">{title}</span>

				{!pageResolving && <SpotlightPageFilters page={page} />}
			</div>

			{!pageResolving && (
				<div
					id="popoverContent"
					ref={containerRef}
					className="-mt-0.5 relative w-screen overflow-auto focus:outline-none"
					style={{ height: "calc(100vh - 100px)" }}
				>
					{renderPage()}
				</div>
			)}
		</>
	);
}
