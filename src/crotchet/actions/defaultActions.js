import { firebaseUploadFile } from "@/providers/data/firebase/useFirebase";
import unsplashFetcher from "@/providers/data/unsplash";
import { openUrl, readClipboard, shuffle } from "@/crotchet";
import dataSource from "@/providers/data/dataSource";

export const uploadFile = async ({ showToast }) => {
	await firebaseUploadFile();
	showToast("Uploaded");
};

export const getRandomYoutubeClip = async ({ dataSources }) => {
	const res = await dataSources.ytClips.random();
	openUrl(res.url);
};

// export const updateWhyLead = async ({ showToast }) => {
// 	await firebaseUploadFile({
// 		name: "index.html",
// 		file: new Blob([(await readClipboard()).value], {
// 			type: "text/html",
// 		}),
// 	});

// 	showToast("WhyLead updated");

// 	return;
// };

export const rentersByStatus = ({ openPage, actualSource }) => {
	const source = actualSource(dataSource.crotchet("renters"));
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

export const overdueRenters = ({ openPage }) =>
	openPage({
		image: "random",
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

export const getRandomPicture = async ({ copyImage, showToast }) => {
	try {
		const data = await unsplashFetcher();
		const image = shuffle(data)[0].urls.regular;
		await copyImage(image);
		showToast("Image copied!");
		return;
	} catch (error) {
		console.log("Error: ", error);
		showToast(error);
	}
};