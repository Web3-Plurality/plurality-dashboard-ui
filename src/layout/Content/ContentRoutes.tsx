import React, { lazy, useEffect, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import contents from '../../routes/contentRoutes';
import WidgetAppHeader from '../Header/WidgetAppHeader';

const PAGE_404 = lazy(() => import('../../pages/presentation/auth/Page404'));
const ContentRoutes = () => {
	const [showHeader, setShowHeader] = useState(false)


	useEffect(() => {
		const isHeaderVisible = localStorage.getItem('username') !== null
		setShowHeader(isHeaderVisible)
	}, [localStorage.getItem('username')])
	return (
		<>
			{showHeader && <WidgetAppHeader />}
			<Routes>
				{contents.map((page) => (
					// eslint-disable-next-line react/jsx-props-no-spreading
					<Route key={page.path} {...page} />
				))}
				<Route path='*' element={<PAGE_404 />} />
			</Routes>

		</>
	);
};

export default ContentRoutes;
