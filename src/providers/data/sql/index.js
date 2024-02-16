import initSqlJs from "sql.js";

function loadBinaryFile(path) {
	return new Promise((res) => {
		var xhr = new XMLHttpRequest();
		xhr.open("GET", path, true);
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
}

export const loadDb = async (dbUrl) => {
	const SQL = await initSqlJs({
		locateFile: (file) => `https://sql.js.org/dist/${file}`,
	});

	if (dbUrl?.length) {
		const data = await loadBinaryFile(dbUrl);
		return new SQL.Database(data);
		// console.log("Db data: ", data);
	}

	return new SQL.Database();
};

export const sqlFetcher = async ({
	db,
	query, // = "SELECT * FROM renter",
} = {}) => {
	const [res] = db.exec(query);
	const columns = res.columns;

	const rows = res.values.map((entry) => {
		return entry.reduce((agg, value, index) => {
			return {
				...agg,
				[columns[index]]: value,
			};
		}, {});
	});

	return rows;
	// return {
	// 	rows,
	// 	columns,
	// };
};
