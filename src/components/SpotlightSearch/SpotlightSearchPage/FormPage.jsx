import { useRef } from "react";
import { useSpotlightContext } from "../SpotlightContext";
import { useSpotlightPageContext } from "../SpotlightSearchPage/SpotlightPageContext";
import Form from "@/components/Form";
import { useOnInit, useAppContext, dispatch, randomId } from "@/crotchet";

export default function FormPage({ page }) {
	const { withLoader } = useAppContext();
	const { popCurrentSpotlightPage } = useSpotlightContext();
	const { mainAction, setMainAction, preview, pageData } =
		useSpotlightPageContext();
	const wrapperRef = useRef(null);
	const formId = useRef("form" + randomId());
	const handleSubmit = async (values) => {
		const pageAction = mainAction();
		let res = values;
		if (typeof pageAction.__originalHandler == "function") {
			res = await withLoader(() => pageAction.__originalHandler(values), {
				successMessage: pageAction.successMessage,
				errorMessage: pageAction.errorMessage,
			});

			if (!res) return;
		}

		popCurrentSpotlightPage(res);
	};

	useOnInit(() => {
		let action = page?.action;
		if (typeof action == "function") action = action({ page, pageData });

		setMainAction({
			...(action
				? {
						...action,
						__originalHandler: action.handler,
				  }
				: {}),

			handler: () => {
				document
					.querySelector(`#${formId.current} [type="submit"]`)
					?.click();
			},
		});
	});

	return (
		<div ref={wrapperRef} className="px-4 my-7 flex flex-col gap-5">
			<Form
				{...page}
				formId={formId.current}
				horizontalLayout={!preview()}
				onChange={(data) =>
					dispatch("form-data-changed", {
						...data,
						_pageId: page?._id,
					})
				}
				onSubmit={handleSubmit}
			/>
		</div>
	);
}
