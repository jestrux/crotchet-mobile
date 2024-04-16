import { forwardRef } from "react";

const Button = forwardRef(function Input(
	{ type = "button", onClick, children },
	ref
) {
	return (
		<button
			ref={ref}
			type={type}
			onClick={onClick}
			className="bg-primary text-white h-12 px-6 w-full rounded-full"
		>
			{children}
		</button>
	);
});

export default Button;
