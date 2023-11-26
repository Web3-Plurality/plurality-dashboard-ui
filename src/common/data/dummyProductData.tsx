import BeveledCone from '../../assets/img/abstract/beveled-cone.png';
import CloudBall from '../../assets/img/abstract/cloud-ball.png';
import Quadrilateral from '../../assets/img/abstract/quadrilateral.png';
import HardSharpDonut from '../../assets/img/abstract/hald-sharp-donut.png';
import BendyRectangle from '../../assets/img/abstract/bendy-rectangle.png';
import Infinity from '../../assets/img/abstract/infinity.png';
import Octahedron from '../../assets/img/abstract/octahedron.png';
import Triangle from '../../assets/img/abstract/triangle.png';
import SquiglyGlobe from '../../assets/img/abstract/squigly-globe.png';
import Dodecagon from '../../assets/img/abstract/dodecagon.png';
import BeveledCube from '../../assets/img/abstract/beveled-cube.png';
import Cylinder from '../../assets/img/abstract/cylinder.png';
import Facebook from '../../assets/img/abstract/facebook.png';
import Twitter from '../../assets/img/abstract/twitter.png';
import Linkedin from '../../assets/img/abstract/linkedin.png';
import Github from '../../assets/img/abstract/github.png';
import Stackoverflow from '../../assets/img/abstract/stackoverflow.png';
import Reddit from '../../assets/img/abstract/reddit.png';
import Pinterest from '../../assets/img/abstract/pinterest.png';
import Medium from '../../assets/img/abstract/medium.png';
import { getTwitterID } from '../../utils/oauth';
import FacebookLogin from 'react-facebook-login/dist/facebook-login-render-props';
import Button from '../../components/bootstrap/Button';

const loginTwitter = async () => {
	await getTwitterID("false", "plurality-dashboard");
};

const responseFacebook = async (response: any) => {
	console.log(response);
};

const buttonTheme = () => {
	return "w-100 mb-4 shadow-3d-up-hover shadow-3d-dark"
}

const facebookLoginButton = () => {
	return (
		<FacebookLogin
		appId="696970245672784"
		autoLoad={false}
		fields="name,picture,gender,inspirational_people,languages,meeting_for,quotes,significant_other,sports, music, photos, age_range, favorite_athletes, favorite_teams, hometown, feed, likes "
		callback={responseFacebook}
		cssClass='shadow-3d-container'
		scope="public_profile, email, user_hometown, user_likes, user_friends, user_gender, user_age_range"
		render={renderProps => (
			<Button
			color='dark'
			className={buttonTheme()}
			size='lg'
			tag='a'
			onClick={renderProps.onClick}
			>
			Connect
		</Button>
		)}
	  />
	)	
}

const data: {
	id: number;
	image: string;
	name: string;
	category: string;
	series: { data: number[] }[];
	color: string;
	stock: number;
	price: number;
	store: string;
	file: string;
	login?: any;
	customization?: boolean;
	button?: any;
}[] = [
	{
		id: 1,
		image: Facebook,
		name: 'Facebook',
		category: '3D Shapes',
		series: [
			{
				data: [25, 66, 41, 89, 63],
			},
		],
		color: String(process.env.REACT_APP_SUCCESS_COLOR),
		stock: 380,
		price: 14.5,
		store: 'Company A',
		file: 'Figma',
		customization: true,
		button: facebookLoginButton,
	},
	{
		id: 2,
		image: Twitter,
		name: 'Twitter',
		category: '3D Shapes',
		series: [
			{
				data: [12, 24, 33, 12, 48],
			},
		],
		color: String(process.env.REACT_APP_SUCCESS_COLOR),
		stock: 1245,
		price: 12,
		store: 'Company A',
		file: 'Figma',
		login: loginTwitter,
		customization: false,
	},
	{
		id: 3,
		image: Linkedin,
		name: 'Linkedin',
		category: '3D Shapes',
		series: [
			{
				data: [34, 32, 36, 34, 34],
			},
		],
		color: String(process.env.REACT_APP_WARNING_COLOR),
		stock: 27,
		price: 12.8,
		store: 'Company D',
		file: 'XD',
	},
	{
		id: 4,
		image: Github,
		name: 'Github',
		category: '3D Shapes',
		series: [
			{
				data: [54, 34, 42, 23, 12],
			},
		],
		color: String(process.env.REACT_APP_DANGER_COLOR),
		stock: 219,
		price: 16,
		store: 'Company C',
		file: 'Sketch',
	},
	{
		id: 5,
		image: Stackoverflow,
		name: 'Stackoverflow',
		category: '3D Shapes',
		series: [
			{
				data: [23, 21, 12, 34, 14],
			},
		],
		color: String(process.env.REACT_APP_DANGER_COLOR),
		stock: 219,
		price: 16,
		store: 'Company A',
		file: 'Figma',
	},
	{
		id: 6,
		image: Reddit,
		name: 'Reddit',
		category: '3D Shapes',
		series: [
			{
				data: [23, 13, 34, 41, 38],
			},
		],
		color: String(process.env.REACT_APP_SUCCESS_COLOR),
		stock: 219,
		price: 16,
		store: 'Company C',
		file: 'Figma',
	},
	{
		id: 7,
		image: Pinterest,
		name: 'Pinterest',
		category: '3D Shapes',
		series: [
			{
				data: [21, 34, 23, 12, 67],
			},
		],
		color: String(process.env.REACT_APP_SUCCESS_COLOR),
		stock: 498,
		price: 18,
		store: 'Company B',
		file: 'Figma',
	},
	{
		id: 8,
		image: Medium,
		name: 'Medium',
		category: '3D Shapes',
		series: [
			{
				data: [18, 32, 26, 15, 34],
			},
		],
		color: String(process.env.REACT_APP_SUCCESS_COLOR),
		stock: 219,
		price: 16,
		store: 'Company B',
		file: 'Figma',
	},
	// {
	// 	id: 9,
	// 	image: SquiglyGlobe,
	// 	name: 'SquiglyGlobe',
	// 	category: '3D Shapes',
	// 	series: [
	// 		{
	// 			data: [18, 32, 26, 15, 34],
	// 		},
	// 	],
	// 	color: String(process.env.REACT_APP_SUCCESS_COLOR),
	// 	stock: 219,
	// 	price: 16,
	// 	store: 'Company C',
	// 	file: 'Figma',
	// },
	// {
	// 	id: 10,
	// 	image: Dodecagon,
	// 	name: 'Dodecagon',
	// 	category: '3D Shapes',
	// 	series: [
	// 		{
	// 			data: [18, 32, 26, 15, 34],
	// 		},
	// 	],
	// 	color: String(process.env.REACT_APP_SUCCESS_COLOR),
	// 	stock: 219,
	// 	price: 16,
	// 	store: 'Company A',
	// 	file: 'Figma',
	// },
	// {
	// 	id: 11,
	// 	image: BeveledCube,
	// 	name: 'Beveled Cube',
	// 	category: '3D Shapes',
	// 	series: [
	// 		{
	// 			data: [18, 32, 26, 15, 34],
	// 		},
	// 	],
	// 	color: String(process.env.REACT_APP_SUCCESS_COLOR),
	// 	stock: 219,
	// 	price: 16,
	// 	store: 'Company A',
	// 	file: 'Figma',
	// },
	// {
	// 	id: 12,
	// 	image: Cylinder,
	// 	name: 'Cylinder',
	// 	category: '3D Shapes',
	// 	series: [
	// 		{
	// 			data: [18, 32, 26, 15, 34],
	// 		},
	// 	],
	// 	color: String(process.env.REACT_APP_SUCCESS_COLOR),
	// 	stock: 219,
	// 	price: 16,
	// 	store: 'Company B',
	// 	file: 'Figma',
	// },
];
export default data;
