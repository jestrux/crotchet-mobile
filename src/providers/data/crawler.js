const CrotchetCrawlerCache = {};

export default class CrotchetCrawler {
	url;
	siteContent;
	htmlString;

	constructor(options) {
		const { url, search, matcher } = options;

		this.matcher = matcher;
		this.url = url;
		this.search = search;
	}

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

	match = async (query) => {
		const content = await this.crawl();

		if (this.matcher.indexOf("=>") == -1) {
			const [matcherQuery, attribute = "innerText"] =
				this.matcher.split("::");
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

		const [parent, childrenMatchers] = this.matcher.split("=>");
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

				return [...agg, row];
			},
			[]
		);

		return results;
	};
}
