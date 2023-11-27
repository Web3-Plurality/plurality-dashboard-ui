import { Orbis } from "@orbisclub/orbis-sdk";
import { ProfileData, getDid } from "./orbis";
import { getCommitment } from "./snap";

const Cryptr = require('cryptr');
const orbis = new Orbis();

export async function shareDataWithDApp(walletAddress: string): Promise<ProfileData[]> {
    try {
        const did = getDid(walletAddress);
        const { data, error } = await orbis.getProfile(did);
		if (error) {
		    console.log(error);
		    return [];
		}
        let profileDataObjects: ProfileData[] = data.details.profile?.data.web2ProfilesData;
		  // todo: simplify this workflow and use a better encryption mechanism
		  // todo: ideally implement ceramic's encrypted data streams
		  // IMPORTANT: This is a workaround for testing - not production ready
		  try {
			for (let i=0;i<profileDataObjects.length;i++) {
				const secret = await getCommitment(profileDataObjects[i].dataFetchedFrom);
				const cryptr = new Cryptr(secret);
				const decryptedAssetData = cryptr.decrypt(profileDataObjects[i].assetData);
				const decryptedProfileData = cryptr.decrypt(profileDataObjects[i].profileData);

				console.log(decryptedAssetData);
				console.log(decryptedProfileData);

				var assetDataArray = new Array();
				assetDataArray = decryptedAssetData.split(",");
				profileDataObjects[i].assetData = assetDataArray;
				profileDataObjects[i].profileData = decryptedProfileData;
				console.log(profileDataObjects[i].assetData);
			}
		}
		catch(err) {
			console.log(err);
			alert("The data was encrypted with a different key. Did you remove the secrets from the snap?");
			return [];
		}
		return profileDataObjects;
    }
    catch (err) {
        console.log(err);
        return [];
    }
}