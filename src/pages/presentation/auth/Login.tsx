import React, { FC, useCallback, useContext, useEffect, useRef, useState } from 'react';
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

axios.defaults.withCredentials = true;
type OtpStep = 'pre-submit' | 'submit' | 'verify' | 'post-submit' | 'success' | 'creating-profile';

const isIframe = window.location !== window.parent.location
const LoginHeader: FC<any> = ({ step }) => {
	return (
		<>
			<div className='text-center h1 fw-bold' style={{ marginTop: "20px" }}>Social Connect</div>
			{step === "pre-submit" && (<div className='text-center h6 mt-2' style={{ marginBottom: "50px" }}>Subscribe to access early bird benefits</div>)}
			{step === "submit" && (<div className='text-center h6 mt-2' style={{ marginBottom: "50px" }}>A verification code will be sent to your email</div>)}
			{step === "verify" && (<div className='text-center h6 mt-2' style={{ marginBottom: "50px" }}>Enter the 6 digit code sent to your email</div>)}
			{step === "success" && (<div className='text-center h6 mt-2' style={{ marginBottom: "50px" }}>Subscription successful. Congrats!</div>)}
			{step === "post-submit" && (<div className='text-center h6 mt-2' style={{ marginBottom: "50px" }}>Please connect your social profiles</div>)}
			{step === "creating-profile" && (<div className='text-center h6 mt-2' style={{ marginBottom: "50px" }}>Your profile is creating, please don't close this window</div>)}
		</>
	);
};
const LoginFooter: FC<any> = ({ address }: { address: string }) => {
	return (
		<div className="d-flex align-items-center justify-content-center" style={{ marginTop: isIframe && !address ? "105px" : "50px" }}>
			Powered by
			<a href="https://twitter.com/PluralityWeb3" target="_blank" rel="noopener noreferrer">
				<img src={PLogo} alt="Logo" style={{ width: "100px", height: "40px" }} />
			</a>
		</div>
	);
};
const CenteredImage: FC<any> = ({ imageSrc, width, height }) => {
	return (
		<>
			<div className='d-flex align-items-center justify-content-center'>
				<img src={imageSrc} alt="GIF Image" style={{ width: width, height: height }} />
			</div>
		</>
	);
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

	// profile data
	const [userTwitterProfiles, setUserTwitterProfiles] = useState<any>();
	const [userFacebookProfiles, setUserFacebookProfiles] = useState<any>();

	// wagmi connectors and disconnectors
	const { connect, connectors } = useConnect();
	const { address, connector, isConnected } = useAccount();

	const [renderBlocker, setRenderBlocker] = useState(false);
	const [popup, setPopup] = useState<Window | null>(null)

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

	useEffect(() => {
		const evtSource = new EventSource(`${process.env.REACT_APP_API_BASE_URL}/register-event`, { withCredentials: true });
		evtSource.onmessage = function (event) {
			const {message, app} = JSON.parse(event?.data)
			if (message === "received") {
				if (app === "twitter") {
					console.log("Twitter message received");
					handleInfoRequestTwitter();
				}
				else if (JSON.parse(event?.data)?.app === "tiktok") {
					console.log("Tiktok message received");
					handleInfoRequestTiktok();
				}
			}
		};

		evtSource.onerror = function (err) {
			console.error('EventSource failed:', err);
			evtSource.close();
		};
	}, [])

	useEffect(() => {
        let intervalId: any;

        if (popup) {
            intervalId = setInterval(() => {
                if (popup.closed) {
                    hideLoading();
                    clearInterval(intervalId);
                    setPopup(null);
                    console.log("Popup closed");
                }
            }, 500);
        }

        // Cleanup the interval when the component unmounts or popup is closed
        return () => clearInterval(intervalId);
    }, [popup]);

	const handleInfoRequestTwitter = async () => {
		console.log("info endpoint")
		await axios.get(`${process.env.REACT_APP_API_BASE_URL}/oauth-twitter/info`)
			.then(response => {
				console.log(response)
				const {
					username, name, reputationScore, 
					description, introTags, followersCount, 
					followingCount, tweetCount, 
					mostRecentTweetId, interests
				} = response.data.twitterProfile
				const profile = { 
					name: username, 
					displayName: name, 
					profileUrl: `https://twitter.com/${username}`,
					reputationScore,
					description,
					introTags,
					followersCount,
					followingCount,
					tweetCount,
					mostRecentTweet: `https://twitter.com/${username}/status/${mostRecentTweetId}`,
					interests,
				};
				createProfile(process.env.REACT_APP_TWITTER!,
					process.env.REACT_APP_TWITTER_GROUP_ID!,
					username,
					description,
					AssetType.INTEREST,
					interests, 
					JSON.stringify(profile))
					.then(isProfileCreated => {
						console.log("Profile created response", isProfileCreated)
						if (isProfileCreated) {
							setUserTwitterProfiles(constructProfileData(AssetType.INTEREST, response.data.twitterProfile.interests, process.env.REACT_APP_TWITTER!, JSON.stringify(profile)));
							console.log("Profile created response 1")
							setIsTwitterConnectedInLocalStorage();
							hideLoading();
						}
						else
							console.log("Profile could not be created. Please try again");

						hideLoading();

					}).catch(error => {
						console.log(error);
						hideLoading();
					})
				console.log('Info:', response.data);
			})
			.catch(error => {
				hideLoading()
				console.error('Error getting info:', error);
			});
	};

	const handleInfoRequestTiktok = async () => {
		await axios.get(`${process.env.REACT_APP_API_BASE_URL}/oauth-tiktok/info`)
			.then(response => {
				hideLoading()
				console.log('Info:', response.data);
			})
			.catch(error => {
				hideLoading()
				console.error('Error getting info:', error);
			});
	};

	useEffect(() => {
		const params = new URLSearchParams(window.location.search)
		const origin = params.get('origin')!;
		window.parent.postMessage({ eventName: 'profilesConnectionCompleted', data: JSON.stringify(isFacebookConnected && isTwitterConnected) }, origin);
	}, [isFacebookConnected, isTwitterConnected])

	const skipEmailRegistration = async () => {
		showLoading();
		const apiUrl = process.env.REACT_APP_API_BASE_URL + '/stytch';
		axios.post(apiUrl, {
			data: { email: "", address: address, subscribe: false }
		})
			.then(function (response) {
				if (response.status === 200) {
					showPostSubmit();
				}
			})
			.catch(function (error) {
				alert("Something goes wrong, please try again!")
			})
		hideLoading();
	}


	// If the user skipped the profile connect
	const skipConnectProfiles = async () => {
		console.log("Profile Connected here - Start")
		showLoading();
		const params = new URLSearchParams(window.location.search)
		const origin = params.get('origin')!;
		// If nothing is connected
		if (!userTwitterProfiles && !userFacebookProfiles) {
			console.log("No account connected")
			window.parent.postMessage({ eventName: 'profileDataReturned', data: [] }, origin);
		} else if (userTwitterProfiles && !userFacebookProfiles) {
			console.log("Twitter Connected block")
			window.parent.postMessage({ eventName: 'profileDataReturned', data: [userTwitterProfiles] }, origin);
		} else if (!userTwitterProfiles && userFacebookProfiles) {
			console.log("Facebook Connected block")
			window.parent.postMessage({ eventName: 'profileDataReturned', data: [userFacebookProfiles] }, origin);
		} else {
			console.log("Facebook and Twitter Connected block")
			window.parent.postMessage({ eventName: 'profileDataReturned', data: [userTwitterProfiles, userFacebookProfiles] }, origin);
		}
		console.log("Profile Connected here - End")
		hideLoading();
	}

	const checkAddressExistence = () => {
		const apiUrl = process.env.REACT_APP_API_BASE_URL + '/stytch/check-address'
		return axios.get(apiUrl, {
			params: {
				address: address
			}
		})
	}


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
		try {
			console.log(response);
			if (response.accessToken) {
				const interests = getFacebookInterests(response);
				const username = response.name;
				const description = 'some description';
				const profile = { name: username, profileUrl: "" };
				const isProfileCreated = await createProfile(process.env.REACT_APP_FACEBOOK!,
					process.env.REACT_APP_FACEBOOK_GROUP_ID!,
					username,
					description,
					AssetType.INTEREST,
					interests,
					JSON.stringify(profile)
				);
				if (isProfileCreated) {
					// setIsFacebookConnected(true);
					setIsFacebookConnectedInLocalStorage();
					// We can construct the profile data from user login data
					const profileDataObj = constructProfileData(AssetType.INTEREST, interests, process.env.REACT_APP_FACEBOOK!, JSON.stringify(profile));
					if (profileDataObj) {
						const params = new URLSearchParams(window.location.search)
						const origin = params.get('origin')!;
						setUserFacebookProfiles(profileDataObj)
						wait(5000).then(res => {
							window.close();
						}).catch(console.error);
						window.close();
					}
				}
				else
					console.log("Profile could not be created. Please try again");
					hideLoading();
			}
			else {
				console.log("access token not found");
				alert("Could not sign in to facebook");
				hideLoading();
			}
		}
		catch (error) {
			console.log(error);
			alert(error);
			hideLoading();
		}
	};

	const failureFacebook = (error: any) => {
		alert(error);
		hideLoading()
	}

	const constructProfileData = (assetType: any, assetData: any, dataFetchedFrom: any, profileData: any) => {
		const profile = {
			'assetType': assetType,
			'assetData': assetData,
			'dataFetchedFrom': dataFetchedFrom,
			'profileData': profileData
		}
		return profile;
	}

	const ensureMetamaskConnection = async (): Promise<boolean> => {
		console.log("Ensure MetaMask connection called");

		// Check if MetaMask is installed
		if (typeof window.ethereum !== 'undefined') {
			console.log("MetaMask is installed");

			// Check if MetaMask is connected
			if (!address || !isConnected) {
				for (let i = 0; i < connectors.length; i++) {
					let connector = connectors[i];
					console.log("Trying to connect with connector: " + connectors[i].name);
					connect({ connector });
				}
			}
			return true; // MetaMask is installed
		} else {
			alert("MetaMask is not installed");
			const params = new URLSearchParams(window.location.search)
			const origin = params.get('origin')!;
			window.parent.postMessage({ eventName: 'errorMessage', data: "Please install metamask" }, origin);
			return false; // MetaMask is not installed
		}
	};


	const setIsTwitterConnectedInLocalStorage = () => {
		const userInfo = localStorage.getItem(address!);
		// If no localstorage of this address found then we create one with 'twitter connected' only
		if (userInfo === null) {
			console.log('No user info found in localStorage');
			const storedUserInfo = {
				isFacebookConnected: false,
				isTwitterConnected: true, 
			}
			localStorage.setItem(address!, JSON.stringify(storedUserInfo));
		} else {
			console.log('User found, updating...');
			const userInfoJson = JSON.parse(userInfo);
			const storedUserInfo = {
				isFacebookConnected: userInfoJson.isFacebookConnected,
				isTwitterConnected: true,
			}
			localStorage.setItem(address!, JSON.stringify(storedUserInfo));
		}
		setIsTwitterConnected(true);
	}

	const setIsFacebookConnectedInLocalStorage = () => {
		const userInfo = localStorage.getItem(address!);
		// If no localstorage of this address found then we create one with 'twitter connected' only
		if (userInfo === null) {
			console.log('No user info found in localStorage');
			const storedUserInfo = {
				isFacebookConnected: true,
				isTwitterConnected: false,
			}
			localStorage.setItem(address!, JSON.stringify(storedUserInfo));
		} else {
			console.log('User found, updating...');
			const userInfoJson = JSON.parse(userInfo);
			const storedUserInfo = {
				isFacebookConnected: true,
				isTwitterConnected: userInfoJson.isTwitterConnected,
			}
			localStorage.setItem(address!, JSON.stringify(storedUserInfo));
		}
		setIsFacebookConnected(true);
	}

	const openTwitterOAuthPopup = async () => {
		const params = new URLSearchParams(window.location.search);
		const isWidget = params.get('isWidget')!;
		const origin = params.get('origin')!;
		const apps = params.get('apps')!;
		const apiUrl = process.env.REACT_APP_API_BASE_URL + `/oauth-twitter?apps=${apps}&isWidget=${isWidget}&origin=${origin}`; // Replace with your Twitter API endpoint
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
		const profileDataObj = await getProfileData(address!.toString(), process.env.REACT_APP_TWITTER!);

		if (profileDataObj) {
			console.log("fetching profile from orbis");
			setUserTwitterProfiles(profileDataObj);
			//setIsTwitterConnected(true);
			setIsTwitterConnectedInLocalStorage();
			hideLoading();
			//window.close();
		}
		else {
			// Open the popup window
			console.log("Window open here")
			const childPopup = window.open(
				apiUrl,
				'_blank',
				`width=${popupWidth}, height=${popupHeight}, top=${popupTop}, left=${popupLeft}`
			);	
			
			setPopup(childPopup)
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
		const profileDataObj = await getProfileData(address!.toString(), process.env.REACT_APP_FACEBOOK!);
		if (profileDataObj) {
			const params = new URLSearchParams(window.location.search)
			const origin = params.get('origin')!;
			setUserFacebookProfiles(profileDataObj);
			//setIsFacebookConnected(true);
			setIsFacebookConnectedInLocalStorage();
			hideLoading();
			window.close();
		} else {
			// if there is no profile yet, we connect facebook
			renderPropsOnclick();
		}
	}

	// This use effect is for protecting accidently access to our dashboard ui
	// Also it set up the profle options via url parameters
	useEffect(() => {
		const params = new URLSearchParams(window.location.search)
		const widget = params.get('isWidget')!;
		const idPlatform = params.get('id_platform')!;
		const apps = params.get('apps')!;

		if (widget == "true") {
			if (!idPlatform) {
				navigate(`/?isWidget=false`);
			}
			else {
				if (apps?.split(",")) {
					for (let app of apps?.split(",")) {
						if (app === "twitter") {
							setIsTwitterSelected(true)
						}
						if (app === "facebook") {
							setIsFacebookSelected(true)
						}
					}
					setIsWidget(true);
				}
			}
		}
	}, [state])

	const wait = (timeout: number) => new Promise(resolve => setTimeout(resolve, timeout));

	// This use effect is used for child window when it is trying to create twitter profiledata
	useEffect(() => {
		const params = new URLSearchParams(window.location.search);
		const idPlatform = params.get('id_platform')!;
		if (idPlatform == "twitter" && !renderBlocker) {
			window.close();

			// setRenderBlocker(true);
			// const params = new URLSearchParams(window.location.search);
			// const username = params.get('username')!;
			// const displayName = params.get('display_name')!;
			// const profileUrl = params.get('picture_url')!;


		}
	}, [state])

	// This useEffect is used for checking if the connected address is already stored in backend or not
	// We need to make an exception here, we should disable this behavior when in the child window
	useEffect(() => {
		const params = new URLSearchParams(window.location.search);
		const username = params.get('username')!;
		if (address && !username) {
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

	// Once user connected via metamask then we check if this address has twitter/facebook connected
	useEffect(() => {
		if (address) {
			const userInfo = localStorage.getItem(address!);
			// If there is already some data
			if (userInfo) {
				const userInfoJson = JSON.parse(userInfo);
				if (userInfoJson.isTwitterConnected) {
					showLoading();
					getProfileData(address!.toString(), process.env.REACT_APP_TWITTER!).then(
						profileDataObj => {
							if (profileDataObj) {
								setIsTwitterConnected(true);
								setUserTwitterProfiles(profileDataObj);
							}
							hideLoading();
						}
					)
				} else {
					setIsTwitterConnected(false);
				}
				if (userInfoJson.isFacebookConnected) {
					showLoading();
					getProfileData(address!.toString(), process.env.REACT_APP_FACEBOOK!).then(
						profileDataObj => {
							if (profileDataObj) {
								setIsFacebookConnected(true);
								setUserFacebookProfiles(profileDataObj);
							}
							hideLoading();
						}
					)
				} else {
					setIsFacebookConnected(false);
				}
			} else {
				setUserFacebookProfiles(null);
				setUserTwitterProfiles(null);
				setIsTwitterConnected(false);
				setIsFacebookConnected(false);
			}
		}
	}, [address])

	// userProfiles useEffect hook, once all profiles are connected, we return the userprofile back the profiles
	// useEffect(() => {
	// 	if (userFacebookProfiles && userTwitterProfiles) {
	// 		const params = new URLSearchParams(window.location.search)
	// 		const origin = params.get('origin')!;
	// 		window.parent.postMessage({ eventName: 'profileDataReturned', data: [userTwitterProfiles, userFacebookProfiles] }, origin);
	// 	}
	// }, [userFacebookProfiles, userTwitterProfiles])

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
											style={{ marginTop: isIframe && !address ? "80px" : isIframe && step === "pre-submit" ? "92px" : "0" }} aria-label='Facit'										>
											{/* Here goes logo */}
											<CenteredImage imageSrc={PLogo} width={200} height={80} />
										</div>
									</div>
									<div
										className={classNames('rounded-3', {
											'bg-l10-dark': !darkModeStatus,
											'bg-dark': darkModeStatus,
										})}>

									</div>

									{/* BEGIN :: Metamask Login*/}
									<LoginHeader step={step} />
									{!address && (
										<>
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
												<button className='skip-btn'
													onClick={skipEmailRegistration}
												>
													Skip
												</button>
											</div>
										</>
									)}
									{/* END :: Add email or skip */}

									{/* BEGIN :: Stych workflow */}
									{
										(step === "submit" || step === "verify") && (
											<>
												<StytchOTP showPostSubmit={showPostSubmit} step={step} moveBack={moveBack} sendCode={sendCode} tryAgain={tryAgain} address={address} />
											</>
										)}
									{/* END :: Stych workflow */}

									{/* BEGIN :: Success page */}
									{
										(step === "success") && (
											<>
												<div className='d-flex align-items-center justify-content-center' style={{ marginTop: "70px" }}>
													<p>Stay Connected with us!</p>
												</div>
												<div className='d-flex align-items-center justify-content-center' style={{ marginBottom: "90px" }}>
													<a href="https://x.com/mvfwofficial?s=21&t=1GCSt3HPM8WcPENlVpgHfQ" target="_blank" rel="noopener noreferrer">
														<img src={Twitter} style={{ height: "45px", width: "45px" }} alt="Twitter" />
													</a>
													<a href="https://www.instagram.com/mvfwofficial?igsh=MW15MW5hem44MTR3dQ==" target="_blank" rel="noopener noreferrer">
														<img src={Instagram} style={{ height: "50px", width: "50px", marginLeft: "10px" }} alt="Instagram" />
													</a>
												</div>
											</>
										)}
									{/* END :: Success page */}


									{/* BEGIN :: Social Login */}
									{address && isWidget && step === "post-submit" && (
										<>
											{isTwitterSelected && (<div className='col-12 mt-3'>
												<Button
													isOutline
													isDisable={isTwitterConnected == true ? true : false}
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
													onFailure={failureFacebook}
													cssClass='shadow-3d-container'
													scope="public_profile, email, user_hometown, user_likes, user_friends, user_gender, user_age_range"
													render={renderProps => (
														<Button
															isOutline
															isDisable={isFacebookConnected == true ? true : false}
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
												<div className="d-flex justify-content-center mt-1">
													<button className='skip-btn'
														onClick={skipConnectProfiles}
													>
														{isTwitterConnected && isFacebookConnected ? "Done"  :"Skip"}
													</button>
												</div>
												<div className='text-center col-12 mt-1'>
													<a href='mailto:hirasiddiqui95@gmail.com'>
														Please contact <u>devs</u> to request access for facebook
													</a>
												</div>
											</div>)}
										</>
									)}
									{/* END :: Social Login */}
									{/* START:: Footer */}
									<LoginFooter address={address} />
									{/* END :: Footer */}
								</CardBody>
							</Card>
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