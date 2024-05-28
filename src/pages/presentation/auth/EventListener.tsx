import { ethers, verifyMessage } from 'ethers';
import React, { useEffect } from 'react';

const EventListener: React.FC = () => {
    
  function removeTrailingSlash(url: string): string {
    const slashesRemoved = url?.replace(/\/+$/, '');
    const urlObject = new URL(slashesRemoved);
  
    // Extract the origin (protocol + domain + port)
    return urlObject.origin;
  }
      const receiveMessage = async (event: MessageEvent) => {
          const params = new URLSearchParams(window.location.search)
		      const parentUrl = removeTrailingSlash(params.get('origin')!);
          if (event.origin === parentUrl && event.data.type === 'metamaskRequest') {
              const data = event.data;
              let signer = null;

              let provider;
              if (window.ethereum == null) {
                console.log("Please install metamask");
                window.parent.postMessage({ type: 'noEthersProvider', data: "Please install metamask" }, parentUrl);
                return;
              } else {
                try{
                  provider = new ethers.BrowserProvider(window.ethereum);
                  signer = await provider.getSigner();
                }
                catch(e: any){
                  console.log(e.toString())
                  window.parent.postMessage({ type: 'noEthersProvider', data: e.toString() }, parentUrl);
                  return;
                }
              }
        
              if (data.method === 'getAllAccounts') {
                try {
                  const accounts = await provider.listAccounts();
                  window.parent.postMessage({ eventName: 'getAllAccounts', data: accounts }, parentUrl);
                }
                catch (error: any) {
                  console.error(error);
                  window.parent.postMessage({ eventName: 'errorMessage', data: error.toString() }, parentUrl);
                }
              }
              else if (data.method === 'getConnectedAccount') {
                try {
                  const accounts = await provider.listAccounts();
                  window.parent.postMessage({ eventName: 'getConnectedAccount', data: accounts[0] }, parentUrl);
                }
                catch (error: any) {
                  console.error(error);
                  window.parent.postMessage({ eventName: 'errorMessage', data: error.toString() }, parentUrl);
                }
              }
                            
              else if (data.method === 'getMessageSignature' && data.message) {
                try {
                  let signature = await signer.signMessage(data.message);
                  window.parent.postMessage({ eventName: 'getMessageSignature', data: signature }, parentUrl);
                }
                catch (error: any) {
                  console.error(error);
                  window.parent.postMessage({ eventName: 'errorMessage', data: error.toString() }, parentUrl);
                }  
              }
              else if (data.method === 'verifyMessageSignature' && data.signature && data.message) {
                try {
                  let signerAddress = verifyMessage(data.message, data.signature);
                  if (signerAddress == await signer.getAddress()) {
                    window.parent.postMessage({ eventName: 'verifyMessageSignature', data: "true" }, parentUrl);
                  }
                  else {
                    window.parent.postMessage({ eventName: 'verifyMessageSignature', data: "false" }, parentUrl);
                  }
                }
                catch (error: any) {
                  console.error(error);
                  window.parent.postMessage({ eventName: 'errorMessage', data: error.toString() }, parentUrl);
                }
              }
              else if (data.method === 'getBalance') {
                try {
                  let connectedAddress= await signer.getAddress();
                  console.log("Connected address: "+ connectedAddress)
                  let balance = await provider.getBalance(connectedAddress);
                  window.parent.postMessage({ eventName: 'getBalance', data: balance.toString() + 'n' }, parentUrl);
                }
                catch (error: any) {
                  console.error(error);
                  window.parent.postMessage({ eventName: 'errorMessage', data: error.toString() }, parentUrl);
                }
              }
              else if (data.method === 'sendTransaction' && data.sendTo && data.value) {
                try {
                  //let connectedAddress= await signer.getAddress();
                  // TODO : Error handling - value > 0 , address valid
                  let tx = await signer.sendTransaction({
                      to: data.sendTo, 
                      value: data.value
                  });
                  const receipt = await tx.wait();
                  console.log(receipt);
                  window.parent.postMessage({ eventName: 'sendTransaction', data: receipt!.toString() }, parentUrl);
                }
                catch (error: any) {
                  console.error(error);
                  window.parent.postMessage({ eventName: 'errorMessage', data: error.toString() }, parentUrl);
                }
              }
              else if (data.method === 'getBlockNumber' ) {
                try {
                  const blockNumber = await provider.getBlockNumber();
                  window.parent.postMessage({ eventName: 'getBlockNumber', data: blockNumber }, parentUrl);
                }
                catch (error: any) {
                  console.error(error);
                  window.parent.postMessage({ eventName: 'errorMessage', data: error.toString() }, parentUrl);
                }
              }
              else if (data.method === 'getTransactionCount' && data.address ) {
                try {
                  const transactionCount = await provider.getTransactionCount(data.address);
                  window.parent.postMessage({ eventName: 'getTransactionCount', data: transactionCount }, parentUrl);
                }
                catch (error: any) {
                  console.error(error);
                  window.parent.postMessage({ eventName: 'errorMessage', data: error.toString() }, parentUrl);
                }
              }
              else if (data.method === 'readFromContract' && data.contractAddress && data.abi && data.methodName) {
                // to be implemented
                const contract = new ethers.Contract(data.contractAddress, data.abi,provider);
                if (!contract[data.methodName]) {
                  window.parent.postMessage({ eventName: 'readFromContract', data: "Method name does not exist on this contract" }, parentUrl);
                  throw new Error(`Method ${data.methodName} does not exist on the contract.`);
                }
                try {
                    let result;
                    if (!data.methodParams) {
                      result = await contract[data.methodName]();
                    }
                    else {
                      result = await contract[data.methodName](...data.methodParams);
                    }
                    window.parent.postMessage({ eventName: 'readFromContract', data: result.toString() }, parentUrl);
                  } catch (error: any) {
                    console.error(error);
                    window.parent.postMessage({ eventName: 'errorMessage', data: error.toString() }, parentUrl);
                }
              }
              else if (data.method === 'writeToContract' && data.contractAddress && data.abi && data.methodName ) {
                const contract = new ethers.Contract(data.contractAddress, data.abi,signer);
                if (!contract[data.methodName]) {
                  window.parent.postMessage({ eventName: 'writeToContract', data: "Method name does not exist on this contract" }, parentUrl);
                  throw new Error(`Method ${data.methodName} does not exist on the contract.`);
                }
                try {
                  let result;
                  if (!data.methodParams) {
                    result = await contract[data.methodName]();
                  }
                  else {
                    result = await contract[data.methodName](...data.methodParams);
                  }
                  window.parent.postMessage({ eventName: 'writeToContract', data: JSON.stringify(result) }, parentUrl);
                  } catch (error: any) {
                    console.error(error);
                    window.parent.postMessage({ eventName: 'errorMessage', data: error.toString() }, parentUrl);
                }
              }
            }
      };
  useEffect(() => {
    window.addEventListener('message', receiveMessage, false);
    // Cleanup function to remove the event listener
    return () => {
      window.removeEventListener('message', receiveMessage);
    };
  }, []); // Empty dependency array ensures the effect runs only once
  return <div></div>;
};

export default EventListener;