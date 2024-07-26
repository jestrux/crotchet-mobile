import { Children, cloneElement, useRef } from "react";
import useAlerts from "@/components/Alerts/useAlerts";
import { useSpotlightPageContext } from "./SpotlightPageContext";
import { onActionClick } from "@/crotchet";

export default function ActionPage({ page, children }) {
	const {
		pageData,
		preview: _preview,
		onSecondaryActionClick,
		onMainActionClick,
		setMainAction,
		mainAction: _mainAction,
		secondaryAction: _secondaryAction,
	} = useSpotlightPageContext();
	const { confirm } = useAlerts();

	const secondaryAction = _secondaryAction();
	const mainAction = _mainAction();
	const preview = _preview();

	const onSubmit = (callback) => {
		setMainAction({
			...(mainAction || {}),
			handler: callback,
		});
	};

	const handleSecondaryAction = (payload) => {
		return onActionClick(secondaryAction, { confirm })(payload);
	};

	const handleMainAction = (payload) => {
		return onActionClick(mainAction, { confirm })(payload);
	};

	onSecondaryActionClick(() => {
		handleSecondaryAction({ page, pageData });
	});

	onMainActionClick(() => {
		handleMainAction({ page, pageData });
	});

	const content = () => {
		return Children.map(children, (child) => {
			if (!child?.type) return null;

			return cloneElement(child, {
				page,
				onSubmit,
			});
		});
	};

	return (
		<>
			{preview && preview?.type ? (
				<div className="grid grid-cols-12 h-sc">
					<div className="col-span-5">{content()}</div>
					<div className="col-span-7 overflow-hidden p-0.5">
						<div className="fixed top-14 bottom-0 right-0 w-7/12">
							<div className="h-full w-full border-l border-content/10 overflow-x-hidden overflow-y-auto">
								{preview}
							</div>
						</div>
					</div>
				</div>
			) : (
				content()
			)}
		</>
	);
}
