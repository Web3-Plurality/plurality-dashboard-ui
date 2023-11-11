import React, { FC } from 'react';
import PropTypes from 'prop-types';

interface ILogoProps {
	width?: number;
	height?: number;
}
const Logo: FC<ILogoProps> = ({ width, height }) => {
	return (
		<svg
			width={height !== 854 && !!height ? height * (2155 / 854) : width}
			height={width !== 2155 && !!width ? width * (854 / 2155) : height}
			viewBox='0 0 650 854'
			fill='none'
			xmlns='http://www.w3.org/2000/svg'>
			<rect x='300' width='256' height='256' rx='64' fill='#46BCAA' />
			<circle cx='128' cy='726' r='128' fill='#4D69FA' />
			<rect x='300' y='355' width='256' height='144' fill='#6C5DD3' />
			<path d='M128 24L238.851 216H17.1488L128 24Z' fill='#FFCF52' />
			<path
				d='M128 307L238.851 367.197V487.59L128 547.787L17.1488 487.59V367.197L128 307Z'
				fill='#F35421'
			/>
		</svg>
	);
};
Logo.propTypes = {
	width: PropTypes.number,
	height: PropTypes.number,
};
Logo.defaultProps = {
	width: 2155,
	height: 854,
};

export default Logo;
