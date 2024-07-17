import { registerAction } from "@/crotchet";

registerAction("brandySearchUser", {
	label: "Brandy - Search User",
	global: true,
	icon: "🥃",
	handler: async (
		_,
		{
			isValidEmail,
			openForm,
			readClipboard,
			showToast,
			openPage,
			networkRequest,
		}
	) => {
		var copiedEmail;
		try {
			copiedEmail = (await readClipboard())?.value?.replace(
				"mailto:",
				""
			);
		} catch (error) {
			showToast("Error: " + error);
		}

		var email = await openForm({
			title: "Brandy - Search User",
			field: {
				label: "User's email address",
				placeholder: "E.g. james@example.com",
				defaultValue: isValidEmail(copiedEmail) ? copiedEmail : "",
			},
		});

		if (!email?.length) return;

		const user = await networkRequest(
			`https://app.brandyhq.com/brandy-admin/user/${email}`,
			{
				secretToken: "X-BRANDY-ADMIN-CODE",
			}
		);

		if (!user) return null;

		return openPage({
			title: "User Details",
			fullHeight: true,
			content: {
				type: "jsonObject",
				value: user,
			},
		});
	},
});

registerAction("brandySearchOrg", {
	label: "Brandy - Search Organisation",
	global: true,
	icon: "🥃",
	handler: async (_, { openForm, openPage, networkRequest }) => {
		const name = await openForm({
			title: "Brandy - Search Organisation",
			field: {
				label: "Organisation name",
				placeholder: "E.g. akil",
			},
		});

		if (!name?.length) return;

		const organisation = await networkRequest(
			`https://app.brandyhq.com/brandy-admin/user/${name}`,
			{
				secretToken: "X-BRANDY-ADMIN-CODE",
			}
		);

		if (!organisation) return null;

		return openPage({
			title: "Organisation Details",
			fullHeight: true,
			content: {
				type: "jsonObject",
				value: organisation,
			},
		});
	},
});

registerAction("brandySearchPromoCode", {
	label: "Brandy - Search Promo Code",
	global: true,
	icon: "🥃",
	handler: async (_, { openForm, openPage, networkRequest }) => {
		const code = await openForm({
			title: "Brandy - Search Promo Code",
			field: {
				label: "Promo Code",
				defaultValue: "JNO0RTT6",
			},
		});

		if (!code?.length) return;

		const promo = await networkRequest(
			`https://app.brandyhq.com/brandy-admin/promo/${code}`,
			{
				secretToken: "X-BRANDY-ADMIN-CODE",
			}
		);

		if (!promo) return null;

		return openPage({
			title: "Promo Code Details",
			fullHeight: true,
			content: {
				type: "jsonObject",
				value: promo,
			},
		});
	},
});
