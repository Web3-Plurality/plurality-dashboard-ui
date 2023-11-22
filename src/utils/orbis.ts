import { Orbis } from "@orbisclub/orbis-sdk";
import {
	getCommitment,
	getZkProof,
  } from './snap';

  const orbis = new Orbis();


    /** Calls the Orbis SDK and handles the results */
	export const orbisConnect = async (): Promise<string> => {
		//dispatch({ type: MetamaskActions.SetInfoMessage, payload: "Signing in your orbis profile" });
		console.log("Signing in your orbis profile");
		const res = await orbis.connect_v2({ chain: "ethereum", lit: false });
		console.log(orbis);
		/** Check if the connection is successful or not */
		if(res.status == 200) {
			console.log(res.did);
			//setOrbisUser(res.did);
			//setDid(res.did);
			//dispatch({ type: MetamaskActions.SetInfoMessage, payload: "" });
			return res.did;
	
		} else {
			console.log("Error connecting to Ceramic: ", res);
			alert("User rejected the orbis sign in request");
			//alert("Error connecting to Ceramic.");
			return "";
		}
	}
	async function addDataToOrbis(did: string, name: string, description: string, repAssetType: string, repAssetData: string[]) {
		try {
		  const { data, error } = await orbis.getProfile(did);
		  if (error) {
			console.log(error);
			return -1;
		  }
		  console.log(JSON.stringify(data));
		  const res = await orbis.updateProfile({username:name, description: description, data: {reputationalAssetsType:repAssetType, reputationalAssetsData:repAssetData}});
		  console.log(res);
		}
		catch (error) {
		  console.log(error);
		  return -1;
		}
	  }	

	export const addCommitmentAndDidToSnap = async (profileType: string, 
												groupId: string,
												username: string,
												description: string,
												reputationalAssetType: string,
												reputationalAssetData: string[]) => {

        // TODO: Confirm that this DID is indeed the one that's being used
        // See difference between did:key and did:pkh
        // TODO: Add this DID in the snap
		const did = await orbisConnect();

		const [res, commitment] =  await getCommitment(profileType, groupId);
		if (!res) {
			alert("User rejected the authentication request.");
			return -1;
		}
		else {
			
			const res = await addDataToOrbis(did, username, description, reputationalAssetType, reputationalAssetData);
			if (res == -1) return -1;
			const result = await getZkProof(profileType, groupId);
			if (result !== "") {
				alert("Reputation ownership proved");
			}
			else {
				alert("Reputation invalid" );
			}
		}
	}