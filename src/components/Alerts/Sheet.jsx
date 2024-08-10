import { motion } from "framer-motion";
import { useRef } from "react";
import { AlertDialog, AlertDialogLabel } from "@reach/alert-dialog";
import useDataLoader from "@/hooks/useDataLoader";
import {
	isValidAction,
	Loader,
	objectFieldChoices,
	useActionClick,
} from "@/crotchet";
import useKeyboard from "@/hooks/useKeyboard";

import clsx from "clsx";

function SheetButton({
	action,
	className,
	onClick: _onClick,
	onClose = () => {},
}) {
	useKeyboard();

	const { onClick } = useActionClick(action, {
		propagate: true,
	});

	return (
		<button
			onClick={
				_onClick
					? _onClick
					: () => {
							onClose();
							onClick();
					  }
			}
			className={clsx(
				"relative w-full text-left outline:focus-none flex items-center gap-2 text-base leading-none disabled:opacity-50",
				"h-14 flex-row-reverse",
				className
			)}
		>
			{action.icon && (
				<div className="flex-shrink-0 opacity-80 w-5 p-0.5">
					{action.icon}
				</div>
			)}

			<div className="flex-1">{action.label || action.name}</div>
		</button>
	);
}

const SheetContent = ({ onClose = () => {}, actions: _actions, children }) => {
	const { data: actions, loading } = useDataLoader({
		handler: () => {
			return objectFieldChoices(_actions);
		},
	});

	if (children) return children;

	return (
		<div>
			{loading ? (
				<div className="flex justify-center">
					<Loader size={40} />
				</div>
			) : (
				<div className="space-y-3">
					{!actions?.length && (
						<div className="pt-4 flex h-full items-center justify-center opacity-50">
							No actions
						</div>
					)}

					{actions?.length > 0 && (
						<div className="bg-card shadow-sm border border-content/5 rounded-lg overflow-hidden divide-y divide-content/5">
							{actions.map((action) => {
								return (
									<SheetButton
										className="px-4"
										key={action.__id}
										action={action}
										onClose={onClose}
										onClick={
											isValidAction(action)
												? null
												: () => onClose(action.value)
										}
									/>
								);
							})}
						</div>
					)}
				</div>
			)}
		</div>
	);
};

export default function Sheet({
	actions,
	children,
	dismissible = true,
	showOverlayBg = true,
	onClose = () => {},
}) {
	const cancelRef = useRef();

	return (
		<AlertDialog
			onDismiss={dismissible ? onClose : () => {}}
			isOpen={true}
			leastDestructiveRef={cancelRef}
			className="fixed inset-x-3 mb-[env(safe-area-inset-bottom)] z-[999]"
			style={{
				bottom: "calc(32px - env(safe-area-inset-bottom))",
			}}
		>
			<div
				ref={cancelRef}
				className="fixed inset-0 bg-black/20 dark:bg-black/70"
				onClick={() => onClose()}
			>
				<AlertDialogLabel className="hidden">Label</AlertDialogLabel>
			</div>

			<motion.div
				className="bg-stone-100/95 dark:bg-card/85 backdrop-blur-sm rounded-3xl relative z-10 max-w-lg mx-auto group text-content border shadow-2xl overflow-hidden"
				style={{
					boxShadow: showOverlayBg
						? ""
						: "0px 10px 30px -2px var(--shadow-color)",
				}}
				animate={{
					y: 0,
					opacity: 1,
				}}
				initial={{
					y: "10%",
					opacity: 0,
				}}
				transition={{
					duration: 0.2,
				}}
			>
				<SheetContent actions={actions} onClose={onClose}>
					{children}
				</SheetContent>
			</motion.div>
		</AlertDialog>
	);
}
