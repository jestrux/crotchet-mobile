import { dataSource } from "@/providers/data";
import { shuffle } from "@/utils";
import { Clipboard } from "@capacitor/clipboard";
import { Share } from "@capacitor/share";

export const rentersByStatus = ({ openPage, actualSource }) => {
	const source = actualSource(dataSource.crotchet("renters"));

	return () =>
		openPage({
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
						query: source.query.replace(";", " WHERE verified = 0"),
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
						query: source.query.replace(";", " WHERE verified = 1"),
					},
				},
			],
		});
};

export const overdueRenters = ({ openPage }) => {
	return () =>
		openPage({
			image: "gradient",
			// gradient: "random",
			title: "Overdue renters",
			subtitle: "Click a renter to chat with them on Whatsapp.",
			content: [
				{
					type: "data",
					// limit={4}
					source: dataSource.crotchet("pier", {
						query: /*sql*/ `
								SELECT r.image, r.name as title, CONCAT("Tsh. ", FORMAT("%,d", a.rent)) as amount, a.name as apartment, REPLACE(REPLACE(r.phone, ' ', ''), '+', '') as phone, CONCAT('https://api.whatsapp.com/send/?text=', 'Hey ', r.name, ',\nYour rent: ', printf("%,d", a.rent), ' is due on: ', strftime('%d / %m', r.due_date), '&phone=', phone) as whatsapp
								FROM renter as r 
								LEFT JOIN apartment as a
								ON r.apartment = a._id
							`,
						fieldMap: {
							// title: "name",
							subtitle: "apartment",
							trailing: "amount",
							action: "whatsapp",
						},
					}),
				},
			],
		});
};

export const shareRandomPicture = ({ dataSources }) => {
	return async () => {
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
	};
};

export const getRandomPicture = ({ dataSources, copyImage }) => {
	return async () => {
		const data = await dataSources.unsplash.handler();
		const image = shuffle(data)[0];
		copyImage(image);
	};
};
