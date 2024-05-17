import { ethers, verifyMessage } from 'ethers';
import React, { useEffect } from 'react';

const EventListener: React.FC = () => {
    
  function removeTrailingSlash(url: string): string {
    return url.replace(/\/+$/, ''); // Removes trailing slashes
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
                provider = new ethers.BrowserProvider(window.ethereum);
                signer = await provider.getSigner();
              }
        
              if (data.method === 'getAllAccounts') {
                try {
                  const accounts = await provider.listAccounts();
                  window.parent.postMessage({ type: 'metamaskResponse', data: accounts }, parentUrl);
                }
                catch (error: any) {
                  console.error(error);
                  window.parent.postMessage({ type: 'metamaskResponse', data: error.toString() }, parentUrl);
                }
              }
              else if (data.method === 'getConnectedAccount') {
                try {
                  const accounts = await provider.listAccounts();
                  window.parent.postMessage({ type: 'metamaskResponse', data: accounts[0] }, parentUrl);
                }
                catch (error: any) {
                  console.error(error);
                  window.parent.postMessage({ type: 'metamaskResponse', data: error.toString() }, parentUrl);
                }
              }
                            
              else if (data.method === 'getMessageSignature' && data.message) {
                try {
                  let signature = await signer.signMessage(data.message);
                  window.parent.postMessage({ type: 'metamaskResponse', data: signature }, parentUrl);
                }
                catch (error: any) {
                  console.error(error);
                  window.parent.postMessage({ type: 'metamaskResponse', data: error.toString() }, parentUrl);
                }  
              }
              else if (data.method === 'verifyMessageSignature' && data.signature && data.message) {
                try {
                  let signerAddress = verifyMessage(data.message, data.signature);
                  if (signerAddress == await signer.getAddress()) {
                    window.parent.postMessage({ type: 'metamaskResponse', data: "true" }, parentUrl);
                  }
                  else {
                    window.parent.postMessage({ type: 'metamaskResponse', data: "false" }, parentUrl);
                  }
                }
                catch (error: any) {
                  console.error(error);
                  window.parent.postMessage({ type: 'metamaskResponse', data: error.toString() }, parentUrl);
                }
              }
              else if (data.method === 'getBalance') {
                try {
                  let connectedAddress= await signer.getAddress();
                  console.log("Connected address: "+ connectedAddress)
                  let balance = await provider.getBalance(connectedAddress);
                  window.parent.postMessage({ type: 'metamaskResponse', data: balance.toString() + 'n' }, parentUrl);
                }
                catch (error: any) {
                  console.error(error);
                  window.parent.postMessage({ type: 'metamaskResponse', data: error.toString() }, parentUrl);
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
                  window.parent.postMessage({ type: 'metamaskResponse', data: receipt!.toString() }, parentUrl);
                }
                catch (error: any) {
                  console.error(error);
                  window.parent.postMessage({ type: 'metamaskResponse', data: error.toString() }, parentUrl);
                }
              }
              else if (data.method === 'getBlockNumber' ) {
                try {
                  const blockNumber = await provider.getBlockNumber();
                  window.parent.postMessage({ type: 'metamaskResponse', data: blockNumber }, parentUrl);
                }
                catch (error: any) {
                  console.error(error);
                  window.parent.postMessage({ type: 'metamaskResponse', data: error.toString() }, parentUrl);
                }
              }
              else if (data.method === 'getTransactionCount' && data.address ) {
                try {
                  const transactionCount = await provider.getTransactionCount(data.address);
                  window.parent.postMessage({ type: 'metamaskResponse', data: transactionCount }, parentUrl);
                }
                catch (error: any) {
                  console.error(error);
                  window.parent.postMessage({ type: 'metamaskResponse', data: error.toString() }, parentUrl);
                }
              }
              else if (data.method === 'readFromContract' && data.contractAddress && data.abi && data.methodName) {
                // to be implemented
                const contract = new ethers.Contract(data.contractAddress, data.abi,provider);
                if (!contract[data.methodName]) {
                  window.parent.postMessage({ type: 'metamaskResponse', data: "Method name does not exist on this contract" }, parentUrl);
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
                    window.parent.postMessage({ type: 'metamaskResponse', data: result.toString() }, parentUrl);
                  } catch (error: any) {
                    console.error(error);
                    window.parent.postMessage({ type: 'metamaskResponse', data: error.toString() }, parentUrl);
                }
              }
              else if (data.method === 'writeToContract' && data.contractAddress && data.abi && data.methodName ) {
                const contract = new ethers.Contract(data.contractAddress, data.abi,signer);
                if (!contract[data.methodName]) {
                  window.parent.postMessage({ type: 'metamaskResponse', data: "Method name does not exist on this contract" }, parentUrl);
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
                  window.parent.postMessage({ type: 'metamaskResponse', data: JSON.stringify(result) }, parentUrl);
                  } catch (error: any) {
                    console.error(error);
                    window.parent.postMessage({ type: 'metamaskResponse', data: error.toString() }, parentUrl);
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