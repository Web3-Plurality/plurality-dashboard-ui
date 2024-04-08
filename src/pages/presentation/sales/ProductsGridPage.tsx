import React, { useEffect, useState, useContext } from 'react';
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
import { getFacebookInterests } from '../../../utils/facebookUserInterest';
import { getTwitterInterests } from '../../../utils/twitterUserInterest';
import { createProfile, AssetType, getProfileData } from '../../../utils/orbis';
import { MetaMaskContext, MetamaskActions } from '../../../hooks';
import { defaultSnapOrigin } from '../../../config';
import { useAccount } from 'wagmi';
import { useNavigate } from 'react-router-dom';
import LoadingContext from '../../../utils/LoadingContext'
import Checks, { ChecksGroup } from '../../../components/bootstrap/forms/Checks';
import PLogo from '../../../assets/img/favicon5.png';

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
	const [isFacebookConnected, setFacebookConnected] = useState<Boolean>(false);
	const [isTwitterConnected, setTwitterConnected] = useState<Boolean>(false);
	const [sidePanelData, setSidePanelData] = useState<any>();
	const [checked, setChecked] = useState<any>(true);
	const [state, dispatch] = useContext(MetaMaskContext);
	const { address, connector, isConnected } = useAccount()
	const { showLoading, hideLoading } = useContext(LoadingContext)
	const navigate = useNavigate();
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

	// useEffect(() => {
	// 	checkConnectProfilesOnPageLoad().catch(console.error);
	// }, [state])

	useEffect(() => {
		if (address) {
			checkConnectProfilesOnPageLoad(); 
		} else {
			navigate(`/auth-pages/login?isWidget=false`);
		}
	}, [address])

	const checkConnectProfilesOnPageLoad = async () => {

		// Added navigation to the dashboard
		const params = new URLSearchParams(window.location.search);
		const widget = params.get('isWidget')!;
		if ((widget=="false" || !widget) && !address) {
			navigate(`/auth-pages/login?isWidget=false`);
		} 
		if(address) {
			showLoading();
			const twitterProfileData = await getProfileData(address!.toString(),process.env.REACT_APP_TWITTER!);
			if (twitterProfileData) setTwitterConnected(true)
			const facebookProfileData = await getProfileData(address!.toString(),process.env.REACT_APP_FACEBOOK!);
			if (facebookProfileData) setFacebookConnected(true)
			hideLoading();
		}
	}

	//TODO verify what this useEffect is used for??
	useEffect(() => {
		if ( !isTwitterConnected ) {  
			const params = new URLSearchParams(window.location.search)
			const idPlatform = params.get('id_platform')!;
			if (idPlatform == "twitter") { 
				showLoading();
				const params = new URLSearchParams(window.location.search);
				const username = params.get('username')!;
				const displayName = params.get('display_name')!;
				const profileUrl = params.get('picture_url')!;
	
				const description = 'some description';
				const profile = {name: username, displayName: displayName, profileUrl: profileUrl};
				createProfile(process.env.REACT_APP_TWITTER!, 
							process.env.REACT_APP_TWITTER_GROUP_ID!,
							username,
							description,
							AssetType.INTEREST,
							getTwitterInterests({}), JSON.stringify(profile)).then(isProfileCreated => {
								if (isProfileCreated) 
								// Add condition for making sure that the user has indeed connected
									setTwitterConnected(true);
								else 
									console.log("Profile could not be created. Please try again");
								hideLoading();
							}).catch(error => {
								console.log(error);
								hideLoading();
							})		
			}
		}
	  }, [state])

	//   const checkConnectProfilesOnPageLoad = async () => {
	// 	const params = new URLSearchParams(window.location.search)
	// 	const widget = params.get('isWidget')!;
	// 	const snap = await getSnap();
	// 	if ((widget=="false" || !widget) && !snap) {
	// 		navigate(`/auth-pages/login?isWidget=false`);
	// 	} 
	// 	else {
	// 		const facebook = await checkIfProfileSaved(process.env.REACT_APP_FACEBOOK!);
	// 		const twitter = await checkIfProfileSaved(process.env.REACT_APP_TWITTER!);
	// 		setTwitterConnected(twitter);
	// 		setFacebookConnected(facebook);
	// 	}
	// }

	const twitter = async () => {
		const params = new URLSearchParams(window.location.search)
		const username = params.get('username')!;
		const platform = params.get('id_platform')!;
	
		if (username!=null && platform == "twitter") {
			setTwitterConnected(true);
	 	}
	}

	const loginTwitter = async () => {
		await getTwitterID("false", "plurality-dashboard");
	  };
	
	  const responseFacebook = async (response: any) => {
		console.log(response);
		if (response.accessToken) {
			showLoading();
			const interests = getFacebookInterests(response);
			const username = response.name;
			const description = 'some description';
			const profile = {name: username, profileUrl: ""};
			try {
			const isProfileCreated = await createProfile(process.env.REACT_APP_FACEBOOK!, 
									process.env.REACT_APP_FACEBOOK_GROUP_ID!,
									username,
									description,
									AssetType.INTEREST,
									interests,
									JSON.stringify(profile)
								);
			if (isProfileCreated) 
				setFacebookConnected(true);
			else
				console.log("Profile could not be created. Please try again");

			hideLoading();
			}
			catch (error) {
				console.log(error);
				hideLoading();
			}
		}
	};	
	
	const buttonTheme = () => {
		return "w-100 mb-4 shadow-3d-up-hover shadow-3d-dark"
	}

	const viewFacebookDetails = async () => {
		showLoading()
		const detail = await getSocialMediaDetails("facebook")
		console.log(detail)
		setSidePanelData(detail)
		setEditPanel(true)
		hideLoading()
	}

	const viewTwitterDetails = async () => {
		showLoading()
		const detail =  await getSocialMediaDetails("twitter")
		console.log(detail)
		setSidePanelData(detail)
		setEditPanel(true)
		hideLoading()
	}

	const getSocialMediaDetails = async (platform: string) => {
		const socialMediaDetails = await getProfileData(address || "", platform)
		if (socialMediaDetails) {
			console.log(socialMediaDetails)
			return socialMediaDetails;
		}

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

	const handleCheck = () => {
		setChecked(!checked)
	}

	const imgSrc = () => {
		if(sidePanelData) {
			return JSON.parse(sidePanelData?.profileData).profileUrl ? JSON.parse(sidePanelData?.profileData).profileUrl : PLogo
		}
		return PLogo
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
						connectAction={viewFacebookDetails}
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
						connectAction={viewTwitterDetails}
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
				<></>

					{/* <OffCanvasTitle id='edit-panel'>
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
					</OffCanvasTitle> */}
				</OffCanvasHeader>
				<OffCanvasBody>
					<Card>
						<CardHeader>
							<CardLabel icon='Description' iconColor='success'>
								<CardTitle>Data fetched from your profile</CardTitle>
							</CardLabel>
						</CardHeader>
						<CardBody>
							<div>
								<h3>Profile</h3>
								<img src={imgSrc()} style={{height: "80px", width: "80px", marginBottom: "10px"}}/>
								<p>Name: {sidePanelData? JSON.parse(sidePanelData?.profileData).name: ""}</p>

								<h3>Interests</h3>
								{sidePanelData?.assetData.map((interest: any) =><li key={interest}>{interest}</li>)}
								<div style={{marginBottom: "20px"}}></div>
								<Checks
									type='switch'
									id='inlineCheckOne'
									label='Share your profile to those dapps'
									name='checkOne'
									onChange={handleCheck}
									checked={checked}
								/>
								<img src="https://avatars.githubusercontent.com/u/105918252?s=200&v=4" alt="" style={{width: "20px", height: "20px"}}/>	Orbis				
							</div>
							{/* <div className='row g-4'>
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
							</div> */}
						</CardBody>
					</Card>
				</OffCanvasBody>
				{/* <div className='p-3'>
					<Button
						color='info'
						icon='Save'
						type='submit'
						isDisable={!formik.isValid && !!formik.submitCount}>
						Save
					</Button>
				</div> */}
			</OffCanvas>
		</PageWrapper>
	);
};

export default ProductsGridPage;
