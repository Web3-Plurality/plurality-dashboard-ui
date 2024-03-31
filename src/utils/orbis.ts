import { Orbis } from "@orbisclub/orbis-sdk";

  const Cryptr = require('cryptr');
  const orbis = new Orbis();


  export enum AssetType {
	REPUTATION = "REPUTATION",
	INTEREST = "INTEREST"
  }
  export interface ProfileData {
	dataFetchedFrom: string,
	assetType: AssetType 
	assetData: any,
	profileData: any,
	did: string
  }

    /** Calls the Orbis SDK and handles the results */
	const orbisConnect = async (): Promise<string> => {
		//dispatch({ type: MetamaskActions.SetInfoMessage, payload: "Signing in your orbis profile" });
		console.log("Signing in your orbis profile");
		const res = await orbis.connect_v2({ chain: "ethereum", lit: false });
		console.log(orbis);
		/** Check if the connection is successful or not */
		if(res.status == 200) {
			console.log(res.did);
			return res.did;
		} else {
			console.log("Error connecting to Ceramic: ", res);
			//alert("User rejected the orbis sign in request");
			//alert("Error connecting to Ceramic.");
			return "";
		}
	}
	export async function addDataToOrbis(profileType: string, did: string, name: string, description: string, repAssetType: AssetType, repAssetData: string[], profileData: string) {
		try {
		  const { data, error } = await orbis.getProfile(did);
		  if (error) {
			console.log(error);
			return -1;
		  }
		  console.log("PROFILE DATA: ");
		  console.log(profileData);
		  //TODO the data should be encrpted using the user wallet
		  const secret = "123456";

		  const cryptr = new Cryptr(secret);
		  const encryptedString = cryptr.encrypt(repAssetData);
		  const encryptedProfileData = cryptr.encrypt(profileData);


		  // the data fetched from web2 profile to be pushed to ceramic
		  let newData:ProfileData = {dataFetchedFrom: profileType, assetType: repAssetType, assetData: encryptedString, profileData: encryptedProfileData, did: did};
		  //console.log(JSON.stringify(data));
		  //console.log(data.details);
		  //console.log(data.details.profile?.data);

		  // fetch data about already connected web2 profiles
		  let profileDataObjects: ProfileData[] = data.details.profile?.data.web2ProfilesData;
		  let res:any;
		  if (!profileDataObjects) {
			// if no existing data about any web2 profile, then the current one is the first one
			// square brackets around newData to push this as an array 
			console.log([newData]);
			res = await orbis.updateProfile({username:name, description: description, data: {web2ProfilesData:[newData]}});
			console.log(res);
			}
		  else {
				let isAlreadySaved = false;
			// add the data from current web2 profile into the list of existing web2 profiles 
				for (let i=0;i<profileDataObjects.length;i++) {
					if (profileDataObjects[i].dataFetchedFrom == profileType) {
						// data was already fetched from this source, so update it
						profileDataObjects[i] = newData;
						console.log(profileDataObjects);
						res = await orbis.updateProfile({username:name, description: description, data: {web2ProfilesData:profileDataObjects}});
						console.log(res);
						isAlreadySaved = true;
					}
				}
				if (!isAlreadySaved) {
					profileDataObjects.push(newData);
					console.log(profileDataObjects);
					res = await orbis.updateProfile({username:name, description: description, data: {web2ProfilesData:profileDataObjects}});
					console.log(res);
				}
		  } 
		  if (res.status !== 200) {
			return -1;
		  }
		}
		catch (error) {
		  console.log(error);
		  return -1;
		}
	  }	

	export const getDid = (connectedAddress: string) : string => {
		//TODO : this is just a hacky workaround for now
		return "did:pkh:eip155:1:"+connectedAddress;
	}

	export const getProfileData = async (connectedAddress: string, profileType: string) : Promise<ProfileData | undefined> => {
		try {

		const did = getDid(connectedAddress);

		const { data, error } = await orbis.getProfile(did);
		  if (error) {
			console.log(error);
			return undefined;
		  }
		let profileDataObj: ProfileData = {
			dataFetchedFrom: "",
			assetType: AssetType.REPUTATION,
			assetData: undefined,
			profileData: undefined,
			did: ""
		};

		console.log(data.details);
		let profileDataObjects: ProfileData[] = data.details.profile?.data.web2ProfilesData;

		  //todo: simplify this workflow and use a better encryption mechanism
		  // todo: ideally implement ceramic's encrypted data streams
		  // IMPORTANT: This is a workaround for testing - not production ready
			for (let i=0;i<profileDataObjects.length;i++) {
				console.log("Loop started");
				console.log(profileDataObjects[i]);
				if (profileDataObjects[i].dataFetchedFrom == profileType) {
				//TODO the data should be encrpted using the user wallet
				const secret = "123456"
				console.log("Secret is" + secret);
				const cryptr = new Cryptr(secret);
				const decryptedAssetData = cryptr.decrypt(profileDataObjects[i].assetData);
				const decryptedProfileData = cryptr.decrypt(profileDataObjects[i].profileData);

				console.log(decryptedAssetData);
				console.log(decryptedProfileData);

				var assetDataArray = new Array();
				assetDataArray = decryptedAssetData.split(",");
				profileDataObj.assetData = assetDataArray;
				profileDataObj.profileData = decryptedProfileData;
				profileDataObj.dataFetchedFrom = profileDataObjects[i].dataFetchedFrom;
				profileDataObj.assetType = profileDataObjects[i].assetType;
				profileDataObj.did = did;
				console.log(profileDataObj);
				return profileDataObj;
				}
			}
		}
		catch(err) {
			console.log(err);
			return undefined;
		}
	}
	const createOrbisPost = async (platform: string): Promise<string> => {
		const postContent = "Gm folks! \n"+
		"I just connected my " + platform + " \n" +
		"Let's make social media sovereign!";
		/** Add the results in a media array used when sharing the post (the media object must be an array) */
		const res = await orbis.createPost({
		  body: postContent,
		});
		console.log(res);
		return res;
	  }

	export const createProfile = async (profileType: string, 
												groupId: string,
												username: string,
												description: string,
												reputationalAssetType: AssetType,
												reputationalAssetData: string[],
												profileData: string): Promise<Boolean> => {
													

			//TODO: We should only push the social data when it is not already pushed => controll this logic in actual usage instead of here??
			const did = await orbisConnect();
			if (did == "") {
				alert("Orbis connect request was rejected");
				return false;
			}	
			const res = await addDataToOrbis(profileType, did, username, description, reputationalAssetType, reputationalAssetData, profileData);
			if (res == -1) {
				alert("Could not add profile data to ceramic. Returning");
				return false;
			}
			const orbisPost = await createOrbisPost(profileType);
			console.log(orbisPost);
			return true;
			}
		
	

	//TODO: The above function has overlaps with the following two functions, need to cleanup
	export const createProfileTwitterPopup = async (profileType: string, 
											groupId: string,
											username: string,
											description: string,
											reputationalAssetType: AssetType,
											reputationalAssetData: string[],
											profileData: string): Promise<Boolean> => {
													
			//TODO: We should only push the social data when it is not already pushed
			const did = await orbisConnect();
			if (did == "") {
				console.log("Orbis connect request was rejected");
				return false;
			}
			const res = await addDataToOrbis(profileType, did, username, description, reputationalAssetType, reputationalAssetData, profileData);
			if (res == -1) {
				console.log("Could not add profile data to ceramic. Returning");
				return false;
			}
			else {
				console.log("Profile created");
				return true;
			}
		}	