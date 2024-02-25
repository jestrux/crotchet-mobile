const CrotchetCrawlerCache = {};

export default class CrotchetCrawler {
	url;
	siteContent;
	htmlString;

	constructor(options) {
		const { url, search, map } = options;

		this.url = url;
		this.search = search;
		this.map = map;
	}

	_map = (entry) => (this.map ? this.map(entry) : entry);

	_search = (results, query) => {
		if (!query?.length) return results;

		if (typeof this.search == "function")
			return this.search(results, query);

		return results.filter((e) => {
			return Object.entries(e).some(([, value]) =>
				value.toString().toLowerCase().includes(query.toString())
			);
		});
	};

	crawl = async () => {
		if (CrotchetCrawlerCache[this.url])
			return CrotchetCrawlerCache[this.url];

		const res = await fetch(
			`https://us-central1-letterplace-c103c.cloudfunctions.net/api/crawl/${encodeURIComponent(
				this.url
			)}`
		).then((res) => res.json());

		const siteContent = document.createElement("div");
		siteContent.innerHTML = res.data;

		CrotchetCrawlerCache[this.url] = siteContent;

		return siteContent;
	};

	match = async (matcher, query) => {
		const content = await this.crawl();

		if (matcher.indexOf("=>") == -1) {
			const [matcherQuery, attribute = "innerText"] = matcher.split("::");
			const results = Array.from(
				content.querySelectorAll(matcherQuery.trim())
			).map((node) => {
				return node[attribute] || getComputedStyle(node)[attribute];
			});

			if (query?.length) {
				results.filter((entry) =>
					entry.toLowerCase().includes(query.toLowerCase())
				);
			}

			return results;
		}

		const [parent, childrenMatchers] = matcher.split("=>");
		const results = Array.from(content.querySelectorAll(parent)).reduce(
			(agg, node) => {
				const row = {};
				const children = childrenMatchers.split("|");
				children.forEach((child) => {
					const [key, matcher, attribute = "innerText"] =
						child.split("::");
					const childNode = node.querySelector(matcher);
					row[key.trim()] =
						childNode[attribute] ||
						getComputedStyle(childNode)[attribute];
				});

				return [...agg, this._map(row)];
			},
			[]
		);

		return this._search(results, query);
	};
}
