import { Children, cloneElement, useRef } from "react";
import useAlerts from "@/components/Alerts/useAlerts";
import { useSpotlightPageContext } from "./SpotlightPageContext";
import { showToast } from "@/utils";
import { onActionClick } from "@/crotchet";

export default function ActionPage({ page, children }) {
	const {
		pageData,
		preview: _preview,
		onContextMenuClick,
		onActionMenuClick,
		onSecondaryActionClick,
		onMainActionClick,
		setMainAction,
		mainAction: _mainAction,
		secondaryAction: _secondaryAction,
	} = useSpotlightPageContext();
	const { confirm } = useAlerts();
	const actionsButtonRef = useRef();

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

	onContextMenuClick(() => {
		showToast("Context menu shortcut clicked");
	});

	onActionMenuClick(() => {
		if (actionsButtonRef.current) actionsButtonRef.current.click();
	});

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
					<div className="col-span-7 border-l border-content/10 overflow-hidden p-0.5">
						{preview}
					</div>
				</div>
			) : (
				content()
			)}
		</>
	);
}
