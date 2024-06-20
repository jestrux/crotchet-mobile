import { getShareActions, registerActionSheet } from "@/crotchet";

registerActionSheet("share", async (payload = {}, { utils }, onChange) => {
	const mainActionNames = ["share", "copy", "copyImage", "download", "open"];
	let content = { ...payload };
	const setContent = (newValues) => {
		content = {
			...content,
			...newValues,
		};
	};

	const processData = () => {
		const { image, subtitle, url, text } = content;

		if (image?.length) {
			return setContent({
				preview: image,
				...(!subtitle && !image.startsWith("data:")
					? { subtitle: image }
					: {}),
			});
		}

		const value = url?.length ? url : text?.length ? text : null;

		if (!value) return;

		if (!subtitle) {
			setContent({
				subtitle: value,
			});
		}

		if (utils.isValidUrl(value)) {
			setContent({
				url: value,
			});

			utils
				.crawlUrl(value)
				.then((res) => {
					const { image, title, description } = res.meta || {};
					setContent(
						utils.cleanObject({
							preview: image || content?.preview,
							title: title || content?.title,
							subtitle: description || content?.subtitle,
							data: res.data,
						})
					);

					const shareActions = getShareActions(
						content,
						window.__crotchet.actions,
						mainActionNames
					);

					onChange({
						...content,
						actions: shareActions,
						previewImage: content.preview,
						preview: {
							image: content.preview,
							title: content.title,
							description: content.subtitle || content.url,
						},
					});
				})
				.catch(() => {
					//
				});
		}
	};

	processData();

	const shareActions = getShareActions(
		content,
		window.__crotchet.actions,
		mainActionNames
	);

	const res = {
		...content,
		actions: shareActions,
		previewImage: content.preview,
		preview: {
			image: content.preview,
			title: content.title,
			description: content.subtitle || content.url,
		},
	};

	return res;
});
