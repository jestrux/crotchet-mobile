import { motion } from "framer-motion";

import { usePageContext } from "../PageProvider";
import PageHeader from "./PageHeader";
import PageNav, { BottomNavPlaceholder } from "./PageNav";
import { useDataLoader } from "@/hooks";
import { Loader, randomId } from "@/crotchet";
import PageSection from "./PageSection";
import useHideFloatingUI from "./useHideFloatingUI";
import { useState } from "react";

const PageAction = () => {
	const hideFloatingUI = useHideFloatingUI();
	const { scaffold, page } = usePageContext();

	if (!page?.action) return null;

	const insetBottom = 24 + (scaffold.nav ? 42 : 0);

	return (
		<motion.button
			className="primary-bg dark:bg-content dark:text-inverted shadow border border-content/5 dark:border-content/20 fixed bottom-0 right-5 mx-auto z-50 h-11 w-28 flex items-center justify-center gap-2 rounded-full px-3.5 focus:outline-none"
			onClick={page.action.handler}
			animate={{
				opacity: hideFloatingUI ? 0 : 1,
				scale: hideFloatingUI ? 0.9 : 1,
			}}
			style={{
				marginBottom: `calc(${insetBottom}px + env(safe-area-inset-bottom))`,
			}}
		>
			{page.action.icon}
			<span className="mr-0.5 text-base/none tracking-wide font-semibold uppercase">
				{page.action.label}
			</span>
		</motion.button>
	);
};

const PageContent = ({ onSectionLoaded }) => {
	const { content: _content, pageData } = usePageContext();
	const { data: content } = useDataLoader({
		handler: _content,
		pageData,
	});

	if (!content) return null;

	const pageContent = _.isArray(content) ? content : [content];

	return pageContent.map((section, index) => (
		<PageSection
			key={index}
			{...section}
			onSectionLoaded={onSectionLoaded}
		/>
	));
};

export default function Page() {
	const [headerKey, setHeaderKey] = useState(randomId());
	const { pageResolving } = usePageContext();

	return (
		<>
			<div className="fixed inset-0 overflow-y-auto">
				<div>
					<PageHeader refreshKey={headerKey} />

					<div className="px-5 space-y-8">
						{pageResolving ? (
							<div className="py-12 flex justify-center">
								<Loader />
							</div>
						) : (
							<div className="space-y-8">
								<PageContent
									onSectionLoaded={() =>
										setHeaderKey(randomId())
									}
								/>
							</div>
						)}
						<BottomNavPlaceholder />
					</div>
				</div>
			</div>

			<PageAction />

			<PageNav />
		</>
	);
}
