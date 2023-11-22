import React, { FC, useCallback, useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useFormik } from 'formik';
import PageWrapper from '../../../layout/PageWrapper/PageWrapper';
import Page from '../../../layout/Page/Page';
import Card, { CardBody } from '../../../components/bootstrap/Card';
import Button from '../../../components/bootstrap/Button';
import Logo from '../../../components/Logo';
import useDarkMode from '../../../hooks/useDarkMode';
import AuthContext from '../../../contexts/authContext';
import USERS, { getUserDataWithUsername } from '../../../common/data/userDummyData';
import { connectSnap, getSnap, isLocalSnap } from '../../../utils';
import { MetaMaskContext, MetamaskActions } from '../../../hooks';
import { defaultSnapOrigin } from '../../../config';
import { getTwitterID } from '../../../utils/oauth';
import FacebookLogin from 'react-facebook-login/dist/facebook-login-render-props';
import useLocalStorageState from 'use-local-storage-state';
import { addCommitmentAndDidToSnap } from '../../../utils/orbis';



interface ILoginHeaderProps {
	isSnap?: boolean;
}
const LoginHeader: FC<ILoginHeaderProps> = ({ isSnap }) => {
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
			<div className='text-center h5 text-muted mb-5'>https://dapp-name.com</div>
		</>
	);
};
LoginHeader.defaultProps = {
	isSnap: true,
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

	const usernameCheck = (username: string) => {
		return !!getUserDataWithUsername(username);
	};

	const passwordCheck = (username: string, password: string) => {
		return getUserDataWithUsername(username).password === password;
	};

	const formik = useFormik({
		enableReinitialize: true,
		initialValues: {
			loginUsername: USERS.JOHN.username,
			loginPassword: USERS.JOHN.password,
		},
		validate: (values) => {
			const errors: { loginUsername?: string; loginPassword?: string } = {};

			if (!values.loginUsername) {
				errors.loginUsername = 'Required';
			}

			if (!values.loginPassword) {
				errors.loginPassword = 'Required';
			}

			return errors;
		},
		validateOnChange: false,
		onSubmit: (values) => {
			if (usernameCheck(values.loginUsername)) {
				if (passwordCheck(values.loginUsername, values.loginPassword)) {
					if (setUser) {
						setUser(values.loginUsername);
					}

					handleOnClick();
				} else {
					formik.setFieldError('loginPassword', 'Username and password do not match.');
				}
			}
		},
	});

	const [isLoading, setIsLoading] = useState<boolean>(false);
	const handleContinue = () => {
		setIsLoading(true);
		setTimeout(() => {
			if (
				!Object.keys(USERS).find(
					(f) => USERS[f].username.toString() === formik.values.loginUsername,
				)
			) {
				formik.setFieldError('loginUsername', 'No such user found in the system.');
			} else {
				setSignInPassword(true);
			}
			setIsLoading(false);
		}, 1000);
	};

	// metamask hooks
	const [state, dispatch] = useContext(MetaMaskContext);
	const isMetaMaskReady = isLocalSnap(defaultSnapOrigin)
	? state.isFlask
	: state.snapsDetected;

	// orbis hooks
	//const [orbisUser, setOrbisUser] = useState();
	//const [orbis, setOrbis] = useState(new Orbis({}));
	
	// local storage states (signed in user & did of user in case of orbis)
	//const [signedInUser, setSignedInUser] = useLocalStorageState('signedInUser', {defaultValue: ""});
	//const [did, setDid] = useLocalStorageState('did', {defaultValue: ""});

	// social logins connection hooks
	//TODO: Add tick or something in the buttons if a social login is already connected
	const [isFacebookConnected, setFacebookConnected] = useLocalStorageState('isFacebookConnected', {defaultValue: false});
	const [isTwitterConnected, setTwitterConnected] = useLocalStorageState('isTwitterConnected', {defaultValue: false});
	const [isTwitterUseEffectCalled, setTwitterUseEffectCalled] = useState(false);

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
			alert("Metamask Flask not installed. Please install from here: https://metamask.io/flask/");

		  }
		  dispatch({ type: MetamaskActions.SetError, payload: e });
		}
	  };
	  const handleOnTwitterClick = async () => {
		const params = new URLSearchParams(window.location.search)
		const isWidget = params.get('isWidget')!;
		await getTwitterID(isWidget);
		setTwitterConnected(true);
	  };
	  const responseFacebook = async (response: any) => {
		console.log(response);
		setFacebookConnected(true);
		// TODO: push correct data to ceramic
		const username = "some username";
		const description = 'some description';
		const reputationalAssetType = "Interests";
		const reputationalAssetData = ["random interest 1", "random interest 2"];
		await addCommitmentAndDidToSnap(	process.env.REACT_APP_FACEBOOK!, 
									process.env.REACT_APP_FACEBOOK_GROUP_ID!,
									username,
									description,
									reputationalAssetType,
									reputationalAssetData
								);
		alert("Facebook profile successfully connected");
	};	
	

	useEffect(() => {
		const params = new URLSearchParams(window.location.search)
		const idPlatform = params.get('id_platform')!;
		if (idPlatform == "twitter") {
			const params = new URLSearchParams(window.location.search);
			// TODO: push correct data to ceramic
			const username = params.get('username')!;
			const description = 'some description';
			const reputationalAssetType = "Interests";
			const reputationalAssetData = ["random interest 1", "random interest 2"];
			if ( !isTwitterConnected && !isTwitterUseEffectCalled) {      
				setTwitterUseEffectCalled(true);
				addCommitmentAndDidToSnap(process.env.REACT_APP_TWITTER!, 
										process.env.REACT_APP_TWITTER_GROUP_ID!,
										username,
										description,
										reputationalAssetType,
										reputationalAssetData
										).catch(console.error);
			}
		}
	}, [])


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
								<div className='text-center my-5' style={{marginLeft:"40%"}}>
									<Link
										to='/'
										className={classNames(
											'text-decoration-none  fw-bold display-2',
											{
												'text-dark': !darkModeStatus,
												'text-light': darkModeStatus,
											},
										)}
										aria-label='Facit'>
										<Logo width={200}/>
									</Link>
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
											<LoginHeader isSnap={true} />

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
									{!signInPassword && isMetaMaskReady && state.installedSnap && isWidget && (
										<>
										<LoginHeader isSnap={false} />

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
													color={darkModeStatus ? 'light' : 'dark'}
													className={classNames('w-100 py-3', {
														'border-light': !darkModeStatus,
														'border-dark': darkModeStatus,
													})}
													icon='CustomFacebook'
													onClick={renderProps.onClick}
													>
													Connect Facebook
												</Button>
												)}
											/>
											</div>
											<div className='col-12 mt-3'>
												<Button
													isOutline
													color={darkModeStatus ? 'light' : 'dark'}
													className={classNames('w-100 py-3', {
														'border-light': !darkModeStatus,
														'border-dark': darkModeStatus,
													})}
													icon='CustomTwitter'
													onClick={handleOnTwitterClick}>
													Continue Twitter
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