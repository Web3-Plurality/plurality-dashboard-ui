/* global BigInt */

import Web3 from 'web3';

import SemaphoreIdentity from '../semaphore_artifacts/SemaphoreIdentity.json';
import { Contract } from 'web3-eth-contract';
import { Account } from 'web3-core';

let semaphoreIdentityContract: Contract;
let signer: Account;
let network: string;
let isInitialized = false;
let merkleTreeDepth = 20;
const signal = 1;
//const groupId:string = process.env.GATSBY_GROUP_ID!;

export const init = async () => {

  // FOR INFURA
  network = process.env.GATSBY_ETHEREUM_NETWORK!;
  console.log("Network is: " + network);
  const web3 = new Web3(
    new Web3.providers.HttpProvider(
      `https://${network}.infura.io/v3/${process.env.GATSBY_INFURA_API_KEY}`
    )
  );
  // Creating a signing account from a private key
  signer = web3.eth.accounts.privateKeyToAccount(
    process.env.GATSBY_SIGNER_PRIVATE_KEY!
  );
  web3.eth.accounts.wallet.add(signer);
  console.log(SemaphoreIdentity.abi);
  const abi: any = SemaphoreIdentity.abi;
  semaphoreIdentityContract = new web3.eth.Contract(abi,process.env.GATSBY_SEMAPHORE_IDENTITY_CONTRACT); //contract address at sepolia
  console.log(semaphoreIdentityContract);
  isInitialized = true;
};



export const createGroup = async (groupId: string) => {

  if (!isInitialized) {
      await init();
    }
    console.log("Checking if the group id already exists on chain");
    const doesGroupExist = await semaphoreIdentityContract.methods.groups(groupId).call({ from: process.env.GATSBY_SEMAPHORE_IDENTITY_CONTRACT });
    console.log("Does Group Exist?");
    console.log(doesGroupExist);
    if (doesGroupExist[0] === "0x0000000000000000000000000000000000000000")
      {
        console.log("Group does not exist on chain. Creating now");
        const tx = await semaphoreIdentityContract.methods.createGroup(groupId,merkleTreeDepth,signer.address);
        const receipt = tx
        .send({
        from: signer.address,
        gas: await tx.estimateGas(),
        })
        .once("transactionHash", (txhash: any) => {
          console.log(`Mining createGroup transaction ...`);
          console.log(`https://${network}.etherscan.io/tx/${txhash}`);
        });

        // The transaction is now on chain!
        console.log(`createGroup Mined in block ${receipt.blockNumber}`);
        return receipt;
      }
      else {
        console.log("Group already exists on chain so not creating again");
        return "GROUP_ALREADY_EXISTS";
      }
  };

  export const addMemberToGroup = async (identityCommitment: any, groupId: string) => {
    if (!isInitialized) {
      await init();
    }
    identityCommitment = BigInt(identityCommitment);

    console.log("Adding member to group");
    console.log("using group id: "+groupId);
    console.log("groupId: "+ groupId);
    console.log("identityCommitment: "+ identityCommitment);

    const tx = semaphoreIdentityContract.methods.addMember(groupId,identityCommitment);
    const receipt = await tx
    .send({
      from: signer.address,
      gasLimit: 9100000
    })
    .once("transactionHash", (txhash: any) => {
      console.log(`Mining addMemberToGroup transaction ...`);
      console.log(`https://${network}.etherscan.io/tx/${txhash}`);
    });
    // The transaction is now on chain!
    console.log(`addMemberToGroup Mined in block ${receipt.blockNumber}`);
    
    return receipt;
  };

  export const verifyZKProofSentByUser = async (fullProof: any, groupId: string) => {

    let txUrl = "";
    if (!isInitialized) {
      await init();
    }
    if (fullProof === "" || fullProof === null) {
      console.log("Error: Got empty proof in verify ZK Proof function. Returning");
      return;
    }
    console.log("Sending proof to SC: "+ fullProof);
    console.log("GroupId: "+groupId);
    console.log("MerkleTreeRoot: "+fullProof.merkleTreeRoot);
    console.log("Signal: "+signal);
    console.log("NullifierHash: "+fullProof.nullifierHash);
    console.log("Proof: "+fullProof.proof);

    const tx = semaphoreIdentityContract.methods
              .verifyProof(groupId, fullProof.merkleTreeRoot, signal, fullProof.nullifierHash, groupId, fullProof.proof);

    const receipt = await tx
    .send({
      from: signer.address,
      gas: await tx.estimateGas()    
    })
    .once("transactionHash", (txhash: any) => {
      console.log(`Mining verifyZKProofSentByUser transaction ...`);
      console.log(`https://${network}.etherscan.io/tx/${txhash}`);
      txUrl = `https://${network}.etherscan.io/tx/${txhash}`;
    });
    // The transaction is now on chain!
    console.log(`verifyZKProofSentByUser Mined in block ${receipt.blockNumber}`);
    
    if (receipt.events.ProofVerified) 
    {
      console.log("Proof is valid. Returning tx url");
      return txUrl;
      //return true;
    }
    else 
    {
      console.log("Proof is invalid. Returning empty tx url");
      return txUrl;
      //return false;
    }
  };