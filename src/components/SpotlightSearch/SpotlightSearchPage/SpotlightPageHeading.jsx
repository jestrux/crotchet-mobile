import { ArrowLeftIcon } from "@heroicons/react/24/outline";
// import { ComboboxInput } from "@reach/combobox";
import SpotlightPageActions from "./SpotlightPageActions";
import { useRef } from "react";

export default function SpotlightPageHeading({
	popoverTitleRef: popoverTitleRefProp,
	page,
	onPop = () => {},
}) {
	const popoverTitleRef = useRef(null);

	return (
		<div
			ref={popoverTitleRefProp || popoverTitleRef}
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

			{page?.title && (
				<span className="w-full text-base font-bold">
					{page?.title}
				</span>
			)}

			<SpotlightPageActions page={page} />
		</div>
	);
}
