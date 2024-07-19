import { useRef } from "react";
import { useSpotlightContext } from "../SpotlightContext";
import Form from "@/components/Form";

export default function FormPage({ page, onSubmit }) {
	const { popCurrentSpotlightPage } = useSpotlightContext();
	const submitButtonRef = useRef();
	const handleSubmit = async (values) => {
		if (typeof page.onSave == "function") {
			try {
				const res = await page.onSave(values);
				popCurrentSpotlightPage(res);
			} catch (error) {
				console.log("Save error: ", error);
			}
		} else {
			popCurrentSpotlightPage(values);
		}
	};

	if (typeof onSubmit == "function") {
		onSubmit(() => {
			submitButtonRef.current.click();
		});
	}

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
