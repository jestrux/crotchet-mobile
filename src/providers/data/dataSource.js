export default {
	web: ({
		url,
		bearerToken,
		responseType = "json",
		responseField,
		searchParam = "q",
		params = {},
		headers,
		filters,
		search,
		...otherProps
	} = {}) => {
		return {
			provider: "web",
			url,
			bearerToken,
			responseType,
			responseField,
			searchParam,
			filters,
			headers,
			params,
			search,
			...(otherProps || {}),
		};
	},
	unsplash: (collection, { query, fieldMap, ...otherProps } = {}) => {
		return {
			provider: "unsplash",
			collection,
			query,
			fieldMap: {
				title: "alt_description",
				subtitle: "description",
				image: "urls.regular",
				action: "copy://urls.regular",
				...(fieldMap || {}),
			},
			...(otherProps || {}),
		};
	},
	airtable: ({
		table,
		filters,
		orderBy = "created_at|asc",
		search,
		...otherProps
	} = {}) => {
		return {
			provider: "airtable",
			table,
			filters,
			orderBy,
			search,
			...(otherProps || {}),
		};
	},
	firebase: ({ collection, orderBy, search, ...otherProps } = {}) => {
		return {
			provider: "firebase",
			collection,
			orderBy,
			search,
			...(otherProps || {}),
		};
	},
	sql: ({ dbUrl, query, search, ...otherProps } = {}) => {
		return {
			provider: "sql",
			dbUrl,
			query,
			search,
			...(otherProps || {}),
		};
	},
	crawler: ({
		url,
		match,
		searchable,
		searchableFields,
		search,
		...otherProps
	} = {}) => {
		return {
			provider: "crawler",
			url,
			match,
			searchable,
			searchableFields,
			search,
			...(otherProps || {}),
		};
	},
	crotchet: (name, { q, filters, search, ...otherProps } = {}) => {
		return {
			provider: "crotchet",
			name,
			q,
			filters,
			search,
			...(otherProps || {}),
		};
	},
};
