/* global BigInt */

import Web3 from 'web3';

import Interests from '../interests_artifacts/interestsContractAbi.json';
import { Contract } from 'web3-eth-contract';
import { Account } from 'web3-core';

let interestsContract: Contract;
let signer: Account;
let network: string;
let isInitialized = false;

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
  console.log(Interests);
  const abi: any = Interests;
  interestsContract = new web3.eth.Contract(abi,process.env.GATSBY_INTERESTS_CONTRACT); //contract address at sepolia
  console.log(interestsContract);
  isInitialized = true;
};

  export const addCommitmentInterests = async (identityCommitment: any, interestsUrl: string) => {
    if (!isInitialized) {
      await init();
    }
    identityCommitment = BigInt(identityCommitment);

    const tx = interestsContract.methods.storeInterests(identityCommitment,interestsUrl);
    const receipt = await tx
    .send({
      from: signer.address,
      //gas: await tx.estimateGas(),
      gasLimit: 9100000 //todo: check why estimating gas doesnt work
    })
    .once("transactionHash", (txhash: any) => {
      console.log(`Mining add commitment interests transaction ...`);
      console.log(`https://${network}.etherscan.io/tx/${txhash}`);
    });
    // The transaction is now on chain!
    console.log(`add commitment interests Mined in block ${receipt.blockNumber}`);
    
    return receipt;
  };