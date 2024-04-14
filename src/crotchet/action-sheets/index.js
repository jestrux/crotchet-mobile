import { cleanObject, registerActionSheet } from "@/crotchet";

registerActionSheet(
	"share",
	async (payload = {}, { actions, onDesktop, utils }, onChange) => {
		const mainActionNames = [
			"share",
			"copy",
			"copyImage",
			"download",
			"open",
		];

		let content = { ...payload };

		const setContent = (newValues) => {
			content = {
				...content,
				...newValues,
			};
		};

		const getShareActions = () => {
			const { image, url, text, download, scheme, state = {} } = content;
			return Object.entries(actions).reduce((agg, [name, action]) => {
				if (
					action.context != "share" ||
					(action.mobileOnly && onDesktop())
				)
					return agg;

				let matches = Object.keys(cleanObject(url, text)).length > 0;

				const match = action.match;

				if (_.isFunction(match)) {
					matches = match({
						image,
						url,
						text,
						download,
						scheme,
						state,
					});
				} else if (
					["image", "url", "text", "download"].includes(match)
				) {
					matches = {
						image,
						url,
						text,
						download,
					}[match]?.length;
				}

				if (!matches) return agg;

				return [
					...agg,
					{
						...action,
						main: mainActionNames.includes(name),
						// handler: () => action.handler(content),
					},
				];
			}, []);
		};

		const processData = () => {
			const { image, subtitle, url, text } = content;

			if (image?.length) {
				return setContent({
					preview: image,
					subtitle: subtitle || image,
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
				// if (preview && (title || subtitle)) return;

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

						const shareActions = getShareActions();

						onChange({
							...content,
							actions: shareActions,
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

		const shareActions = getShareActions();

		const res = {
			...content,
			actions: shareActions,
			preview: {
				image: content.preview,
				title: content.title,
				description: content.subtitle || content.url,
			},
		};

		return res;
	}
);
