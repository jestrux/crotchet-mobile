import useFocusCapture from "@/hooks/useFocusCapture";
import { DndContext, useDraggable } from "@dnd-kit/core";
import { restrictToParentElement } from "@dnd-kit/modifiers";
import { useState } from "react";

export const DragHandle = ({ listeners = {}, reset = () => {} }) => {
	return (
		<div
			className="transition-all opacity-0 -translate-y-3 group-hover:transform-none group-hover:opacity-100 text-content/50 hover:text-content absolute inset-0 z-10 mx-auto h-3 w-16"
			onDoubleClick={reset}
			{...listeners}
		>
			<div className="relative w-full h-full flex items-center justify-center">
				<svg
					className="absolute inset-x-0 w-full text-[--border-color]"
					viewBox="0 0 67.506 19.804"
				>
					<path
						d="M350.332,498.229s11.981,1.007,17.57,11.285,24.4,10.515,29.816,0,20.119-12.007,20.119-12.007h0"
						transform="translate(-350.332 -497.507)"
						fill="currentColor"
					/>
				</svg>
				<svg
					className="w-6 mr-0.5 relative z-10"
					fill="currentColor"
					viewBox="0 0 24 24"
					strokeWidth={1.5}
					stroke="currentColor"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
					/>
				</svg>
			</div>
		</div>
	);
};

const Draggable = ({ children, x, y, reset }) => {
	const { attributes, listeners, setNodeRef, transform } = useDraggable({
		id: "draggable",
	});

	const style = {
		position: "relative",
		top: y,
		left: x,
		transform: transform
			? `translate(${transform.x}px, ${transform.y}px)`
			: undefined,
	};

	return <>{children({ listeners, attributes, setNodeRef, style, reset })}</>;
};

export default function DraggableElement({ persistKey, children = () => {} }) {
	const { captureFocus, restoreFocus } = useFocusCapture();
	const [{ x, y } = {}, setCoordinates] = useState(persistKey, {
		x: 0,
		y: 0,
	});
	const reset = () => setCoordinates({ x: 0, y: 0 });

	return (
		<DndContext
			modifiers={[restrictToParentElement]}
			onDragStart={captureFocus}
			onDragEnd={({ delta }) => {
				setCoordinates(({ x, y }) => {
					return {
						x: x + delta.x,
						y: y + delta.y,
					};
				});
				restoreFocus();
			}}
		>
			<Draggable {...{ x, y, reset }}>{children}</Draggable>
		</DndContext>
	);
}
