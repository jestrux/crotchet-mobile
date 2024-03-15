import { registerDataSource, DataWidget, formatDate } from "@/crotchet";
import { useAppContext } from "@/providers/app";

registerDataSource("sql", "pier", {
	dbUrl: "https://firebasestorage.googleapis.com/v0/b/letterplace-c103c.appspot.com/o/dev.db?alt=media&token=9493e08d-9b41-4760-8d86-20be77393280",
	query: /*sql*/ `
		SELECT r.image, r.name, r.due_date, (case when r.verified = 1 then 'verified' else 'pending' end) as verified, json_object('name', a.name, 'image', a.image) as apartment
		FROM renter as r
		LEFT JOIN apartment as a
		ON r.apartment = a._id;
	`,
	// fieldMap: {
	// 	title: "name",
	// 	subtitle: "due_date|date",
	// 	status: "verified",
	// },
	mapEntry: (entry) => ({
		image: entry.image,
		title: entry.name,
		subtitle: formatDate(entry.due_date),
		status: entry.verified,
	}),
	searchFields: ["name"],
});

export default function RentersWidget() {
	const { dataSources } = useAppContext();

	return (
		<DataWidget
			source={dataSources.pier}
			widgetProps={{
				icon: "user",
				title: "Renters",
				actions: [
					{
						icon: "list",
						url: "crotchet://action/rentersByStatus",
					},
				],
			}}
		/>
	);
}
