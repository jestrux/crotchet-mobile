import DataWidget from "@/components/DataWidget";
import { dataSource } from "@/providers/data";
import { shuffle } from "@/utils";
import { Clipboard } from "@capacitor/clipboard";
import { Share } from "@capacitor/share";

export const overdueRent = ({ openBottomSheet }) => {
	return {
		label: "Overdue rents",
		handler: () =>
			openBottomSheet({
				title: "Overdue renters",
				content: (
					<DataWidget
						source={dataSource.crotchet("pier", {
							query: /*sql*/ `
							SELECT a.image, REPLACE(REPLACE(r.phone, ' ', ''), '+', '') as phone, r.name as title, CONCAT('https://api.whatsapp.com/send/?text=', 'Hey ', r.name, ',\nYour rent: ', printf("%,d", a.rent), ' is due on: ', strftime('%d / %m', r.due_date), '&phone=', phone) as whatsapp
							FROM renter as r 
							LEFT JOIN apartment as a
							ON r.apartment = a._id
						`,
							fieldMap: {
								// title: "name",
								subtitle: "phone",
								action: "whatsapp",
							},
						})}
						// limit={4}
					/>
				),
			}),
	};
};

export const shareRandomPicture = ({ dataSources }) => {
	return {
		// label: "Overdue rents",
		handler: async () => {
			const data = await dataSources.unsplash.handler();
			const image = shuffle(data)[0];

			const url = image.urls.regular;
			const title = image.alt_description;
			const description = image.description;
			fetch(url)
				.then((response) => response.blob())
				.then((blob) => {
					const reader = new FileReader();

					reader.onload = async () => {
						const image = reader.result;

						try {
							await Clipboard.write({
								image,
							});

							await Share.share({
								title,
								text: description,
								url,
								dialogTitle: "A cool image for ya!",
							});

							// setTimeout(() => {
							// 	alert("Copied!");
							// }, 50);
						} catch (error) {
							// alert(error);
						}
					};

					reader.readAsDataURL(blob);
				});
		},
	};
};
