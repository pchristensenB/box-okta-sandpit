// Okta + Box Platform integration

////////////////////////////////////////////////////

require('dotenv').config()

const jwtDecode = require('jwt-decode');

var bodyParser = require('body-parser');

var BoxSDK = require('box-node-sdk');

const express = require('express');

var fs = require('fs');

var http = require("https");

var nJwt = require('njwt');

var util = require('util');

var request = require('request');

///////////////////////////////////////////////////

// SET UP WEB SERVER
const app = express();

var port = process.env.PORT || 3000;

app.use(express.static('public'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.listen(port, function () {
	console.log('App listening on port ' + port + '...');
})


var jsonParser = bodyParser.json()
var urlencodedParser = bodyParser.urlencoded({ extended: false });

//////////////////////////////////////////////////

// SET UP BOX SDK

// Look to see if the key has already been loaded into the
// environment - through heroku config vars for example
// If not, then load the key from a local file
if (!(process.env.BOX_PRIVATE_KEY)) {
	process.env.BOX_PRIVATE_KEY = fs.readFileSync('boxKey.pem', 'utf8')
}

var sdk = new BoxSDK({
	clientID: process.env.BOX_CLIENT_ID,
	clientSecret: process.env.BOX_CLIENT_SECRET,

	appAuth: {
		keyID: process.env.BOX_PUBLIC_KEY_ID,
		privateKey: process.env.BOX_PRIVATE_KEY,
		passphrase: process.env.BOX_PASSPHRASE
	}
})

//////////////////////////////////////////////////

// HOME PAGE
app.get('/', function (req, res) {
	fs.readFile('html/index.html', 'utf8', (err, page) => {
		if (err) {
			console.log("error reading the index.html file")
		}

		page = page.replace(/{{baseUrl}}/g, "https://" + process.env.OKTA_TENANT)
		page = page.replace(/{{clientId}}/g, process.env.OKTA_CLIENT_ID)
		page = page.replace(/{{OKTA_MFA_CLIENT_ID}}/g, process.env.OKTA_MFA_CLIENT_ID)
		page = page.replace(/{{OKTA_REDIRECT_URI}}/g, process.env.OKTA_REDIRECT_URI)
		page = page.replace(/{{logo}}/g, process.env.OKTA_LOGO)

		res.send(page)
	})
})

app.post('/evaluateRegForm', urlencodedParser, function (req, res) {

	var firstName = req.body.firstName;
	var lastName = req.body.lastName;
	var email = req.body.email;

	console.log("***************first name: " + firstName)

	createOktaUser(firstName, lastName, email,(errMsg, oktaUserID) => {
		if (errMsg) {

			res.json({ msg: errMsg })
		}
		else { // SUCCESSFULLY CREATED OKTA USER
			console.log("successfully created an Okta user with id " + oktaUserID);

			res.json({ msg: "success", firstName: firstName, email: email })

			createBoxUser(firstName, lastName, (errMsg, boxUser) => {

				if (errMsg) {
					console.log("something went wrong trying to create a user in Box.");
				}
				else { // SUCCESSFULLY CREATED BOX USER
					console.log("successfully created a Box user with id: " + boxUser.id);

					updateOktaUser(oktaUserID, boxUser.id, (errMsg, result) => {
						if (errMsg) {
							console.log("error updating the Okta user record: " + errMsg);
						}
						else { // UPDATED OKTA USER RECORD WITH BOX ID
							console.log("Okta user record successfully updated with Box ID.");

							var appUserClient = sdk.getAppAuthClient('user', boxUser.id);

						}
					});
				}
			});
		}
	});
});

// ACCEPT ACCESS TOKEN FROM OKTA, GET AN ACCESS TOKEN FROM BOX
app.post('/boxUI', urlencodedParser, function (req, res) {
	var decoded = jwtDecode(req.body.accessToken);
	console.log("dec:" + 'https://' + process.env.OKTA_TENANT + '/api/v1/users/' + decoded.uid);
	var options = {
		method: 'GET',
		url: 'https://' + process.env.OKTA_TENANT + '/api/v1/users/' + decoded.uid,
		headers: {
			'Cache-Control': 'no-cache',
			Authorization: 'SSWS ' + process.env.OKTA_API_KEY,
			Accept: 'application/json',
			"Content-Type": 'application/json'
		}
	}

	request(options, function (error, response, body) {
		if (error) throw new Error(error);
		//console.log(body)
		body = JSON.parse(body)
		var appUserClient = sdk.getAppAuthClient('user', body.profile.boxID);
		appUserClient._session.getAccessToken().then(function (accessToken) {
			appUserClient.users.get(appUserClient.CURRENT_USER_ID,{fields:'id,name,login,external_app_user_id'}).then(currentUser => {
				console.log(JSON.stringify(currentUser));
				res.json({ 
					accessToken: accessToken,
					oktaId:body.id,
					userName:body.profile.firstName + " " + body.profile.lastName,
					email:body.profile.email,
					login:currentUser.login,
					extId:currentUser.external_app_user_id,
					appUserID:currentUser.id
				});
			})
		})
	})
})

function createOktaUser(firstName, lastName, email,callback) {

	// CREATE THE USER IN OKTA
	// user will receive an activation email
	var options = {
		"method": "POST",
		"hostname": process.env.OKTA_TENANT,
		"port": null,
		"path": "/api/v1/users?activate=true",
		"headers": {
			"accept": "application/json",
			"content-type": "application/json",
			"authorization": "SSWS " + process.env.OKTA_API_KEY,
			"cache-control": "no-cache"
		}
	}

	var req = http.request(options, function (res) {
		var chunks = [];

		res.on("data", function (chunk) {
			chunks.push(chunk);
		});

		res.on("end", function () {
			var body = Buffer.concat(chunks);
			console.log(body.toString());

			var json = JSON.parse(body);

			if (json.errorCode) {
				var msg;

				// the most common error
				if (json.errorCauses[0].errorSummary == "login: An object with this field already exists in the current organization") {
					msg = "That username already exists in this Okta tenant. Please try another username.";
				}
				else { msg = "Something went wrong with the Okta user registration. Please check the logs."; }

				return callback(msg);
			}
			else {
				return callback(null, json.id);
			}
		});
	});

	req.write(JSON.stringify({
		profile:
		{
			firstName: firstName,
			lastName: lastName,
			email: email,
			login: email
		}
	}));

	req.end();
}

function createBoxUser(firstName, lastName, callback) {

	var name = firstName + " " + lastName;

	var serviceAccountClient = sdk.getAppAuthClient('enterprise', process.env.BOX_ENTERPRISE_ID);

	serviceAccountClient.enterprise.addAppUser(name, { "is_platform_access_only": true }, function (err, res) {
		if (err) throw err

		else {
			return callback(null, res);
			console.log(res);
		}
	});
}

// UPDATE THE OKTA USER RECORD WITH THE BOX ID

function updateOktaUser(oktaUserID, boxUserID, callback) {

	var options = {
		"method": "POST",
		"hostname": process.env.OKTA_TENANT,
		"port": null,
		"path": "/api/v1/users/" + oktaUserID,
		"headers": {
			"accept": "application/json",
			"content-type": "application/json",
			"authorization": "SSWS " + process.env.OKTA_API_KEY,
			"cache-control": "no-cache"
		}
	}

	var req = http.request(options, function (res) {
		var chunks = [];

		res.on("data", function (chunk) {
			chunks.push(chunk);
		});

		res.on("end", function () {
			var body = Buffer.concat(chunks);
			console.log(body.toString());

			var json = JSON.parse(body);

			if (json.errorCode) {
				return callback(json);
			}
			else {
				return callback(null, "success");
			}
		});
	});

	req.write(JSON.stringify({ profile: { boxID: boxUserID } }));

	req.end();
}

function validateIDtoken(id_token, callback) {

	var path = "/oauth2/v1/introspect?token=" + id_token + "&client_id=" + process.env.OKTA_CLIENT_ID + "&client_secret=" + process.env.OKTA_CLIENT_SECRET

	var options = {
		"method": "POST",
		"hostname": process.env.OKTA_TENANT,
		"port": null,
		"path": path,
		"headers": {
			"content-type": "application/x-www-form-urlencoded",
			"accept": "application/json",
			"cache-control": "no-cache"
		}
	}

	var req = http.request(options, function (res) {
		var chunks = [];

		res.on("data", function (chunk) {
			chunks.push(chunk);
		});

		res.on("end", function () {
			var body = Buffer.concat(chunks);
			console.log(body.toString());

			var json = JSON.parse(body);

			if (json.errorCode) {
				return callback(body.toString());
			}
			else {
				return callback(null, json);
			}
		});
	});

	req.end();
}