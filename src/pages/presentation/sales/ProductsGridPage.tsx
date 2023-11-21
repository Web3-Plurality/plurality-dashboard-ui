import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import Page from '../../../layout/Page/Page';
import PageWrapper from '../../../layout/PageWrapper/PageWrapper';
import Button from '../../../components/bootstrap/Button';
import CommonGridProductItem from '../../_common/CommonGridProductItem';
import tableData from '../../../common/data/dummyProductData';
import OffCanvas, {
	OffCanvasBody,
	OffCanvasHeader,
	OffCanvasTitle,
} from '../../../components/bootstrap/OffCanvas';
import Card, {
	CardBody,
	CardHeader,
	CardLabel,
	CardTitle,
} from '../../../components/bootstrap/Card';
import Badge from '../../../components/bootstrap/Badge';
import Input from '../../../components/bootstrap/forms/Input';
import PlaceholderImage from '../../../components/extras/PlaceholderImage';
import FormGroup from '../../../components/bootstrap/forms/FormGroup';
import { demoPagesMenu } from '../../../menu';
import Facebook from '../../../assets/img/abstract/facebook.png';
import Twitter from '../../../assets/img/abstract/twitter.png';
import Linkedin from '../../../assets/img/abstract/linkedin.png';
import Github from '../../../assets/img/abstract/github.png';
import Stackoverflow from '../../../assets/img/abstract/stackoverflow.png';
import Reddit from '../../../assets/img/abstract/reddit.png';
import Pinterest from '../../../assets/img/abstract/pinterest.png';
import Medium from '../../../assets/img/abstract/medium.png';
import { getTwitterID } from '../../../utils/oauth';
import FacebookLogin from 'react-facebook-login/dist/facebook-login-render-props';
import { is } from 'date-fns/locale';

interface IValues {
	name: string;
	price: number;
	stock: number;
	category: string;
	image?: string | null;
}
const validate = (values: IValues) => {
	const errors = {
		name: '',
		price: '',
		stock: '',
		category: '',
	};

	if (!values.name) {
		errors.name = 'Required';
	} else if (values.name.length < 3) {
		errors.name = 'Must be 3 characters or more';
	} else if (values.name.length > 20) {
		errors.name = 'Must be 20 characters or less';
	}

	if (!values.price) {
		errors.price = 'Required';
	} else if (values.price < 0) {
		errors.price = 'Price should not be 0';
	}

	if (!values.stock) {
		errors.stock = 'Required';
	}

	if (!values.category) {
		errors.category = 'Required';
	} else if (values.category.length < 3) {
		errors.category = 'Must be 3 characters or more';
	} else if (values.category.length > 20) {
		errors.category = 'Must be 20 characters or less';
	}

	return errors;
};

const ProductsGridPage = () => {
	const [data, setData] = useState(tableData);
	const [editItem, setEditItem] = useState<IValues | null>(null);
	const [editPanel, setEditPanel] = useState<boolean>(false);
	const [isFacebookConnected, setIsFacebookConnected] = useState<boolean>(false);
	const [isTwitterConnected, setIsTwitterConnected] = useState<boolean>(false);

	function handleRemove(id: number) {
		const newData = data.filter((item) => item.id !== id);
		setData(newData);
	}

	function handleEdit(id: number) {
		const newData = data.filter((item) => item.id === id);
		setEditItem(newData[0]);
	}

	const formik = useFormik({
		initialValues: {
			name: '',
			price: 0,
			stock: 0,
			category: '',
		},
		validate,
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		onSubmit: (values) => {
			setEditPanel(false);
		},
	});

	useEffect(() => {
		if (editItem) {
			formik.setValues({
				name: editItem.name,
				price: editItem.price,
				stock: editItem.stock,
				category: editItem.category,
			});
		}
		return () => {
			formik.setValues({
				name: '',
				price: 0,
				stock: 0,
				category: '',
			});
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [editItem]);

	useEffect(() => {
		if ( !isTwitterConnected ) {      
		  twitter().catch(console.error);
		}
	  }, [])

	const twitter = async () => {
		const params = new URLSearchParams(window.location.search)
		const username = params.get('username')!;
		const platform = params.get('id_platform')!;
	
		if (username!=null && platform == "twitter") {
			setIsTwitterConnected(true);
	 	}
	}

	const loginTwitter = async () => {
		const params = new URLSearchParams(window.location.search)
		const isWidget = params.get('isWidget')!;
		await getTwitterID(isWidget);
	  };
	
	const responseFacebook = async (response: any) => {
		setIsFacebookConnected(true);
		console.log(response);
	};
	
	const buttonTheme = () => {
		return "w-100 mb-4 shadow-3d-up-hover shadow-3d-dark"
	}

	const viewDetails = () => {
		console.log("see more details")
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
				{isFacebookConnected ? "View Details" : "Connect"}
			</Button>
			)}
		  />
		)	
	}

	return (
		<PageWrapper title={demoPagesMenu.sales.subMenu.productsGrid.text}>
			<Page>
			<div className='row'>
				{
					!isFacebookConnected ? (
					<div className='col-xxl-3 col-xl-4 col-md-6'>
					<CommonGridProductItem
						id='1'
						name='Facebook'
						img={Facebook}
						customization={true}
						button={(facebookLoginButton)}
					/>
					</div>) : (
					<div className='col-xxl-3 col-xl-4 col-md-6'>
					<CommonGridProductItem
						id='1'
						name='Facebook'
						img={Facebook}
						customization={false}
						connectAction={viewDetails}
						buttonText={"View Details"}
					/>
					</div>
					)
				}
				{
					!isTwitterConnected ? (
					<div className='col-xxl-3 col-xl-4 col-md-6'>
					<CommonGridProductItem
						id='2'
						name='Twitter'					
						img={Twitter}
						customization={false}
						connectAction={loginTwitter}	
						buttonText={"Connect"}
					/>
					</div>) : (
					<div className='col-xxl-3 col-xl-4 col-md-6'>
					<CommonGridProductItem
						id='2'
						name='Twitter'
						img={Twitter}
						customization={false}
						connectAction={viewDetails}
						buttonText={"View Details"}
					/>
					</div>
					)
				}
				<div className='col-xxl-3 col-xl-4 col-md-6'>
					<CommonGridProductItem
						id='3'
						name='Linkedin'					
						img={Linkedin}
						customization={false}
						buttonText={"Coming soon"}
					/>
				</div>
				<div className='col-xxl-3 col-xl-4 col-md-6'>
					<CommonGridProductItem
						id='4'
						name='Github'					
						img={Github}
						customization={false}
						buttonText={"Coming soon"}
					/>
				</div>
				<div className='col-xxl-3 col-xl-4 col-md-6'>
					<CommonGridProductItem
						id='5'
						name='Stackoverflow'					
						img={Stackoverflow}
						customization={false}
						buttonText={"Coming soon"}
					/>
				</div>
				<div className='col-xxl-3 col-xl-4 col-md-6'>
					<CommonGridProductItem
						id='6'
						name='Reddit'					
						img={Reddit}
						customization={false}
						buttonText={"Coming soon"}
					/>
				</div>
				<div className='col-xxl-3 col-xl-4 col-md-6'>
					<CommonGridProductItem
						id='7'
						name='Pinterest'					
						img={Pinterest}
						customization={false}
						buttonText={"Coming soon"}
					/>
				</div>
				<div className='col-xxl-3 col-xl-4 col-md-6'>
					<CommonGridProductItem
						id='8'
						name='Medium'					
						img={Medium}
						customization={false}
						buttonText={"Coming soon"}
					/>
				</div>
			</div>
			</Page>

			<OffCanvas
				setOpen={setEditPanel}
				isOpen={editPanel}
				isRightPanel
				tag='form'
				noValidate
				onSubmit={formik.handleSubmit}>
				<OffCanvasHeader setOpen={setEditPanel}>
					<OffCanvasTitle id='edit-panel'>
						{editItem?.name || 'New Product'}{' '}
						{editItem?.name ? (
							<Badge color='primary' isLight>
								Edit
							</Badge>
						) : (
							<Badge color='success' isLight>
								New
							</Badge>
						)}
					</OffCanvasTitle>
				</OffCanvasHeader>
				<OffCanvasBody>
					<Card>
						<CardHeader>
							<CardLabel icon='Photo' iconColor='info'>
								<CardTitle>Product Image</CardTitle>
							</CardLabel>
						</CardHeader>
						<CardBody>
							<div className='row'>
								<div className='col-12'>
									{editItem?.image ? (
										<img
											src={editItem.image}
											alt=''
											width={128}
											height={128}
											className='mx-auto d-block img-fluid mb-3'
										/>
									) : (
										<PlaceholderImage
											width={128}
											height={128}
											className='mx-auto d-block img-fluid mb-3 rounded'
										/>
									)}
								</div>
								<div className='col-12'>
									<div className='row g-4'>
										<div className='col-12'>
											<Input type='file' autoComplete='photo' />
										</div>
										<div className='col-12'>
											{editItem && (
												<Button
													color='dark'
													isLight
													icon='Delete'
													className='w-100'
													onClick={() => {
														setEditItem({ ...editItem, image: null });
													}}>
													Delete Image
												</Button>
											)}
										</div>
									</div>
								</div>
							</div>
						</CardBody>
					</Card>

					<Card>
						<CardHeader>
							<CardLabel icon='Description' iconColor='success'>
								<CardTitle>Product Details</CardTitle>
							</CardLabel>
						</CardHeader>
						<CardBody>
							<div className='row g-4'>
								<div className='col-12'>
									<FormGroup id='name' label='Name' isFloating>
										<Input
											placeholder='Name'
											onChange={formik.handleChange}
											onBlur={formik.handleBlur}
											value={formik.values.name}
											isValid={formik.isValid}
											isTouched={formik.touched.name}
											invalidFeedback={formik.errors.name}
											validFeedback='Looks good!'
										/>
									</FormGroup>
								</div>
								<div className='col-12'>
									<FormGroup id='price' label='Price' isFloating>
										<Input
											placeholder='Price'
											onChange={formik.handleChange}
											onBlur={formik.handleBlur}
											value={formik.values.price}
											isValid={formik.isValid}
											isTouched={formik.touched.price}
											invalidFeedback={formik.errors.price}
											validFeedback='Looks good!'
										/>
									</FormGroup>
								</div>
								<div className='col-12'>
									<FormGroup id='stock' label='Stock' isFloating>
										<Input
											placeholder='Stock'
											onChange={formik.handleChange}
											onBlur={formik.handleBlur}
											value={formik.values.stock}
											isValid={formik.isValid}
											isTouched={formik.touched.stock}
											invalidFeedback={formik.errors.stock}
											validFeedback='Looks good!'
										/>
									</FormGroup>
								</div>
								<div className='col-12'>
									<FormGroup id='category' label='Category' isFloating>
										<Input
											placeholder='Category'
											onChange={formik.handleChange}
											onBlur={formik.handleBlur}
											value={formik.values.category}
											isValid={formik.isValid}
											isTouched={formik.touched.category}
											invalidFeedback={formik.errors.category}
											validFeedback='Looks good!'
										/>
									</FormGroup>
								</div>
							</div>
						</CardBody>
					</Card>
				</OffCanvasBody>
				<div className='p-3'>
					<Button
						color='info'
						icon='Save'
						type='submit'
						isDisable={!formik.isValid && !!formik.submitCount}>
						Save
					</Button>
				</div>
			</OffCanvas>
		</PageWrapper>
	);
};

export default ProductsGridPage;
