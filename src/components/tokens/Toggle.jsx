import { Switch } from "@adobe/react-spectrum";

function Toggle({ checked, onChange }) {
	return (
		<div style={{ margin: "-1rem" }}>
			<Switch
				defaultSelected={checked}
				isEmphasized
				value={checked}
				onChange={onChange}
				aria-label="Toggle"
			/>
		</div>
	);

	return (
		<div
			className={`cursor-pointer flex border ${
				checked ? "border-dark-gray bg-blue" : "bg-black26 border-gray"
			}`}
			style={{ width: "34px", padding: "1.5px", borderRadius: "28px" }}
			onClick={() => onChange(!checked)}
		>
			<div
				className={`rounded-full bg-white border border-darkgray ${
					checked && "ml-auto"
				}`}
				style={{ width: "14px", height: "14px" }}
			></div>
		</div>
	);
}
export default Toggle;
