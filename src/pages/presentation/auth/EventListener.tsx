import { ethers, verifyMessage } from 'ethers';
import { BrowserProvider, parseUnits } from "ethers";

import React, { useEffect } from 'react';
import { useAccount, useSignMessage } from 'wagmi';

const EventListener: React.FC = () => {
    
      const receiveMessage = async (event: MessageEvent) => {
          const parentUrl = "http://localhost:3001";
          if (event.origin === parentUrl) {
              const data = event.data;
              let signer = null;

              let provider;
              if (window.ethereum == null) {
                
                // If MetaMask is not installed, we use the default provider,
                // which is backed by a variety of third-party services (such
                // as INFURA). They do not have private keys installed,
                // so they only have read-only access
                //console.log("MetaMask not installed; using read-only defaults")
                //provider = ethers.getDefaultProvider()
                console.log("Please install metamask");
                return; //todo: send to parent?
                
              } else {
                // Connect to the MetaMask EIP-1193 object. This is a standard
                // protocol that allows Ethers access to make all read-only
                // requests through MetaMask.
                provider = new ethers.BrowserProvider(window.ethereum);
                signer = await provider.getSigner();
              }
        
              if (data.type === 'metamaskRequest' && data.method === 'getAllAccounts') {
                const accounts = await provider.listAccounts();
                window.parent.postMessage({ type: 'metamaskResponse', data: accounts }, parentUrl);

              }
              else if (data.type === 'metamaskRequest' && data.method === 'getConnectedAccount') {
                const accounts = await provider.listAccounts();
                window.parent.postMessage({ type: 'metamaskResponse', data: accounts[0] }, parentUrl);
              }
                            
              else if (data.type === 'metamaskRequest' && data.method === 'getMessageSignature' && data.message) {
                      try {
                      let signature = await signer.signMessage(data.message);
                      window.parent.postMessage({ type: 'metamaskResponse', data: signature }, parentUrl);
                      }
                      catch (e) {
                        console.log(e);
                      }
                  
              }
              else if (data.type === 'metamaskRequest' && data.method === 'verifyMessageSignature' && data.signature && data.message) {
                try {
                let signerAddress = verifyMessage(data.message, data.signature);
                if (signerAddress == await signer.getAddress()) {
                  window.parent.postMessage({ type: 'metamaskResponse', data: "true" }, parentUrl);
                }
                else {
                  window.parent.postMessage({ type: 'metamaskResponse', data: "false" }, parentUrl);
                 }
                }
                catch (e) {
                  console.log(e);
                }
              }
              else if (data.type === 'metamaskRequest' && data.method === 'getBalance') {
                let connectedAddress= await signer.getAddress();
                console.log("Connected address: "+ connectedAddress)
                let balance = await provider.getBalance(connectedAddress);
                window.parent.postMessage({ type: 'metamaskResponse', data: balance.toString() + 'n' }, parentUrl);
              }
              else if (data.type === 'metamaskRequest' && data.method === 'sendTransaction' && data.sendTo && data.value) {
                let connectedAddress= await signer.getAddress();
                // TODO : Error handling - value > 0 , address valid
                let tx = await signer.sendTransaction({
                    to: data.sendTo, 
                    value: data.value
                });
                const receipt = await tx.wait();
                window.parent.postMessage({ type: 'metamaskResponse', data: receipt }, parentUrl);
              }
              else if (data.type === 'metamaskRequest' && data.method === 'getBlockNumber' ) {
                const blockNumber = await provider.getBlockNumber();
                window.parent.postMessage({ type: 'metamaskResponse', data: blockNumber }, parentUrl);
              }
              else if (data.type === 'metamaskRequest' && data.method === 'getTransactionCount' && data.address ) {
                const transactionCount = await provider.getTransactionCount(data.address);
                window.parent.postMessage({ type: 'metamaskResponse', data: transactionCount }, parentUrl);
              }
              else if (data.type === 'metamaskRequest' && data.method === 'readFromContract' && data.contractAddress && data.abi && data.methodName) {
                // to be implemented
                const contract = new ethers.Contract(data.contractAddress, data.abi,provider);
                if (!contract[data.methodName]) {
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
                    window.parent.postMessage({ type: 'metamaskResponse', data: result }, parentUrl);
                  } catch (error) {
                    window.parent.postMessage({ type: 'metamaskResponse', data: error }, parentUrl);
                }
              }
              else if (data.type === 'metamaskRequest' && data.method === 'writeToContract' && data.contractAddress && data.abi && data.methodName ) {
                const contract = new ethers.Contract(data.contractAddress, data.abi,signer);
                if (!contract[data.methodName]) {
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
                  window.parent.postMessage({ type: 'metamaskResponse', data: result }, parentUrl);
                  } catch (error) {
                    window.parent.postMessage({ type: 'metamaskResponse', data: error }, parentUrl);
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