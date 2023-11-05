import React from 'react';
import Header, { HeaderLeft } from '../../../layout/Header/Header';
import CommonHeaderRight from './CommonHeaderRight';
import Plurality from '../../../assets/logos/plurality.png';

const ProductListHeader = () => {
	return (
		<Header>
			<HeaderLeft>
				<img src={Plurality} alt='Plurality' height={24} />
				<span>Social Medias</span>
			</HeaderLeft>
			<CommonHeaderRight />
		</Header>
	);
};

export default ProductListHeader;
