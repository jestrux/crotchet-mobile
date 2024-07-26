import { Button } from "@chakra-ui/react";
import { useRef } from "react";
import CommandKey from "@/components/CommandKey";
import { useSpotlightPageContext } from "./SpotlightPageContext";
import { dispatch } from "@/utils";
import SpotLightPageMenu from "./SpotLightPageMenu";
import { objectFieldChoices } from "../../../utils";

export default function SpotlightPageFilters() {
	const filterMenuTriggerRef = useRef();
	const {
		filters: _filters,
		pageFilter,
		setPageFilter,
		onChangeFilter,
		pageResolving,
	} = useSpotlightPageContext();
	const filters = _filters();

	onChangeFilter(() => {
		filterMenuTriggerRef.current.click();
	});

	if (!filters?.length || pageResolving) return null;

	const selected = objectFieldChoices(filters).find(
		({ value }) => value == pageFilter
	);

	return (
		<SpotLightPageMenu
			width="330px"
			selected={selected?.value}
			choices={filters}
			onChange={(value) => {
				setPageFilter(value);
				dispatch("filter-changed", value);
			}}
			trigger={
				<Button
					as="div"
					ref={filterMenuTriggerRef}
					className="gap-2 w-[200px] relative cursor-default rounded-md h-9 px-2 focus:outline-none focus-visible:border-content/20 text-xs font-medium border border-content/20 text-left"
					rounded="md"
					size="sm"
					variant="ghost"
				>
					<span className="mr-0.5 capitalize text-sm flex-1 truncate">
						{selected?.label || "Choose one"}
					</span>
					<CommandKey label="Cmd" />
					<CommandKey label="P" />
				</Button>
			}
		/>
	);
}
