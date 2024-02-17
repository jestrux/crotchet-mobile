import DataWidget from "@/components/DataWidget";
import { dataSource } from "@/providers/data";

export const SqlWidget = () => {
	return (
		<DataWidget
			source={dataSource.crotchet("pier", {
				query: /*sql*/ `
						SELECT r.image, r.name, json_object('name', a.name, 'image', a.image) as apartment
						FROM renter as r 
						LEFT JOIN apartment as a
						ON r.apartment = a._id
						WHERE r.name = 'Misael Hyatt';
					`,
				fieldMap: {
					title: "name",
					subtitle: "apartment.name",
				},
			})}
		/>
	);
};
