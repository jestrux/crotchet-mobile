import {
	registerDataSource,
	formatDate,
	registerAction,
	registerApp,
	useAppContext,
	SearchPage,
} from "@/crotchet";

// registerDataSource("sql", "pier", {
// 	dbUrl: "https://firebasestorage.googleapis.com/v0/b/letterplace-c103c.appspot.com/o/dev.db?alt=media&token=9493e08d-9b41-4760-8d86-20be77393280",
// });

registerDataSource("libSql", "pier", {
	dbUrl: "libsql://pier-test-jestrux.turso.io",
	authToken: import.meta.env.VITE_libSqlAuthToken,
});

registerDataSource("crotchet://pier", "renters", {
	query: /*sql*/ `
		SELECT r.image, r.name, r.due_date, (case when r.verified = 1 then 'verified' else 'pending' end) as verified, json_object('name', a.name, 'image', a.image) as apartment
		FROM renter as r
		LEFT JOIN apartment as a
		ON r.apartment = a._id;
	`,
	mapEntry: (entry) => ({
		image: entry.image,
		title: entry.name,
		subtitle: formatDate(entry.due_date),
		status: entry.verified,
	}),
	filter: "status",
	searchFields: ["name"],
	layoutProps: {
		layout: "grid",
	},
});

registerDataSource("crotchet://pier", "apartments", {
	query: /*sql*/ `
		SELECT a.*, c.name as complex
		FROM apartment as a
		LEFT JOIN complex as c
		ON a.complex = c._id;
	`,
	mapEntry: (entry) => ({
		image: entry.image,
		title: entry.name,
		subtitle: Number(entry.rent).toLocaleString(),
	}),
	filter: "type",
	searchFields: ["name"],
	layoutProps: {
		layout: "grid",
	},
});

registerAction("rentersByStatus", (_, { openPage, dataSources }) => {
	const source = dataSources.renters;
	const rentersVerificationQuery = (status) => /*sql*/ `
		SELECT r.image, r.name, r.due_date, (case when r.verified = 1 then 'verified' else 'pending' end) as verified, json_object('name', a.name, 'image', a.image) as apartment
		FROM renter as r 
		LEFT JOIN apartment as a
		ON r.apartment = a._id
		WHERE verified = ${status};
	`;

	openPage({
		image: "gradient",
		// gradient: "random",
		content: [
			{
				title: "Pending approval",
				type: "data",
				source: {
					...source,
					fieldMap: {
						...source.fieldMap,
						status: null,
						subtitle: "apartment.name",
						trailing: "due_date|date",
					},
					query: rentersVerificationQuery(0),
				},
			},
			{
				title: "Verified renters",
				type: "data",
				source: {
					...source,
					fieldMap: {
						...source.fieldMap,
						subtitle: "apartment.name",
					},
					query: rentersVerificationQuery(1),
				},
			},
		],
	});
});

registerAction("overdueRenters", (_, { openPage, dataSources }) =>
	openPage({
		fullHeight: true,
		image: "random",
		title: "Overdue renters",
		subtitle: "Click a renter to chat with them on Whatsapp.",
		source: {
			...dataSources.renters,
			query: /*sql*/ `
				SELECT r.image, r.name as title, CONCAT("Tsh. ", FORMAT("%,d", a.rent)) as amount, a.name as apartment, REPLACE(REPLACE(r.phone, ' ', ''), '+', '') as phone, CONCAT('https://api.whatsapp.com/send/?text=', 'Hey ', r.name, ',\nYour rent: ', printf("%,d", a.rent), ' is due on: ', strftime('%d / %m', r.due_date), '&phone=', phone) as whatsapp
				FROM renter as r 
				LEFT JOIN apartment as a
				ON r.apartment = a._id
			`,
		},
	})
);

registerApp("laCroix", () => {
	return {
		icon: (
			<svg fill="currentColor" viewBox="0 0 24 24">
				<path d="M11.068 0 22.08 6.625v12.573L13.787 24V11.427L2.769 4.808 11.068 0ZM1.92 18.302l8.31-4.812v9.812l-8.31-5Z" />
			</svg>
		),
		name: "La Croix",
		main: function LaCroix() {
			const { dataSources } = useAppContext();
			return (
				<SearchPage autoFocus={false} source={dataSources.renters} />
			);
		},
	};
});
