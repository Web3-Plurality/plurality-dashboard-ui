import { ethers } from 'ethers';
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
        
              if (data.type === 'metamaskRequest' && data.method === 'eth_requestAccounts') {
                  // Call MetaMask method
                  window.ethereum.request({ method: 'eth_requestAccounts' })
                      .then(accounts => {
                          // Send response back to parent application
                          window.parent.postMessage({ type: 'metamaskResponse', data: accounts }, parentUrl);
                      })
                      .catch(error => {
                          // Handle error
                      });
              }
              else if (data.type === 'metamaskRequest' && data.method === 'personal_sign' && data.message) {
                  // signMessage();
                  // window.parent.postMessage({ type: 'metamaskResponse', data: "personal sign response" }, parentUrl);
  
                 
                  // Call MetaMask method
                  // const from = selectedAccount;
                  // For historical reasons, you must submit the message to sign in hex-encoded UTF-8.
                  // This uses a Node.js-style buffer shim in the browser.
                  // const msg = `0x${btoa(data.message)}`;
                  /*console.log("Received personal sign request: " , event.origin);
                  window.ethereum.request({ method: 'eth_requestAccounts' })
                      .then(accounts => {
                       
                          window.ethereum.request({ method: 'personal_sign', params: [data.message, "0xCD96f257Cc6603132Cf6B8709Ae14F0A391d1916"] })
                          .then(result => {
                              console.log("Sign result: "+ result);
                              // Send response back to parent application
                              window.parent.postMessage({ type: 'metamaskResponse', data: result }, parentUrl);
                          })
                          .catch(error => {
                              // Handle error
                          });
                          
                      })
                      .catch(error => {
                          // Handle error
                      });*/
                      try {
                      let signature = await signer.signMessage(data.message);
                      window.parent.postMessage({ type: 'metamaskResponse', data: signature }, parentUrl);
                      }
                      catch (e) {
                        console.log(e);
                      }
                  
              }
              else if (data.type === 'metamaskRequest' && data.method === 'getBalance') {
                let connectedAddress= await signer.getAddress();
                console.log("Connected address: "+ connectedAddress)
                let balance = await provider.getBalance(connectedAddress);
                window.parent.postMessage({ type: 'metamaskResponse', data: balance }, parentUrl);
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
