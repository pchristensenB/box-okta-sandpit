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

  <img src="/public/img/app.png" width="75%" height="75%">

6. Go to 'Directory' -> 'Profile editor' and find the profile for your app and add new string attribute
  - Display Name=BoxId
  - Variable Name=boxId
  
  <img src="/public/img/attr.png" width="75%" height="75%">


  
