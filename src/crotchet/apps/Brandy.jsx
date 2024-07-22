import { registerAction, isValidEmail } from "@/crotchet";

registerAction("brandySearchUserShareAction", {
	icon: "🥃",
	label: "Brandy - Search User",
	context: "share",
	match: ({ text }) => isValidEmail(text),
	handler: ({ text }, { actions }) =>
		actions.brandySearchUser.handler({ email: text }),
});

registerAction("brandySearchUser", {
	label: "Brandy - Search User",
	global: true,
	icon: "🥃",
	handler: async (
		{ email: copiedEmail },
		{
			isValidEmail,
			openForm,
			copyToClipboard,
			exportContent,
			readClipboard,
			openPage,
			networkRequest,
			getMarkdownTable,
		}
	) => {
		const doSearch = (email) =>
			networkRequest(
				`https://app.brandyhq.com/brandy-admin/user/${email}`,
				{
					secretToken: "X-BRANDY-ADMIN-CODE",
				}
			);

		const downloadData = ({ pageData: user }) => {
			exportContent(
				JSON.stringify(user, null, 4),
				`brandy-user-${user.first_name}-${user.last_name}`,
				"json"
			);
		};

		const copyData = ({ pageData: user }) => {
			copyToClipboard(JSON.stringify(user, null, 4), {
				message: "User data copied",
			});
		};

		var email = copiedEmail;
		let data;
		if (!copiedEmail) {
			copiedEmail = (await readClipboard())?.value?.replace(
				"mailto:",
				""
			);

			data = await openForm({
				title: "Brandy - Search User",
				field: {
					label: "User's email address",
					placeholder: "E.g. james@example.com",
					defaultValue: isValidEmail(copiedEmail)
						? copiedEmail
						: "wakyj07@gmail.com",
				},
				action: {
					label: "Search",
					handler: (email) => {
						if (!email?.length) return null;
						return doSearch(email);
					},
				},
			});
		}

		if (!data && !email) return;

		return openPage({
			title: "Brandy - Search User",
			fullHeight: true,
			resolve: () => {
				if (data) return data;

				return doSearch(email);
			},
			action: {
				label: "Download user data",
				handler: downloadData,
			},
			secondaryAction: {
				label: "Copy user data",
				handler: copyData,
			},
			actions: [
				{ label: "Copy user data", handler: copyData },
				{ label: "Download user data", handler: downloadData },
			],
			content: (user) => {
				user = data || user;

				if (!user) return "";

				return {
					type: "markdown",
					value: [
						`## ${[user.first_name, user.last_name].join(" ")} ( ${
							user.email
						} )`,
						`### Orgs:`,
						getMarkdownTable(
							user.organisation.map((org) => ({
								Name: `<button class="underline font-semibold" onclick="window.__crotchet.openUrl('https://app.brandyhq.com/${org.name}')">${org.company_name}</button>`,
								Plan: org.admin?.plan?.name,
								"Total Assets(Mbs)":
									org.totalAssetSizeInMb?.toFixed(2),
								Admin: org.admin?.email,
							}))
						),
						`### Stripe:`,
						getMarkdownTable([
							{
								"Customer ID": user.stripe_customer_id,
								Subscription: `${user.stripe_subscription_id} ( ${user.stripe_subscription_type} )`,
								Coupon: user.stripe_coupon_id || "None",
							},
						]),
					].join("\n"),
				};
			},
		});
	},
});

registerAction("brandySearchOrg", {
	label: "Brandy - Search Organisation",
	global: true,
	icon: "🥃",
	handler: async (
		_,
		{ openForm, openPage, networkRequest, getMarkdownTable }
	) => {
		const name = await openForm({
			title: "Brandy - Search Organisation",
			field: {
				label: "Organisation name",
				placeholder: "E.g. akil",
			},
		});

		if (!name?.length) return;

		return openPage({
			title: "Organisation Details",
			fullHeight: true,
			resolve: () =>
				networkRequest(
					`https://app.brandyhq.com/brandy-admin/org/${name}`,
					{
						secretToken: "X-BRANDY-ADMIN-CODE",
					}
				),
			content: (org) =>
				!org
					? ""
					: [
							{
								type: "markdown",
								value: [
									`## <button class="underline font-semibold" onclick="window.__crotchet.openUrl('https://app.brandyhq.com/${org.name}')">${org.company_name}</button>`,
									getMarkdownTable([
										{
											Public: !org.is_private,
											Plan: org.admin?.plan?.name,
											"Total Assets":
												org.totalAssetSizeInMb?.toFixed(
													2
												) + "Mbs",
											Admin: org.admin?.email,
										},
									]),
									"### Users",
									getMarkdownTable(
										org.users.map(({ user, role }) => ({
											Name: [
												user.first_name,
												user.last_name,
											].join(" "),
											Email: user.email,
											Role: role,
										}))
									),
								].join("\n"),
							},
					  ],
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

		return openPage({
			title: "Promo Code Details",
			fullHeight: true,
			resolve: () =>
				networkRequest(
					`https://app.brandyhq.com/brandy-admin/promo/${code}`,
					{
						secretToken: "X-BRANDY-ADMIN-CODE",
					}
				),
			content: (promo) =>
				!promo
					? true
					: {
							type: "jsonObject",
							value: promo,
					  },
		});
	},
});
