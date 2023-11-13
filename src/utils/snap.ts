import { MetaMaskInpageProvider } from '@metamask/providers';
import { defaultSnapOrigin } from '../config';
import { GetSnapsResponse, Snap } from '../types';
import { createGroup, addMemberToGroup, verifyZKProofSentByUser } from './web3semaphore';

import { Group } from "@semaphore-protocol/group";
import { SemaphoreEthers } from "@semaphore-protocol/data";
import { generateProof } from "@semaphore-protocol/proof";
import { Identity } from "@semaphore-protocol/identity";


/**
 * Get the installed snaps in MetaMask.
 *
 * @param provider - The MetaMask inpage provider.
 * @returns The snaps installed in MetaMask.
 */
export const getSnaps = async (
  provider?: MetaMaskInpageProvider,
): Promise<GetSnapsResponse> =>
  (await (provider ?? window.ethereum).request({
    method: 'wallet_getSnaps',
  })) as unknown as GetSnapsResponse;
/**
 * Connect a snap to MetaMask.
 *
 * @param snapId - The ID of the snap.
 * @param params - The params to pass with the snap to connect.
 */
export const connectSnap = async (
  snapId: string = defaultSnapOrigin,
  params: Record<'version' | string, unknown> = {},
) => {
  await window.ethereum.request({
    method: 'wallet_requestSnaps',
    params: {
      [snapId]: params,
    },
  });
};

/**
 * Get the snap from MetaMask.
 *
 * @param version - The version of the snap to install (optional).
 * @returns The snap object returned by the extension.
 */
export const getSnap = async (version?: string): Promise<Snap | undefined> => {
  try {
    const snaps = await getSnaps();

    return Object.values(snaps).find(
      (snap) =>
        snap.id === defaultSnapOrigin && (!version || snap.version === version),
    );
  } catch (e) {
    console.log('Failed to obtain installed snap', e);
    return undefined;
  }
};

/**
 * Invoke the "hello" method from the example snap.
 */

export const sendHello = async () => {
  await window.ethereum.request({
    method: 'wallet_invokeSnap',
    params: { snapId: defaultSnapOrigin, request: { method: 'hello' } },
  });
};

/**
 * Invoke the "fetch_request" method from the example snap.
 */

export const fetchCommitment = async (profileType: string): Promise<string> => {
    console.log("In fetch commitment");
    try {
      let commitment = await window.ethereum.request({
        method: 'wallet_invokeSnap',
        params: { snapId: defaultSnapOrigin, request: { method: 'commitment_fetch', params: {source:profileType} } },
      });
      return commitment ? commitment.toString() : "";
    } catch (e) {
      console.log(e)
    }
    return "";
};

/**
 * Invoke the "commitment_request" method from the example snap.
 */

export const getCommitment = async (profileType: string, groupId: string): Promise<[boolean, string]> => {
  let acceptance = await window.ethereum.request({
    method: 'wallet_invokeSnap',
    params: { snapId: defaultSnapOrigin, request: { method: 'commitment_request', params: {source:profileType} }},
  });
  if (acceptance) {
    let commitment = await window.ethereum.request({
      method: 'wallet_invokeSnap',
      params: { snapId: defaultSnapOrigin, request: { method: 'commitment_fetch', params: {source:profileType} } },
    });
    console.log(commitment);
    await createGroup(groupId);
    await addMemberToGroup(commitment, groupId);
    return [true, commitment!.toString()];
  }
  else {
    console.log("User rejected the request for commitment");
    return [false,""];
  }
};

/** 
* Invoke the "zkproof_request" method from the example snap.
*/
export const getZkProof = async (profileType: string, groupId: string) : Promise<string> => {
 let identityString = await window.ethereum.request({
   method: 'wallet_invokeSnap',
   params: { snapId: defaultSnapOrigin, request: { method: 'zkproof_request', params: {source:profileType} } },
 });
  console.log(identityString);

  // zk proof creation
  //TODO: The following code block should be executed in snap 
  const identity = new Identity(identityString!.toString());
  const semaphoreEthers = new SemaphoreEthers("sepolia", {
    address: process.env.REACT_APP_SEMAPHORE_IDENTITY_CONTRACT,
    startBlock: 4269200
  });

  console.log("using group id: "+groupId);
  const groupIds = await semaphoreEthers.getGroupIds()
  console.log(groupIds);


  const members = await semaphoreEthers.getGroupMembers(groupId);
  console.log(members);
  const group = new Group(groupId, 20, members);
  const signal = 1;
  /*const commitment=identity.commitment;
  console.log("Checking commitment: "+commitment);
  if (members.includes(commitment.toString())){
    console.log("Membership proof verified");
    return true;
  }
  else {
    console.log("Membership proof not verified");
    return false;
  }*/
  /*const fullProof = await generateProof(identity, group, groupId, signal, {
    zkeyFilePath: "./semaphore.zkey",
    wasmFilePath: "./semaphore.wasm"
})*/
  const proof = await generateProof(identity, group, groupId, signal);
  console.log(proof); 

  // zk proof verification
  const txUrl = await verifyZKProofSentByUser(proof, groupId);
  if (txUrl!="") {
    //alert("Proof is valid");
    //return JSON.stringify(proof);
    return txUrl!;
  }
  else {
    alert ("Proof invalid");
    //return "Invalid proof";
    return txUrl;
  }
};


export const isLocalSnap = (snapId: string) => snapId.startsWith('local:');
