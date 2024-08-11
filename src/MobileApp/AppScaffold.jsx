import useDataLoader from "@/hooks/useDataLoader";
import NavRootProvider from "./NavRootProvider";
import { randomId } from "@/utils";
import { useState } from "react";
import PageNav from "./Page/PageNav";

export default function AppScaffold({ rootPage: _rootPage } = {}) {
	const [activePage, setActivePage] = useState(0);
	const { nav, pages: _pages = [], ...rootPage } = _rootPage;
	const { data: pages } = useDataLoader(() => {
		return (_pages || []).map((page) => {
			const id = randomId();

			return {
				...page,
				id,
				_id: id,
			};
		});
	});

	return (
		<div data-app-scaffold="true">
			<NavRootProvider
				isOpen={activePage == 0}
				scaffold={{ nav }}
				rootPage={rootPage}
			/>

			{pages?.map((page, index) => {
				<NavRootProvider
					isOpen={activePage == index}
					scaffold={{ nav }}
					rootPage={page}
				/>;
			})}

			<PageNav {...{ nav, activePage, setActivePage }} />
		</div>
	);
}
