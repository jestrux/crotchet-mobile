import BarChart from "./bar-chart";
import PieChart from "./pier-chart";

export class ChartDrawer {
	constructor() {
		this.width = 1000;
		this.height = 1000;
	}

	async draw(props = {}) {
		Object.assign(this, props);

		return this.drawImage();
	}

	async drawImage() {
		const chartProperties = Object.assign(
			{
				...(this.settings ? this.settings : {}),
			},
			this
		);

		const res = {
			pie: new PieChart(chartProperties).toDataURL(),
			bar: new BarChart(chartProperties).toDataURL(),
		}[this.chart];

		// showPreview(res);
		return res;
	}
}
