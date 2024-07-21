import { useRef } from "react";
import { useSpotlightContext } from "../SpotlightContext";
import Form from "@/components/Form";
import { useOnInit } from "@/crotchet";

export default function FormPage({ page, onSubmit }) {
	const { popCurrentSpotlightPage } = useSpotlightContext();
	const submitButtonRef = useRef();
	const handleSubmit = async (values) => {
		popCurrentSpotlightPage(values);
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
