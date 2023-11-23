import { Orbis } from "@orbisclub/orbis-sdk";
import {
	checkProfile,
	saveProfile,
	getZkProof,
  } from './snap';

  const orbis = new Orbis();


  export enum AssetType {
	REPUTATION = "REPUTATION",
	INTEREST = "INTEREST"
  }
  export interface ProfileData {
	dataFetchedFrom: string,
	assetType: AssetType 
	assetData: any
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
			alert("User rejected the orbis sign in request");
			//alert("Error connecting to Ceramic.");
			return "";
		}
	}
	export async function addDataToOrbis(profileType: string, did: string, name: string, description: string, repAssetType: AssetType, repAssetData: string[]) {
		try {
		  const { data, error } = await orbis.getProfile(did);
		  if (error) {
			console.log(error);
			return -1;
		  }

		  // the data fetched from web2 profile to be pushed to ceramic
		  let newData:ProfileData = {dataFetchedFrom: profileType, assetType: repAssetType, assetData: repAssetData};
		  console.log(JSON.stringify(data));
		  console.log(data.details);
		  console.log(data.details.profile?.data);

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
			// add the data from current web2 profile into the list of existing web2 profiles 
			profileDataObjects.push(newData);
			console.log(profileDataObjects);
			res = await orbis.updateProfile({username:name, description: description, data: {web2ProfilesData:profileDataObjects}});
			console.log(res);
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

	export const checkIfProfileSaved = async (profileType: string): Promise<Boolean> =>{
		const isStored =  await checkProfile(profileType);
		return isStored;
	}

	const getDid = (connectedAddress: string) : string => {
		//TODO : this is just a hacky workaround for now
		return "did:pkh:eip155:1:"+connectedAddress;
	}

	export const getProfileData = async (connectedAddress: string) : Promise<ProfileData[]> => {
		const did = getDid(connectedAddress);
		const { data, error } = await orbis.getProfile(did);
		  if (error) {
			console.log(error);
			return [];
		  }
		let profileDataObjects: ProfileData[] = data.details.profile?.data.web2ProfilesData;
		return profileDataObjects;
	}
	//TODO: return the stream id from this function
	export const createProfile = async (profileType: string, 
												groupId: string,
												username: string,
												description: string,
												reputationalAssetType: AssetType,
												reputationalAssetData: string[]) => {
													
		const isStored =  await checkIfProfileSaved(profileType);
		if (isStored) {
			alert("Your profile has already been linked. Nothing more to do :) ");
			return;
		}
		else {
			// TODO: Confirm that this DID is indeed the one that's being used
			// See difference between did:key and did:pkh
			// TODO: Add this DID in the snap
			// TODO: If this DID and commitment already in snap then return the same one, do not create new
			const did = await orbisConnect();

			const [res, commitment] =  await saveProfile(profileType, groupId);
			if (!res) {
				alert("User rejected the authentication request.");
				return -1;
			}
			else {
				
				const res = await addDataToOrbis(profileType, did, username, description, reputationalAssetType, reputationalAssetData);
				if (res == -1) {
					console.log("Could not add profile data to ceramic. Returning");
					return -1;
				}
				const result = await getZkProof(profileType, groupId);
				if (result !== "") {
					alert("Reputation ownership proved");
				}
				else {
					alert("Reputation invalid" );
				}
			}
		}
	}