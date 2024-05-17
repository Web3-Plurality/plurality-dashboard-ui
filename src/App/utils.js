/* eslint-disable prettier/prettier */
// import { ethers } from 'ethers';

export const sendTransaction = async (to, value, provider) => {
    const signer = provider.getSigner();
    const transactionResponse = await signer.sendTransaction({
        to,
        value,
    });
    return transactionResponse.hash;
};

export const verifyMessage = (message, signature, expectedAddress) => {
    console.log(message, signature, expectedAddress)
    // const hashedMessage = ethers.utils.hashMessage(message);

    // const signer = ethers.utils.recoverAddress(hashedMessage, signature);

    // // Compare the recovered address with the expected address
    // return signer.toLowerCase() === expectedAddress.toLowerCase();
    return true
};

export const signTransaction = async (to, value, provider) => {
    const signer = provider.getSigner();
    const signedTransaction = await signer.signTransaction({
        to,
        value
    });

    return signedTransaction;
}
