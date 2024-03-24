import { createClient } from "@libsql/client";

export const CrotchetLibSQLCache = {};

export default class CrotchetLibSQL {
	constructor({ dbUrl, authToken } = {}) {
		this.client = createClient({
			url: dbUrl,
			authToken,
		});
	}

	exec = async ({ query }) => {
		if (!query?.length) return console.log("No libsql query passed");

		const res = await this.client.execute(query);

		return res.rows;

		// const db = await this._loadDb();
		// const [res] = db.exec(query);
		// const columns = res.columns;

		// return res.values.map((entry) => {
		// 	return entry.reduce((agg, value, index) => {
		// 		try {
		// 			value = JSON.parse(value);
		// 		} catch (error) {
		// 			//
		// 		}

		// 		return {
		// 			...agg,
		// 			[columns[index]]: value,
		// 		};
		// 	}, {});
		// });
	};
}
