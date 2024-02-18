export default class CrotchetCrawler {
	url;
	siteContent;
	htmlString;

	constructor({ url } = {}) {
		this.url = url;
	}

	crawl = async () => {
		const res = await fetch(
			`https://us-central1-letterplace-c103c.cloudfunctions.net/api/crawl/${encodeURIComponent(
				this.url
			)}`
		).then((res) => res.json());

		const siteContent = document.createElement("div");
		siteContent.innerHTML = res.data;

		this.siteContent = siteContent;

		return siteContent;
	};

	match = async (matcher, query) => {
		this.siteContent = this.siteContent || (await this.crawl());

		if (matcher.indexOf("=>") == -1) {
			const [matcherQuery, attribute = "innerText"] = matcher.split("::");
			const results = Array.from(
				this.siteContent.querySelectorAll(matcherQuery.trim())
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
		const results = Array.from(
			this.siteContent.querySelectorAll(parent)
		).reduce((agg, node) => {
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
		}, []);

		if (query?.length) {
			return results.filter((e) => {
				return Object.entries(e).some(([, value]) =>
					value.toString().toLowerCase().includes(query.toString())
				);
			});
		}

		return results;
	};
}
