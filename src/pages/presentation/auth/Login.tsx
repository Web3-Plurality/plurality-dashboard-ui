import React, { FC, useCallback, useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import classNames from 'classnames';
//import { useFormik } from 'formik';
import PageWrapper from '../../../layout/PageWrapper/PageWrapper';
import Page from '../../../layout/Page/Page';
import Card, { CardBody } from '../../../components/bootstrap/Card';
import Button from '../../../components/bootstrap/Button';
import Logo from '../../../components/Logo';
import useDarkMode from '../../../hooks/useDarkMode';
import AuthContext from '../../../contexts/authContext';
import { connectSnap, getSnap, isLocalSnap } from '../../../utils';
import { MetaMaskContext, MetamaskActions } from '../../../hooks';
import { defaultSnapOrigin } from '../../../config';
import { getTwitterID } from '../../../utils/oauth';
import FacebookLogin from 'react-facebook-login/dist/facebook-login-render-props';
import { checkIfProfileSaved, createProfile, AssetType, getProfileData, createProfileTwitterPopup, createZKProofTwitterPopup, ProfileData } from '../../../utils/orbis';
import { getFacebookInterests } from '../../../utils/facebookUserInterest';
import { getTwitterInterests } from '../../../utils/twitterUserInterest';
import LoadingContext from '../../../utils/LoadingContext';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import PLogo from '../../../assets/img/logo-no-bg.png';
import { CheckBox } from '../../../components/icon/material-icons';



interface ILoginHeaderProps {
	isSnap?: boolean;
	callingDApp?: String;
}
interface IConsentHeaderProps {
	socialMedia?: String;
	callingDApp?: String;
}
const ConsentHeader: FC<IConsentHeaderProps> = ({ socialMedia, callingDApp }) => {
	return (
		<>
			<div className='text-center h1 fw-bold mt-5'>Reputation Connect</div>
			<div className='text-center h4 text-muted mb-5'>Do you agree to share your {socialMedia} data with {callingDApp} ?</div>
		</>
	);
};
const LoginHeader: FC<ILoginHeaderProps> = ({ isSnap, callingDApp }) => {
	if (isSnap) {
		return (
			<>
			<div className='text-center h1 fw-bold mt-5'>Plurality Connect</div>
			<div className='text-center h4 text-muted mb-5'>Sign in to continue!</div>
			</>
		);
	}
	return (
		<>
			<div className='text-center h1 fw-bold mt-5'>Plurality Connect</div>
			<div className='text-center h4 text-muted mb-5'>Connect your social profiles to:</div>
			<div className='text-center h5 text-muted mb-5'>{callingDApp}</div>
		</>
	);
};

// Modal box styling
const modalStyle = {
	width: '300px',
	height: '280px',
	top: '49%',
	left: '50%',
	right: 'auto',
	bottom: 'auto',
	marginRight: '-50%',
	transform: 'translate(-50%, -50%)',
};

LoginHeader.defaultProps = {
	isSnap: true,
	callingDApp: "http://some-dapp.com"
};

interface ILoginProps {
	isSignUp?: boolean;
}
const Login: FC<ILoginProps> = ({ isSignUp }) => {
	const { setUser } = useContext(AuthContext);
	const { darkModeStatus } = useDarkMode();

	const [isWidget, setIsWidget] = useState(false);  
	const [signInPassword, setSignInPassword] = useState<boolean>(false);
	const [singUpStatus, setSingUpStatus] = useState<boolean>(!!isSignUp);
	
	const navigate = useNavigate();
	const handleOnClick = useCallback(() => navigate('/'), [navigate]);

	// metamask hooks
	const [state, dispatch] = useContext(MetaMaskContext);
	const isMetaMaskReady = isLocalSnap(defaultSnapOrigin)
	? state.isFlask
	: state.snapsDetected;

	// social logins connection hooks
	const [isFacebookConnected, setFacebookConnected] = useState<Boolean>(false);
	const [isTwitterConnected, setTwitterConnected] = useState<Boolean>(false);
	const [callingDApp, setCallingDApp] = useState<String>("");
	const [isFacebookSelected, setIsFacebookSelected] = useState<Boolean>(false);
	const [isTwitterSelected, setIsTwitterSelected] = useState<Boolean>(false);
	const { showLoading, hideLoading } = useContext(LoadingContext);
	// const [makeConsentFor, setMakeConsentFor] = useState("");
	const [isTwitterChecked, setIsTwitterChecked] = useState(false);
	const [isFacebookChecked, setIsFacebookChecked] = useState(false);
	const [isSocialThreeChecked, setIsSocialThreeChecked] = useState(false);
	const [isModalBoxVisible, setIsModalBoxVisible] = useState(false);

	// wagmi connectors and disconnectors
	const { connect, connectors, error, isLoading, pendingConnector } = useConnect();
	const { address, connector, isConnected } = useAccount();
	const { disconnect } = useDisconnect()

	const [renderBlocker, setRenderBlocker] = useState(false);

	// Checkbox for social medias
	const checkboxIsVisible = () => {
		return ;
	}

	const checkboxTwitterHandleOnChange = async () => {
		setIsTwitterChecked(!isTwitterChecked)
	}

	const checkboxFacebookHandleOnChange = async () => {
		setIsFacebookChecked(!isFacebookChecked)
	}

	// Consent tooltip
	const consentTooltip = () => {
		if (isTwitterChecked || isFacebookChecked) {
			return "connect your profile"
		}
		return "you need to select a social media first"
	}

	const setVisibilityOfModalBox = () => {
		if(!isTwitterChecked || !isFacebookChecked){
			setIsModalBoxVisible(true)
		}
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
		//todo: check how to handle this - social already conected (commitments in snap), but metamask not connected
		/*const wait = () => new Promise(resolve => setTimeout(resolve, 1000));
		while (!address) {
			if (address)
				return true;
			else 
				await wait();
		}
		return false;*/

	}

	const handleSnapConnect = async () => {
		
		try {	
		  await connectSnap();
		  const installedSnap = await getSnap();
		  dispatch({
			type: MetamaskActions.SetInstalled,
			payload: installedSnap,
		  });
		  if (setUser) setUser("user");
		  console.log(state.installedSnap);
		  const res = await ensureMetamaskConnection();

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
		} catch (e: any) {
		  console.error(e);
		  if (e.message == "Fetching local snaps is disabled.") {
			alert("Please install flask which is the development version of Metamask from here: https://metamask.io/flask/");
		  }
		  else {
			alert("Snap installation failed, please make sure you are using Metamask Flask (can be downloaded from https://metamask.io/flask/) and try again");
		  }
		  dispatch({ type: MetamaskActions.SetError, payload: e });
		}
	  };

	const responseFacebook = async (response: any) => {
		console.log(response);
		if (response.accessToken) {
			showLoading();
			console.log(response);
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
				setFacebookConnected(true);
				// const profileDataObj = await getProfileData(address!.toString(),process.env.REACT_APP_FACEBOOK!);
				// if (profileDataObj) {
				// 	const params = new URLSearchParams(window.location.search)
				// 	const origin = params.get('origin')!;
				// 	window.opener?.postMessage(profileDataObj, origin);
				// 	wait(5000).then(res=>{
				// 		//window.close();
				// 	}).catch(console.error);
				// 	//window.close();
				// }
				// //await sendDataToDApp();
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
	};	

	const twitterConsent = () => {
		console.log("user is making consent for twitter");
		const urlParams = new URLSearchParams(window.location.search);
		const originURL = urlParams.get('origin');
		getProfileData(address!.toString(),process.env.REACT_APP_TWITTER!).then(profileDataObj => {
			console.log(profileDataObj);
			if (profileDataObj) {
				hideLoading();
				window.opener.postMessage(profileDataObj, originURL);
				// window.close();
			}
		});
	}

	const facebookConsent = () => {
		console.log("user is making consent for facebook");
		const urlParams = new URLSearchParams(window.location.search);
		const originURL = urlParams.get('origin');
		getProfileData(address!.toString(),process.env.REACT_APP_FACEBOOK!).then(profileDataObj => {
			console.log(profileDataObj);
			if (profileDataObj) {
				hideLoading();
				window.opener.postMessage(profileDataObj, originURL);
				//window.close();
			}
		});
	}

	const moveForward = () => {
		// write the logic of how to share user profile data to dapp
		console.log("user made consent");
	 	showLoading();
		if (isTwitterChecked) {
			twitterConsent()
		} else if (isFacebookChecked) {
			facebookConsent()
		}
		// TODO
		// Need to find a way of asynchronizly close the widget
	}

	const moveBack = () => {
		setIsModalBoxVisible(false)
	}

	// const consent = () => {
	// 	console.log("user made consent");
	// 	showLoading();
	// 	switch(makeConsentFor){
	// 		case "twitter": {
	// 			twitterConsent(); 
	// 			break;
	// 		}
	// 		case "facebook": {
	// 			FacebookConsent();
	// 			break;
	// 		}
	// 	}
	// }

	// const decline = () => {
	// 	console.log("user declined");
	// 	window.close();
	// }

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
		const popupHeight = 600;
		//const popupLeft = (window.innerWidth - popupWidth) / 2;
		//const popupTop = (window.innerHeight - popupHeight) / 2;
		const popupLeft = 500;
		const popupTop = 100;

		// Open the popup window
		const childWindow = window.open(
		  apiUrl,
		  '_blank',
		  `width=${popupWidth}, height=${popupHeight}, top=${popupTop}, left=${popupLeft}`
		);
		console.log("Child window: ");
		console.log(childWindow);

		ensureMetamaskConnection().then(res=> {
			if (res) console.log("address connected");
			else console.log("Address not connected");
		});

		while (!isTwitterConnected) {
			showLoading();
			console.log("Twitter not yet connected, so waiting");
			const profileDataObj = await getProfileData(address!.toString(),process.env.REACT_APP_TWITTER!);
			if (profileDataObj) {
				childWindow!.close();
				const res = await createZKProofTwitterPopup(process.env.REACT_APP_TWITTER!, process.env.REACT_APP_TWITTER_GROUP_ID!);
				if (res) {
					console.log("Added twitter verification post to orbis");
					//window.opener?.postMessage(profileDataObj, origin);
					setTwitterConnected(true);
					await wait(5000);
					//window.close();
					break;
				}
				else {
					console.log("Could not add twitter verification post to orbis");	
					//window.close();								
				}
			}
			else {
				console.log("waiting");
				await wait(5000);
			}
		}

	  };

	  const checkConnectProfilesOnPageLoad = async () => {
		if (isMetaMaskReady && state.installedSnap) {
			const facebook = await checkIfProfileSaved(process.env.REACT_APP_FACEBOOK!);
			const twitter = await checkIfProfileSaved(process.env.REACT_APP_TWITTER!);
			await ensureMetamaskConnection();
			const urlParams = new URLSearchParams(window.location.search);
			const originURL = urlParams.get('origin');
			if (twitter == true && isTwitterSelected)  { 
				setTwitterConnected(twitter); 	
			}
			if (facebook == true && isFacebookSelected) { 
				setFacebookConnected(facebook);		
			}
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
				//TODO verifiy if we still need this?
                for(let app of apps.split(",")) {
				    if(app === "twitter"){
					    setIsTwitterSelected(true)
				    }
				    if(app === "facebook"){
					    setIsFacebookSelected(true)
                    }
			    }
				setCallingDApp(dAppName);
				setIsWidget(true);
				checkConnectProfilesOnPageLoad().catch(console.error);
			}
		}
		else {
			navigate(`/?isWidget=false`);
		} 
	}, [state])

	const wait = (timeout: number) => new Promise(resolve => setTimeout(resolve, timeout));

	useEffect(() => {

		const params = new URLSearchParams(window.location.search);
		const idPlatform = params.get('id_platform')!;
		if (idPlatform == "twitter" && state.installedSnap && !renderBlocker) {
			setRenderBlocker(true);
			const params = new URLSearchParams(window.location.search);
			const username = params.get('username')!;
			const displayName = params.get('display_name')!;
			const profileUrl = params.get('picture_url')!;

			const description = 'some description';
			const profile = {name: username, displayName: displayName, profileUrl: profileUrl};
			showLoading();
			createProfileTwitterPopup(process.env.REACT_APP_TWITTER!, 
						process.env.REACT_APP_TWITTER_GROUP_ID!,
						username,
						description,
						AssetType.INTEREST,
						getTwitterInterests({}), JSON.stringify(profile)).then(isProfileCreated => {
							if (isProfileCreated) {
								// Add condition for making sure that the user has indeed connected
								//setTwitterConnected(true);
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

	return (
		<PageWrapper
			isProtected={false}
			title={singUpStatus ? 'Sign Up' : 'Login'}
			className={classNames({ 'bg-dark': !singUpStatus, 'bg-light': singUpStatus })}>
			<Page className='p-0'>
				{/*{ !renderBlocker && (*/
				<div className='row h-100 align-items-center justify-content-center'>
					<div className='col-xl-4 col-lg-6 col-md-8 shadow-3d-container'>
						<Card className='shadow-3d-dark' data-tour='login-page'>
							<CardBody>
								<div className='text-center my-5'>
									<div
										className={classNames(
											'text-decoration-none  fw-bold display-2',
											{
												'text-dark': !darkModeStatus,
												'text-light': darkModeStatus,
											},
										)}
										aria-label='Facit'>
										{/* <Logo width={200}/> */}
										<img src={PLogo} alt="Logo" style={{height: "100px"}}/>
									</div>
								</div>
								<div
									className={classNames('rounded-3', {
										'bg-l10-dark': !darkModeStatus,
										'bg-dark': darkModeStatus,
									})}>
								
								</div>


									{/* BEGIN :: Snap install */}

									{!signInPassword && (!isMetaMaskReady || !state.installedSnap) && (
										<>
											<LoginHeader isSnap={true} callingDApp={callingDApp}/>

											<form className='row g-4'>
											<div className='col-12 mt-3'>
												<Button
													isOutline
													color={darkModeStatus ? 'light' : 'dark'}
													className={classNames('w-100 py-3', {
														'border-light': !darkModeStatus,
														'border-dark': darkModeStatus,
													})}
													icon='CustomMetamask'
													onClick={handleSnapConnect}>
													Sign in with MetaMask
												</Button>
											</div>
											<div className='col-12 mt-3 text-center text-muted'>
												OR
											</div>
											<div className='col-12'>
												<Button
													isOutline
													color={darkModeStatus ? 'light' : 'dark'}
													className={classNames('w-100 py-3', {
														'border-light': !darkModeStatus,
														'border-dark': darkModeStatus,
													})}
													icon='CustomGoogle'
													onClick={handleOnClick}
													isDisable>
													Coming Soon
												</Button>
											</div>
											</form>
										</>

									)}
									{/* END :: Snap install */}

									{/* BEGIN :: Consent page */}
									{/* {isMetaMaskReady && state.installedSnap && isWidget && isConnected && makeConsentFor &&(
										<>
										<ConsentHeader socialMedia={makeConsentFor} callingDApp={callingDApp}/>
										<form className='row g-4'></form>
											<div className='col-12 mt-3'>
												<Button 
													isOutline
													color={darkModeStatus ? 'dark' : 'light'}
													className={classNames('w-100 py-3', {
														'border-light': !darkModeStatus,
														'border-dark': darkModeStatus,
													})}
													onClick={consent}>Consent</Button>
											</div>
											<div className='col-12 mt-3'>
												<Button 
													isOutline
													color={darkModeStatus ? 'dark' : 'light'}
													className={classNames('w-100 py-3', {
														'border-light': !darkModeStatus,
														'border-dark': darkModeStatus,
													})}
													onClick={decline}>Decline</Button>
											</div>
										</>
									)} */}
									{/* END :: Consent page */}

									{/* BEGIN :: Social Login */}
									{isMetaMaskReady && state.installedSnap && isWidget && isConnected &&(
										<>
										<LoginHeader isSnap={false} callingDApp={callingDApp} />
											<form className='row g-4'>
												<div style={{"display": "flex", "justifyContent": "space-between"}}>
													{ (isTwitterConnected || isFacebookConnected) && (<input
														style={{"height": "35px", "width": "35px", marginTop:"7px"}}
														type="checkbox"
														id="socialOne"
														checked={isTwitterChecked}
														disabled={!isTwitterConnected}
														onChange={checkboxTwitterHandleOnChange}/>) }
													<div style={{"flex": "0 0 auto", "width": "90%"}}>
														{isTwitterSelected && (<div>
														<Button
															isOutline
															isDisable= {isTwitterConnected==true ? true: false}
															color={darkModeStatus ? 'dark' : 'light'}
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
													</div>
												</div>

												<div style={{"display": "flex", "justifyContent": "space-between"}}>
													{ (isTwitterConnected || isFacebookConnected) && (<input
														style={{"height": "35px", "width": "35px", marginTop:"7px"}}
														type="checkbox"
														id="socialTwo"
														checked={isFacebookChecked}
														disabled={!isFacebookConnected}
														onChange={checkboxFacebookHandleOnChange}/>) }
													<div style={{"flex": "0 0 auto", "width": "90%"}}>	
														{isFacebookSelected && (<div>
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
																color={darkModeStatus ? 'dark' : 'light'}
																className={classNames('w-100 py-3', {
																	'border-light': !darkModeStatus,
																	'border-dark': darkModeStatus,
																})}
																icon='CustomFacebook'
																onClick={renderProps.onClick}
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
														</div>)}
													</div>
												</div>

												<div style={{"display": "flex", "justifyContent": "space-between"}}>
													<div style={{"flex": "0 0 auto", "width": "100%"}}>
														{isTwitterSelected && (<div title={consentTooltip()}>
														<Button
															isOutline
															isDisable= {!isTwitterChecked && !isFacebookChecked}
															color={darkModeStatus ? 'dark' : 'light'}
															className={classNames('w-100 py-3', {
																'border-light': !darkModeStatus,
																'border-dark': darkModeStatus,
															})}
															onClick={setVisibilityOfModalBox}>
															I consent to share my data with {callingDApp} 
														</Button>
														</div>)}
													</div>
												</div>

											</form>
											<div className='text-center col-12 mt-3'>
												<a href='mailto:hirasiddiqui95@gmail.com'>
														<br />
													Please contact <u>devs</u> to request access for facebook
												</a>
											</div>
										</>
									)}
									{/* END :: Social Login */}
							</CardBody>
						</Card>
						<div className='text-center'>
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
						</div>
						(<dialog id="modal" open = {isModalBoxVisible} style={modalStyle}>
  							<p style={{marginBottom: "130px"}}>Actually you can share more social media data to {callingDApp}, are you sure to move forward?</p>
							<a href="">Learn more about the benefits of sharing more data</a>
							<div className="d-flex justify-content-evenly">
								<button id="moveFoward" onClick={moveForward}>Yes</button>
								<button id="moveBack" onClick={moveBack}>Back</button>
							</div>
						</dialog>)
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