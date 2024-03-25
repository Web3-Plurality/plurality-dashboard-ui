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
import { MetaMaskContext, MetamaskActions } from '../../../hooks';
import { getTwitterID } from '../../../utils/oauth';
import FacebookLogin from 'react-facebook-login/dist/facebook-login-render-props';
import { createProfile, AssetType, getProfileData, createProfileTwitterPopup, createZKProofTwitterPopup, ProfileData } from '../../../utils/orbis';
import { getFacebookInterests } from '../../../utils/facebookUserInterest';
import { getTwitterInterests } from '../../../utils/twitterUserInterest';
import LoadingContext from '../../../utils/LoadingContext';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import PLogo from '../../../assets/img/logo-no-bg.png';



interface ILoginHeaderProps {
	isSnap?: boolean;
	callingDApp?: String;
}
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
	const [showLoginScreen, setShowLoginScreen] = useState<boolean>(true);
	const [singUpStatus, setSingUpStatus] = useState<boolean>(!!isSignUp);
	
	const navigate = useNavigate();
	const handleOnClick = useCallback(() => navigate('/'), [navigate]);

	// metamask hooks
	const [state, dispatch] = useContext(MetaMaskContext);

	// social logins connection hooks
	const [isFacebookConnected, setFacebookConnected] = useState<Boolean>(false);
	const [isTwitterConnected, setTwitterConnected] = useState<Boolean>(false);
	const [callingDApp, setCallingDApp] = useState<String>("");
	const [isFacebookSelected, setIsFacebookSelected] = useState<Boolean>(false);
	const [isTwitterSelected, setIsTwitterSelected] = useState<Boolean>(false);
	const { showLoading, hideLoading } = useContext(LoadingContext);

	const handleMetamaskConnect = async () => {
		
		try {	
		  if (setUser) setUser("user");
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
		  setShowLoginScreen(false);
		} catch (e: any) {
		  console.error(e);
		  dispatch({ type: MetamaskActions.SetError, payload: e });
		}
	  };


	// wagmi connectors and disconnectors
	const { connect, connectors, error, isLoading, pendingConnector } = useConnect();
	const { address, connector, isConnected } = useAccount();
	const { disconnect } = useDisconnect()

	const [renderBlocker, setRenderBlocker] = useState(false);

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
				const profileDataObj = await getProfileData(address!.toString(),process.env.REACT_APP_FACEBOOK!);
				if (profileDataObj) {
					const params = new URLSearchParams(window.location.search)
					const origin = params.get('origin')!;
					window.opener?.postMessage(profileDataObj, origin);
					wait(5000).then(res=>{
						window.close();
					}).catch(console.error);
					window.close();
				}
				//await sendDataToDApp();
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
					window.opener?.postMessage(profileDataObj, origin);
					setTwitterConnected(true);
					await wait(5000);
					window.close();
				}
				else {
					console.log("Could not add twitter verification post to orbis");	
					window.close();								
				}
			}
			else {
				console.log("waiting");
				await wait(5000);
			}
		}

	  };
	 
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
		if (idPlatform == "twitter" && !renderBlocker) {
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

									{showLoginScreen && (
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
													onClick={handleMetamaskConnect}>
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

									{/* BEGIN :: Social Login */}
									{!showLoginScreen && isWidget && isConnected &&(
										<>
										<LoginHeader isSnap={false} callingDApp={callingDApp} />

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