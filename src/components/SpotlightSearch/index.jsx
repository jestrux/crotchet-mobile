import SpotlightSearchPage from "./SpotlightSearchPage";
import { SpotlightProvider, useSpotlightContext } from "./SpotlightContext";
import DraggableElement from "@/components/DraggableElement";

export function SpotlightSearchWrapper({ open, children }) {
	const {
		spotlightRef,
		spotlightInnerPages,
		hideSpotlightSearch,
		popCurrentSpotlightPage,
		popSpotlightToRoot,
		...props
	} = useSpotlightContext();

	return (
		<DraggableElement persistKey="spotlightPlacement">
			{(dragProps) => (
				<>
					<SpotlightSearchPage
						key={spotlightRef}
						{...props}
						page={{ type: "search" }}
						open={open && !spotlightInnerPages.length}
						onClose={() => hideSpotlightSearch()}
						dragProps={dragProps}
					>
						{children}
					</SpotlightSearchPage>

					{spotlightInnerPages.map((page) => (
						<SpotlightSearchPage
							key={spotlightRef + "-" + page.id}
							page={page}
							open={
								open && page.id == spotlightInnerPages.at(-1).id
							}
							onClose={() => hideSpotlightSearch()}
							onPopAll={popSpotlightToRoot}
							onPop={popCurrentSpotlightPage}
							dragProps={dragProps}
						>
							{page.content}
						</SpotlightSearchPage>
					))}
				</>
			)}
		</DraggableElement>
	);
}

export default function SpotlightSearch({ children, pages, open }) {
	return (
		<SpotlightProvider pages={pages}>
			<SpotlightSearchWrapper open={open}>
				{children}
			</SpotlightSearchWrapper>
		</SpotlightProvider>
	);
}
