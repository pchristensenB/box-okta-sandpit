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
2. Add http://localhost:3000 to the CORS exceptions in your app configuration
3. Download the json file with the private key
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

2. Install dependencies

   npm install
        
3. Run the app
   
   npm start
   
   This should bring up this website on localhost:3000 
   
   <img src="/images/appfront.png" width="50%" height="50%">
   
   You can go through the registration process
   
   <img src="/images/reg.png" width="50%" height="50%">
   
   This will send an email with instructions on account activation (this part can be configured in your Okta app) and then you can login
   
   <img src="/images/login.png" width="50%" height="50%">
   
   Once logged in you can see user info 
   
  <img src="/images/userinfo.png" width="75%" height="75%">
  
  And create a folder as the registered app user
  
  <img src="/images/oktafolder.png" width="75%" height="75%">
   

# License
The MIT License (MIT)

Copyright (c) 2021 Peter Christensen

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
