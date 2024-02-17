import initSqlJs from "sql.js";
import sqliteUrl from "@/assets/sql-wasm.wasm?url";

export default class CrotchetSQL {
	dbUrl;

	constructor({ dbUrl } = {}) {
		this.dbUrl = dbUrl;
	}

	_loadDb = async () => {
		const SQL = await initSqlJs({
			// locateFile: (file) => `https://sql.js.org/dist/${file}`,
			locateFile: () => sqliteUrl,
		});

		if (this.dbUrl?.length) {
			const data = await new Promise((res) => {
				var xhr = new XMLHttpRequest();
				xhr.open("GET", this.dbUrl, true);
				xhr.responseType = "arraybuffer";
				xhr.onload = function () {
					var data = new Uint8Array(xhr.response);
					var arr = new Array();
					for (var i = 0; i != data.length; ++i)
						arr[i] = String.fromCharCode(data[i]);
					res(arr.join(""));
				};
				xhr.send();
			});

			this.db = new SQL.Database(data);
		} else this.db = new SQL.Database();

		return this.db;
	};

	exec = async (query) => {
		const db = this.db || (await this._loadDb());
		const [res] = db.exec(query);
		const columns = res.columns;

		return res.values.map((entry) => {
			return entry.reduce((agg, value, index) => {
				try {
					value = JSON.parse(value);
				} catch (error) {
					//
				}

				return {
					...agg,
					[columns[index]]: value,
				};
			}, {});
		});
	};
}
