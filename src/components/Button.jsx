import { forwardRef } from "react";
import clsx from "clsx";
import Loader from "@/components/Loader";

export default forwardRef(function Button(
	{
		children,
		type = "button",
		disabled = false,
		loading = false,
		variant = "regular",
		color,
		size = "",
		rounded = "full",
		className = "",
		onClick = () => {},
		...props
	},
	ref
) {
	const outlined = variant == "outline";
	color = color || (outlined ? "black" : "primary");

	const getColor = () => {
		const colorMap = {
			danger: [
				"bg-red-500 border-red-500 text-white",
				"text-red-500 border-current hover:bg-red-500/5",
			],
			success: [
				"bg-green-500 border-green-500 text-white",
				"text-green-500 hover:bg-green-500/5",
			],
			primary: [
				"bg-primary border-primary text-white",
				"text-primary border-current hover:bg-primary/5",
			],
			secondary: [
				"bg-gray-500 border-gray-500 text-white",
				"text-gray-500 border-current hover:bg-gray-500/5",
			],
			black: [
				"bg-black border-black text-white",
				"text-black border-current hover:bg-black/5",
			],
		};

		const [regularColor, outlineColor] =
			colorMap[color] ?? colorMap.primary;

		return outlined ? outlineColor : regularColor;
	};

	return (
		<button
			ref={ref}
			type={type}
			className={clsx(
				"Button border w-full flex items-center justify-center px-3.5 leading-none relative",
				(disabled || loading) && "pointer-events-none",
				disabled && "opacity-25",
				outlined
					? "bg-transparent hover:bg-gray-500/5"
					: "bg-primary text-white hover:opacity-90",
				getColor(),
				size == "xs"
					? "text-[0.6rem] h-6 px-[0.6rem]"
					: size == "sm"
					? "text-xs h-8 px-[0.8rem]"
					: "h-12 px-6",
				rounded == "full" ? "rounded-full" : "rounded",
				className
			)}
			onClick={onClick}
			{...props}
		>
			{children}

			{loading && <Loader size={26} thickness={8} color="#888" />}
		</button>
	);
});
