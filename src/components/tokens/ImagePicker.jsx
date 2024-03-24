import { showToast } from "@/utils";
import Input from "./Input";

const sweetAlert = (title, description) => {
	if (typeof window.AddOnSdk?.app?.showModalDialog == "function") {
		window.AddOnSdk.app.showModalDialog({
			variant: "error",
			title,
			description: [description],
		});

		return;
	}

	// ToastQueue.negative(`${title} - ${description}`);
	showToast(`${title} - ${description}`);
};
const readFile = (file) => {
	return new Promise((res) => {
		const reader = new FileReader();
		reader.onload = (e) => res(e.target.result);
		reader.readAsDataURL(file);
	});
};

export default function ImagePicker({ children, multiple, onChange }) {
	const processImage = async (e) => {
		const files = e.target.files;

		if (!files?.length) return;

		// onChange(null);

		const supportedFileTypes = ["jpg", "jpeg", "png", "webp", "gif"];
		const maxSize = 6 * 1000000; // 6 MB

		let error;

		const fileList = Array.from(files);
		Array.from(files).forEach((file, index) => {
			const typeSupported =
				!file.type || !file.type.length
					? null
					: supportedFileTypes.find(
							(type) =>
								file.type.toLowerCase().indexOf(type) != -1
					  );

			const fileSize = file.size; // file size in bytes

			if (fileSize > maxSize)
				error = `size ( ${(fileSize / 1000000).toFixed(1)} MB )`;
			if (!typeSupported) error = `type (${file.type})`;

			if (!typeSupported || fileSize > maxSize) fileList.splice(index, 1);
		});

		if (!fileList.length && error) {
			const message =
				error.indexOf("type") != -1
					? `Invalid file ${error}. Please pick an image with from one of these types .${supportedFileTypes.join(
							",."
					  )}.`
					: `File ${error} is too large. Max file size is ${
							maxSize / 1000000
					  } MB.`;

			e.target.value = "";

			return sweetAlert(
				error.indexOf("type") != -1
					? "Unsupported file type"
					: "File too large",
				message
			);
		}

		const res = await (multiple
			? Promise.all(Array.from(fileList).map(readFile))
			: readFile(fileList[0]));

		onChange(res);

		e.target.value = "";
	};

	// return (
	// 	<Button elementType="label" width="100%" variant="accent">
	// 		<Input
	// 			className="hidden"
	// 			type="file"
	// 			name="image"
	// 			onChange={processImage}
	// 			{...(multiple ? { multiple: true } : {})}
	// 		/>
	// 		{multiple ? "Add images from device" : "Add image from device"}
	// 	</Button>
	// );

	if (children) {
		return (
			<label
				className="cursor-pointer"
				onClick={(e) => e.stopPropagation()}
			>
				<Input
					className="hidden"
					type="file"
					name="image"
					onChange={processImage}
					accept=".jpg, .png, .jpeg, .gif|image/*"
					{...(multiple ? { multiple: true } : {})}
				/>
				{children}
			</label>
		);
	}

	return (
		<label
			className="hoverable border border-primary bg-primary text-white block w-full text-center flex center-center gap-2 rounded-full"
			style={{ height: "40px", fontSize: "0.82rem" }}
		>
			<Input
				className="hidden"
				type="file"
				name="image"
				onChange={processImage}
				accept=".jpg, .png, .jpeg, .gif|image/*"
				{...(multiple ? { multiple: true } : {})}
			/>

			{multiple ? (
				<svg fill="currentColor" height="18" viewBox="0 0 24 24">
					<path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9h-4v4h-2v-4H9V9h4V5h2v4h4v2z" />
				</svg>
			) : (
				<svg fill="currentColor" height="18" viewBox="0 0 24 24">
					<path d="M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z" />
				</svg>
			)}

			{multiple ? "Upload images" : "Upload image"}
		</label>
	);
}
