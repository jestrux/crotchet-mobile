// https://code.tutsplus.com/tutorials/how-to-draw-bar-charts-using-javascript-and-html5-canvas--cms-28561
import { dataSets, chartThemes as defaultChartThemes } from "./chart-utils";

const chartThemes = structuredClone(defaultChartThemes).map((theme) => {
	theme.splice(theme.length - 1, 1, "#999999");

	return theme;
});

export const defaultOptions = {
	padding: 40,
	gridColor: "black",
	data: dataSets[2],
	settings: {
		barCorners: 20,
		gridSpacing: "normal",
		barSpacing: 20,
		labels: 25,
		borders: 2.5,
	},
	colors: chartThemes[2],
};

export const schema = {
	data: {
		type: "keyValue",
		meta: {
			type: "number",
			dataSets,
		},
	},
	settings: {
		type: "section",
		label: "Chart Properties",
		collapsed: true,
		children: {
			labels: {
				type: "radio",
				inline: true,
				choices: [
					{ label: "hide", value: 0 },
					{ label: "sm", value: 25 },
					{ label: "md", value: 32.5 },
					{ label: "lg", value: 40 },
				],
			},
			barCorners: {
				type: "radio",
				inline: true,
				choices: [
					{ label: "flat", value: 0 },
					{ label: "rounded", value: 20 },
				],
			},
			barSpacing: {
				type: "radio",
				inline: true,
				choices: [
					{ label: "none", value: 0 },
					{ label: "sm", value: 20 },
					{ label: "md", value: 40 },
					{ label: "lg", value: 60 },
				],
			},
			gridSpacing: {
				type: "radio",
				inline: true,
				choices: ["normal", "dense"],
			},
			borders: {
				type: "radio",
				choices: [
					{ label: "hide", value: 0 },
					{ label: "sm", value: 1 },
					{ label: "md", value: 2.5 },
					{ label: "lg", value: 4 },
				],
				// type: "range",
				inline: true,
				defaultValue: defaultOptions.borders,
				meta: {
					min: 0,
					max: 6,
					step: 0.1,
					className: "inline-number-field",
				},
			},
		},
	},
	colors: {
		label: "Theme",
		type: "swatch",
		meta: { themes: chartThemes },
	},
};

class BarChart {
	constructor(options) {
		Object.entries(defaultOptions).forEach(([key, value]) => {
			if (options[key] === undefined) options[key] = value;
		});

		this.options = options;
		this.canvas = document.createElement("canvas");
		this.canvas.width = options.width;
		this.canvas.height = options.height;
		this.ctx = this.canvas.getContext("2d");
		this.colors = options.colors;
		this.maxValue = Math.max(...Object.values(this.options.data));
		this.minValue = Math.min(...Object.values(this.options.data));

		const denseGrid = this.options.gridSpacing == "dense";

		let gridSpacing = this.maxValue - this.minValue;
		let scaleFactor =
			gridSpacing >= 90 || this.maxValue >= 90
				? denseGrid
					? 30
					: 8
				: denseGrid
				? 10
				: 5;
		gridSpacing /= scaleFactor;

		this.gridStep = Math.ceil(gridSpacing);

		this.fontSize = this.options.labels;
		this.ctx.font = `bold ${this.fontSize}px Georgia, serif`;
		this.ctx.textAlign = "right";
		const metrics = this.ctx.measureText(this.maxValue);

		this.textWidth = metrics.width;
		this.insetX = this.options.padding + metrics.width - 5;

		return this.draw();
	}

	drawLine(startX, startY, endX, endY, color) {
		const ctx = this.ctx;
		ctx.save();
		ctx.beginPath();
		ctx.moveTo(startX, startY);
		ctx.lineTo(endX, endY);
		ctx.stroke();
		ctx.restore();
	}

	drawBar(
		upperLeftCornerX,
		upperLeftCornerY,
		width,
		height,
		color,
		barCorners = 0
	) {
		const ctx = this.ctx;
		ctx.save();
		ctx.fillStyle = color;
		ctx.beginPath();
		ctx.roundRect(upperLeftCornerX, upperLeftCornerY, width, height, [
			barCorners,
			barCorners,
			0,
			0,
		]);
		ctx.closePath();
		ctx.fill();
		ctx.restore();
	}

	drawGridLines() {
		var canvasActualHeight = this.canvas.height - this.options.padding * 2;
		var canvasActualWidth = this.canvas.width - this.options.padding * 2;
		var gridValue = 0;

		while (gridValue <= this.maxValue) {
			var gridY =
				canvasActualHeight * (1 - gridValue / this.maxValue) +
				this.options.padding;
			this.drawLine(
				this.insetX - this.options.padding / 2,
				gridY,
				this.canvas.width,
				gridY
			);
			this.drawLine(
				this.insetX,
				this.options.padding / 2,
				this.insetX,
				gridY + this.options.padding / 2
			);

			if (this.options.labels) {
				// Writing grid markers
				this.ctx.save();
				this.ctx.fillStyle = this.options.colors.at(-1);
				this.ctx.textBaseline = "bottom";
				this.ctx.fillText(
					gridValue,
					this.textWidth,
					gridY - 2 + this.fontSize / 2
				);
				this.ctx.restore();
			}

			gridValue += this.gridStep;
		}
	}
	drawBars() {
		var canvasActualHeight = this.canvas.height - this.options.padding * 2;
		var canvasActualWidth = this.canvas.width - this.insetX * 1.5;
		var barIndex = 0;
		var numberOfBars = Object.keys(this.options.data).length;
		var barSize = canvasActualWidth / numberOfBars;
		var values = Object.values(this.options.data);
		for (let val of values) {
			var barHeight = Math.round(
				(canvasActualHeight * val) / this.maxValue
			);

			const spacing = this.options.barSpacing;
			this.drawBar(
				this.insetX + barIndex * barSize + spacing * 2,
				this.canvas.height - barHeight - this.options.padding,
				barSize - spacing * 2,
				barHeight,
				this.colors[barIndex % this.colors.length],
				this.options.barCorners
			);
			barIndex++;
		}
	}

	draw() {
		const ctx = this.ctx;
		ctx.lineWidth = this.options.borders;
		ctx.strokeStyle =
			this.options.borders <= 0.1
				? "transparent"
				: this.options.colors.at(-1);

		this.drawGridLines();
		this.drawBars();

		return this.canvas;
	}
}

export default BarChart;
