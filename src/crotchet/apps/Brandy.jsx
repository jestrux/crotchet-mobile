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
			copyToClipboard,
			exportContent,
			readClipboard,
			openPage,
			networkRequest,
			getMarkdownTable,
		}
	) => {
		var copiedEmail = (copiedEmail = (
			await readClipboard()
		)?.value?.replace("mailto:", ""));

		var email = await openForm({
			title: "Brandy - Search User",
			field: {
				label: "User's email address",
				placeholder: "E.g. james@example.com",
				defaultValue: isValidEmail(copiedEmail) ? copiedEmail : "",
			},
		});

		if (!email?.length) return;

		return openPage({
			title: "Brandy - Search User",
			fullHeight: true,
			resolve: () =>
				networkRequest(
					`https://app.brandyhq.com/brandy-admin/user/${email}`,
					{
						secretToken: "X-BRANDY-ADMIN-CODE",
					}
				),
			action: {
				label: "Download user data",
				handler: ({ pageData: user }) => {
					exportContent(
						JSON.stringify(user, null, 4),
						`brandy-user-${user._first_name}-${user.last_name}`,
						"json"
					);
				},
			},
			secondaryAction: {
				label: "Copy user data",
				handler: ({ pageData: user }) => {
					copyToClipboard(JSON.stringify(user, null, 4));
				},
			},
			actions: [
				{ label: "Copy user data", handler: () => {} },
				{ label: "Download user data", handler: () => {} },
			],
			content: (user) => {
				if (!user) return true;

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
			content: async () =>
				await networkRequest(
					`https://app.brandyhq.com/brandy-admin/org/${name}`,
					{
						secretToken: "X-BRANDY-ADMIN-CODE",
					}
				).then((org) =>
					!org
						? null
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
						  ]
				),
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
