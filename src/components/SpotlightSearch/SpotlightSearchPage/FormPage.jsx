import { useRef } from "react";
import { useSpotlightContext } from "../SpotlightContext";
import { useSpotlightPageContext } from "../SpotlightSearchPage/SpotlightPageContext";
import Form from "@/components/Form";
import { useOnInit, useAppContext, dispatch, randomId } from "@/crotchet";
import clsx from "clsx";

export default function FormPage({ page }) {
	const { withLoader } = useAppContext();
	const { popCurrentSpotlightPage } = useSpotlightContext();
	const {
		mainAction,
		setMainAction,
		preview,
		setFormData,
		pageData,
		pageDataVersion,
		formFields,
	} = useSpotlightPageContext();
	const wrapperRef = useRef(null);
	const formId = useRef("form" + randomId());
	const handleSubmit = async (values) => {
		values = _.keys(values).includes("formField")
			? values.formField
			: values;

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

	const horizontalLayout = !preview() && !page?.fullWidth;

	return (
		<div
			ref={wrapperRef}
			className={clsx(
				"flex flex-col gap-5",
				page?.noPadding ? "" : horizontalLayout ? "px-4 my-7" : "p-4"
			)}
		>
			<Form
				// {...page}
				data={pageData}
				key={pageDataVersion}
				fields={formFields()}
				formId={formId.current}
				horizontalLayout={horizontalLayout}
				onChange={(data) => {
					if (page.liveUpdate ?? true) setFormData(data);

					dispatch("form-data-changed", {
						...data,
						_pageId: page?._id,
					});

					if (typeof page?.onChange == "function")
						page.onChange(data);
				}}
				onSubmit={handleSubmit}
			/>
		</div>
	);
}
