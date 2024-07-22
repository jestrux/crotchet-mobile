import { useRef } from "react";
import { useSpotlightContext } from "../SpotlightContext";
import Form from "@/components/Form";
import { useOnInit, useAppContext } from "@/crotchet";

export default function FormPage({ page, onSubmit }) {
	const { withLoader } = useAppContext();
	const { popCurrentSpotlightPage } = useSpotlightContext();
	const submitButtonRef = useRef();
	const handleSubmit = async (values) => {
		var res = values;
		if (page.action) {
			res = await withLoader(() => page.action.handler(values), {
				successMessage: page.action.successMessage,
				errorMessage: page.action.errorMessage,
			});
			if (!res) return;
		}

		popCurrentSpotlightPage(res);
	};

	useOnInit(() => {
		if (typeof onSubmit == "function") {
			onSubmit(() => {
				submitButtonRef.current.click();
			});
		}
	});

	return (
		<div className="px-4 my-7 flex flex-col gap-5">
			<Form
				{...page}
				submitButtonRef={submitButtonRef}
				onSubmit={handleSubmit}
			/>
		</div>
	);
}
