# Plurality

We have created a “Reputation Connect“ widget which can be used to personalize your web3 account and give you a better UX on dApps.

## Video Demo

[![Plurality Live Demo](https://github.com/Web3-Plurality/plurality-dashboard-ui/assets/8026367/9503e4ac-72de-4b0c-a4de-50958feb8e24)](https://youtu.be/zy41VvccfxI "Plurality Live Demo")

## Live Testing

Depending on your mood for the day, there are two ways you can test it:

### No code testing

* Install MetaMask flask on a new browser profile (where you don't have MetaMask already installed): https://metamask.io/flask/
* We have created an example dApp that creates your Orbis web3 social account and links to your web2 social. Open this dApp and play around with the widget (Connect Reputation button): https://demo.plurality.network/
* Login via twitter. If you want to use a Facebook login, please request access.
* After linking, you can also play around with our user dashboard at https://app.plurality.network/ and manage your connected apps
* You can view your Orbis account here: https://app.orbis.club/

### Get-into-the-code testing

* Import our widget into your own dApp and play around with it. Adding the widget is super easy in 3 lines of code. View the instructions for the deployed npm package here:\
  https://www.npmjs.com/package/plurality-repconnect-widget
* The GitHub of the Plurality organization containing all the repositories is here: https://github.com/Web3-Plurality

### Run locally

If you want to run the setup locally you need to:

* Pull all submodules
* `cd` into each submodule and run using npm 

  ```plaintext
  npm install
  npm run start 
  ```

## Run using Docker

* You can also use `docker` to run the demo.
* `cd` into docker directory and configure `.env` file
* Run `docker-compose` file
