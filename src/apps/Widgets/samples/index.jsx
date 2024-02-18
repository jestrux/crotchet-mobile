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

{
	/* <div className="grid grid-cols-2 gap-4 p-4˝">
					<WidgetWrapper columnSpan={1}>
						<Widget title="Airtable | Pings">
							<DataFetcher
								source={dataSource.airtable({
									table: "pings",
									filters: {
										recepient_name: user.name,
									},
								})}
								first
							>
								{({ shuffle, ...res }) => {
									return (
										<div className="flex flex-col gap-3">
											{res.isLoading && "Loading..."}
											{res?.data?.sender_name}
											<img
												className="w-16 aspect-square rounded-full object-cover"
												src={res?.data?.sender_image}
												alt=""
											/>
											<button onClick={shuffle}>
												Shuffle
											</button>
										</div>
									);
								}}
							</DataFetcher>
						</Widget>
					</WidgetWrapper>

					<WidgetWrapper columnSpan={1}>
						<Widget title="Firebase - YT Clips">
							<DataFetcher
								source={dataSource.firebase({
									collection: "videos",
									orderBy: "updatedAt,desc",
								})}
								first
							>
								{({ shuffle, ...res }) => {
									return (
										<div className="flex flex-col gap-3">
											{res.isLoading && "Loading..."}
											{res?.data?.name}
											<img
												className="w-full aspect-video object-cover"
												src={res?.data?.poster}
												alt=""
											/>

											<button onClick={shuffle}>
												Shuffle
											</button>
										</div>
									);
								}}
							</DataFetcher>
						</Widget>
					</WidgetWrapper>

					<WidgetWrapper columnSpan={1}>
						<Widget title="Web - Unsplash">
							<DataFetcher
								source={dataSource.web({
									// url: "https://api.unsplash.com/search/photos",
									url: "https://api.unsplash.com/photos/random",
									body: {
										client_id: import.meta.env
											.VITE_unsplashClientId,
										count: 24,
										// query: "girl",
										// per_page: 24,
									},
									// responseField: "results",
								})}
								first
							>
								{({ shuffle, ...res }) => {
									return (
										<div className="flex flex-col gap-3">
											{res.isLoading && "Loading..."}
											{res?.data?.alt_description}
											<img
												className="w-full aspect-video object-cover"
												src={res?.data?.urls?.regular}
												alt=""
											/>
											<button onClick={shuffle}>
												Shuffle
											</button>
										</div>
									);
								}}
							</DataFetcher>
						</Widget>
					</WidgetWrapper>

					<WidgetWrapper columnSpan={1}>
						<Widget title="SQL - Renters">
							<DataFetcher
								source={dataSource.sql({
									query: "SELECT * from renter",
								})}
								first
							>
								{({ shuffle, ...res }) => {
									return (
										<div className="flex flex-col gap-3">
											{res.isLoading && "Loading..."}
											{res.data?.name}
											<img
												className="w-full aspect-video object-cover"
												src={res?.data?.image}
												alt=""
											/>
											<button onClick={shuffle}>
												Shuffle
											</button>
										</div>
									);
								}}
							</DataFetcher>
						</Widget>
					</WidgetWrapper>
				</div> */
}
