import initSqlJs from "sql.js";
import sqliteUrl from "@/assets/sql-wasm.wasm?url";

let SQL;
const CrotchetSQLCache = {};

export default class CrotchetSQL {
	dbUrl;

	constructor({ dbUrl } = {}) {
		this.dbUrl = dbUrl;
	}

	_loadDb = async () => {
		if (CrotchetSQLCache[this.dbUrl]) return CrotchetSQLCache[this.dbUrl];

		if (!SQL) {
			SQL = await initSqlJs({
				// locateFile: (file) => `https://sql.js.org/dist/${file}`,
				locateFile: () => sqliteUrl,
			});
		}

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

			const db = new SQL.Database(data);

			CrotchetSQLCache[this.dbUrl] = db;

			return db;
		}

		return new SQL.Database();
	};

	exec = async (query) => {
		const db = await this._loadDb();
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
