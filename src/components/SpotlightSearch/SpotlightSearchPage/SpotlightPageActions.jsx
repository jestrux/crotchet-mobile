import { useRef } from "react";
import Menu from "@/components/Menu";
import { useSpotlightPageActions } from "./SpotlightPageContext";

export default function SpotlightPageActions({ page }) {
	const ref = useRef();
	const { actions, value, setValue } = useSpotlightPageActions();

	if (!actions?.length) return null;

	return (
		<div className="flex-shrink-0">
			<Menu
				ref={ref}
				onTopMenu
				choices={actions}
				value={value}
				onChange={setValue}
			/>
		</div>
	);
}
