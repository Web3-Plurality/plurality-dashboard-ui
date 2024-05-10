import React, { FC, useCallback, useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import classNames from 'classnames';
//import { useFormik } from 'formik';
import PageWrapper from '../../../layout/PageWrapper/PageWrapper';
import Page from '../../../layout/Page/Page';
import Card, { CardBody } from '../../../components/bootstrap/Card';
import Button from '../../../components/bootstrap/Button';
import useDarkMode from '../../../hooks/useDarkMode';
import AuthContext from '../../../contexts/authContext';
import { MetaMaskContext, MetamaskActions } from '../../../hooks';
import { getTwitterID } from '../../../utils/oauth';
import FacebookLogin from 'react-facebook-login/dist/facebook-login-render-props';
import { createProfile, AssetType, getProfileData } from '../../../utils/orbis';
import { getFacebookInterests } from '../../../utils/facebookUserInterest';
import { getTwitterInterests } from '../../../utils/twitterUserInterest';
import LoadingContext from '../../../utils/LoadingContext';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import PLogo from '../../../assets/img/new-logo.png';
import StytchOTP from '../../../components/StytchOTP';
import Instagram from '../../../assets/instagram.png';
import Twitter from '../../../assets/twitter.png';
import axios from 'axios';

type OtpStep = 'pre-submit' | 'submit' | 'verify' | 'post-submit' | 'success' | 'creating-profile';

// interface ILoginHeaderProps {
// 	isMetamaskConnected?: boolean;
// 	callingDApp?: String;
// }

const LoginHeader: FC<any> = ({step}) => {
	return (
		<>
			<div className='text-center h1 fw-bold' style={{marginTop: "50px"}}>Social Connect</div>
			{step === "pre-submit" && (<div className='text-center h6 mt-2' style={{marginBottom: "50px"}}>Subscribe to access early bird benefits</div>)}
			{step === "submit" && (<div className='text-center h6 mt-2' style={{marginBottom: "50px"}}>A verification code will be sent to your email</div>)}
			{step === "verify" && (<div className='text-center h6 mt-2' style={{marginBottom: "50px"}}>Enter the 6 digit code sent to your email</div>)}
			{step === "success" && (<div className='text-center h6 mt-2' style={{marginBottom: "50px"}}>Subscription successful. Congrats!</div>)}
			{step === "post-submit" && (<div className='text-center h6 mt-2' style={{marginBottom: "50px"}}>Please connect your social profiles</div>)}
		</>
	);
};
const LoginFooter: FC<any> = () => {
	return (
		<>
			<div className="d-flex align-items-center justify-content-center" style={{marginTop: "50px"}}>
				Powered by 
				<a href="https://twitter.com/PluralityWeb3" target="_blank" rel="noopener noreferrer">
					<img src={PLogo} alt="Logo" style={{width: "100px", height: "40px"}}/>
				</a>
			</div>
		</>
	);
};
const CenteredImage: FC<any> = ({imageSrc, width, height}) => {
	return (
		<>
			<div className='d-flex align-items-center justify-content-center'>
				<img src={imageSrc} alt="GIF Image"  style={{width: width, height: height}}/>
			</div>
		</>
	);
};

LoginHeader.defaultProps = {
	isMetamaskConnected: false,
	callingDApp: "http://some-dapp.com"
};

interface ILoginProps {
	isSignUp?: boolean;
}
const Login: FC<ILoginProps> = ({ isSignUp }) => {
	const { setUser } = useContext(AuthContext);
	const { darkModeStatus } = useDarkMode();

	const [isWidget, setIsWidget] = useState(false);  
	const [singUpStatus, setSingUpStatus] = useState<boolean>(!!isSignUp);
	
	const navigate = useNavigate();

	// metamask hooks
	const [state, dispatch] = useContext(MetaMaskContext);

	// social logins connection hooks
	const [isFacebookConnected, setIsFacebookConnected] = useState<Boolean>(false);
	const [isTwitterConnected, setIsTwitterConnected] = useState<Boolean>(false);
	const [callingDApp, setCallingDApp] = useState<String>("");
	const [isFacebookSelected, setIsFacebookSelected] = useState<Boolean>(false);
	const [isTwitterSelected, setIsTwitterSelected] = useState<Boolean>(false);
	const { showLoading, hideLoading } = useContext(LoadingContext);

	// wagmi connectors and disconnectors
	const { connect, connectors } = useConnect();
	const { address, connector, isConnected } = useAccount();

	const [renderBlocker, setRenderBlocker] = useState(false);
	const [isMetamaskConnected, setIsMetamaskConnected] = useState(false);

	// Stytch
	const [step, setStep] = useState<OtpStep>("pre-submit");
	const moveBack = () => {
		setStep("pre-submit")
	}
	const sendCode = () => {
		setStep("verify")
	}
	const tryAgain = () => {
		setStep("submit")
	}
	const handleEmailOnClick = () => {
		setStep("submit")
	};

	const showSuccess = () => {
		setStep("success")
	}

	const showPostSubmit = () => {
		setStep("post-submit")
	}

	const skipEmailRegistration = async () => {
		showLoading();
		const apiUrl = process.env.REACT_APP_API_BASE_URL + '/stytch';
		axios.post(apiUrl, {
			data: {email: "", address: address, subscribe: false}
			})
			.then(function (response) {
			if(response.status === 200) {
				showPostSubmit();
			} 
			})
			.catch(function (error) {
			alert("Something goes wrong, please try again!")
			})
		hideLoading();
	}

	const checkAddressExistence = () => {
		const apiUrl = process.env.REACT_APP_API_BASE_URL + '/stytch/check-address'
		return axios.get(apiUrl,{
		  params: {
			  address: address
		}
		})
	  }
	const isInsideIframe = window.self !== window.top;


	const handleMetamaskConnect = async () => {
		try {	
		  if (setUser) setUser("user");
		  //TODO need to find a way of how to selectivly connect
		  await ensureMetamaskConnection();
		} catch (e: any) {
		  console.error(e);
		  dispatch({ type: MetamaskActions.SetError, payload: e });
		}
	  };

	const responseFacebook = async (response: any) => {
		console.log(response);
		if (response.accessToken) {
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
			if (isProfileCreated) {
				setIsFacebookConnected(true);
				// We can construct the profile data from user login data
				const profileDataObj = constructProfileData(AssetType.INTEREST, interests, process.env.REACT_APP_FACEBOOK!, JSON.stringify(profile));
				if (profileDataObj) {
					const params = new URLSearchParams(window.location.search)
					const origin = params.get('origin')!;
					window.parent?.postMessage(profileDataObj, origin);
					wait(5000).then(res=>{
						window.close();
					}).catch(console.error);
					window.close();
				}
			}
			else
				console.log("Profile could not be created. Please try again");

			hideLoading();
			}
			catch (error) {
				console.log(error);
				hideLoading();
			}
			
		}
		else {
			console.log("access token not found");
		}
	};	

	const constructProfileData = (assetType: any, assetData: any, dataFetchedFrom: any, profileData: any) => {
		const profile = {
			'assetType': assetType,
			'assetData': assetData,
			'dataFetchedFrom': dataFetchedFrom,
			'profileData': profileData
		}
		return profile;
	}

	const ensureMetamaskConnection = async (): Promise<Boolean> => {
		console.log("Ensure metamask connection called");
		if (!address || !isConnected) {
			for (let i=0; i < connectors.length; i++) {
				let connector = connectors[i];
				console.log("Trying to connect with connector: "+connectors[i].name);
				connect({ connector});
			}
		}
		return true;
	}

	const openTwitterOAuthPopup = async () => {
		const params = new URLSearchParams(window.location.search)
		const isWidget = params.get('isWidget')!;
		const origin = params.get('origin')!;
		const apps = params.get('apps')!;
		const apiUrl = process.env.REACT_APP_API_BASE_URL+`/oauth-twitter?apps=${apps}&isWidget=${isWidget}&origin=${origin}`; // Replace with your Twitter API endpoint
		//TODO: Change it back
		//const apiUrl = "http://localhost:3000/auth-pages/login?isWidget=true&origin=http://localhost:3001/&id_platform=twitter&username=hirasiddiqui199&display_name=HiraSiddiqui&picture_url=https://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png"; // Replace with your Twitter API endpoint
		// Define the dimensions for the popup window
		const popupWidth = 450;
		const popupHeight = 540;
		//const popupLeft = (window.innerWidth - popupWidth) / 2;
		//const popupTop = (window.innerHeight - popupHeight) / 2;
		const popupLeft = 380;
		const popupTop = 100;

		await ensureMetamaskConnection()
		
		// Check if twitter profile already exists at orbis
		showLoading();
		const profileDataObj = await getProfileData(address!.toString(),process.env.REACT_APP_TWITTER!);
		if (profileDataObj) {
			window.parent?.postMessage(profileDataObj, origin);
			setIsTwitterConnected(true);
			hideLoading();
			window.close();
		}
		else {
			// Open the popup window
			const childWindow = window.open(
				apiUrl,
				'_blank',
				`width=${popupWidth}, height=${popupHeight}, top=${popupTop}, left=${popupLeft}`
			);
			console.log("Child window: ");
			console.log(childWindow);
			// Loop in main window	
			while (!isTwitterConnected && window.parent !== null) {
				console.log("Twitter not yet connected, so waiting");
				const profileDataObj = await getProfileData(address!.toString(),process.env.REACT_APP_TWITTER!);
				if (profileDataObj) {
					childWindow!.close();
					window.parent?.postMessage(profileDataObj, origin);
					setIsTwitterConnected(true);
					hideLoading();
					window.close();
				}
				else {
					console.log("waiting");
					await wait(5000);
				}
			}
		}
	  }; 

	// Function to call before the Facebook popup
	const handleBeforeFacebookPopup = async (renderPropsOnclick: Function) => {
		//If metamask is somehow not connected
		if (!address) {
			await ensureMetamaskConnection()
		}
		// Check if facebook profile already exists at orbis
		showLoading();
		const profileDataObj = await getProfileData(address!.toString(),process.env.REACT_APP_FACEBOOK!);
		if (profileDataObj) {
			const params = new URLSearchParams(window.location.search)
			const origin = params.get('origin')!;
			alert("Sending to parent");
			window.parent?.postMessage(profileDataObj, origin);
			setIsFacebookConnected(true);
			hideLoading();
			window.close();
		} else {
			// if there is no profile yet, we connect facebook
			renderPropsOnclick();
		}
	}
	 
	useEffect(() => {
		const params = new URLSearchParams(window.location.search)
		const widget = params.get('isWidget')!;
		const dAppName = params.get('origin')!; 
		const idPlatform = params.get('id_platform')!;
		const apps = params.get('apps')!;

		if (widget == "true") {
			if(!idPlatform && !window.opener){
				navigate(`/?isWidget=false`);
			}
			else{
				if (apps?.split(",")) {
					for(let app of apps?.split(",")) {
						if(app === "twitter"){
							setIsTwitterSelected(true)
						}
						if(app === "facebook"){
							setIsFacebookSelected(true)
						}
					}
					setCallingDApp(dAppName);
					setIsWidget(true);
				}
			}
		}
		//else {
		//	navigate(`/?isWidget=false`);
		//} 
	}, [state])

	const wait = (timeout: number) => new Promise(resolve => setTimeout(resolve, timeout));

	useEffect(() => {
		const params = new URLSearchParams(window.location.search);
		const idPlatform = params.get('id_platform')!;
		if (idPlatform == "twitter" && !renderBlocker) {
			setRenderBlocker(true);
			const params = new URLSearchParams(window.location.search);
			const username = params.get('username')!;
			const displayName = params.get('display_name')!;
			const profileUrl = params.get('picture_url')!;

			const description = 'some description';
			const profile = {name: username, displayName: displayName, profileUrl: profileUrl};
			showLoading();
			setStep("creating-profile")
			createProfile(process.env.REACT_APP_TWITTER!, 
						process.env.REACT_APP_TWITTER_GROUP_ID!,
						username,
						description,
						AssetType.INTEREST,
						getTwitterInterests({}), JSON.stringify(profile)).then(isProfileCreated => {
							if (isProfileCreated) {
								// Add condition for making sure that the user has indeed connected
								setIsTwitterConnected(true);
								console.log("Twitter is successfully connected");
								wait(5000).then(res=>{
									window.close();
								}).catch(console.error);
							}
							else 
								console.log("Profile could not be created. Please try again");
							
						}).catch(error => {
							console.log(error);
							hideLoading();
							//window.close();
						})
		}
	}, [state])

	useEffect(() => {
		if(address) {
			const params = new URLSearchParams(window.location.search)
			const isWidget = params.get('isWidget')!;
			if (!isWidget || isWidget == "false")
				navigate(`/?isWidget=false`);
			else if (isWidget == "true") {
				// update widget state
				setIsWidget(true);
			}
			else
				throw new Error("Something went wrong while parsing the isWidget parameter");
			setIsMetamaskConnected(true)
		}
	}, [address])

	useEffect(() => {
		if(address) {
			showLoading();
			checkAddressExistence().then(res => {
				if (!res.data.exists) {
					setStep("pre-submit");
				} else {
					setStep("post-submit");
				}
				hideLoading();
			})		
		}
	}, [address])

	return (
		<PageWrapper
			isProtected={false}
			title={singUpStatus ? 'Sign Up' : 'Login'}
			// className={classNames({ 'bg-dark': !singUpStatus, 'bg-light': singUpStatus })}
			>
			<Page className='p-0'>
				{/*{ !renderBlocker && (*/
				<div className='row h-100 align-items-center justify-content-center'>
					<div className='col-xl-4 col-lg-6 col-md-8 shadow-3d-container'>
						<Card className='shadow-3d-dark' data-tour='login-page'>
							<CardBody>
								<div className='text-center mt-5'>
									<div
										className={classNames(
											'text-decoration-none  fw-bold display-2',
											{
												'text-dark': !darkModeStatus,
												'text-light': darkModeStatus,
											},
										)}
										aria-label='Facit'>
										{/* Here goes logo */}
										<CenteredImage imageSrc={PLogo} width={200} height={80}/>
									</div>
								</div>
								<div
									className={classNames('rounded-3', {
										'bg-l10-dark': !darkModeStatus,
										'bg-dark': darkModeStatus,
									})}>
								
								</div>

									{/* BEGIN :: Metamask Login*/}
										<LoginHeader step={step} isMetamaskConnected={false} callingDApp={callingDApp}/>
										{!address && step === "pre-submit" && (
										<>
											{/* <div className='col-12 mt-4 text-center text-muted'>
												OR
											</div> */}
											<div className='col-12 mt-4'>
												<Button
													isOutline
													color={darkModeStatus ? 'light' : 'dark'}
													className={classNames('w-100 py-3', {
														'border-light': !darkModeStatus,
														'border-dark': darkModeStatus,
													})}
													icon='CustomMetamask'
													onClick={handleMetamaskConnect}>
													Continue with MetaMask
												</Button>
											</div>
										</>	
										)}
									{/* END :: Metamask Login*/}

									{/* BEGIN :: Add email or skip */}
									{address && step === "pre-submit" && (
										<>
											<div className='col-12'>
												<Button
													isOutline
													color={darkModeStatus ? 'light' : 'dark'}
													className={classNames('w-100 py-3', {
														'border-light': !darkModeStatus,
														'border-dark': darkModeStatus,
													})}
													icon='Email'
													onClick={handleEmailOnClick}
													>
													{address ? "Register your Email" : "Continue with Email"}
												</Button>
											</div>
											<div className="d-flex justify-content-center mt-1">
												<a href="#" onClick={skipEmailRegistration}>Skip</a>
											</div>	
										</>
										)}
									{/* END :: Add email or skip */}

									{/* BEGIN :: Stych workflow */}
									{
										(step === "submit" || step === "verify") && (
											<>
											<StytchOTP showPostSubmit={showPostSubmit} step={step} moveBack={moveBack} sendCode={sendCode} tryAgain={tryAgain} address={address}/>
											</>
									)}
									{/* END :: Stych workflow */}

									{/* BEGIN :: Success page */}
									{
										(step === "success") && (
											<>
											<div className='d-flex align-items-center justify-content-center' style={{marginTop: "70px"}}>
												<p>Stay Connected with us!</p>
											</div>
											<div className='d-flex align-items-center justify-content-center' style={{marginBottom: "90px"}}>
												<a href="https://x.com/mvfwofficial?s=21&t=1GCSt3HPM8WcPENlVpgHfQ" target="_blank" rel="noopener noreferrer">
													<img src={Twitter} style={{height: "45px", width: "45px"}} alt="Twitter" />
												</a>
												<a href="https://www.instagram.com/mvfwofficial?igsh=MW15MW5hem44MTR3dQ==" target="_blank" rel="noopener noreferrer">
													<img src={Instagram} style={{height: "50px", width: "50px", marginLeft: "10px"}} alt="Instagram" />
												</a>
											</div>
											</>
									)}
									{/* END :: Success page */}
									

									{/* BEGIN :: Social Login */}
									{address && isWidget && step === "post-submit" &&(
										<>
											<form className='row g-4'>
											{isTwitterSelected && (<div className='col-12 mt-3'>
												<Button
													isOutline
													isDisable= {isTwitterConnected==true ? true: false}
													color={darkModeStatus ? 'light' : 'dark'}
													className={classNames('w-100 py-3', {
														'border-light': !darkModeStatus,
														'border-dark': darkModeStatus,
													})}
													icon='CustomTwitter'
													onClick={openTwitterOAuthPopup}>
													{!isTwitterConnected && (
															<>
															Connect Twitter
															</>
														)}
														{isTwitterConnected && (
															<>
															Connected
															</>
														)}
												</Button>
											</div>)}
											{isFacebookSelected && (<div className='col-12 mt-3'>
												<FacebookLogin
													appId="696970245672784"
													autoLoad={false}
													fields="name,picture,gender,inspirational_people,languages,meeting_for,quotes,significant_other,sports, music, photos, age_range, favorite_athletes, favorite_teams, hometown, feed, likes "
													callback={responseFacebook}
													cssClass='shadow-3d-container'
													scope="public_profile, email, user_hometown, user_likes, user_friends, user_gender, user_age_range"
													render={renderProps => (
														<Button
														isOutline
														isDisable= {isFacebookConnected==true ? true: false}
														color={darkModeStatus ? 'light' : 'dark'}
														className={classNames('w-100 py-3', {
															'border-light': !darkModeStatus,
															'border-dark': darkModeStatus,
														})}
														icon='CustomFacebook'
														onClick={() => {
															 // Define an async inner function to await handleBeforeFacebookPopup
															const onClickAsync = async () => {
																// Let it judge if we need to login facebook
																await handleBeforeFacebookPopup(renderProps.onClick);
													
															};
															// Call the async inner function
															onClickAsync();
														  }}
														>
															{!isFacebookConnected && (
																<>
																Connect Facebook
																</>
															)}
															{isFacebookConnected && (
																<>
																Connected
																</>
															)}
													</Button>
													)}
												/>
												<div className='text-center col-12 mt-3'>
												<a href='mailto:hirasiddiqui95@gmail.com'>
														<br />
													Please contact <u>devs</u> to request access for facebook
												</a>
												</div>
											</div>)}
											</form>
										</>
									)}
									{/* END :: Social Login */}
									{/* START:: Footer */}
									<LoginFooter/>
									{/* END :: Footer */}
							</CardBody>
						</Card>
						{!isInsideIframe && <div className='text-center'>
							<a
								href='/'
								className={classNames('text-decoration-none me-3', {
									'link-light': singUpStatus,
									'link-dark': !singUpStatus,
								})}>
								Privacy policy
							</a>
							<a
								href='/'
								className={classNames('link-light text-decoration-none', {
									'link-light': singUpStatus,
									'link-dark': !singUpStatus,
								})}>
								Terms of use
							</a>
						</div>}
					</div>
				</div>
				/*)}*/}
			</Page>
		</PageWrapper>
	);
};
Login.propTypes = {
	isSignUp: PropTypes.bool,
};
Login.defaultProps = {
	isSignUp: false,
};

export default Login;