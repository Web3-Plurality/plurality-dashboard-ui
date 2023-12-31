import React, { FC } from 'react';
import { ApexOptions } from 'apexcharts';
import Card, {
	CardActions,
	CardBody,
	CardFooter,
	CardHeader,
	CardLabel,
	CardSubTitle,
	CardTitle,
} from '../../components/bootstrap/Card';
import Button from '../../components/bootstrap/Button';
import Chart from '../../components/extras/Chart';
import Dropdown, {
	DropdownItem,
	DropdownMenu,
	DropdownToggle,
} from '../../components/bootstrap/Dropdown';
import Badge from '../../components/bootstrap/Badge';
import { priceFormat } from '../../helpers/helpers';
import showNotification from '../../components/extras/showNotification';
import Icon from '../../components/icon/Icon';
import { demoPagesMenu } from '../../menu';
import useDarkMode from '../../hooks/useDarkMode';

interface ICommonGridProductItemProps {
	id: string | number;
	name: string;
	category?: string;
	img: string;
	color?: string;
	series?: ApexOptions['series'];
	price?: number;
	editAction?: any;
	deleteAction?: any;
	connectAction?: any;
	customization?: boolean;
	button?: any;
	buttonText?: any;
}
const CommonGridProductItem: FC<ICommonGridProductItemProps> = ({
	id,
	name,
	category,
	img,
	color,
	series,
	price,
	editAction,
	deleteAction,
	connectAction,
	customization,
	button,
	buttonText,
}) => {
	const { themeStatus, darkModeStatus } = useDarkMode();

	const isDisabled = (name: string) => {
		return (name === "Facebook" || name === "Twitter") ? false : true
	}

	const buttonTheme = (name: string) => {
		if (name === "Facebook" || name === "Twitter") {
			return `w-100 mb-4 shadow-3d-up-hover shadow-3d-${
				darkModeStatus ? 'light' : 'dark'
			}`
		} else {
			return `w-100 mb-4`
		}
	}

	const dummyOptions: ApexOptions = {
		colors: [color],
		chart: {
			type: 'line',
			width: 100,
			height: 35,
			sparkline: {
				enabled: true,
			},
		},
		tooltip: {
			theme: 'dark',
			fixed: {
				enabled: false,
			},
			x: {
				show: false,
			},
			y: {
				title: {
					// eslint-disable-next-line @typescript-eslint/no-unused-vars
					formatter(seriesName: string) {
						return '';
					},
				},
			},
		},
		stroke: {
			curve: 'smooth',
			width: 2,
		},
	};

	const cardOpacity = () => {
		return isDisabled(name) ? '0.4' : '1'
	}
	return (
		<Card style={{opacity: cardOpacity()}}>
			<CardHeader>
				<CardLabel>
					<CardTitle tag='div' className='h5'>
						{name}{' '}
					</CardTitle>
				</CardLabel>
			</CardHeader>
			<CardBody>
				<img
					src={img}
					alt=''
					width={128}
					height={128}
					className='mx-auto d-block img-fluid mb-3'
				/>
			</CardBody>
			<CardFooter className='shadow-3d-container'>
				{!customization ? (<Button
					color='dark'
					className={buttonTheme(name)}
					size='lg'
					tag='a'
					isDisable={isDisabled(name)}
					onClick={() => connectAction()}
					>
					{buttonText}
				</Button>) : (button())}
			</CardFooter>
		</Card>
	);
};

export default CommonGridProductItem;
