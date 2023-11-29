import React from 'react';
import Header, { HeaderLeft } from '../../../layout/Header/Header';
import CommonHeaderRight from './CommonHeaderRight';
import Plurality from '../../../assets/logos/plurality.png';
import PLogo from '../../../assets/img/logo-no-bg.png';

const ProductListHeader = () => {
	return (
		<Header>
			<HeaderLeft>
				{/* <img src={Plurality} alt='Plurality' height={24} /> */}
				<img src={PLogo} alt="Logo" style={{height: "35px", width: "25px"}}/>
				<span>Social Medias</span>
			</HeaderLeft>
			<CommonHeaderRight />
		</Header>
	);
};

export default ProductListHeader;
