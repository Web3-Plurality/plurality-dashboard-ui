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
//import USERS, { getUserDataWithUsername } from '../../../common/data/userDummyData';
import { connectSnap, getSnap, isLocalSnap } from '../../../utils';
import { MetaMaskContext, MetamaskActions } from '../../../hooks';
import { defaultSnapOrigin } from '../../../config';
import { getTwitterID } from '../../../utils/oauth';
import FacebookLogin from 'react-facebook-login/dist/facebook-login-render-props';
import { checkIfProfileSaved, createProfile, AssetType } from '../../../utils/orbis';
import { getFacebookInterests } from '../../../utils/facebookUserInterest';
import { getTwitterInterests } from '../../../utils/twitterUserInterest';
import LoadingContext from '../../../utils/LoadingContext';



interface ILoginHeaderProps {
	isSnap?: boolean;
	callingDApp?: String;
}
const LoginHeader: FC<ILoginHeaderProps> = ({ isSnap, callingDApp }) => {
	if (isSnap) {
		return (
			<>
			<div className='text-center h1 fw-bold mt-5'>Reputation Connect</div>
			<div className='text-center h4 text-muted mb-5'>Sign in to continue!</div>
			</>
		);
	}
	return (
		<>
			<div className='text-center h1 fw-bold mt-5'>Reputation Connect</div>
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
	const { showLoading, hideLoading } = useContext(LoadingContext);


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
	  const handleOnTwitterClick = async () => {
		const params = new URLSearchParams(window.location.search)
		const isWidget = params.get('isWidget')!;
		const origin = params.get('origin')!;
		await getTwitterID(isWidget, origin);
	  };
	  const responseFacebook = async (response: any) => {
		console.log(response);
		if (response.accessToken) {
			showLoading();
			const interests = getFacebookInterests(response);
			const username = "some username";
			const description = 'some description';
			try {
			const isProfileCreated = await createProfile(process.env.REACT_APP_FACEBOOK!, 
									process.env.REACT_APP_FACEBOOK_GROUP_ID!,
									username,
									description,
									AssetType.INTEREST,
									interests
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
	
	const checkConnectProfilesOnPageLoad = async () => {
		if (isMetaMaskReady && state.installedSnap) {
			const facebook = await checkIfProfileSaved(process.env.REACT_APP_FACEBOOK!);
			const twitter = await checkIfProfileSaved(process.env.REACT_APP_TWITTER!)
			if (twitter == true) setTwitterConnected(twitter);
			if (facebook == true) setFacebookConnected(facebook);

			if (facebook && twitter) {
				// close the browser tab
				//alert("All required profiles have been connected. Closing the widget");
				//window.open("about:blank", "_self");
				//window.close();
			}
		}
	}

	useEffect(() => {
		const params = new URLSearchParams(window.location.search)
		const widget = params.get('isWidget')!;
		const dAppName = params.get('origin')!; 

		if (widget == "true") {
			setCallingDApp(dAppName);
			setIsWidget(true);
			checkConnectProfilesOnPageLoad().catch(console.error);
		}
		if ((widget=="false" || !widget) && state.installedSnap) {
			navigate(`/?isWidget=false`);
		} 
	}, [state])
	
	useEffect(() => {
		const params = new URLSearchParams(window.location.search)
		const idPlatform = params.get('id_platform')!;
		if (idPlatform == "twitter" && state.installedSnap) {
			const params = new URLSearchParams(window.location.search);
			const username = params.get('username')!;
			const description = 'some description';
			showLoading();
			createProfile(process.env.REACT_APP_TWITTER!, 
						process.env.REACT_APP_TWITTER_GROUP_ID!,
						username,
						description,
						AssetType.INTEREST,
						getTwitterInterests({})).then(isProfileCreated => {
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
	}, [state])


	return (
		<PageWrapper
			isProtected={false}
			title={singUpStatus ? 'Sign Up' : 'Login'}
			className={classNames({ 'bg-dark': !singUpStatus, 'bg-light': singUpStatus })}>
			<Page className='p-0'>
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
										<Logo width={200}/>
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
									{/* BEGIN :: Social Login */}
									{isMetaMaskReady && state.installedSnap && isWidget && (
										<>
										<LoginHeader isSnap={false} callingDApp={callingDApp} />

											<form className='row g-4'>
											<div className='col-12 mt-3'>
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
											</div>
											<div className='col-12 mt-3'>
												<Button
													isOutline
													isDisable= {isTwitterConnected==true ? true: false}
													color={darkModeStatus ? 'light' : 'dark'}
													className={classNames('w-100 py-3', {
														'border-light': !darkModeStatus,
														'border-dark': darkModeStatus,
													})}
													icon='CustomTwitter'
													onClick={handleOnTwitterClick}>
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
											</div>
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