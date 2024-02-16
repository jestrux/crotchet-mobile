export const model_table = (model) => {
	return (model?.name || "").toLowerCase();
};

export const createModel = ({ db, model, data }) => {
	const fields = ["_id", ...model.fields.map((f) => f.label)];
	const columns = fields.map((f) => `${f} text`).join(", ");
	const _data = data
		.map((row) => {
			const cols = fields
				.map((field) => {
					const value = row[field].toString().replaceAll("'", "''");
					return `'${value}'`;
				})
				.join(",");
			return `(${cols})`;
		})
		.join(",");

	const table = model_table(model);
	const create = `CREATE TABLE ${table} (${columns});`;
	const insert = `INSERT INTO ${table} (${fields.join(
		","
	)}) VALUES ${_data};`;

	// console.log("Stmt: ", `${create} \ ${data?.length ? insert : ""}`);

	db.run(`${create} \ ${data?.length ? insert : ""}`);
};

export const queryModel = ({ db, model }) => {
	// const stmt = db.prepare("SELECT * FROM hello WHERE a=:aval AND b=:bval");
	// const res = stmt.getAsObject({ ":aval": 1, ":bval": "world" });
	// stmt.free();
	// return res;

	return db.exec(`SELECT * FROM ${model_table(model)};`);
};

export const modelFieldsObject = (model) =>
	(model?.fields || []).reduce(
		(agg, entry) => ({ ...agg, [entry.label]: entry }),
		{
			_id: { label: "_id", type: "string" },
		}
	);

export const queryModelString = (model, options = {}) => {
	const table = model_table(model);
	let searchField = model.display_field;
	let searchValue = (options || {})?.q;
	if (searchValue?.length) {
		const [field, value] = searchValue.toString().split(":");
		if (value?.length) {
			searchField = field;
			searchValue = value;
		}
	}
	let searchQuery = (options || {})?.q
		? `WHERE ${searchField} LIKE '%${searchValue}%'`
		: "";

	let query = `SELECT * FROM ${model_table(model)} ${searchQuery};`;
	const referenceFields = model.fields.filter(
		({ type }) => type == "reference"
	);
	if (referenceFields.length) {
		const r = () => `md${Math.random().toFixed(4).replace("0.", "")}`;
		const baseModelKey = r();
		const fieldsObject = modelFieldsObject(model);
		const fieldNames = Object.keys(fieldsObject);
		let fieldSelector = fieldNames
			.filter(
				(fieldName) =>
					!["reference", "multi-reference"].includes(
						fieldsObject[fieldName].type
					)
			)
			.map((fieldName) => {
				return `${baseModelKey}.${fieldName} as ${fieldName}`;
			})
			.join(", ");

		let joinQueries = "";

		let fullSearchField = `${baseModelKey}.${searchField}`;

		referenceFields.forEach((field) => {
			const { model, mainField } = field.meta;
			const joinedTable = model_table({ name: model });
			const modelKey = r();

			if (searchField == field.label)
				fullSearchField = `${modelKey}.${mainField}`;
			fieldSelector += `, json_object('_id', ${modelKey}._id, 'name', ${modelKey}.${mainField}) as ${joinedTable}`;
			joinQueries += `LEFT JOIN (SELECT _id, ${mainField} FROM ${joinedTable}) as ${modelKey} ON ${baseModelKey}.${field.label} = ${modelKey}._id`;
		});

		const searchQuery = (options || {})?.q
			? `WHERE ${fullSearchField} LIKE '%${searchValue}%'`
			: "";

		const innerQuery = `SELECT ${fieldNames.join(",")} FROM ${table}`;
		query = `SELECT ${fieldSelector} FROM (${innerQuery}) as ${baseModelKey} ${joinQueries} ${searchQuery};`;
	}

	return query;
};
