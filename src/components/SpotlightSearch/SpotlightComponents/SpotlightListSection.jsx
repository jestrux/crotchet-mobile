import { useRef } from "react";
import { Text } from "@chakra-ui/react";
import { ComboboxList } from "@/components/reach-combobox"; //"@reach/combobox";

export default function SpotlightListSection({ title, children }) {
	const sectionRef = useRef(null);

	return (
		<div className="border-b border-content/5">
			{title && (
				<Text className="mt-5 mb-1 uppercase tracking-wide text-xs font-semibold opacity-50 px-4 flex items-center">
					{title}
				</Text>
			)}

			<ComboboxList ref={sectionRef}>
				<div className="sdivide-y divide-content/5">{children}</div>
			</ComboboxList>
		</div>
	);
}
