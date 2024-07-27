import { useOnInit, registerAction } from "@/crotchet";
import { useRef } from "react";

function PageBuilder({ pageData, formData }) {
	const parentRef = useRef();
	const contentRef = useRef();
	const scaleToFit = () => {
		const div = document.createElement("div");
		div.style.position = "fixed";
		div.innerHTML = pageData.render();
		document.body.appendChild(div);
		const { width, height } = div.getBoundingClientRect();
		div.remove();

		const { width: pWidth } = parentRef.current.getBoundingClientRect();
		const aspectRatio = width / height;
		const outputWidth = pWidth;
		const outputHeight = outputWidth / aspectRatio;

		contentRef.current.style.transform = `scale(${outputWidth / width}, ${
			outputHeight / height
		})`;
	};

	useOnInit(() => {
		setTimeout(scaleToFit, 20);
	});

	return (
		<div className="p-2">
			<div ref={parentRef}>
				<div
					id={pageData.referenceId}
					className="origin-top-left"
					ref={contentRef}
					dangerouslySetInnerHTML={{
						__html: pageData.render(formData),
					}}
				></div>
			</div>
		</div>
	);
}

const moduleFromString = (str) => {
	if (globalThis.URL.createObjectURL) {
		const blob = new Blob([str], { type: "text/javascript" });
		const url = URL.createObjectURL(blob);
		const module = import(url);
		URL.revokeObjectURL(url); // GC objectURLs
		return module;
	}

	return import(`data:text/javascript;base64,${btoa(str)}`);
};

const parseTemplate = async (template, referenceId) => {
	const module = (await moduleFromString(template.contents))?.default;
	const defaultValues = {};
	const fields = Object.entries(module.props).reduce((agg, [name, field]) => {
		defaultValues[name] = field.defaultValue;

		return {
			...agg,
			[name]: {
				...field,
				renderChoice:
					typeof field.renderChoice == "function"
						? (...args) => (
								<div
									dangerouslySetInnerHTML={{
										__html: field.renderChoice(...args),
									}}
								></div>
						  )
						: null,
			},
		};
	}, {});

	return {
		referenceId,
		file: template,
		name: module.label,
		fields,
		data: defaultValues,
		render: (payload) =>
			new module({ ...defaultValues, ...(payload || {}) }).render(),
	};
};

registerAction("editAsset", {
	label: "Page Builder - Edit Asset",
	global: true,
	handler: async (
		_,
		{
			openPage,
			loadExternalAsset,
			getWriteableFile,
			randomId,
			exportContent,
			dispatch,
		}
	) => {
		const importDomToImage = () =>
			loadExternalAsset(
				"https://www.unpkg.com/dom-to-image@2.6.0/dist/dom-to-image.min.js"
			);

		const referenceId = "ref-" + randomId();

		const getTemplate = async (path) => {
			const template = await getWriteableFile(path);

			if (!template?.contents) return;

			return parseTemplate(template, referenceId);
		};

		const template = await getTemplate();

		if (typeof template?.render != "function") return;

		importDomToImage();

		return openPage({
			title: template.name,
			type: "form",
			resolve: ({ fromRefetch } = {}) => {
				if (fromRefetch) return getTemplate(template.file.path);

				return template;
			},
			listenForUpdates: (callback = () => {}) => {
				window.addEventListener(
					"page-template-updated",
					callback,
					false
				);

				return () =>
					window.removeEventListener(
						"page-template-updated",
						callback,
						false
					);
			},
			fields({ pageData } = {}) {
				if (typeof pageData?.render != "function") return null;

				return pageData.fields;
			},
			preview({ pageData, formData } = {}) {
				if (typeof pageData?.render != "function") return null;

				return <PageBuilder pageData={pageData} formData={formData} />;
			},
			action: {
				label: "Download",
				handler: async () => {
					await importDomToImage();

					const dataUrl = await window.domtoimage.toPng(
						document.querySelector("#" + template.referenceId)
					);

					return exportContent(dataUrl, template.referenceId, "png");
				},
				successMessage: "Asset downloaded",
			},
			actions: [
				{
					label: "Edit template",
					handler: async () => {
						return await openPage({
							title: "Edit " + template.name,
							type: "form",
							field: {
								label: "",
								type: "contentEditable",
								defaultValue: template.file.contents,
							},
							noPadding: true,
							fullWidth: true,
							action: {
								label: "Save template",
								handler: async (value) => {
									if (!value) return;
									template.file.save(value);
									dispatch("page-template-updated");
									return true;
								},
							},
						});
					},
				},
			],
		});
	},
});

registerAction("editTemplate", {
	label: "Page Builder - Edit Template",
	global: true,
	handler: async (
		_,
		{ openPage, loadExternalAsset, getWriteableFile, randomId, dispatch }
	) => {
		const referenceId = "ref-" + randomId();

		const getTemplate = async (path) => {
			const template = await getWriteableFile(path);

			if (!template?.contents) return;

			return parseTemplate(template, referenceId);
		};

		const template = await getTemplate();

		if (typeof template?.render != "function") return;

		return await openPage({
			resolve: async () => {
				await loadExternalAsset(
					"https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.35.0/codemirror.js"
				);
				await Promise.all(
					[
						"https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.35.0/codemirror.css",
						"https://cdn.jsdelivr.net/npm/code-mirror-themes@1.0.0/themes/bongzilla.min.css",
						"https://raw.githubusercontent.com/codemirror/codemirror5/master/mode/javascript/javascript.js",
					].map((item) =>
						loadExternalAsset(item, {
							name:
								"codemirror-resource-" + item.split("/").at(-1),
						})
					)
				);
			},
			title: "Edit " + template.name,
			type: "form",
			field: {
				label: "",
				type: "contentEditable",
				defaultValue: template.file.contents,
			},
			noPadding: true,
			fullWidth: true,
			action: {
				label: "Save",
				handler: async (value) => {
					if (!value) return;
					template.file.save(value);
					dispatch("page-template-updated");
					return true;
				},
			},
		});
	},
});
