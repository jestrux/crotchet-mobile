import Form from "../Form";

export default function FormPage(props) {
	return (
		<div className="pb-8">
			<Form
				{...props}
				onSubmit={async (values) => {
					values = _.keys(values).includes("formField")
						? values.formField
						: values;

					if (props.action?.handler) {
						try {
							const res = await props.action?.handler(values);
							if (!res) return console.log("No return...");

							props.onClose(res);
						} catch (error) {
							window.showAlert(error);
							return;
						}
					}

					props.onClose(values);
				}}
			/>
		</div>
	);
}
