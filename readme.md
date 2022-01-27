# Okta and Box Platform demo
This sample will show integration between Okta and Box platform and app users. The sample will allow you to register a user in Okta and this will automatically create a mapped app user in Box to allow interaction with Box content in a Box UI Element.

See the below diagrams for details

Registration flow

<img src="/public/img/register.png" width="75%" height="75%">
        
Login flow

<img src="/public/img/login.png" width="75%" height="75%">


## Pre-requisites
You will need both a Okta free developer account and a Box account
- Free Okta Dev account: https://developer.okta.com/signup/
- Free Box Developer account: https://account.box.com/signup/developer

## Okta setup

1. Login to the Okta console and go to Applications-> Create App Integration
2. Choose 'OIDC - OpenID Connect' as sign method and 'Web application' as application type
3. Give your application a meaningful name
4. Tick all the grant type boxes

  <img src="/images/grant.png" width="50%" height="50%"/>
  
5. URLS
  - Sign-in URIs: http://localhost:3000/, http://localhost:3000/authorization-code/callback, http://localhost:3000/?signout=true
  - Initiate login URI: - http://localhost:3000/authorization-code/callback

  <img src="/images/app.png" width="75%" height="75%">

6. Go to 'Directory' -> 'Profile editor' and find the profile for your app and add new string attribute
  - Display Name=BoxId
  - Variable Name=boxId
  
  <img src="/images/profile.png" width="75%" height="75%">

## Box

1. Create a new JWT Application https://developer.box.com/guides/authentication/jwt/jwt-setup/
2. Download the json file with the private key
   This will be downloaded as json file with 12 lines. Remove all line ending to make it a single line
  
    From

    <img src="/images/multi.png" width="50%" height="50%">

    
    To
    
    <img src="/images/single.png" width="50%" height="50%">

## Setup and run the app

1. Clone this repository and create an '.env' file in the root and add the following key/value pair
  -  OKTA_TENANT=..from the General page of your Okta app (Okta domain)
  -  OKTA_API_KEY=..In Okta, go to Security->API->Tokens, Create token and copy here
  -  OKTA_CLIENT_ID=..from the General page of your Okta app
  -  OKTA_CLIENT_SECRET=..from the General page of your Okta app
  -  OKTA_REDIRECT_URI=http://localhost:3000
  -  OKTA_LOGO=..URL to a logo you want to use for your login dialog
  -  BOX_JWT=..jwt json config in a single line

  
