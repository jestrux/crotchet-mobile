import { camelCaseToSentenceCase } from "@/utils";

function CardList({
	choices = [],
	transparent = false,
	renderChoice,
	onChange,
	...props
}) {
	return (
		<div className="grid grid-cols-2 gap-2 mt-1 rounded-xs overflow-hidden">
			{choices.map((choice, index) => {
				const isObject = typeof choice == "object";
				const label = isObject ? choice.label : choice;
				const value = isObject ? choice.value : choice;
				const selected = props.value == value;

				return (
					<button
						key={index}
						className={`relative overflow-hidden cursor-pointer flex items-center border-2 rounded-sm text-left ${
							selected
								? "bg-transparent border-primary"
								: "bg-transparent"
						}`}
						style={{
							padding: "0.25rem 0.25rem",
							height: "42px",
							fontSize: "11px",
							gap: "0.3rem",
							borderColor: selected ? "" : "#bEbEbE",
						}}
						onClick={() => onChange(value, index)}
					>
						{selected && (
							<div
								className="absolute bg-primary rounded-sm flex center-center"
								style={{
									width: "11px",
									height: "11px",
									zIndex: 1,
									top: "2px",
									right: "2px",
								}}
							>
								<svg
									width={6}
									viewBox="0 0 24 24"
									fill="none"
									stroke="#fff"
									strokeWidth={5}
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										d="M4.5 12.75l6 6 9-13.5"
									/>
								</svg>
							</div>
						)}

						<div
							className={`relative flex-shrink-0 rounded-xs overflow-hidden h-full aspect-square ${
								transparent ? "" : " bg-gray"
							}`}
						>
							{typeof renderChoice == "function" &&
								renderChoice(value, selected)}
						</div>

						<div
							className="relative flex-1"
							style={{
								color: "black",
								opacity: selected ? 1 : 0.8,
							}}
						>
							{camelCaseToSentenceCase(label).replace("-", " ")}
						</div>
					</button>
				);
			})}
		</div>
	);
}
export default CardList;
