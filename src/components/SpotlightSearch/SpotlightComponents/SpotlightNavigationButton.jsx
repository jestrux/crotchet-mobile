import SpotlightListItem from "./SpotlightListItem";
import { camelCaseToSentenceCase } from "@/utils";
import { useSpotlightContext } from "../SpotlightContext";

export default function SpotlightNavigationButton({
	label,
	page,
	onPop = () => {},
	...props
}) {
	const { pushSpotlightPage } = useSpotlightContext();

	const handleClick = async () => {
		const res = await pushSpotlightPage({
			// secondaryAction: "Submit",
			// secondaryActionType: "danger",
			// confirmText: "Delete",
			// title: "Edit Links",
			title: label,
			type: "detail",
			// content,
			...(page || {}),
		});

		onPop(res);
	};

	return (
		<SpotlightListItem
			trailing={SpotlightListItem.NavIcon}
			{...props}
			label={camelCaseToSentenceCase(label)}
			value={label}
			onSelect={handleClick}
		/>
	);
}
